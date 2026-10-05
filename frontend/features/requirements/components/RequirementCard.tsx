'use client';

import React from 'react';
import { AlertTriangle, HelpCircle, Copy, CheckCircle2, FileText } from 'lucide-react';
import { TenderRequirement } from '../types';

interface RequirementCardProps {
  requirement: TenderRequirement;
  isSelected: boolean;
  onSelect: () => void;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement: req,
  isSelected,
  onSelect,
}) => {
  const categoryColors: Record<string, string> = {
    FINANCIAL: 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    TECHNICAL: 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
    STATUTORY: 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
    ELIGIBILITY: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    POLICY: 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
    TENDER_SPECIFIC: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
  };

  const statusBadge = () => {
    switch (req.status) {
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
            <AlertTriangle className="w-3 h-3" /> Conflict
          </span>
        );
      case 'REVIEW':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
            <HelpCircle className="w-3 h-3" /> Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 line-through">
            Rejected
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Draft
          </span>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 border-b transition cursor-pointer select-none ${
        isSelected
          ? 'bg-blue-50/80 dark:bg-slate-800/90 border-l-4 border-l-blue-600 dark:border-l-blue-500 border-b-slate-200 dark:border-b-slate-700'
          : 'bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b-slate-200 dark:border-b-slate-800/80'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{req.requirementCode}</span>
          {req.clauseReference && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              Clause {req.clauseReference}
            </span>
          )}
        </div>
        {statusBadge()}
      </div>

      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-2 line-clamp-2 leading-relaxed">
        {req.requirementText}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
            categoryColors[req.category] || categoryColors.TENDER_SPECIFIC
          }`}
        >
          {req.category}
        </span>

        <div className="flex items-center gap-2">
          {/* Warning Flag Icons */}
          {req.ambiguityFlag && (
            <span title="Ambiguous clause" className="text-amber-500 dark:text-amber-400">
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          )}
          {req.conflictFlag && (
            <span title="Clause conflict detected" className="text-rose-500 dark:text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          )}
          {req.duplicateFlag && (
            <span title="Duplicate requirement" className="text-purple-500 dark:text-purple-400">
              <Copy className="w-3.5 h-3.5" />
            </span>
          )}

          <span
            className={`text-xs font-mono font-semibold ${
              req.extractionConfidence >= 0.9
                ? 'text-emerald-600 dark:text-emerald-400'
                : req.extractionConfidence >= 0.75
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {Math.round(req.extractionConfidence * 100)}% Conf
          </span>
        </div>
      </div>
    </div>
  );
};
