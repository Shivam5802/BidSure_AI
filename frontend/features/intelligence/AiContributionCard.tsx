'use client';

import React from 'react';
import { AiContributionAnalytics } from '@/types/intelligence';
import { Bot, Cpu, UserCheck, ShieldCheck } from 'lucide-react';

interface AiContributionCardProps {
  contribution?: AiContributionAnalytics;
}

export const AiContributionCard: React.FC<AiContributionCardProps> = ({ contribution }) => {
  const defaultContribution: AiContributionAnalytics = {
    aiAssistedActivities: [
      {
        activity: 'Tender Requirement Extraction',
        description: 'Extracts clauses, criteria, and statutory conditions from unformatted PDFs.',
        component: 'AI Blueprint Engine',
      },
      {
        activity: 'Document Classification',
        description: 'Categorizes bid documents (PAN, GST, ITR, Experience Certificates, Audited Statements).',
        component: 'Bidder Ingestion Pipeline',
      },
      {
        activity: 'Evidence Extraction',
        description: 'Extracts source-grounded facts with bounding page numbers and verbatim text.',
        component: 'Evidence Extraction Engine',
      },
      {
        activity: 'Investigation Assistance',
        description: 'Performs multi-step inquiry on conflicts and mismatches for officer review.',
        component: 'AI Investigation Agent',
      },
    ],
    deterministicActivities: [
      {
        activity: 'Deterministic Rule Evaluation',
        description: 'Executes boolean, threshold, and date logic strictly without LLM hallucinations.',
        component: 'Compliance Evaluation Engine',
      },
      {
        activity: 'Contradiction Detection',
        description: 'Identifies conflicting values across documents using exact fact matching graphs.',
        component: 'Evidence Conflict Graph',
      },
      {
        activity: 'External Verification Checks',
        description: 'Validates statutory credentials against official external simulation adapters.',
        component: 'Verification Adapter Layer',
      },
      {
        activity: 'Audit Log Integrity',
        description: 'Maintains tamper-evident sequential audit records with cryptographic hashes.',
        component: 'Audit Trail & Snapshot Engine',
      },
    ],
    humanGovernanceActivities: [
      {
        activity: 'Mandatory Requirement Overrides',
        description: 'Procurement officers review borderline cases and make definitive compliance calls.',
        role: 'Procurement Officer',
      },
      {
        activity: 'Investigation Finding Acceptance',
        description: 'Officers accept or dismiss AI-generated root cause hypotheses.',
        role: 'Procurement Officer',
      },
      {
        activity: 'Final Tender Award',
        description: 'The platform does NOT pick winners or rank bidders; all decisions remain human.',
        role: 'Tender Committee',
      },
    ],
  };

  const data = contribution || defaultContribution;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Architectural Division of Responsibility</h2>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Strict separation of intelligence roles: AI assists understanding, deterministic engines compute logic, and human officers govern decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: AI-Assisted */}
        <div className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-800/40 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-purple-100 dark:border-purple-800/60">
            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                AI Assistance
              </h3>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Understanding & Inquiry</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {data.aiAssistedActivities.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/40 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.activity}</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{item.description}</p>
                <span className="inline-block text-[10px] font-mono text-purple-600 dark:text-purple-400">
                  {item.component}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Deterministic Engine */}
        <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/40 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-blue-100 dark:border-blue-800/60">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Deterministic Engine
              </h3>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Mathematical & Rule Logic</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {data.deterministicActivities.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-blue-100 dark:border-blue-900/40 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.activity}</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{item.description}</p>
                <span className="inline-block text-[10px] font-mono text-blue-600 dark:text-blue-400">
                  {item.component}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Human Governance */}
        <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-emerald-100 dark:border-emerald-800/60">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                Human Governance
              </h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Final Decision Authority</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {data.humanGovernanceActivities.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.activity}</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{item.description}</p>
                <span className="inline-block text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
                  Role: {item.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
