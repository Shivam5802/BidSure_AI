'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { ClarificationRequestItem } from '@/lib/api/officer.api';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Paperclip,
  X,
  FileText,
  Loader2,
  ShieldAlert,
  Calendar,
  Building,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BidderClarificationsPage() {
  const [clarifications, setClarifications] = useState<ClarificationRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESPONDED' | 'EXPIRED'>('ALL');

  // Response Modal State
  const [activeItem, setActiveItem] = useState<ClarificationRequestItem | null>(null);
  const [responseText, setResponseText] = useState('');
  const [docInput, setDocInput] = useState('');
  const [attachedDocs, setAttachedDocs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadClarifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getMyClarifications();
      setClarifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load clarifications. Please ensure you are logged in.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadClarifications();
  }, []);

  const openResponseModal = (item: ClarificationRequestItem) => {
    setActiveItem(item);
    setResponseText(item.bidderResponse || '');
    setAttachedDocs(item.responseDocuments || []);
    setDocInput('');
    setFormError(null);
    setActionSuccess(null);
  };

  const closeResponseModal = () => {
    setActiveItem(null);
    setResponseText('');
    setAttachedDocs([]);
    setDocInput('');
    setFormError(null);
  };

  const addDocument = () => {
    if (!docInput.trim()) return;
    if (attachedDocs.includes(docInput.trim())) return;
    setAttachedDocs([...attachedDocs, docInput.trim()]);
    setDocInput('');
  };

  const removeDocument = (index: number) => {
    setAttachedDocs(attachedDocs.filter((_, idx) => idx !== index));
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    if (!responseText.trim() || responseText.trim().length < 10) {
      setFormError('Please enter a substantive clarification response of at least 10 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await api.respondToClarification(activeItem.id, {
        response: responseText.trim(),
        responseDocuments: attachedDocs,
      });

      setActionSuccess('Your clarification response has been submitted and transmitted to the Procurement Officer.');
      await loadClarifications();
      setTimeout(() => {
        closeResponseModal();
      }, 1800);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit response. Please verify the deadline has not expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = clarifications.filter((c) => c.status === 'PENDING').length;
  const respondedCount = clarifications.filter((c) => c.status === 'RESPONDED').length;
  const expiredCount = clarifications.filter((c) => c.status === 'EXPIRED').length;

  const filteredItems = clarifications.filter((c) => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline).getTime() < Date.now();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            Clarification Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and respond to formal procurement inquiries, compliance discrepancies, and statutory document requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/bidder/applications">
            <Button variant="outline" size="sm" className="text-xs h-9">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              My Applications
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inquiries</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{clarifications.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all tender bids</div>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/70 dark:border-amber-900/40 shadow-xs">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Action Required
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Awaiting your response</div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Responded
          </div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">{respondedCount}</div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Under officer evaluation</div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Expired
          </div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1">{expiredCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Response window closed</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(['ALL', 'PENDING', 'RESPONDED', 'EXPIRED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab === 'ALL' && `All (${clarifications.length})`}
            {tab === 'PENDING' && `Pending Action (${pendingCount})`}
            {tab === 'RESPONDED' && `Responded (${respondedCount})`}
            {tab === 'EXPIRED' && `Expired (${expiredCount})`}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-800 dark:text-rose-300 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Unable to fetch inquiries</div>
            <div className="text-xs mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Loading formal clarification queries...
          </p>
        </div>
      )}

      {/* Clarifications List */}
      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No clarifications in this category</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            {filter === 'PENDING'
              ? 'Great! There are no outstanding compliance or technical questions requiring your response.'
              : 'No clarification inquiries match the current filter selection.'}
          </p>
        </div>
      )}

      {!isLoading && filteredItems.length > 0 && (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const expired = isDeadlinePassed(item.deadline);
            const isPending = item.status === 'PENDING';
            const isResponded = item.status === 'RESPONDED';

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition hover:shadow-md ${
                  isPending
                    ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                        {item.tenderReference || 'TENDER'}
                      </span>
                      {item.requirementTitle && (
                        <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {item.requirementTitle}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                          isResponded
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : isPending && !expired
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {isResponded && <CheckCircle2 className="w-3 h-3" />}
                        {isPending && !expired && <Clock className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {item.subject}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Deadline: <strong className={expired && isPending ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {new Date(item.deadline).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>
                    {isPending && !expired && (
                      <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                        Action Due
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <div className="mt-3.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                    Officer Inquiry ({item.officerName || 'Procurement Committee'}):
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                    {item.question}
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1">
                    Issued: {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>

                {/* Submitted Response Preview (if answered) */}
                {item.bidderResponse && (
                  <div className="mt-3 p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl space-y-1.5">
                    <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Your Submitted Response:
                    </div>
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      {item.bidderResponse}
                    </p>
                    {item.responseDocuments && item.responseDocuments.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                          Evidence:
                        </span>
                        {item.responseDocuments.map((doc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] bg-white dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800"
                          >
                            <Paperclip className="w-2.5 h-2.5" />
                            {doc}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.responseSubmittedAt && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 pt-1">
                        Submitted: {new Date(item.responseSubmittedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-mono">
                    ID: {item.id}
                  </div>
                  <div>
                    {isPending && !expired && (
                      <Button
                        size="sm"
                        onClick={() => openResponseModal(item)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 px-3.5 shadow-xs"
                      >
                        <Send className="w-3 h-3 mr-1.5" />
                        Submit Response
                      </Button>
                    )}
                    {isPending && expired && (
                      <span className="text-xs text-rose-500 font-medium italic">
                        Response window expired
                      </span>
                    )}
                    {isResponded && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResponseModal(item)}
                        className="text-xs h-8 text-slate-600 dark:text-slate-300"
                      >
                        View Full Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Response Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Clarification Response
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeItem.subject}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tender: {activeItem.tenderReference} | Due: {new Date(activeItem.deadline).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={closeResponseModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitResponse} className="p-5 space-y-4">
              {/* Query Context */}
              <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl space-y-1">
                <div className="text-xs font-semibold text-purple-900 dark:text-purple-300">
                  Inquiry from {activeItem.officerName || 'Procurement Officer'}:
                </div>
                <p className="text-xs text-purple-800 dark:text-purple-200 leading-relaxed">
                  {activeItem.question}
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Text Response Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Written Clarification / Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  disabled={activeItem.status !== 'PENDING' || isDeadlinePassed(activeItem.deadline) || isSubmitting}
                  placeholder="Provide precise clarification, certificate reference numbers, or explanations address the officer query..."
                  rows={4}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 disabled:opacity-70 resize-y"
                  required
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Minimum 10 characters</span>
                  <span>{responseText.length} chars</span>
                </div>
              </div>

              {/* Attached Supporting Documents */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Supporting Evidence / Document References
                </label>
                {activeItem.status === 'PENDING' && !isDeadlinePassed(activeItem.deadline) && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={docInput}
                      onChange={(e) => setDocInput(e.target.value)}
                      placeholder="e.g. Updated_Notarized_Affidavit_2026.pdf or CA_Networth_Signed.pdf"
                      className="flex-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addDocument();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDocument}
                      className="text-xs h-9"
                    >
                      Attach
                    </Button>
                  </div>
                )}

                {attachedDocs.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                    {attachedDocs.map((doc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 shadow-2xs font-mono"
                      >
                        <FileText className="w-3 h-3 text-purple-600" />
                        {doc}
                        {activeItem.status === 'PENDING' && !isDeadlinePassed(activeItem.deadline) && (
                          <button
                            type="button"
                            onClick={() => removeDocument(idx)}
                            className="text-slate-400 hover:text-rose-500 ml-1"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No supporting documents attached yet.</p>
                )}
              </div>

              {/* Audit notice */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  All submitted responses and attached document references are cryptographically timestamped and recorded in the tender audit ledger.
                </span>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeResponseModal}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  {activeItem.status === 'PENDING' ? 'Cancel' : 'Close'}
                </Button>
                {activeItem.status === 'PENDING' && !isDeadlinePassed(activeItem.deadline) && (
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || !responseText.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Submit Response
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
