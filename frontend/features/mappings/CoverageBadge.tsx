import React from 'react';
import { RequirementCoverageState } from '@/types';
import { CheckCircle2, AlertTriangle, HelpCircle, XCircle, Layers } from 'lucide-react';

interface CoverageBadgeProps {
  state: RequirementCoverageState;
  showText?: boolean;
  className?: string;
}

export const CoverageBadge: React.FC<CoverageBadgeProps> = ({ state, showText = true, className = '' }) => {
  switch (state) {
    case 'COVERED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 ${className}`}
          title="Evidence items exist to evaluate this requirement (Does NOT imply compliance PASS)"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          {showText && <span>COVERED</span>}
        </span>
      );

    case 'PARTIAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30 ${className}`}
          title="Partial evidence mapped for multi-part requirement"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          {showText && <span>PARTIAL COVERAGE</span>}
        </span>
      );

    case 'AMBIGUOUS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-500/30 ${className}`}
          title="Mapped evidence has medium/low confidence and requires officer review"
        >
          <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
          {showText && <span>AMBIGUOUS</span>}
        </span>
      );

    case 'CONFLICTING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-500/30 ${className}`}
          title="Mapped evidence contains conflicting extracted values"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          {showText && <span>CONFLICTING</span>}
        </span>
      );

    case 'NO_EVIDENCE':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-700/50 ${className}`}
          title="No evidence mapped to this requirement"
        >
          <XCircle className="w-3.5 h-3.5 text-slate-500" />
          {showText && <span>NO EVIDENCE</span>}
        </span>
      );
  }
};
