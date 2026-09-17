import React from 'react';
import { ReportExecutiveSummary } from '@/types/reports';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, FileText, ShieldAlert, Bot } from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: ReportExecutiveSummary;
}

export const ReportExecutiveSummaryCards: React.FC<ExecutiveSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs mb-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Executive Compliance Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent counts of evaluated requirements, evidence conflicts, and investigation records.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {summary.totalRequirements} Requirements Evaluated
        </span>
      </div>

      {/* 4 Status Count Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASS
          </div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
            {summary.passCount}
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
            Deterministic rule passed
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60">
          <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> FAIL
          </div>
          <div className="text-2xl font-bold text-rose-900 dark:text-rose-200">
            {summary.failCount}
          </div>
          <div className="text-[10px] text-rose-700 dark:text-rose-400 mt-0.5">
            Deterministic rule failed
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
          <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> REVIEW
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
            {summary.reviewCount}
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
            Human officer review required
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> NOT EVALUABLE
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {summary.notEvaluableCount}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Evidence missing or unsuitable
          </div>
        </div>
      </div>

      {/* Secondary Meta Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <ShieldAlert className="w-4 h-4 text-rose-500" /> Evidence Conflicts:
          </span>
          <strong className="text-slate-900 dark:text-white font-mono text-sm">
            {summary.conflictCount}
          </strong>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <Bot className="w-4 h-4 text-indigo-500" /> AI Investigations:
          </span>
          <strong className="text-slate-900 dark:text-white font-mono text-sm">
            {summary.investigationCount}
          </strong>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <FileText className="w-4 h-4 text-emerald-500" /> Evidence Coverage:
          </span>
          <strong className="text-slate-900 dark:text-white font-mono text-sm">
            {summary.coveragePercentage}%
          </strong>
        </div>
      </div>
    </div>
  );
};
