import React from 'react';
import {
  Search,
  Plus,
  Download,
  Upload,
  X,
  Filter,
  FileDown,
  Columns3,
} from 'lucide-react';
import { FilterOptions } from '../../types';
import {
  BRANCH_CODES,
  OPERATOR_OPTIONS,
  SIM_TYPES,
  DEPARTMENTS,
  SIM_OWNERS,
  SIM_GROUPS,
} from '../../data/simInitialData';

interface SimToolbarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onOpenNewForm: () => void;
  onExportCSV: () => void;
  onOpenImport: () => void;
  onResetData?: () => void;
  compactMode?: boolean;
  onToggleCompact?: () => void;
  onOpenPdfExport: () => void;
  onOpenColumnFilter: () => void;
  activeColumnsCount?: number;
  totalColumnsCount?: number;
  canEdit?: boolean;
  branches?: string[];
  operators?: string[];
  simTypes?: string[];
  departments?: string[];
  simOwners?: string[];
  simGroups?: string[];
  statuses?: string[];
}

export const SimToolbar: React.FC<SimToolbarProps> = ({
  filters,
  onFilterChange,
  onOpenNewForm,
  onExportCSV,
  onOpenImport,
  onResetData,
  compactMode,
  onToggleCompact,
  onOpenPdfExport,
  onOpenColumnFilter,
  activeColumnsCount = 18,
  totalColumnsCount = 18,
  canEdit = true,
  branches = BRANCH_CODES,
  operators = OPERATOR_OPTIONS,
  simTypes = SIM_TYPES,
  departments = DEPARTMENTS,
  simOwners = SIM_OWNERS,
  simGroups = SIM_GROUPS,
  statuses = ['Active', 'Inactive'],
}) => {
  const hasActiveFilters =
    filters.branchCode !== '' ||
    filters.operatorName !== '' ||
    filters.simType !== '' ||
    filters.department !== '' ||
    filters.simOwner !== '' ||
    filters.simGroup !== '' ||
    Boolean(filters.status) ||
    Boolean(filters.search);

  const resetFilters = () => {
    onFilterChange({
      ...filters,
      branchCode: '',
      operatorName: '',
      simType: '',
      department: '',
      simOwner: '',
      simGroup: '',
      status: '',
      search: '',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      {/* Top row: Search & Primary Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-64 lg:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="search-input"
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search by User Name, SIM Number."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white shadow-2xs"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Column Filter Button */}
          <button
            id="btn-column-filter"
            onClick={onOpenColumnFilter}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Choose which columns to show"
          >
            <Columns3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Columns ({activeColumnsCount}/{totalColumnsCount})</span>
          </button>

          {/* PDF Download Button with Red Outline matching image */}
          <button
            id="btn-download-pdf"
            onClick={onOpenPdfExport}
            className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Filter columns and download styled PDF report"
          >
            <FileDown className="w-4 h-4 text-rose-600" />
            <span>PDF Download</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download CSV file for Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {canEdit && (
            <button
              id="btn-import-data"
              onClick={onOpenImport}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-400 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Import SIM data from Excel or CSV file (এক্সেল বা সিএসভি ইমপোর্ট)"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import (ইমপোর্ট)</span>
            </button>
          )}

          {canEdit && (
            <button
              id="btn-open-form-modal"
              onClick={onOpenNewForm}
              className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New SIM (নতুন এন্ট্রি)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center text-slate-500 font-medium mr-1">
          <Filter className="w-3.5 h-3.5 mr-1" />
          <span>Filters:</span>
        </div>

        {/* Branch Code */}
        <select
          value={filters.branchCode}
          onChange={(e) => onFilterChange({ ...filters, branchCode: e.target.value })}
          className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 outline-hidden focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b} value={b}>
              Branch: {b}
            </option>
          ))}
        </select>

        {/* Operator */}
        <select
          value={filters.operatorName}
          onChange={(e) => onFilterChange({ ...filters, operatorName: e.target.value })}
          className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 outline-hidden focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Operators</option>
          {operators.map((op) => (
            <option key={op} value={op}>
              Operator: {op}
            </option>
          ))}
        </select>

        {/* Sim Type */}
        <select
          value={filters.simType}
          onChange={(e) => onFilterChange({ ...filters, simType: e.target.value })}
          className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 outline-hidden focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All SIM Types</option>
          {simTypes.map((t) => (
            <option key={t} value={t}>
              Type: {t}
            </option>
          ))}
        </select>

        {/* Department */}
        <select
          value={filters.department}
          onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
          className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 outline-hidden focus:ring-1 focus:ring-blue-500 max-w-[180px] truncate"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Sim Owner */}
        <select
          value={filters.simOwner || ''}
          onChange={(e) => onFilterChange({ ...filters, simOwner: e.target.value })}
          className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 outline-hidden focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All SIM Owners</option>
          {simOwners.map((owner) => (
            <option key={owner} value={owner}>
              Owner: {owner}
            </option>
          ))}
        </select>

        {/* Sim Group */}
        <select
          value={filters.simGroup}
          onChange={(e) => onFilterChange({ ...filters, simGroup: e.target.value })}
          className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 outline-hidden focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All SIM Groups</option>
          {simGroups.map((grp) => (
            <option key={grp} value={grp}>
              Group: {grp}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
        >
          <option value="">All Statuses</option>
          {statuses.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-2 py-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
