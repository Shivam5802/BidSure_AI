import React from 'react';
import { ReportConflictItem } from '@/types/reports';
import { ShieldAlert, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

interface ConflictsSectionProps {
  conflicts: ReportConflictItem[];
}

export const ReportConflictsSection: React.FC<ConflictsSectionProps> = ({ conflicts }) => {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs mb-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Evidence Conflicts Record ({conflicts.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit history of detected evidence contradictions and officer resolutions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conflicts.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                {c.conflictType}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                Severity: {c.severity}
              </span>
            </div>

            <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {c.description}
            </p>

            <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px] flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Status: <strong>{c.status}</strong></span>
              {c.resolvedBy && (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <UserCheck className="w-3.5 h-3.5" /> Resolved by {c.resolvedBy}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
