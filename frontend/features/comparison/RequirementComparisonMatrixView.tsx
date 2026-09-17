import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ComparisonMatrixItem,
  SelectedBidderSummary,
  RequirementCategory,
  EvaluationStatus,
} from '@/types/comparison';

interface MatrixViewProps {
  items: ComparisonMatrixItem[];
  selectedBidders: SelectedBidderSummary[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  categoryFilter: string;
  resultFilter: string;
  differenceOnly: boolean;
  attentionOnly: boolean;
  searchQuery: string;
  onPageChange: (page: number) => void;
  onCategoryChange: (cat: string) => void;
  onResultChange: (res: string) => void;
  onDifferenceOnlyToggle: (val: boolean) => void;
  onAttentionOnlyToggle: (val: boolean) => void;
  onSearchChange: (query: string) => void;
  onSelectRequirement: (requirementId: string) => void;
}

export const RequirementComparisonMatrixView: React.FC<MatrixViewProps> = ({
  items,
  selectedBidders,
  totalCount,
  currentPage,
  totalPages,
  categoryFilter,
  resultFilter,
  differenceOnly,
  attentionOnly,
  searchQuery,
  onPageChange,
  onCategoryChange,
  onResultChange,
  onDifferenceOnlyToggle,
  onAttentionOnlyToggle,
  onSearchChange,
  onSelectRequirement,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden mb-6">
      {/* Matrix Controls Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Requirement Comparison Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Side-by-side compliance results matrix for approved tender requirements across selected bidders.
            </p>
          </div>

          {/* Mode Toggles */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                onDifferenceOnlyToggle(false);
                onAttentionOnlyToggle(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                !differenceOnly && !attentionOnly
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Requirements
            </button>
            <button
              onClick={() => {
                onDifferenceOnlyToggle(true);
                onAttentionOnlyToggle(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                differenceOnly
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Differences Only
            </button>
            <button
              onClick={() => {
                onDifferenceOnlyToggle(false);
                onAttentionOnlyToggle(true);
              }}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                attentionOnly
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              Attention Required
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search requirement code or text..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="ELIGIBILITY">Eligibility</option>
              <option value="FINANCIAL">Financial</option>
              <option value="TECHNICAL">Technical</option>
              <option value="STATUTORY">Statutory</option>
              <option value="POLICY">Policy</option>
              <option value="TENDER_SPECIFIC">Tender Specific</option>
            </select>
          </div>

          {/* Result Filter */}
          <div>
            <select
              value={resultFilter}
              onChange={(e) => onResultChange(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="ALL">All Result Statuses</option>
              <option value="PASS">PASS Only</option>
              <option value="FAIL">FAIL Only</option>
              <option value="REVIEW">REVIEW Only</option>
              <option value="NOT_EVALUABLE">NOT_EVALUABLE Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-3.5 px-4 min-w-[280px] max-w-[360px] sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 shadow-xs">
                Tender Requirement
              </th>
              <th className="py-3.5 px-3 min-w-[120px]">Category</th>
              <th className="py-3.5 px-3 text-center min-w-[100px]">Variation</th>

              {/* Bidder Column Headers */}
              {selectedBidders.map((b) => (
                <th key={b.bidderId} className="py-3.5 px-4 min-w-[160px] max-w-[220px]">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {b.displayName || b.legalName}
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                    {b.bidderCode}
                  </div>
                </th>
              ))}

              <th className="py-3.5 px-4 text-center min-w-[90px]">Inspect</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={4 + selectedBidders.length}
                  className="py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  <p className="font-medium text-sm">No requirement comparison data found.</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Try adjusting search filters or selecting different comparison modes.
                  </p>
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.requirementId}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition group"
                >
                  {/* Sticky Requirement Info Column */}
                  <td
                    onClick={() => onSelectRequirement(row.requirementId)}
                    className="py-3 px-4 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80 z-10 cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                        {row.requirementCode}
                      </span>
                      {row.clauseReference && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-slate-500">
                          {row.clauseReference}
                        </span>
                      )}
                      {row.mandatory === 'YES' && (
                        <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                          Mandatory
                        </span>
                      )}
                    </div>
                    <div className="text-slate-900 dark:text-white font-medium line-clamp-2 text-xs">
                      {row.requirementText}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                      {row.category}
                    </span>
                  </td>

                  {/* Visual Difference Indicator */}
                  <td className="py-3 px-3 text-center">
                    {row.hasDifference ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        title={row.differenceState.replace('_', ' ')}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Different
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">All Same</span>
                    )}
                  </td>

                  {/* Bidder Evaluation Cells */}
                  {selectedBidders.map((b) => {
                    const cell = row.evaluations[b.bidderId];
                    const result = cell ? cell.result : 'NO_RESULT';

                    return (
                      <td
                        key={b.bidderId}
                        onClick={() => onSelectRequirement(row.requirementId)}
                        className="py-3 px-4 cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition"
                      >
                        {renderStatusBadge(result, cell?.summary)}
                      </td>
                    );
                  })}

                  {/* Inspect Button */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onSelectRequirement(row.requirementId)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Inspect side-by-side evidence & trace"
                    >
                      <Eye className="w-4 h-4 text-indigo-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of{' '}
          <strong className="text-slate-900 dark:text-white">{totalPages}</strong> ({totalCount} items)
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function renderStatusBadge(result: string, summary?: string) {
  switch (result) {
    case 'PASS':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold"
          title={summary || 'Deterministic evaluation passed'}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          PASS
        </span>
      );
    case 'FAIL':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold"
          title={summary || 'Deterministic rule failed'}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          FAIL
        </span>
      );
    case 'REVIEW':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold"
          title={summary || 'Human officer review requested'}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          REVIEW
        </span>
      );
    case 'NOT_EVALUABLE':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
          title={summary || 'Evidence missing or insufficient'}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          N/E
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs font-medium">
          No Result
        </span>
      );
  }
}
