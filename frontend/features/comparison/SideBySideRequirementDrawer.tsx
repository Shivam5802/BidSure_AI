import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bot,
  Search,
  BookOpen,
  Calculator,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { comparisonApi } from '@/lib/api/comparison.api';
import { RequirementDetailComparisonResponse } from '@/types/comparison';

interface DrawerProps {
  tenderId: string;
  requirementId: string | null;
  selectedBidderIds: string[];
  onClose: () => void;
}

export const SideBySideRequirementDrawer: React.FC<DrawerProps> = ({
  tenderId,
  requirementId,
  selectedBidderIds,
  onClose,
}) => {
  const [data, setData] = useState<RequirementDetailComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeWhyBidderId, setActiveWhyBidderId] = useState<string | null>(null);

  useEffect(() => {
    if (!requirementId) return;
    setLoading(true);
    comparisonApi
      .getRequirementDetail(tenderId, requirementId, selectedBidderIds)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Failed to load requirement comparison detail:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tenderId, requirementId, selectedBidderIds]);

  if (!requirementId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                {data?.requirement.requirementCode || 'REQUIREMENT'}
              </span>
              {data?.requirement.clauseReference && (
                <span className="text-xs font-mono text-slate-500">
                  {data.requirement.clauseReference}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                {data?.requirement.category}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {data?.requirement.requirementText || 'Requirement Detail Comparison'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center flex-1">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium">Loading side-by-side evidence & evaluation trace...</p>
          </div>
        ) : !data ? (
          <div className="p-12 text-center text-slate-500 flex-1">
            <p className="text-sm font-medium">Failed to load comparison data.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Rule Blueprint Card */}
            {data.rule && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                  <Calculator className="w-4 h-4" />
                  Approved Rule Blueprint: {data.rule.name} ({data.rule.ruleCode})
                </div>
                <div className="text-slate-600 dark:text-slate-300 space-y-1">
                  <p>
                    <strong>Rule Type:</strong> {data.rule.ruleType}
                  </p>
                  {data.rule.definition && (
                    <pre className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-[11px] font-mono overflow-x-auto text-slate-800 dark:text-slate-200">
                      {JSON.stringify(data.rule.definition, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Side-by-Side Bidder Columns */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Side-by-Side Bidder Evaluations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.bidders.map((b) => (
                  <div
                    key={b.bidderId}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {b.bidderCode}
                        </span>
                        {renderStatusBadge(b.evaluation.result)}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {b.legalName}
                      </h4>
                    </div>

                    {/* Evaluation Summary & Trace */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-500" />
                        Result Summary:
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        {b.evaluation.summary || 'No evaluation trace summary available.'}
                      </p>

                      {b.evaluation.explanation && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/60 pt-1.5 mt-1.5">
                          <strong>Explanation:</strong> {b.evaluation.explanation}
                        </div>
                      )}
                    </div>

                    {/* Extracted Evidence List */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>Submitted Evidence ({b.evidenceList.length})</span>
                      </div>

                      {b.evidenceList.length === 0 ? (
                        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[11px]">
                          No mapped evidence found for this requirement.
                        </div>
                      ) : (
                        b.evidenceList.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 bg-white dark:bg-slate-900"
                          >
                            <div className="flex items-center justify-between font-medium">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {ev.fieldLabel}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Pg {ev.pageNumber}
                              </span>
                            </div>
                            <div className="text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md font-semibold">
                              {ev.rawValue} {ev.unit ? `(${ev.unit})` : ''}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
                              <span>Doc: {ev.documentName}</span>
                              <span>Conf: {Math.round(ev.confidence * 100)}%</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Conflicts & Investigations Warning */}
                    {b.conflicts.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          Unresolved Conflict ({b.conflicts.length})
                        </div>
                        <p className="text-[10px]">{b.conflicts[0].description}</p>
                      </div>
                    )}

                    {/* Interactive Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => setActiveWhyBidderId(b.bidderId)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-[11px] text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                        Why?
                      </button>

                      {(b.evaluation.result === 'REVIEW' || b.evaluation.result === 'NOT_EVALUABLE') && (
                        <a
                          href={`/tenders/${tenderId}/bidders/${b.bidderId}`}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 font-semibold text-[11px] text-indigo-700 dark:text-indigo-300 transition flex items-center justify-center gap-1 hover:bg-indigo-100"
                        >
                          <Bot className="w-3.5 h-3.5 text-indigo-600" />
                          Investigate
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expanded "Why?" Trace Modal */}
            {activeWhyBidderId && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Feature 1G Deterministic Evaluation Trace
                  </h4>
                  <button
                    onClick={() => setActiveWhyBidderId(null)}
                    className="text-xs text-indigo-700 dark:text-indigo-300 hover:underline font-bold"
                  >
                    Close Trace
                  </button>
                </div>
                {renderWhyTraceDetails(data, activeWhyBidderId)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function renderStatusBadge(result: string) {
  switch (result) {
    case 'PASS':
      return (
        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASS
        </span>
      );
    case 'FAIL':
      return (
        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-bold flex items-center gap-1">
          <XCircle className="w-3 h-3 text-rose-600" /> FAIL
        </span>
      );
    case 'REVIEW':
      return (
        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-600" /> REVIEW
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 text-[10px] font-bold">
          N/E
        </span>
      );
  }
}

function renderWhyTraceDetails(
  data: RequirementDetailComparisonResponse,
  bidderId: string
) {
  const b = data.bidders.find((bid) => bid.bidderId === bidderId);
  if (!b) return null;

  return (
    <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60">
      <div>
        <strong>Bidder:</strong> {b.legalName} ({b.bidderCode})
      </div>
      <div>
        <strong>Evaluated Result:</strong> {b.evaluation.result} ({b.evaluation.reasonCode || 'DETERMINISTIC_SCAN'})
      </div>
      <div>
        <strong>Calculation Trace:</strong>
        {b.evaluation.calculationTrace ? (
          <pre className="mt-1 p-2 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
            {JSON.stringify(b.evaluation.calculationTrace, null, 2)}
          </pre>
        ) : (
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
            Calculation trace snapshot stored during Feature 1G evaluation run. Result is deterministic based on approved rule rules.
          </p>
        )}
      </div>
    </div>
  );
}
