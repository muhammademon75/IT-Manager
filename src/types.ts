export interface LedgerPermissions {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserPermissions {
  requisitions: LedgerPermissions;
  acknowledgements: LedgerPermissions;
  returnChallans: LedgerPermissions;
  quotations: LedgerPermissions;
  purchaseBills: LedgerPermissions;
  monitorTargets?: LedgerPermissions;
  remoteCredentials?: LedgerPermissions;
  hotspotLedger?: LedgerPermissions;
  notebookLedger?: LedgerPermissions;
  damagedStockProposals?: LedgerPermissions;
  userManagement?: LedgerPermissions;
  presetSigners?: LedgerPermissions;
  servers?: LedgerPermissions;
}

export interface UserProfile {
  uid: string;
  userId?: string;
  username?: string;
  displayName?: string;
  email: string;
  password?: string;
  role: 'admin' | 'viewer' | 'editor';
  status?: 'approved' | 'pending' | 'rejected';
  createdAt?: any;
  permissions?: UserPermissions;
}

export interface SignatureState {
  signed: boolean;
  name?: string;
  date?: string;
}

export interface RequisitionItem {
  sl: number;
  equipmentName: string;
  description: string;
  qty: number;
  condition: string;
  approximatePrice: number;
}

export interface Requisition {
  id: string;
  date: string;
  applicantName: string;
  applicantDepartment: string;
  employeeId: string;
  branchName: string;
  address: string;
  contact: string;
  types: string[];
  items: RequisitionItem[];
  totalAmount: number;
  reason: string;
  status: 'Draft' | 'Submitted' | 'Manager_Approved' | 'Recommended' | 'Fully_Approved' | 'Rejected';
  applicantSignature: SignatureState;
  managerSignature: SignatureState;
  recommenderSignature: SignatureState;
  authoritySignature: SignatureState;
  createdBy: string;
  createdByEmail: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PresetSigner {
  id: string;
  name: string;
  role: 'Applicant' | 'Manager' | 'Recommender' | 'Authority';
  createdAt?: string;
}

export interface AcknowledgementItem {
  sl: number;
  productName: string;
  brand: string;
  productModel: string;
  qty: number;
  serialNumber: string;
  type: string;
  sourceOfProduct: string;
  distributionDate: string;
}

export interface Acknowledgement {
  id: string;
  date: string;
  userName: string;
  department: string;
  employeeId: string;
  branch: string;
  address: string;
  items: AcknowledgementItem[];
  recipientSignature: SignatureState;
  createdBy: string;
  createdByEmail: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ReturnChallanItem {
  sl: number;
  productName: string;
  brand: string;
  productModel: string;
  qty: number;
  serialNumber: string;
  type: string;
  reasonForReturn: string;
  returnDate: string;
}

export interface ReturnChallan {
  id: string;
  date: string;
  userName: string;
  department: string;
  employeeId: string;
  branch: string;
  address: string;
  items: ReturnChallanItem[];
  returnedBySignature: SignatureState;
  receivedBySignature: SignatureState;
  createdBy: string;
  createdByEmail: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface QuotationItem {
  sl: number;
  productName: string;
  description: string;
  price: number;
  qty: number;
  total: number;
}

export interface ProductQuotation {
  id: string;
  quotationNumber: string;
  date: string;
  validityDate: string;
  // Client Details
  clientCompany: string;
  clientAddress: string;
  clientEmail: string;
  clientContact: string;
  // Company Details
  companyName: string;
  companyAddress: string;
  companyContact: string;
  companyEmail: string;
  companyWebsite: string;
  //
  searchCustomer?: string; // Add searchCustomer property
  items: QuotationItem[];
  totalAmount: number;
  amountInWords: string;
  termsAndConditions: string[];
  //
  status: 'Pending' | 'Approved' | 'Rejected';
  createdBy: string;
  createdByEmail: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CompanyProfile {
  id: string;
  name: string;
  address: string;
  contact: string;
  email: string;
  website: string;
  updatedAt?: any;
}

export interface PurchaseBillEntry {
  sl: number;
  purchaseDate: string;
  vendorName: string;
  invBillNo: string;
  productName: string;
  serialNumber: string;
  qty: number;
  price: number;
  amount: number;
  branchCode: string;
  applicantName: string;
  distributionDate: string;
  remarks: string;
}

export interface MoneyReceipt {
  id: string;
  no: string;
  date: string;
  receivedFrom: string;
  amount: number;
  amountInWords: string;
  for: string;
  branch: string;
  acct: string;
  paid: number;
  due: number;
  receivedBy: string;
  authorizedSignature: SignatureState;
  createdBy: string;
  createdByEmail: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PingHistoryItem {
  timestamp: string;
  latency: number;
  success: boolean;
}

export interface MonitorTarget {
  id: string;
  name: string;
  type: 'ip' | 'web';
  address: string;
  active: boolean;
  latency: number;
  history: number[];
  lossCount: number;
  totalPings: number;
  error?: string;
}

export interface UserTargets {
  targets: MonitorTarget[];
}

export interface PurchaseBill {
  id: string;
  date: string;
  entries: PurchaseBillEntry[];
  totalAmount: number;
  advancePurchase: number;
  grandTotal: number;
  status?: 'draft' | 'confirmed';
  moneyReceiptId?: string;
  createdBy: string;
  createdByEmail: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface DamagedStockItem {
  id: string;
  sl: number;
  productName: string;
  category?: string;
  quantity: number;
  unit: string;
  originalUnitCost: number;
  originalTotalValue: number;
  usageTime?: string;
  proposedUnitSalePrice: number;
  proposedTotalSaleValue: number;
  damageCondition: string;
}

export interface DamagedStockProposal {
  id: string;
  proposalNumber: string;
  date: string;
  subject: string;
  companyName?: string;
  companyAddress?: string;
  submittedBy?: string;
  submittedByDesignation?: string;
  approvedBy?: string;
  approvedByDesignation?: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Disposed' | 'Rejected';
  remarks?: string;
  items: DamagedStockItem[];
  totalOriginalValue: number;
  totalProposedSaleValue: number;
  createdBy?: string;
  createdByEmail?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Ledger {
  id: string;
  userId: string;
  name: string;
  createdAt?: any;
}

export interface Credential {
  id: string;
  userId: string;
  ledgerId: string;
  websiteName: string;
  userNameOrMobile: string;
  email?: string;
  password: string;
  remarks?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Server {
  id: string;
  name: string;
  address: string;
  monitoringType: 'web' | 'server' | 'ping';
  packetSize?: number;
  status: 'online' | 'offline';
  lastChecked?: string;
  avgResponseTime?: number;
  createdAt?: string;
}

export interface PingRecord {
  id?: string;
  serverId: string;
  timestamp: string;
  status: 'online' | 'offline';
  responseTime: number;
}


