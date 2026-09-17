import React from 'react';
import {
  ExtractedEvidence,
  EvidenceStatus,
  EvidenceValueType,
} from '../types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  Edit3,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface EvidenceTableProps {
  evidence: ExtractedEvidence[];
  onInspect: (item: ExtractedEvidence) => void;
  onVerify: (item: ExtractedEvidence) => void;
  onReject: (item: ExtractedEvidence) => void;
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({
  evidence,
  onInspect,
  onVerify,
  onReject,
}) => {
  if (evidence.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
        <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No Extracted Evidence Facts Found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Click "Re-Run AI Extraction" to automatically analyze the document or "Add Manual Fact" to record structured evidence manually.
        </p>
      </div>
    );
  }

  const renderStatusBadge = (status: EvidenceStatus, conflict: boolean) => {
    if (conflict) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertTriangle className="w-3.5 h-3.5" />
          Conflict
        </span>
      );
    }

    switch (status) {
      case 'VERIFIED_BY_HUMAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified
          </span>
        );
      case 'REVIEW_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            Review Needed
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'EXTRACTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Zap className="w-3.5 h-3.5" />
            Extracted
          </span>
        );
    }
  };

  const renderConfidenceBadge = (confidence: number) => {
    const pct = Math.round(confidence * 100);
    let colorClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
    if (pct < 60) {
      colorClass = 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300';
    } else if (pct < 85) {
      colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
    }

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colorClass}`}>
        {pct}%
      </span>
    );
  };

  const renderValueTypeBadge = (valueType: EvidenceValueType) => {
    return (
      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
        {valueType}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Field Parameter</th>
              <th className="py-3.5 px-4">Extracted Fact & Normalized Value</th>
              <th className="py-3.5 px-4">Source Grounding</th>
              <th className="py-3.5 px-4">Confidence</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
            {evidence.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="py-4 px-4 align-top">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {item.fieldLabel}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                        {item.fieldKey}
                      </code>
                      {renderValueTypeBadge(item.valueType)}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4 align-top">
                  <div className="space-y-1">
                    <div className="font-mono text-xs bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-2 py-1 rounded max-w-xs break-all">
                      {item.rawValue}
                    </div>
                    {item.normalizedValue !== undefined && item.normalizedValue !== null && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Normalized:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {typeof item.normalizedValue === 'object'
                            ? JSON.stringify(item.normalizedValue)
                            : String(item.normalizedValue)}
                        </span>
                        {item.unit && <span className="text-slate-400">({item.unit})</span>}
                      </div>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4 align-top">
                  <div className="text-xs space-y-1 max-w-xs">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                      Page {item.pageNumber}
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                      "{item.sourceText}"
                    </p>
                  </div>
                </td>

                <td className="py-4 px-4 align-top whitespace-nowrap">
                  {renderConfidenceBadge(item.confidence)}
                </td>

                <td className="py-4 px-4 align-top whitespace-nowrap">
                  <div>
                    {renderStatusBadge(item.status, item.conflictFlag)}
                    {item.conflictReason && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 max-w-xs">
                        {item.conflictReason}
                      </p>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {item.status !== 'VERIFIED_BY_HUMAN' && (
                      <button
                        onClick={() => onVerify(item)}
                        title="Verify Fact"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}

                    {item.status !== 'REJECTED' && (
                      <button
                        onClick={() => onReject(item)}
                        title="Reject Fact"
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onInspect(item)}
                      title="Inspect & Edit Provenance"
                      className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Inspect
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
