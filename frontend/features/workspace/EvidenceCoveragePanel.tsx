import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface EvidenceCoveragePanelProps {
  coverage: {
    coveredCount: number;
    partialCount: number;
    missingCount: number;
    conflictingCount: number;
    coveragePercentage: number;
  };
}

export const EvidenceCoveragePanel: React.FC<EvidenceCoveragePanelProps> = ({ coverage }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Evidence Coverage Summary</h3>
            <p className="text-[11px] text-slate-500">Tender-level evidence mapping state</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
          {coverage.coveragePercentage}% Mapped
        </span>
      </div>

      <div className="space-y-2">
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          <div
            style={{ width: `${coverage.coveragePercentage}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title="Covered Evidence"
          />
          <div
            style={{ width: `${Math.min(20, (coverage.partialCount / 10) * 100)}%` }}
            className="bg-amber-500 transition-all duration-500"
            title="Partial Evidence"
          />
          <div
            style={{ width: `${Math.min(20, (coverage.missingCount / 10) * 100)}%` }}
            className="bg-rose-500 transition-all duration-500"
            title="Missing Evidence"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Covered
            </span>
            <span className="font-bold">{coverage.coveredCount}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
            <span className="flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Partial
            </span>
            <span className="font-bold">{coverage.partialCount}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300">
            <span className="flex items-center gap-1 font-medium">
              <XCircle className="w-3.5 h-3.5 text-rose-500" /> Missing
            </span>
            <span className="font-bold">{coverage.missingCount}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300">
            <span className="flex items-center gap-1 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-purple-500" /> Conflicting
            </span>
            <span className="font-bold">{coverage.conflictingCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
