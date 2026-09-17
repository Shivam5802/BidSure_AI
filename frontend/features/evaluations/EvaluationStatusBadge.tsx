import React from 'react';
import { EvaluationStatus, ApplicabilityStatus } from '@/types';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Slash } from 'lucide-react';

interface EvaluationStatusBadgeProps {
  status: EvaluationStatus;
  applicability?: ApplicabilityStatus;
  showText?: boolean;
  className?: string;
}

export const EvaluationStatusBadge: React.FC<EvaluationStatusBadgeProps> = ({
  status,
  applicability = 'APPLICABLE',
  showText = true,
  className = '',
}) => {
  if (applicability === 'NOT_APPLICABLE') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800 ${className}`}
        title="Rule is marked Not Applicable for this tender scope"
      >
        <Slash className="w-3.5 h-3.5 text-slate-500" />
        {showText && <span>NOT APPLICABLE</span>}
      </span>
    );
  }

  switch (status) {
    case 'PASS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm ${className}`}
          title="Deterministic compliance threshold satisfied"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          {showText && <span>PASS</span>}
        </span>
      );

    case 'FAIL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/70 text-rose-300 border border-rose-500/40 shadow-sm ${className}`}
          title="Deterministic evaluation failed threshold or criteria"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          {showText && <span>FAIL</span>}
        </span>
      );

    case 'REVIEW':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow-sm ${className}`}
          title="Requires procurement officer review (Conflicting evidence or ambiguous date/semantics)"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          {showText && <span>NEEDS REVIEW</span>}
        </span>
      );

    case 'NOT_EVALUABLE':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 shadow-sm ${className}`}
          title="Cannot be evaluated (Missing approved evidence or mandatory inputs)"
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          {showText && <span>NOT EVALUABLE</span>}
        </span>
      );
  }
};
