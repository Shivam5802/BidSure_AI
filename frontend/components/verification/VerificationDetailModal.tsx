import React from 'react';
import { VerificationRequest } from '@/types/verification';
import { VerificationBadge } from './VerificationBadge';
import { X, FileText, Globe, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';

interface VerificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: VerificationRequest | null;
  onInvestigate?: (verification: VerificationRequest) => void;
}

export function VerificationDetailModal({
  isOpen,
  onClose,
  verification,
  onInvestigate,
}: VerificationDetailModalProps) {
  if (!isOpen || !verification) return null;

  const latestResult = verification.results?.[0];
  const comparisons = latestResult?.comparisons || [];
  const normalized = latestResult?.normalizedResult;

  const isMismatch =
    verification.status === 'MISMATCH' ||
    latestResult?.status === 'MISMATCH' ||
    comparisons.some((c) => c.comparisonStatus === 'MISMATCH');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-4xl my-8 rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Verification Cross-Check Details</h2>
              <VerificationBadge
                status={verification.status}
                providerMode={latestResult?.providerMode || 'MOCK'}
              />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Request ID: {verification.id} | Type: {verification.verificationType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Requirement 10: Clear Separation of Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: BIDDER-SUBMITTED EVIDENCE */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  BIDDER-SUBMITTED EVIDENCE
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Identifier:</span>
                  <p className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 mt-0.5">
                    {verification.evidence?.rawValue || verification.requestedIdentifier}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Field Key:</span>
                  <p className="font-semibold text-slate-800">{verification.evidence?.fieldKey || 'Identifier'}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Source Text Snippet:</span>
                  <p className="italic text-slate-700 bg-white p-2 rounded border border-slate-200 mt-0.5">
                    "{verification.evidence?.sourceText || 'Extracted from bidder document'}"
                  </p>
                </div>
                {verification.evidence?.pageNumber && (
                  <div>
                    <span className="text-slate-500 font-medium">Document Location:</span>
                    <p className="text-slate-800 font-medium">Page {verification.evidence.pageNumber}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 font-medium">Extraction Source:</span>
                  <span className="ml-1.5 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">
                    AI Extracted Document Evidence
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: EXTERNAL VERIFICATION */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                <Globe className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  EXTERNAL VERIFICATION RESULT
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Provider:</span>
                  <p className="font-semibold text-slate-900">
                    {latestResult?.providerName || verification.providerCode}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Mode:</span>
                  <span className="ml-1.5 px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200">
                    {latestResult?.providerMode || 'MOCK'} (SYNTHETIC DATA)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Verified Identifier:</span>
                  <p className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 mt-0.5">
                    {normalized?.identifier || verification.requestedIdentifier}
                  </p>
                </div>
                {normalized?.legalName && (
                  <div>
                    <span className="text-slate-500 font-medium">Registered Legal Entity:</span>
                    <p className="font-semibold text-slate-900">{normalized.legalName}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 font-medium">Verified Timestamp:</span>
                  <p className="text-slate-700">
                    {latestResult?.verifiedAt ? new Date(latestResult.verifiedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requirement 25 & 26: Cross-Check Matrix & Field Differences */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">Field-by-Field Cross-Check Comparison</h4>
            {comparisons.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Field Key</th>
                      <th className="p-3">Bidder Evidence Value</th>
                      <th className="p-3">Verified Provider Value</th>
                      <th className="p-3">Comparison Status</th>
                      <th className="p-3">Summary / Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {comparisons.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800">{c.fieldKey}</td>
                        <td className="p-3 font-mono text-slate-700">{c.evidenceValue || '—'}</td>
                        <td className="p-3 font-mono text-slate-700">{c.verifiedValue || '—'}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.comparisonStatus === 'MATCH'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : c.comparisonStatus === 'MISMATCH'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {c.comparisonStatus === 'MATCH' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {c.comparisonStatus}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{c.differenceSummary || 'Matched deterministically'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                No individual field comparisons available for this request.
              </div>
            )}
          </div>

          {/* Requirement 26: Explainable "Why Mismatch?" Box */}
          {isMismatch && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-2 text-xs text-red-900">
              <div className="flex items-center gap-2 font-bold text-red-900 text-sm">
                <HelpCircle className="w-4 h-4 text-red-600" />
                <span>Why is this marked MISMATCH?</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Deterministic text comparison identified a disparity between the submitted bidder evidence and external provider records:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-800">
                {comparisons
                  .filter((c) => c.comparisonStatus === 'MISMATCH' || c.comparisonStatus === 'REVIEW_REQUIRED')
                  .map((c) => (
                    <li key={c.id}>
                      <strong className="font-semibold">{c.fieldKey}:</strong> Document evidence specifies "
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-red-200">
                        {c.evidenceValue}
                      </span>
                      ", whereas external verification returned "
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-red-200">
                        {c.verifiedValue}
                      </span>
                      ". ({c.differenceSummary})
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Requirement 13 & 25: Compliance Boundary Disclaimer */}
          <div className="rounded-lg bg-slate-100 p-3.5 border border-slate-200 text-xs text-slate-700">
            <strong className="font-semibold text-slate-900">Procurement Officer Authority Boundary:</strong> This verification result cross-checks external data against bidder submissions but does NOT automatically determine bidder qualification or overwrite deterministic rule compliance evaluations.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="text-xs text-slate-500">
            Provider Mode: <strong className="text-purple-700 font-semibold">MOCK / DEMO</strong>
          </div>
          <div className="flex items-center gap-3">
            {isMismatch && onInvestigate && (
              <button
                type="button"
                onClick={() => onInvestigate(verification)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <span>Investigate with AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
