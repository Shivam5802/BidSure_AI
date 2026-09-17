'use client';

import React from 'react';
import { EvidenceCoverageAnalytics } from '@/types/intelligence';
import { Layers, Database, AlertTriangle, CheckCircle, HelpCircle, FileQuestion, Flame } from 'lucide-react';

interface EvidenceCoverageSectionProps {
  coverage: EvidenceCoverageAnalytics;
}

export const EvidenceCoverageSection: React.FC<EvidenceCoverageSectionProps> = ({ coverage }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Tender Requirement Evidence Coverage</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Proportion of tender requirement criteria backed by grounded evidence facts extracted from submissions.
        </p>
      </div>

      {/* Stacked Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Overall Grounding Health</span>
          <span>{coverage.totalMappedRequirements} Requirements Evaluated</span>
        </div>
        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          {coverage.coveredPercentage > 0 && (
            <div
              style={{ width: `${coverage.coveredPercentage}%` }}
              className="bg-emerald-500 hover:opacity-90 transition-all cursor-pointer"
              title={`Covered Evidence: ${coverage.coveredCount} (${coverage.coveredPercentage}%)`}
            />
          )}
          {coverage.partialPercentage > 0 && (
            <div
              style={{ width: `${coverage.partialPercentage}%` }}
              className="bg-blue-500 hover:opacity-90 transition-all cursor-pointer"
              title={`Partial Evidence: ${coverage.partialCount} (${coverage.partialPercentage}%)`}
            />
          )}
          {coverage.conflictingPercentage > 0 && (
            <div
              style={{ width: `${coverage.conflictingPercentage}%` }}
              className="bg-purple-500 hover:opacity-90 transition-all cursor-pointer"
              title={`Conflicting Evidence: ${coverage.conflictingCount} (${coverage.conflictingPercentage}%)`}
            />
          )}
          {coverage.ambiguousPercentage > 0 && (
            <div
              style={{ width: `${coverage.ambiguousPercentage}%` }}
              className="bg-amber-500 hover:opacity-90 transition-all cursor-pointer"
              title={`Ambiguous Evidence: ${coverage.ambiguousCount} (${coverage.ambiguousPercentage}%)`}
            />
          )}
          {coverage.missingPercentage > 0 && (
            <div
              style={{ width: `${coverage.missingPercentage}%` }}
              className="bg-rose-400 hover:opacity-90 transition-all cursor-pointer"
              title={`No Evidence: ${coverage.missingCount} (${coverage.missingPercentage}%)`}
            />
          )}
        </div>
      </div>

      {/* 5-State Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Covered</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {coverage.coveredPercentage}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{coverage.coveredCount} reqs grounded</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Partial</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {coverage.partialPercentage}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{coverage.partialCount} reqs partial</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
            <Flame className="w-3.5 h-3.5" />
            <span>Conflicting</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {coverage.conflictingPercentage}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{coverage.conflictingCount} reqs conflicting</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Ambiguous</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {coverage.ambiguousPercentage}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{coverage.ambiguousCount} reqs ambiguous</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>No Evidence</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {coverage.missingPercentage}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{coverage.missingCount} reqs unmapped</div>
        </div>
      </div>

      {/* Note & Data Source */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 gap-2">
        <span>Evidence coverage reflects factual document grounding, distinct from compliance decisions.</span>
        <div className="flex items-center gap-1.5">
          <Database className="w-3 h-3" />
          <span>Source: Requirement Evidence Mapping Engine</span>
        </div>
      </div>
    </div>
  );
};
