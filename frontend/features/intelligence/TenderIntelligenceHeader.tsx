'use client';

import React from 'react';
import { TenderHealthSnapshot } from '@/types/intelligence';
import { RefreshCw, Clock, ShieldCheck, FileText, AlertTriangle, AlertOctagon, CheckCircle2, XCircle } from 'lucide-react';

interface TenderIntelligenceHeaderProps {
  snapshot: TenderHealthSnapshot;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const TenderIntelligenceHeader: React.FC<TenderIntelligenceHeaderProps> = ({
  snapshot,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Demo Intelligence & Impact Analytics
            </span>
            <span className="text-xs text-slate-400 font-mono">Ref: {snapshot.referenceNumber}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {snapshot.tenderTitle}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Analytics generated: {new Date(snapshot.dataTimestamp).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Intelligence'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Requirements</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{snapshot.totalRequirements}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Extracted Blueprints</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Rules</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{snapshot.executableRulesCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Deterministic Rules</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Evidence Coverage</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{snapshot.evidenceCoveragePercentage}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Direct Grounding</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">PASS</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{snapshot.passCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Satisfied criteria</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">FAIL</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{snapshot.failCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Deterministic fails</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">REVIEW</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{snapshot.reviewCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Officer attention</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conflicts</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{snapshot.unresolvedConflictCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Unresolved graph</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mismatches</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{snapshot.externalMismatchCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">External adapters</div>
        </div>
      </div>
    </div>
  );
};
