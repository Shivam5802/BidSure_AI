import React, { useState, useEffect } from 'react';
import { WhyExplanationResult } from '@/types/workspace';
import { workspaceApi } from '@/lib/api/workspace.api';
import { X, HelpCircle, FileText, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';

interface RequirementWhyDrawerProps {
  tenderId: string;
  requirementId: string | null;
  bidderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onViewSourcePage?: (docId: string, pageNumber: number) => void;
}

export const RequirementWhyDrawer: React.FC<RequirementWhyDrawerProps> = ({
  tenderId,
  requirementId,
  bidderId,
  isOpen,
  onClose,
  onViewSourcePage,
}) => {
  const [data, setData] = useState<WhyExplanationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tenderId && requirementId && bidderId) {
      setIsLoading(true);
      setError(null);
      workspaceApi
        .getWhyExplanation(tenderId, requirementId, bidderId)
        .then((res) => setData(res))
        .catch((err) => setError(err.message || 'Failed to load Why? explanation.'))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, tenderId, requirementId, bidderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                WHY DID THIS RESULT HAPPEN?
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Auditable Evaluation Trace Explanation
            </h2>
            <p className="text-xs text-slate-500">
              Source-Grounded Calculation & Evidence Verification Trace
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Fetching evaluation trace explanation...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Result Summary Banner */}
              <div
                className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                  data.evaluation.result === 'PASS'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                    : data.evaluation.result === 'FAIL'
                    ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200'
                    : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 block">
                    {data.bidder.legalName} ({data.bidder.bidderCode})
                  </span>
                  <h3 className="text-xl font-extrabold mt-0.5">
                    Evaluation Result: {data.evaluation.result}
                  </h3>
                  <p className="text-xs mt-1 font-mono">{data.evaluation.summary}</p>
                </div>
              </div>

              {/* Requirement Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {data.requirement.requirementCode}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {data.requirement.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {data.requirement.requirementText}
                </h4>
                {data.requirement.clauseReference && (
                  <p className="text-xs text-slate-500">Tender Clause Reference: {data.requirement.clauseReference}</p>
                )}
              </div>

              {/* Deterministic Rule Section */}
              {data.rule && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Approved Rule Definition
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {data.rule.name} ({data.rule.ruleCode})
                  </p>
                  <pre className="text-[11px] font-mono p-2.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 overflow-x-auto">
                    {JSON.stringify(data.rule.definition, null, 2)}
                  </pre>
                </div>
              )}

              {/* Concise Auditable Explanation Trace */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Calculation Trace & Auditable Reasoning
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-line">
                  {data.evaluation.explanation}
                </p>
              </div>

              {/* Linked Source Evidence Records */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Linked Source Evidence Items ({data.evidenceSources.length})
                </span>

                {data.evidenceSources.map((ev, idx) => (
                  <div
                    key={ev.evidenceId || idx}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-indigo-600 dark:text-indigo-400">{ev.fieldLabel}</span>
                      <span className="text-slate-500 font-mono">Page {ev.pageNumber}</span>
                    </div>

                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Raw Value: "{ev.rawValue}"
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Document: {ev.documentName}
                    </p>

                    {ev.sourceText && (
                      <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 text-[11px] font-mono text-slate-600 dark:text-slate-400 line-clamp-2">
                        "{ev.sourceText}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs text-slate-500">
          <span>Engine: {data?.evaluation.engineVersion || 'Compliance Engine v1.0.0'}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
