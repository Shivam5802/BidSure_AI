import React from 'react';
import { Users, FileText, CheckCircle2, XCircle, AlertTriangle, HelpCircle, Bot } from 'lucide-react';

interface OverviewCardsProps {
  counts: {
    bidderCount: number;
    activeBidderCount: number;
    requirementCount: number;
    approvedRequirementCount: number;
    passCount: number;
    failCount: number;
    reviewCount: number;
    notEvaluableCount: number;
    conflictCount: number;
    unresolvedConflictCount: number;
    criticalConflictCount: number;
    investigationCount: number;
    pendingInvestigationCount: number;
    humanReviewInvestigationCount: number;
  };
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ counts }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Bidders Overview */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Bidders</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{counts.bidderCount}</p>
          <span className="text-xs text-slate-500">Submitted</span>
        </div>
        <p className="text-[11px] text-slate-500">Active Bidders: {counts.activeBidderCount}</p>
      </div>

      {/* 2. Requirements Overview */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Requirements</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{counts.requirementCount}</p>
          <span className="text-xs text-slate-500">Total</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Approved Blueprint: {counts.approvedRequirementCount} / {counts.requirementCount}
        </p>
      </div>

      {/* 3. Deterministic Evaluation Breakdown */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Compliance Results</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold">
            <span>PASS</span>
            <span>{counts.passCount}</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold">
            <span>FAIL</span>
            <span>{counts.failCount}</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold">
            <span>REVIEW</span>
            <span>{counts.reviewCount}</span>
          </div>
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
            <span>N/E</span>
            <span>{counts.notEvaluableCount}</span>
          </div>
        </div>
      </div>

      {/* 4. Evidence Conflicts */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Conflicts</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{counts.unresolvedConflictCount}</p>
          <span className="text-xs text-slate-500">Unresolved</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Critical/High: <strong className="text-rose-600">{counts.criticalConflictCount}</strong> • Total: {counts.conflictCount}
        </p>
      </div>

      {/* 5. AI Investigations */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">AI Investigations</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{counts.humanReviewInvestigationCount}</p>
          <span className="text-xs text-slate-500">Requires Officer</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Pending: {counts.pendingInvestigationCount} • Total Cases: {counts.investigationCount}
        </p>
      </div>
    </div>
  );
};
