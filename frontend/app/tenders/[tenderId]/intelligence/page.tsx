'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  TenderHealthSnapshot,
  IntelligenceIndicator,
  PriorityActionItem,
  ComplianceDistribution,
  EvidenceCoverageAnalytics,
  BidderAnalyticsSummary,
  AuditabilityMetrics,
  VerificationAnalyticsSummary,
  InvestigationAnalyticsSummary,
  EffortAnalytics,
  AiContributionAnalytics,
} from '@/types/intelligence';
import { intelligenceApi } from '@/lib/api/intelligence.api';
import {
  TenderIntelligenceHeader,
  PriorityActionQueueSection,
  ComplianceDistributionChart,
  EvidenceCoverageSection,
  AuditabilityMetricsCard,
  VerificationAndInvestigationGrid,
  AiContributionCard,
  BeforeAfterWorkflow,
  DemoImpactCalculator,
  BenchmarkSessionModal,
} from '@/features/intelligence';
import { QuickNavToolbar } from '@/features/workspace';
import {
  Loader2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Award,
  BarChart3,
  Users,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ tenderId: string }>;
}

export default function TenderIntelligencePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { tenderId } = resolvedParams;

  const [snapshot, setSnapshot] = useState<TenderHealthSnapshot | null>(null);
  const [indicators, setIndicators] = useState<IntelligenceIndicator[]>([]);
  const [actions, setActions] = useState<PriorityActionItem[]>([]);
  const [compliance, setCompliance] = useState<ComplianceDistribution | null>(null);
  const [evidenceCoverage, setEvidenceCoverage] = useState<EvidenceCoverageAnalytics | null>(null);
  const [bidders, setBidders] = useState<BidderAnalyticsSummary[]>([]);
  const [auditability, setAuditability] = useState<AuditabilityMetrics | null>(null);
  const [verifications, setVerifications] = useState<VerificationAnalyticsSummary | null>(null);
  const [investigations, setInvestigations] = useState<InvestigationAnalyticsSummary | null>(null);
  const [effort, setEffort] = useState<EffortAnalytics | null>(null);
  const [aiContribution, setAiContribution] = useState<AiContributionAnalytics | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBenchmarkModalOpen, setIsBenchmarkModalOpen] = useState(false);

  const loadAllIntelligence = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [
        snapRes,
        indRes,
        compRes,
        evRes,
        bidRes,
        audRes,
        verRes,
        invRes,
        effRes,
        aiRes,
      ] = await Promise.allSettled([
        intelligenceApi.getSummary(tenderId),
        intelligenceApi.getIndicatorsAndActions(tenderId),
        intelligenceApi.getComplianceDistribution(tenderId),
        intelligenceApi.getEvidenceCoverage(tenderId),
        intelligenceApi.getBidderAnalytics(tenderId),
        intelligenceApi.getAuditabilityMetrics(tenderId),
        intelligenceApi.getVerificationAnalytics(tenderId),
        intelligenceApi.getInvestigationAnalytics(tenderId),
        intelligenceApi.getEffortAnalytics(tenderId),
        intelligenceApi.getAiContributionAnalytics(tenderId),
      ]);

      if (snapRes.status === 'fulfilled') setSnapshot(snapRes.value);
      if (indRes.status === 'fulfilled') {
        setIndicators(indRes.value.indicators || []);
        setActions(indRes.value.priorityActions || []);
      }
      if (compRes.status === 'fulfilled') setCompliance(compRes.value.compliance);
      if (evRes.status === 'fulfilled') setEvidenceCoverage(evRes.value.evidenceCoverage);
      if (bidRes.status === 'fulfilled') setBidders(bidRes.value.bidders || []);
      if (audRes.status === 'fulfilled') setAuditability(audRes.value.auditability);
      if (verRes.status === 'fulfilled') setVerifications(verRes.value.verifications);
      if (invRes.status === 'fulfilled') setInvestigations(invRes.value.investigations);
      if (effRes.status === 'fulfilled') setEffort(effRes.value.effort);
      if (aiRes.status === 'fulfilled') setAiContribution(aiRes.value);

      if (snapRes.status === 'rejected') {
        throw new Error(snapRes.reason?.message || 'Failed to load tender snapshot.');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading intelligence data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (tenderId) {
      void loadAllIntelligence();
    }
  }, [tenderId]);

  if (isLoading && !snapshot) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Aggregating Tender Intelligence & Risk Indicators...</p>
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Intelligence Load Error</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={() => loadAllIntelligence()}
            className="w-full py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            Retry Loading Intelligence
          </button>
        </div>
      </div>
    );
  }

  if (!snapshot) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Toolbar */}
        <QuickNavToolbar tenderId={tenderId} />

        {/* 1. Header & Overview KPIs */}
        <TenderIntelligenceHeader
          snapshot={snapshot}
          onRefresh={() => loadAllIntelligence(true)}
          isRefreshing={isRefreshing}
        />

        {/* Action button row to open Benchmark Sessions */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsBenchmarkModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-xs transition"
          >
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Prototype Benchmark Sessions</span>
          </button>
        </div>

        {/* 2. Priority Action Queue */}
        <PriorityActionQueueSection actions={actions} tenderId={tenderId} />

        {/* 3. Compliance Distribution & Evidence Coverage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {compliance && <ComplianceDistributionChart tenderId={tenderId} initialDistribution={compliance} />}
          {evidenceCoverage && <EvidenceCoverageSection coverage={evidenceCoverage} />}
        </div>

        {/* 4. Auditability & Key Innovation Metric (Evidence Traceability) */}
        {auditability && <AuditabilityMetricsCard metrics={auditability} />}

        {/* 5. Verification & Investigation Grid */}
        {verifications && investigations && (
          <VerificationAndInvestigationGrid
            verifications={verifications}
            investigations={investigations}
            tenderId={tenderId}
          />
        )}

        {/* 6. Bidder Analytics Table (Strictly factual, NO scores or ranks) */}
        {bidders.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Bidder-Level Intelligence Summary
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Factual criteria breakdown per bidder without subjective scoring or automated ranking.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {bidders.length} Submitted {bidders.length === 1 ? 'Bidder' : 'Bidders'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Bidder</th>
                    <th className="px-3 py-3 text-center">Evaluated</th>
                    <th className="px-3 py-3 text-center text-emerald-600">PASS</th>
                    <th className="px-3 py-3 text-center text-rose-600">FAIL</th>
                    <th className="px-3 py-3 text-center text-amber-600">REVIEW</th>
                    <th className="px-3 py-3 text-center text-purple-600">NOT EVAL</th>
                    <th className="px-3 py-3 text-center">Coverage</th>
                    <th className="px-3 py-3 text-center">Conflicts</th>
                    <th className="px-3 py-3 text-center">Verif Mismatch</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bidders.map((b) => (
                    <tr key={b.bidderId} className="hover:bg-slate-50/50 dark:hover:bg-slate-850 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{b.legalName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{b.bidderCode}</div>
                      </td>
                      <td className="px-3 py-3 text-center font-bold">{b.requirementsEvaluated}</td>
                      <td className="px-3 py-3 text-center font-extrabold text-emerald-600">{b.passCount}</td>
                      <td className="px-3 py-3 text-center font-extrabold text-rose-600">{b.failCount}</td>
                      <td className="px-3 py-3 text-center font-extrabold text-amber-600">{b.reviewCount}</td>
                      <td className="px-3 py-3 text-center font-bold text-purple-600">{b.notEvaluableCount}</td>
                      <td className="px-3 py-3 text-center font-bold">{b.evidenceCoveragePercentage}%</td>
                      <td className="px-3 py-3 text-center">
                        {b.conflictCount > 0 ? (
                          <span className="font-bold text-purple-600">{b.conflictCount}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {b.verificationMismatchCount > 0 ? (
                          <span className="font-bold text-rose-600">{b.verificationMismatchCount}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/tenders/${tenderId}/workspace?bidderId=${b.bidderId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. AI Contribution & Architectural Clarity */}
        <AiContributionCard contribution={aiContribution || undefined} />

        {/* 8. Demo Impact Calculator */}
        <DemoImpactCalculator
          defaultRequirementsCount={snapshot.totalRequirements}
          defaultBidderCount={bidders.length || 4}
        />

        {/* 9. Workflow Transformation Comparison */}
        <BeforeAfterWorkflow />
      </div>

      {/* Benchmark Session Modal */}
      <BenchmarkSessionModal
        tenderId={tenderId}
        isOpen={isBenchmarkModalOpen}
        onClose={() => setIsBenchmarkModalOpen(false)}
      />
    </div>
  );
}
