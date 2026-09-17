import React from 'react';
import { SelectedBidderSummary } from '@/types/comparison';
import { FileText, ShieldAlert, Search, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface BidderSummaryCardsProps {
  selectedBidders: SelectedBidderSummary[];
}

export const BidderSummaryCards: React.FC<BidderSummaryCardsProps> = ({ selectedBidders }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {selectedBidders.map((bidder) => {
        return (
          <div
            key={bidder.bidderId}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
          >
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                  {bidder.bidderCode}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {bidder.submissionStatus}
                </span>
              </div>

              <h3
                className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mb-3"
                title={bidder.legalName}
              >
                {bidder.displayName || bidder.legalName}
              </h3>
            </div>

            {/* Evaluation Results Breakdown */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Evaluation Results
              </div>

              <div className="grid grid-cols-2 gap-1.5 font-medium">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASS
                  </span>
                  <span className="font-bold">{bidder.passCount}</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300">
                  <span className="flex items-center gap-1 text-[11px]">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> FAIL
                  </span>
                  <span className="font-bold">{bidder.failCount}</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                  <span className="flex items-center gap-1 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> REVIEW
                  </span>
                  <span className="font-bold">{bidder.reviewCount}</span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1 text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> N/E
                  </span>
                  <span className="font-bold">{bidder.notEvaluableCount}</span>
                </div>
              </div>

              {/* Evidence Coverage & Conflicts Bar */}
              <div className="pt-2 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" /> Evidence Coverage
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {bidder.evidenceCoverage.coveragePercentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${bidder.evidenceCoverage.coveragePercentage}%` }}
                  />
                  <div
                    className="bg-amber-400 h-full"
                    style={{ width: `${Math.min(100 - bidder.evidenceCoverage.coveragePercentage, 10)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-500" /> Conflicts:
                    <strong className="text-slate-900 dark:text-white">
                      {bidder.unresolvedConflictCount}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Search className="w-3 h-3 text-indigo-500" /> Investigations:
                    <strong className="text-slate-900 dark:text-white">
                      {bidder.activeInvestigationCount}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
