import React, { useState } from 'react';
import {
  ComplianceInvestigation,
  HumanReviewDecision,
  InvestigationResult,
} from '@/types';
import { investigationApi } from '@/lib/api/investigation.api';
import { InvestigationStatusBadge } from './InvestigationStatusBadge';
import { EvidenceGraphView } from './EvidenceGraphView';
import {
  X,
  Bot,
  ShieldCheck,
  FileText,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  ListOrdered,
  UserCheck,
  RefreshCw,
  Info,
  GitBranch,
} from 'lucide-react';

interface InvestigationDrawerProps {
  investigation: ComplianceInvestigation | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: (updated: ComplianceInvestigation) => void;
}

export const InvestigationDrawer: React.FC<InvestigationDrawerProps> = ({
  investigation,
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'GRAPH'>('DETAILS');
  const [decision, setDecision] = useState<HumanReviewDecision>('ACCEPT_RECOMMENDATION');
  const [reviewReason, setReviewReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen || !investigation) return null;

  const resultData: InvestigationResult | null = investigation.resultData || null;
  const contradictions = resultData?.contradictions || [];
  const evidenceReviewed = resultData?.evidenceReviewed || [];

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewReason.trim()) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const updated = await investigationApi.submitHumanReview(investigation.id, {
        decision,
        reason: reviewReason.trim(),
        reviewerId: 'procurement_officer',
      });
      if (updated && onReviewSubmitted) {
        onReviewSubmitted(updated);
      }
      setReviewReason('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit human review decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Compliance Investigation Agent</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  v{investigation.agentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trigger: <strong className="text-amber-300 font-mono">{investigation.triggerType}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InvestigationStatusBadge
              status={investigation.status}
              severity={investigation.severity}
            />
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Critical Advisory Disclaimer Banner */}
        <div className="px-6 py-2.5 bg-indigo-950/40 border-b border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>AI Advisory Notice:</strong> AI Investigation is decision-support only. Final procurement decisions remain with the authorized Procurement Officer.
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('DETAILS')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                activeTab === 'DETAILS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('GRAPH')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                activeTab === 'GRAPH' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3 h-3" /> Graph
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'GRAPH' ? (
            <EvidenceGraphView
              requirementCode={investigation.requirement?.requirementCode}
              evaluationResult={investigation.summary || 'REVIEW'}
              evidenceItems={evidenceReviewed}
              contradictions={contradictions}
              officerDecision={investigation.reviewDecision || undefined}
            />
          ) : (
            <>
              {/* Section 1: Case Summary */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  Investigation Case Summary
                </h3>
                <p className="text-sm font-semibold text-white">
                  {investigation.summary || resultData?.caseSummary || 'Investigating compliance case...'}
                </p>
                {investigation.question && (
                  <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    Officer Query: "{investigation.question}"
                  </p>
                )}
              </div>

              {/* Section 2: Core Finding & Contradictions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Agent Findings & Evidence Analysis
                </h3>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-semibold">Core Finding:</span>
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                      {investigation.finding || resultData?.finding || 'Analyzing evidence sources...'}
                    </p>
                  </div>

                  {/* Contradiction Cards */}
                  {contradictions.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Conflicting Evidence Discrepancies ({contradictions.length}):
                      </span>
                      <div className="space-y-2">
                        {contradictions.map((c: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between text-rose-300 font-semibold">
                              <span>Field: {c.fieldKey}</span>
                              <span className="text-[11px] font-mono text-slate-400">DISCREPANCY</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{c.description}</p>
                            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                                <span className="text-slate-500 block">Doc A: {c.documentA}</span>
                                <span className="text-rose-300 font-bold">{String(c.valueA)}</span>
                              </div>
                              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                                <span className="text-slate-500 block">Doc B: {c.documentB}</span>
                                <span className="text-rose-300 font-bold">{String(c.valueB)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Evidence List */}
                  {resultData?.missingEvidence && resultData.missingEvidence.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-1">
                      <span className="font-semibold text-indigo-300 block">Missing Required Evidence:</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                        {resultData.missingEvidence.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Reviewed Evidence Table */}
              {evidenceReviewed.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    Reviewed Evidence Items ({evidenceReviewed.length})
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">Source Document</th>
                          <th className="p-3">Page</th>
                          <th className="p-3">Field Key</th>
                          <th className="p-3">Extracted Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono">
                        {evidenceReviewed.map((ev, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/60">
                            <td className="p-3 text-cyan-300 font-semibold">{ev.documentName || 'Bid Document'}</td>
                            <td className="p-3 text-slate-400">{ev.pageNumber ? `Page ${ev.pageNumber}` : '-'}</td>
                            <td className="p-3 text-slate-300">{ev.fieldKey || 'fact'}</td>
                            <td className="p-3 text-emerald-400 font-semibold">{String(ev.rawValue ?? 'N/A')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Section 4: Reasoning Steps */}
              {resultData?.reasoningSteps && resultData.reasoningSteps.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-amber-400" />
                    Auditable Reasoning Steps
                  </h3>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    {resultData.reasoningSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <span className="p-1 rounded bg-slate-900 font-mono text-[10px] text-amber-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <p className="leading-relaxed mt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 5: Recommendation & Confidence */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
                    Recommendation & Action
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {investigation.recommendation || resultData?.recommendation}
                  </p>
                  {resultData?.recommendedHumanAction && (
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-emerald-300">
                      <strong>Action:</strong> {resultData.recommendedHumanAction}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Confidence & Uncertainty
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Agent Confidence:</span>
                      <strong className="text-emerald-400 font-mono">
                        {Math.round((investigation.confidence || 0.8) * 100)}%
                      </strong>
                    </div>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Uncertainty Level:</span>
                      <strong className="text-amber-400 font-mono">
                        {investigation.uncertainty || 'MEDIUM'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6: Human Officer Review Controls */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Procurement Officer Review Action
                  </h3>
                  {investigation.reviewDecision && (
                    <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-500/30">
                      Decision: {investigation.reviewDecision}
                    </span>
                  )}
                </div>

                {investigation.reviewReason && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="text-slate-500 text-[11px] block font-mono">
                      Officer Review Notes ({new Date(investigation.reviewedAt!).toLocaleDateString()}):
                    </span>
                    <p className="italic">"{investigation.reviewReason}"</p>
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'ACCEPT_RECOMMENDATION', label: 'Accept Recommendation' },
                      { id: 'REQUEST_MORE_REVIEW', label: 'Request Review' },
                      { id: 'MARK_RESOLVED', label: 'Mark Resolved' },
                      { id: 'DISMISS', label: 'Dismiss' },
                    ].map((btn) => (
                      <button
                        type="button"
                        key={btn.id}
                        onClick={() => setDecision(btn.id as HumanReviewDecision)}
                        className={`p-2.5 rounded-xl text-xs font-semibold transition border text-center ${
                          decision === btn.id
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Procurement Officer Decision Rationale *
                    </label>
                    <textarea
                      required
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="Specify your procurement decision rationale (e.g., Verified CA certificate manually from authorized registrar)..."
                      rows={3}
                      className="w-full p-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
                    />
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                      {submitError}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !reviewReason.trim()}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Submitting Review...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Submit Officer Decision
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
