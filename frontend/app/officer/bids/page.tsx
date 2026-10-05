'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Clock,
  FileText,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Scale,
  Award,
  SlidersHorizontal,
} from 'lucide-react';
import { officerApi, OfficerBidItem } from '@/lib/api/officer.api';
import { tenderApi } from '@/features/tenders/api';
import { Tender } from '@/features/tenders/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function OfficerReceivedBidsPage() {
  const [bids, setBids] = useState<OfficerBidItem[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenderId, setSelectedTenderId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Decision Modal State
  const [selectedBidForDecision, setSelectedBidForDecision] = useState<OfficerBidItem | null>(null);
  const [decisionType, setDecisionType] = useState<'QUALIFIED' | 'NOT_QUALIFIED' | 'CLARIFICATION_REQUIRED' | 'UNDER_REVIEW'>('QUALIFIED');
  const [decisionReason, setDecisionReason] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionSuccessMsg, setDecisionSuccessMsg] = useState<string | null>(null);

  // Clarification Modal State
  const [selectedBidForClarification, setSelectedBidForClarification] = useState<OfficerBidItem | null>(null);
  const [clarificationSubject, setClarificationSubject] = useState('');
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [clarificationDeadline, setClarificationDeadline] = useState('');
  const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);
  const [clarificationSuccessMsg, setClarificationSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bidsList, tendersList] = await Promise.all([
        officerApi.getReceivedBids(selectedTenderId !== 'ALL' ? selectedTenderId : undefined),
        tenderApi.listTenders(),
      ]);
      setBids(Array.isArray(bidsList) ? bidsList : []);
      setTenders(Array.isArray(tendersList) ? tendersList : []);
    } catch (err) {
      console.error('Failed to load received bids:', err);
      setBids([]);
      setTenders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [selectedTenderId]);

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBidForDecision || !decisionReason.trim()) return;

    setIsSubmittingDecision(true);
    try {
      await officerApi.recordDecision({
        applicationId: selectedBidForDecision.id,
        decision: decisionType,
        reason: decisionReason,
        relevantRequirement: 'Technical & Statutory Eligibility Requirements',
      });
      setDecisionSuccessMsg(`Decision "${decisionType}" recorded successfully and logged in official audit trail.`);
      setTimeout(() => {
        setSelectedBidForDecision(null);
        setDecisionSuccessMsg(null);
        setDecisionReason('');
        void loadData();
      }, 1500);
    } catch (err: any) {
      alert(err?.message || 'Failed to record officer decision');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleCreateClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBidForClarification || !clarificationSubject.trim() || !clarificationQuestion.trim()) return;

    setIsSubmittingClarification(true);
    try {
      await officerApi.createClarification({
        tenderId: selectedBidForClarification.tenderId,
        bidderId: selectedBidForClarification.bidderId,
        applicationId: selectedBidForClarification.id,
        subject: clarificationSubject,
        question: clarificationQuestion,
        deadline: clarificationDeadline || new Date(Date.now() + 86400000 * 3).toISOString(),
      });
      setClarificationSuccessMsg('Clarification request dispatched to vendor portal with active deadline.');
      setTimeout(() => {
        setSelectedBidForClarification(null);
        setClarificationSuccessMsg(null);
        setClarificationSubject('');
        setClarificationQuestion('');
        void loadData();
      }, 1500);
    } catch (err: any) {
      alert(err?.message || 'Failed to send clarification request');
    } finally {
      setIsSubmittingClarification(false);
    }
  };

  const filteredBids = (bids || []).filter((b) => {
    if (selectedTenderId !== 'ALL' && b.tenderId !== selectedTenderId) return false;
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (riskFilter !== 'ALL' && b.riskLevel !== riskFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.bidderName.toLowerCase().includes(q) ||
        b.applicationNumber.toLowerCase().includes(q) ||
        b.tenderReference.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Received Bids Management
            </h1>
            <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
              Procurement Officer Workspace
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centralized bid evaluation register. Review bidder document completeness, inspect AI compliance findings, and record statutory qualification decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Bids
          </Button>
          <Link href="/officer/comparison">
            <Button size="sm" variant="secondary" className="gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300">
              <SlidersHorizontal className="w-4 h-4" />
              Compare Bids
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Submissions</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{bids.length}</div>
            <div className="text-xs text-slate-400 mt-1">Across all procurement tenders</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-4">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Awaiting Review</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {(bids || []).filter((b) => b.status === 'UNDER_REVIEW' || b.status === 'SUBMITTED').length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Pending officer evaluation</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-4">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Qualified Bids</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {(bids || []).filter((b) => b.status === 'QUALIFIED').length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Approved by human officer</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-4">
            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Clarifications</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {(bids || []).filter((b) => b.status === 'CLARIFICATION_REQUIRED').length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Awaiting vendor clarification</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-4">
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">High Risk / Flagged</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {(bids || []).filter((b) => b.riskLevel === 'HIGH' || b.riskLevel === 'CRITICAL').length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Require rigorous audit</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bidder, reference, tender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Tender Filter */}
          <select
            value={selectedTenderId}
            onChange={(e) => setSelectedTenderId(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Tenders</option>
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.referenceNumber} — {t.title.substring(0, 30)}...
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="CLARIFICATION_REQUIRED">Clarification Required</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="NOT_QUALIFIED">Not Qualified</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>
        </div>
      </div>

      {/* Bids Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Bidder & Application</th>
                <th className="py-3.5 px-4">Tender Reference</th>
                <th className="py-3.5 px-4">Completeness</th>
                <th className="py-3.5 px-4">AI Compliance</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Status & Human Decision</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBids.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    No bid submissions found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredBids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{bid.bidderName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{bid.applicationNumber}</span>
                        {bid.isSimulated && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1 text-slate-400 border-slate-300">
                            Demo Bidder
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">
                        {bid.tenderReference}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">
                        {bid.tenderTitle}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              bid.documentCompleteness === 100
                                ? 'bg-emerald-500'
                                : bid.documentCompleteness >= 75
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${bid.documentCompleteness}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{bid.documentCompleteness}%</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {bid.totalDocumentsSubmitted}/{bid.requiredDocumentsCount} docs submitted
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-900 dark:text-white">{bid.complianceScore}%</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {bid.verifiedChecksCount} verified / {bid.failedChecksCount} failed
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          bid.riskLevel === 'LOW'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : bid.riskLevel === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        {bid.riskLevel} RISK
                      </Badge>
                    </td>

                    <td className="py-4 px-4">
                      <Badge
                        variant="neutral"
                        className={`text-xs font-medium ${
                          bid.status === 'QUALIFIED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : bid.status === 'NOT_QUALIFIED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : bid.status === 'CLARIFICATION_REQUIRED'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {bid.status.replace(/_/g, ' ')}
                      </Badge>
                      {bid.officerNotes && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px] mt-1 italic">
                          "{bid.officerNotes}"
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedBidForDecision(bid)}
                          className="h-8 text-xs gap-1 border-blue-200 hover:border-blue-400 text-blue-700 dark:text-blue-300"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          Decide
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedBidForClarification(bid);
                            setClarificationSubject(`Clarification on Bid ${bid.applicationNumber}`);
                          }}
                          className="h-8 text-xs gap-1 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Clarify
                        </Button>

                        <Link href={`/tenders/${bid.tenderId}/bidders/${bid.bidderId}`}>
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-500 hover:text-slate-900">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Human Officer Decision Modal */}
      {selectedBidForDecision && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  Official Human Qualification Decision
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bidder: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedBidForDecision.bidderName}</span> ({selectedBidForDecision.applicationNumber})
                </p>
              </div>
              <button
                onClick={() => setSelectedBidForDecision(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                ✕
              </button>
            </div>

            {decisionSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {decisionSuccessMsg}
              </div>
            )}

            <form onSubmit={handleRecordDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Decision Verdict
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    decisionType === 'QUALIFIED'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="decisionType"
                      value="QUALIFIED"
                      checked={decisionType === 'QUALIFIED'}
                      onChange={() => setDecisionType('QUALIFIED')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-sm">Qualified</div>
                      <div className="text-[11px] font-normal text-slate-500">Satisfies technical & statutory eligibility</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    decisionType === 'NOT_QUALIFIED'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="decisionType"
                      value="NOT_QUALIFIED"
                      checked={decisionType === 'NOT_QUALIFIED'}
                      onChange={() => setDecisionType('NOT_QUALIFIED')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-sm">Not Qualified</div>
                      <div className="text-[11px] font-normal text-slate-500">Disqualified with statutory reason</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    decisionType === 'CLARIFICATION_REQUIRED'
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="decisionType"
                      value="CLARIFICATION_REQUIRED"
                      checked={decisionType === 'CLARIFICATION_REQUIRED'}
                      onChange={() => setDecisionType('CLARIFICATION_REQUIRED')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="text-sm">Clarification Required</div>
                      <div className="text-[11px] font-normal text-slate-500">Request vendor supplementary proof</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    decisionType === 'UNDER_REVIEW'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="decisionType"
                      value="UNDER_REVIEW"
                      checked={decisionType === 'UNDER_REVIEW'}
                      onChange={() => setDecisionType('UNDER_REVIEW')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm">Under Review</div>
                      <div className="text-[11px] font-normal text-slate-500">Keep in active assessment</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Mandatory Statutory Reason / Officer Note <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record your official justification. Reference the tender clause, verified documents, or missing evidence..."
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Note: This decision will be permanently registered in the cryptographic Audit Trail with your Officer ID.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedBidForDecision(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingDecision || decisionReason.trim().length < 10}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {isSubmittingDecision ? 'Signing & Recording...' : 'Submit Official Decision'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clarification Request Modal */}
      {selectedBidForClarification && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Issue Clarification Request
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vendor: <span className="font-semibold">{selectedBidForClarification.bidderName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedBidForClarification(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            {clarificationSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {clarificationSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateClarification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Subject / Clause Ref
                </label>
                <input
                  type="text"
                  required
                  value={clarificationSubject}
                  onChange={(e) => setClarificationSubject(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Specific Query / Clarification Required
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the specific deficiency or clarification required from the bidder..."
                  value={clarificationQuestion}
                  onChange={(e) => setClarificationQuestion(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Response Deadline Date
                </label>
                <input
                  type="date"
                  value={clarificationDeadline}
                  onChange={(e) => setClarificationDeadline(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedBidForClarification(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingClarification || !clarificationQuestion.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  {isSubmittingClarification ? 'Dispatching...' : 'Dispatch Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
