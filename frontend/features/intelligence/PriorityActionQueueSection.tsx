'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PriorityActionItem, IndicatorSeverity, PRIORITY_ORDERING_DISCLAIMER } from '@/types/intelligence';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  FileSearch,
  CheckCircle2,
} from 'lucide-react';

interface PriorityActionQueueSectionProps {
  actions: PriorityActionItem[];
  tenderId: string;
}

export const PriorityActionQueueSection: React.FC<PriorityActionQueueSectionProps> = ({ actions, tenderId }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const filteredActions =
    selectedSeverity === 'ALL'
      ? actions
      : actions.filter((a) => a.priority === selectedSeverity);

  const getSeverityBadge = (priority: IndicatorSeverity) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertOctagon className="w-3 h-3" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Info className="w-3 h-3" />
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Info className="w-3 h-3" />
            LOW
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Priority Action Queue</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredActions.length} Actions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explainable attention indicators prioritized deterministically for officer review.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition ${
                selectedSeverity === sev
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Critical Mandated Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Attention Ordering Principle: </span>
          <span>{PRIORITY_ORDERING_DISCLAIMER}</span>
        </div>
      </div>

      {/* Action Items List */}
      {filteredActions.length === 0 ? (
        <div className="text-center py-10 text-slate-400 dark:text-slate-500">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
          <p className="text-sm font-medium">No attention actions matching current filter.</p>
          <p className="text-xs">All requirements in this category have been addressed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActions.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(item.priority)}
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {item.category.replace(/_/g, ' ')}
                  </span>
                  {item.bidderName && (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Bidder: <span className="text-indigo-600 dark:text-indigo-400">{item.bidderName}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.reason}</p>

                {item.sourceReferences && item.sourceReferences.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Sources:</span>
                    {item.sourceReferences.map((src, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        {src.label || src.id}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Link
                  href={item.recommendedRoute || `/tenders/${tenderId}/workspace`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
                >
                  <span>{item.actionLabel || 'Investigate'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
