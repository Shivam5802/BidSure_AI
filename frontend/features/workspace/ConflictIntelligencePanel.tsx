import React from 'react';
import { AlertTriangle, Network, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ConflictIntelligencePanelProps {
  tenderId: string;
  unresolvedCount: number;
  criticalCount: number;
  totalCount: number;
  bidders: any[];
}

export const ConflictIntelligencePanel: React.FC<ConflictIntelligencePanelProps> = ({
  tenderId,
  unresolvedCount,
  criticalCount,
  totalCount,
  bidders,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Evidence Conflict Intelligence</h3>
            <p className="text-[11px] text-slate-500">Cross-document fact contradictions</p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {unresolvedCount} Unresolved
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Critical / High</span>
          <p className="text-lg font-extrabold text-rose-600">{criticalCount}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Total Scanned</span>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{totalCount}</p>
        </div>
      </div>

      {bidders.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Affected Bidders:</span>
          <div className="space-y-1.5">
            {bidders.slice(0, 3).map((b) => (
              <div
                key={b.bidderId}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <span className="font-medium text-slate-900 dark:text-white truncate max-w-[160px]">
                  {b.legalName}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                  {b.conflictCount} Conflicts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {bidders.length > 0 && bidders[0]?.bidderId && (
        <Link
          href={`/tenders/${tenderId}/bidders/${bidders[0].bidderId}`}
          className="w-full py-2 px-3 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 transition"
        >
          <Network className="w-3.5 h-3.5" />
          Open Conflict Center & Graph
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
};
