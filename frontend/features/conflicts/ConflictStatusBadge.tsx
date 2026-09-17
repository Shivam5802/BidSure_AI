import React from 'react';
import { ConflictSeverity, ConflictStatus, ConflictType } from '@/types/conflict';

interface ConflictStatusBadgeProps {
  severity?: ConflictSeverity;
  status?: ConflictStatus;
  conflictType?: ConflictType;
}

export const ConflictStatusBadge: React.FC<ConflictStatusBadgeProps> = ({
  severity,
  status,
  conflictType,
}) => {
  if (severity) {
    const severityStyles: Record<ConflictSeverity, string> = {
      CRITICAL: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${severityStyles[severity]}`}
      >
        {severity}
      </span>
    );
  }

  if (status) {
    const statusStyles: Record<ConflictStatus, string> = {
      DETECTED: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      UNDER_REVIEW: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      INVESTIGATING: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800 animate-pulse',
      RESOLVED: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      DISMISSED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700',
      SUPERSEDED: 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-500 border-gray-300 dark:border-gray-800 line-through',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${statusStyles[status]}`}
      >
        {status.replace('_', ' ')}
      </span>
    );
  }

  if (conflictType) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {conflictType.replace(/_/g, ' ')}
      </span>
    );
  }

  return null;
};
