'use client';

import React from 'react';
import { Search, Filter, AlertTriangle, HelpCircle, Copy } from 'lucide-react';
import { RequirementFilterState } from '../types';

interface RequirementFilterBarProps {
  filters: RequirementFilterState;
  onChange: (filters: RequirementFilterState) => void;
}

export const RequirementFilterBar: React.FC<RequirementFilterBarProps> = ({
  filters,
  onChange,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clauses, codes, requirements..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full bg-slate-800 text-slate-200 text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="bg-slate-800 text-slate-200 text-sm px-3 py-2 rounded-lg border border-slate-700 outline-none cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          <option value="FINANCIAL">Financial</option>
          <option value="TECHNICAL">Technical</option>
          <option value="STATUTORY">Statutory</option>
          <option value="ELIGIBILITY">Eligibility</option>
          <option value="POLICY">Policy</option>
          <option value="TENDER_SPECIFIC">Tender Specific</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="bg-slate-800 text-slate-200 text-sm px-3 py-2 rounded-lg border border-slate-700 outline-none cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="REVIEW">Review</option>
          <option value="CONFLICT">Conflict</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Quick Flag Toggles */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Quick Flags:
        </span>

        <button
          onClick={() => onChange({ ...filters, ambiguity: !filters.ambiguity })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition border ${
            filters.ambiguity
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
          }`}
        >
          <HelpCircle className="w-3 h-3 text-amber-400" /> Ambiguous
        </button>

        <button
          onClick={() => onChange({ ...filters, conflict: !filters.conflict })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition border ${
            filters.conflict
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-rose-400" /> Conflicts
        </button>

        <button
          onClick={() => onChange({ ...filters, duplicate: !filters.duplicate })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition border ${
            filters.duplicate
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
          }`}
        >
          <Copy className="w-3 h-3 text-purple-400" /> Duplicates
        </button>

        {(filters.category !== 'ALL' ||
          filters.status !== 'ALL' ||
          filters.ambiguity ||
          filters.conflict ||
          filters.duplicate ||
          filters.search) && (
          <button
            onClick={() =>
              onChange({
                category: 'ALL',
                status: 'ALL',
                ambiguity: false,
                conflict: false,
                duplicate: false,
                search: '',
              })
            }
            className="text-slate-400 hover:text-slate-200 underline ml-auto text-xs"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
