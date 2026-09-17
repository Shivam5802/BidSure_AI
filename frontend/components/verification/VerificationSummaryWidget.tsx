import React from 'react';
import { VerificationSummaryDTO } from '@/types/verification';
import { ShieldCheck, XCircle, AlertTriangle, AlertCircle, FileCheck, ExternalLink } from 'lucide-react';

interface VerificationSummaryWidgetProps {
  summary: VerificationSummaryDTO | null;
  onFilterClick?: (status: string) => void;
  isLoading?: boolean;
}

export function VerificationSummaryWidget({
  summary,
  onFilterClick,
  isLoading = false,
}: VerificationSummaryWidgetProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse space-y-4">
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const s = summary || {
    totalCount: 0,
    matchCount: 0,
    mismatchCount: 0,
    reviewRequiredCount: 0,
    unavailableCount: 0,
    notFoundCount: 0,
    errorCount: 0,
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">External Verification Summary</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                DEMO / MOCK
              </span>
            </div>
            <p className="text-xs text-slate-500">Cross-checks against simulated external providers</p>
          </div>
        </div>

        {onFilterClick && (
          <button
            onClick={() => onFilterClick('ALL')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total */}
        <button
          onClick={() => onFilterClick && onFilterClick('ALL')}
          className="flex flex-col p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total</span>
            <FileCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-xl font-bold text-slate-900 mt-1">{s.totalCount}</span>
        </button>

        {/* Match */}
        <button
          onClick={() => onFilterClick && onFilterClick('MATCH')}
          className="flex flex-col p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors text-left"
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Match</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-xl font-bold text-emerald-900 mt-1">{s.matchCount}</span>
        </button>

        {/* Mismatch */}
        <button
          onClick={() => onFilterClick && onFilterClick('MISMATCH')}
          className="flex flex-col p-3 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100/60 transition-colors text-left"
        >
          <div className="flex items-center justify-between text-red-700 text-xs font-medium">
            <span>Mismatch</span>
            <XCircle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <span className="text-xl font-bold text-red-900 mt-1">{s.mismatchCount}</span>
        </button>

        {/* Review Required */}
        <button
          onClick={() => onFilterClick && onFilterClick('REVIEW_REQUIRED')}
          className="flex flex-col p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-colors text-left"
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Review Req.</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-xl font-bold text-amber-900 mt-1">{s.reviewRequiredCount}</span>
        </button>

        {/* Unavailable */}
        <button
          onClick={() => onFilterClick && onFilterClick('UNAVAILABLE')}
          className="flex flex-col p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        >
          <div className="flex items-center justify-between text-slate-600 text-xs font-medium">
            <span>Unavailable</span>
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-xl font-bold text-slate-800 mt-1">{s.unavailableCount}</span>
        </button>
      </div>
    </div>
  );
}
