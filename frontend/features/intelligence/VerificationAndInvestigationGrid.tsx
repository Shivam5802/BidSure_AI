'use client';

import React from 'react';
import { VerificationAnalyticsSummary, InvestigationAnalyticsSummary } from '@/types/intelligence';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Bot, ShieldCheck, Database, Zap } from 'lucide-react';

interface VerificationAndInvestigationGridProps {
  verifications: VerificationAnalyticsSummary;
  investigations: InvestigationAnalyticsSummary;
  tenderId: string;
}

export const VerificationAndInvestigationGrid: React.FC<VerificationAndInvestigationGridProps> = ({
  verifications,
  investigations,
  tenderId,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Verification Analytics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">External Verification Analytics</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory cross-checks with government and third-party credential databases.
              </p>
            </div>
            {/* Prominent Demo Mode Badge as mandated */}
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" />
              MOCK / SYNTHETIC
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-medium text-slate-500 uppercase">Requests</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {verifications.totalRequests}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Match</div>
              <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                {verifications.matchCount}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
              <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase">Mismatch</div>
              <div className="text-xl font-bold text-rose-900 dark:text-rose-200 mt-0.5">
                {verifications.mismatchCount}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
              <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase">Review</div>
              <div className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-0.5">
                {verifications.reviewRequiredCount}
              </div>
            </div>
          </div>

          {/* Type Breakdown */}
          {verifications.byType && Object.keys(verifications.byType).length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Provider Breakdown by Adapter</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(verifications.byType).map(([type, stats]) => (
                  <div
                    key={type}
                    className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-semibold">{stats.match} ✓</span>
                      {stats.mismatch > 0 && <span className="text-rose-600 font-semibold">{stats.mismatch} ✗</span>}
                      {stats.review > 0 && <span className="text-amber-600 font-semibold">{stats.review} ⚠</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
          <Database className="w-3 h-3" />
          <span>Source: External Verification Adapter Layer (Statutory Simulation)</span>
        </div>
      </div>

      {/* 2. Investigation Analytics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Investigation Analytics</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Autonomous root-cause inquiry assisting human officer decisions.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Agentic Inquiry
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-[11px] font-medium text-slate-500 uppercase">Total Cases</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {investigations.totalCount}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Completed</div>
              <div className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                {investigations.completedCount}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
              <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase">Needs Human</div>
              <div className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-0.5">
                {investigations.requiresHumanCount}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
              <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase">In Progress</div>
              <div className="text-xl font-bold text-blue-900 dark:text-blue-200 mt-0.5">
                {investigations.runningCount}
              </div>
            </div>
          </div>

          {/* Trigger Distribution */}
          {investigations.byTriggerType && Object.keys(investigations.byTriggerType).length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Inquiry Triggers</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(investigations.byTriggerType).map(([trigger, count]) => (
                  <span
                    key={trigger}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    <span>{trigger.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
          <Database className="w-3 h-3" />
          <span>Source: AI Compliance Investigation Agent</span>
        </div>
      </div>
    </div>
  );
};
