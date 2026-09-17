'use client';

import React from 'react';
import { AuditabilityMetrics } from '@/types/intelligence';
import { ShieldCheck, HelpCircle, Database, GitCommit, FileCheck, CheckCircle, Award } from 'lucide-react';

interface AuditabilityMetricsCardProps {
  metrics: AuditabilityMetrics;
}

export const AuditabilityMetricsCard: React.FC<AuditabilityMetricsCardProps> = ({ metrics }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Traceability & Auditability Metrics</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically verifiable provenance chains and human-in-the-loop oversight rates.
          </p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          Audit Ready
        </span>
      </div>

      {/* Key Highlight Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 1. Key Innovation: Evidence Traceability */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 to-blue-50/40 dark:from-indigo-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
            <span className="font-bold uppercase tracking-wider text-[11px]">Evidence Traceability</span>
            <span
              title="Proportion of compliance evaluations with unbroken provenance: Requirement -> Rule -> Evidence Fact -> Source Document -> Page number."
              className="cursor-pointer text-indigo-500 hover:text-indigo-700"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400">
            {metrics.evidenceTraceabilityPercentage}%
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Full provenance chain linked directly to verbatim page citations.
          </p>
        </div>

        {/* 2. Automation Coverage */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold uppercase tracking-wider text-[11px]">Automation Coverage</span>
            <span
              title="Percentage of applicable requirements evaluated automatically by approved deterministic rules. This is a system workflow metric, not a measure of procurement correctness."
              className="cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics.automationCoveragePercentage}%
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Evaluated automatically via approved deterministic rules.
          </p>
        </div>

        {/* 3. Human Review Rate */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold uppercase tracking-wider text-[11px]">Human Review Rate</span>
            <span
              title="Requirements requiring officer review or subjective verification. An intentional safety control mechanism, not a failure."
              className="cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {metrics.humanReviewRatePercentage}%
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Officer oversight for borderline criteria or missing evidence.
          </p>
        </div>

        {/* 4. Verification Coverage */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold uppercase tracking-wider text-[11px]">Verification Coverage</span>
            <span
              title="Requirements with external credential verification completed vs applicable requirements."
              className="cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics.verificationCoveragePercentage !== null
              ? `${metrics.verificationCoveragePercentage}%`
              : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            External government credential verification completed.
          </p>
        </div>
      </div>

      {/* Granular Provenance Traceability Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <div className="text-[10px] uppercase font-bold text-slate-400">Req Source Provenance</div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {metrics.requirementProvenancePercentage}%
          </div>
          <div className="text-[10px] text-slate-400">Linked to tender docs</div>
        </div>

        <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <div className="text-[10px] uppercase font-bold text-slate-400">Evidence Page Provenance</div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {metrics.evidencePageProvenancePercentage}%
          </div>
          <div className="text-[10px] text-slate-400">Explicit page number</div>
        </div>

        <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <div className="text-[10px] uppercase font-bold text-slate-400">Rule Version Trace</div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {metrics.evaluationVersionTracePercentage}%
          </div>
          <div className="text-[10px] text-slate-400">Frozen rule snapshot</div>
        </div>

        <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <div className="text-[10px] uppercase font-bold text-slate-400">Audit Events Recorded</div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {metrics.auditEventsRecordedCount}
          </div>
          <div className="text-[10px] text-slate-400">SHA-256 sequential trail</div>
        </div>
      </div>

      {/* Data Source Footnote */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
        <Database className="w-3 h-3" />
        <span>Source: Cryptographic Audit Trail & Snapshot Engine</span>
      </div>
    </div>
  );
};
