import express from 'express';
import path from 'path';
import dns from 'dns';
import net from 'net';
import http from 'http';
import https from 'https';
import { execFile } from 'child_process';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

interface PingOptions {
  address: string;
  type?: 'ip' | 'web' | 'tcp';
  port?: number;
  timeoutMs?: number;
}

interface PingResult {
  active: boolean;
  status: 'online' | 'offline';
  latency: number;
  statusCode?: number;
  method?: string;
  error?: string;
}

// Helper: Measure real HTTP/HTTPS latency
function probeHttp(targetUrl: string, timeoutMs: number = 3000): Promise<PingResult> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    let urlObj: URL;
    try {
      const cleanUrl = targetUrl.startsWith('http://') || targetUrl.startsWith('https://')
        ? targetUrl
        : `https://${targetUrl}`;
      urlObj = new URL(cleanUrl);
    } catch {
      return resolve({
        active: false,
        status: 'offline',
        latency: 0,
        error: 'Invalid URL format'
      });
    }

    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.request(
      urlObj,
      {
        method: 'HEAD',
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'NetworkMonitor/1.0 (HealthCheck)'
        }
      },
      (res) => {
        const endTime = performance.now();
        const latency = Math.max(1, Math.round(endTime - startTime));
        const status = (res.statusCode && res.statusCode >= 200 && res.statusCode < 600) ? 'online' : 'offline';
        resolve({
          active: status === 'online',
          status,
          latency: status === 'online' ? latency : 0,
          statusCode: res.statusCode,
          method: 'http'
        });
        req.destroy();
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({
        active: false,
        status: 'offline',
        latency: 0,
        error: 'HTTP request timed out'
      });
    });

    req.on('error', (err: any) => {
      req.destroy();
      resolve({
        active: false,
        status: 'offline',
        latency: 0,
        error: err.message || 'Connection failed'
      });
    });

    req.end();
  });
}

// Helper: Real ICMP ping using Linux ping utility
function probeIcmp(host: string, timeoutSec: number = 2): Promise<{ success: boolean; latency: number }> {
  return new Promise((resolve) => {
    execFile(
      'ping',
      ['-c', '1', '-W', timeoutSec.toString(), host],
      { timeout: (timeoutSec + 1) * 1000 },
      (error, stdout) => {
        if (error || !stdout) {
          return resolve({ success: false, latency: 0 });
        }

        // Match "time=12.3 ms" or "rtt min/avg/max/mdev = 12.1/12.3/..."
        const timeMatch = stdout.match(/time[=<]([0-9.]+)\s*ms/i);
        const rttMatch = stdout.match(/rtt min\/avg\/max\/mdev = [0-9.]+\/([0-9.]+)\//i);

        if (timeMatch && timeMatch[1]) {
          const lat = parseFloat(timeMatch[1]);
          return resolve({ success: true, latency: Math.max(1, Math.round(lat)) });
        } else if (rttMatch && rttMatch[1]) {
          const lat = parseFloat(rttMatch[1]);
          return resolve({ success: true, latency: Math.max(1, Math.round(lat)) });
        }

        // If packets received > 0
        if (stdout.includes('1 received') || stdout.includes('1 packets received')) {
          return resolve({ success: true, latency: 15 });
        }

        return resolve({ success: false, latency: 0 });
      }
    );
  });
}

// Helper: Real TCP socket connect probe
function probeTcp(host: string, port: number, timeoutMs: number = 2500): Promise<{ success: boolean; latency: number; error?: string }> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const socket = new net.Socket();
    let isSettled = false;

    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      if (isSettled) return;
      isSettled = true;
      const latency = Math.max(1, Math.round(performance.now() - startTime));
      socket.destroy();
      resolve({ success: true, latency });
    });

    socket.on('error', (err: any) => {
      if (isSettled) return;
      isSettled = true;
      socket.destroy();
      // If ECONNREFUSED, the machine is online and actively rejected the port
      if (err.code === 'ECONNREFUSED') {
        const latency = Math.max(1, Math.round(performance.now() - startTime));
        resolve({ success: true, latency });
      } else {
        resolve({ success: false, latency: 0, error: err.code || err.message });
      }
    });

    socket.on('timeout', () => {
      if (isSettled) return;
      isSettled = true;
      socket.destroy();
      resolve({ success: false, latency: 0, error: 'Connection timed out' });
    });
  });
}

// Core unified ping runner
async function performRealPing(opts: PingOptions): Promise<PingResult> {
  const { address, type = 'ip', port, timeoutMs = 3000 } = opts;
  if (!address || typeof address !== 'string' || !address.trim()) {
    return {
      active: false,
      status: 'offline',
      latency: 0,
      error: 'Empty target address'
    };
  }

  const cleanAddr = address.trim();

  // 1. If explicit web type or starts with http:// or https://, do HTTP probe
  if (type === 'web' || cleanAddr.startsWith('http://') || cleanAddr.startsWith('https://')) {
    return await probeHttp(cleanAddr, timeoutMs);
  }

  // 2. Extract host and optional port from address (e.g. "192.168.1.1:8080" or "example.com:443")
  let cleanHost = cleanAddr.replace(/^https?:\/\//i, '').split('/')[0];
  let targetPort = port;

  if (cleanHost.includes(':')) {
    const parts = cleanHost.split(':');
    cleanHost = parts[0];
    const parsedPort = parseInt(parts[1], 10);
    if (!isNaN(parsedPort) && parsedPort > 0 && parsedPort <= 65535) {
      targetPort = parsedPort;
    }
  }

  // 3. DNS Lookup verification for non-IP hosts
  const isRawIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(cleanHost) || cleanHost.includes(':');
  if (!isRawIp) {
    try {
      await dns.promises.lookup(cleanHost);
    } catch (dnsErr: any) {
      // Domain does not exist or cannot resolve -> definitely offline!
      return {
        active: false,
        status: 'offline',
        latency: 0,
        error: `DNS lookup failed: ${dnsErr.code || 'Host not found'}`
      };
    }
  }

  // 4. Try real ICMP ping first
  const icmpResult = await probeIcmp(cleanHost, Math.min(3, Math.max(1, Math.floor(timeoutMs / 1000))));
  if (icmpResult.success) {
    return {
      active: true,
      status: 'online',
      latency: icmpResult.latency,
      method: 'icmp'
    };
  }

  // 5. If ICMP didn't respond (could be blocked by firewall or router), test TCP ports
  const portsToTest = targetPort
    ? [targetPort]
    : [80, 443, 22, 53, 8080];

  for (const p of portsToTest) {
    const tcpResult = await probeTcp(cleanHost, p, 1500);
    if (tcpResult.success) {
      return {
        active: true,
        status: 'online',
        latency: tcpResult.latency,
        method: 'tcp'
      };
    }
  }

  // 6. If all probes fail, the target is genuinely offline
  return {
    active: false,
    status: 'offline',
    latency: 0,
    error: 'Host unreachable or 100% packet loss'
  };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Single Ping API
app.all('/api/ping', async (req, res) => {
  try {
    const address = (req.method === 'GET' ? req.query.address : req.body.address) as string;
    const type = ((req.method === 'GET' ? req.query.type : req.body.type) as any) || 'ip';
    const port = parseInt(((req.method === 'GET' ? req.query.port : req.body.port) as string) || '0', 10) || undefined;
    const timeoutMs = parseInt(((req.method === 'GET' ? req.query.timeoutMs : req.body.timeoutMs) as string) || '3000', 10);

    const result = await performRealPing({ address, type, port, timeoutMs });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      active: false,
      status: 'offline',
      latency: 0,
      error: err.message || 'Server error during ping'
    });
  }
});

// Batch Ping API for rapid multi-target monitoring
app.post('/api/ping-batch', async (req, res) => {
  try {
    const targets = req.body.targets;
    if (!Array.isArray(targets) || targets.length === 0) {
      return res.json({ results: [] });
    }

    const results = await Promise.allSettled(
      targets.map(async (t) => {
        const pingRes = await performRealPing({
          address: t.address,
          type: t.type || 'ip',
          port: t.port,
          timeoutMs: t.timeoutMs || 2500
        });
        return {
          id: t.id,
          address: t.address,
          ...pingRes
        };
      })
    );

    const formatted = results.map((r, idx) => {
      if (r.status === 'fulfilled') {
        return r.value;
      }
      return {
        id: targets[idx]?.id,
        address: targets[idx]?.address,
        active: false,
        status: 'offline' as const,
        latency: 0,
        error: 'Ping failed'
      };
    });

    res.json({ results: formatted });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Batch ping failed' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
