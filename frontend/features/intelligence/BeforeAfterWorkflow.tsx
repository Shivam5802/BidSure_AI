'use client';

import React from 'react';
import { ArrowDown, ArrowRight, GitCommit, CheckCircle2, Clock } from 'lucide-react';

export const BeforeAfterWorkflow: React.FC = () => {
  const traditionalSteps = [
    'Open Tender PDF (100+ pages)',
    'Read and interpret clauses manually',
    'Draft spreadsheet compliance checklist',
    'Open each bidder submission folder',
    'Manually hunt for evidence across pages',
    'Compare numbers, dates & credentials',
    'Cross-check external portals in browser',
    'Manually record findings & remarks',
    'Prepare evaluation summary report',
  ];

  const bidguardSteps = [
    'Upload Tender Document',
    'AI Requirement Blueprint Extraction',
    'Approved Deterministic Rules',
    'Ingest Bidder Submissions',
    'Automated Evidence Extraction & Page Citation',
    'Deterministic Compliance Evaluation',
    'Government Verification & AI Investigation',
    'Procurement Officer Human Decision',
    'Immutable SHA-256 Audit Trail & Report',
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Workflow Transformation Comparison</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Illustrative comparison of manual procurement workflow vs. BidGuard AI evidence-driven architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traditional Workflow Column */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Traditional Procurement Process
            </h3>
          </div>

          <div className="space-y-2">
            {traditionalSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300">{step}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-200 dark:border-slate-700">
            High cognitive load, manual cross-referencing, potential oversight of conflicting values.
          </p>
        </div>

        {/* BidGuard AI Workflow Column */}
        <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-indigo-200 dark:border-indigo-800/60">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
              BidGuard AI Assisted Workflow
            </h3>
          </div>

          <div className="space-y-2">
            {bidguardSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{step}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium pt-2 border-t border-indigo-200 dark:border-indigo-800/60">
            Source-grounded facts, deterministic rules, instant contradiction detection, human governance.
          </p>
        </div>
      </div>
    </div>
  );
};
