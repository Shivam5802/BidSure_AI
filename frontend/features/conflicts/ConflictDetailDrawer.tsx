import React, { useState } from 'react';
import { EvidenceConflict, ConflictStatus } from '@/types/conflict';
import {
  X,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Bot,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Loader2,
  Network,
} from 'lucide-react';
import { ConflictStatusBadge } from './ConflictStatusBadge';

interface ConflictDetailDrawerProps {
  conflict: EvidenceConflict | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    conflictId: string,
    status: ConflictStatus,
    resolution?: string,
    reason?: string
  ) => Promise<void>;
  onInvestigate: (conflictId: string) => Promise<void>;
  onOpenGraph: (conflict: EvidenceConflict) => void;
  onViewSourcePage?: (docId: string, pageNumber: number) => void;
}

export const ConflictDetailDrawer: React.FC<ConflictDetailDrawerProps> = ({
  conflict,
  isOpen,
  onClose,
  onUpdateStatus,
  onInvestigate,
  onOpenGraph,
  onViewSourcePage,
}) => {
  const [resolution, setResolution] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isOpen || !conflict) return null;

  const handleResolve = async (status: ConflictStatus) => {
    if (!reason.trim()) {
      setActionError('Resolution reason is required for procurement officer review.');
      return;
    }
    setActionError(null);
    setIsSubmitting(true);
    try {
      await onUpdateStatus(conflict.id, status, resolution, reason);
      onClose();
    } catch (err: any) {
      setActionError(err.message || 'Failed to record resolution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunInvestigation = async () => {
    setActionError(null);
    setIsInvestigating(true);
    try {
      await onInvestigate(conflict.id);
    } catch (err: any) {
      setActionError(err.message || 'Failed to launch AI investigation.');
    } finally {
      setIsInvestigating(false);
    }
  };

  const items = conflict.items || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ConflictStatusBadge severity={conflict.severity} />
              <ConflictStatusBadge status={conflict.status} />
              <ConflictStatusBadge conflictType={conflict.conflictType} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {conflict.fieldKey.toUpperCase()} Contradiction Detail
            </h2>
            <p className="text-xs text-slate-500">
              Confidence Score: {(conflict.confidence * 100).toFixed(0)}% • ID: {conflict.id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Visual Graph Banner Button */}
          <button
            onClick={() => onOpenGraph(conflict)}
            className="w-full p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between group hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
                <Network className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  View Auditable Evidence Conflict Graph
                </span>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                  Visually trace Requirement $\rightarrow$ Evaluation $\rightarrow$ Conflict $\rightarrow$ Evidence A/B
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Natural Language Explanation */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Deterministic Engine Explanation
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-mono">
              {conflict.description}
            </p>
          </div>

          {/* Conflicting Source Evidence Records (Side by Side) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Linked Source Evidence Items ({items.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item, index) => {
                const docName =
                  item.sourceSnapshot?.documentName ||
                  item.evidence?.bidDocument?.originalFilename ||
                  'Bid Document';
                const pageNum = item.sourceSnapshot?.pageNumber || item.evidence?.pageNumber || 1;
                const rawVal = item.sourceSnapshot?.rawValue || item.evidence?.rawValue || 'N/A';
                const sourceText = item.sourceSnapshot?.sourceText || item.evidence?.sourceText || '';
                const docId = item.evidence?.bidDocumentId;

                return (
                  <div
                    key={item.id || index}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                        Source {index + 1}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Page {pageNum}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Extracted Value:</span>
                      <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {rawVal}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400">Document Provenance:</span>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{docName}</span>
                      </p>
                    </div>

                    {sourceText && (
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-600 dark:text-slate-400 font-mono line-clamp-3">
                        "{sourceText}"
                      </div>
                    )}

                    {onViewSourcePage && docId && (
                      <button
                        onClick={() => onViewSourcePage(docId, pageNum)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Open Original Page PDF
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature 1H AI Compliance Investigation Agent Section */}
          <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Bot className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold">AI Investigation Agent (Feature 1H)</h3>
              </div>
              {conflict.investigationId && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  Linked Case #{conflict.investigationId.substring(0, 8)}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Launch the specialized AI Compliance Investigation Agent to examine contextual evidence ambiguities, parent company declarations, or semantic terminology differences.
            </p>

            <button
              onClick={handleRunInvestigation}
              disabled={isInvestigating || conflict.status === 'RESOLVED'}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 dark:disabled:bg-purple-950 flex items-center justify-center gap-2 transition shadow-sm"
            >
              {isInvestigating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Investigating Conflict Case...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  Investigate Case with AI Agent
                </>
              )}
            </button>
          </div>

          {/* Human Procurement Officer Resolution Form */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                Human Officer Resolution
              </h3>
              <p className="text-xs text-slate-500">
                Record an authoritative procurement resolution decision with full audit trail preservation.
              </p>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800">
                {actionError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Decision / Finding:
                </label>
                <input
                  type="text"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="e.g. CA Certificate verified as authoritative per clause 4.2"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Resolution Reason (Required for Audit Trail):
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide explicit reason or rationale for the procurement officer decision..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleResolve('RESOLVED')}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Resolve Conflict
                </button>

                <button
                  onClick={() => handleResolve('DISMISSED')}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Dismiss False Positive
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SIH Trust Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>BidGuard AI detected the conflict — it did not decide which document was correct.</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Final Decision: Authorized Officer</span>
        </div>
      </div>
    </div>
  );
};
