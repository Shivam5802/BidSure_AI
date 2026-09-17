import React from 'react';
import { Bot, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface InvestigationPanelProps {
  tenderId: string;
  humanReviewCount: number;
  pendingCount: number;
  totalCount: number;
  bidders: any[];
}

export const InvestigationPanel: React.FC<InvestigationPanelProps> = ({
  tenderId,
  humanReviewCount,
  pendingCount,
  totalCount,
  bidders,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Compliance Investigations</h3>
            <p className="text-[11px] text-slate-500">Feature 1H agent case logs</p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200">
          {humanReviewCount} Requires Officer
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Pending / Active</span>
          <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400">{pendingCount}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Total Agent Cases</span>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{totalCount}</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2">
        <Bot className="w-4 h-4 text-purple-600 shrink-0" />
        <span>
          AI investigations are strictly advisory. Final decisions belong to the Procurement Officer.
        </span>
      </div>
    </div>
  );
};
