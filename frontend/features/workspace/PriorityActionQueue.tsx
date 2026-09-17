import React from 'react';
import { PriorityActionItem, PriorityLevel } from '@/types/workspace';
import { AlertCircle, ArrowRight, Bot, AlertTriangle, XCircle, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface PriorityActionQueueProps {
  actions: PriorityActionItem[];
  onActionClick?: (action: PriorityActionItem) => void;
}

export const PriorityActionQueue: React.FC<PriorityActionQueueProps> = ({
  actions,
  onActionClick,
}) => {
  if (actions.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Priority Action Queue Clear</h3>
        <p className="text-xs text-slate-500">
          No critical conflicts, failing requirements, or officer-review cases currently require immediate attention.
        </p>
      </div>
    );
  }

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse';
      case 'HIGH':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Priority Action Queue ("Action Required")
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic prioritization surfacing critical conflicts, FAIL evaluations, and pending officer decisions ({actions.length} items)
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {actions.slice(0, 8).map((action) => (
          <div
            key={action.id}
            className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition"
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(action.priority)}`}>
                  {action.priority}
                </span>

                {action.bidderCode && (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {action.bidderCode}
                  </span>
                )}

                {action.bidderName && (
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {action.bidderName}
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {action.title}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-mono">
                {action.reason}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={action.recommendedRoute}
                onClick={() => onActionClick && onActionClick(action)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-xs"
              >
                Review Item
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
