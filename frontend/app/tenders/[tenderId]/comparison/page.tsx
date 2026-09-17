'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Users,
  SlidersHorizontal,
  ArrowLeft,
  RefreshCw,
  Layers,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { comparisonApi } from '@/lib/api/comparison.api';
import {
  ComparisonSummaryResponse,
  ComparisonMatrixResponse,
  SelectedBidderSummary,
} from '@/types/comparison';
import { BidderSelector } from '@/features/comparison/BidderSelector';
import { BidderSummaryCards } from '@/features/comparison/BidderSummaryCards';
import { RequirementComparisonMatrixView } from '@/features/comparison/RequirementComparisonMatrixView';
import { SideBySideRequirementDrawer } from '@/features/comparison/SideBySideRequirementDrawer';
import { TenderLevelIntelligencePanel } from '@/features/comparison/TenderLevelIntelligencePanel';
import { QuickNavToolbar } from '@/features/workspace/QuickNavToolbar';

interface ComparisonPageProps {
  params: Promise<{
    tenderId: string;
  }>;
}

export default function BidderComparisonPage({ params }: ComparisonPageProps) {
  const resolvedParams = use(params);
  const tenderId = resolvedParams.tenderId;

  const [summary, setSummary] = useState<ComparisonSummaryResponse | null>(null);
  const [matrixData, setMatrixData] = useState<ComparisonMatrixResponse | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingMatrix, setLoadingMatrix] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection & Filters
  const [selectedBidderIds, setSelectedBidderIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [differenceOnly, setDifferenceOnly] = useState(false);
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Requirement Detail Drawer State
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);

  // Load summary on initial mount
  useEffect(() => {
    fetchSummary();
  }, [tenderId]);

  // Load matrix whenever filters or selection change
  useEffect(() => {
    if (selectedBidderIds.length >= 2) {
      fetchMatrix();
    }
  }, [
    tenderId,
    selectedBidderIds,
    categoryFilter,
    resultFilter,
    differenceOnly,
    attentionOnly,
    searchQuery,
    currentPage,
  ]);

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await comparisonApi.getSummary(tenderId);
      setSummary(res);
      const defaultIds = res.selectedBidders.map((b) => b.bidderId).slice(0, 5);
      setSelectedBidderIds(defaultIds);
    } catch (err: any) {
      console.error('Failed to fetch comparison summary:', err);
      setError('Failed to load tender bidders comparison summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchMatrix = async () => {
    setLoadingMatrix(true);
    try {
      const res = await comparisonApi.getMatrix(tenderId, {
        bidderIds: selectedBidderIds,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        result: resultFilter !== 'ALL' ? resultFilter : undefined,
        differenceOnly,
        attentionOnly,
        search: searchQuery,
        page: currentPage,
        pageSize: 25,
      });
      setMatrixData(res);
    } catch (err: any) {
      console.error('Failed to fetch comparison matrix:', err);
    } finally {
      setLoadingMatrix(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/tenders/${tenderId}/workspace`}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Command Center
            </Link>
          </div>

          <button
            onClick={() => {
              fetchSummary();
              fetchMatrix();
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-medium text-xs transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            Refresh Data
          </button>
        </div>

        <QuickNavToolbar tenderId={tenderId} />

        {/* Page Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-mono text-xs font-bold">
                {summary?.tender.referenceNumber || 'CPCL-2026-042'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold">
                Multi-Bidder Evaluation Mode
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Bidder Comparison
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Compare submitted bids against the same approved tender requirements. Transparent, evidence-backed decision support workspace for Procurement Officers.
            </p>
          </div>

          {/* High-Level Informational Counters */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 min-w-[100px]">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Total Bidders</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {summary.totalBidders}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 min-w-[100px]">
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Evaluated</div>
                <div className="text-base font-bold text-emerald-800 dark:text-emerald-200">
                  {summary.biddersWithCompletedEvaluation}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 min-w-[100px]">
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">Review Req.</div>
                <div className="text-base font-bold text-amber-800 dark:text-amber-200">
                  {summary.biddersRequiringReview}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60 min-w-[100px]">
                <div className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase">Unresolved</div>
                <div className="text-base font-bold text-rose-800 dark:text-rose-200">
                  {summary.biddersWithUnresolvedIssues}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bidder Selector */}
        {summary && (
          <BidderSelector
            allBidders={summary.selectedBidders}
            selectedBidderIds={selectedBidderIds}
            onChangeSelection={(ids) => {
              setSelectedBidderIds(ids);
              setCurrentPage(1);
            }}
          />
        )}

        {/* Selected Bidder Summary Cards */}
        {matrixData && <BidderSummaryCards selectedBidders={matrixData.selectedBidders} />}

        {/* Tender-Level Intelligence & Evidence Coverage Panel */}
        {matrixData && (
          <TenderLevelIntelligencePanel
            intelligence={matrixData.tenderIntelligence}
            selectedBidders={matrixData.selectedBidders}
          />
        )}

        {/* Main Requirement Comparison Matrix */}
        {loadingMatrix ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Computing requirement comparison matrix across selected bidders...</p>
          </div>
        ) : matrixData ? (
          <RequirementComparisonMatrixView
            items={matrixData.items}
            selectedBidders={matrixData.selectedBidders}
            totalCount={matrixData.pagination.total}
            currentPage={currentPage}
            totalPages={matrixData.pagination.totalPages}
            categoryFilter={categoryFilter}
            resultFilter={resultFilter}
            differenceOnly={differenceOnly}
            attentionOnly={attentionOnly}
            searchQuery={searchQuery}
            onPageChange={setCurrentPage}
            onCategoryChange={(cat) => {
              setCategoryFilter(cat);
              setCurrentPage(1);
            }}
            onResultChange={(res) => {
              setResultFilter(res);
              setCurrentPage(1);
            }}
            onDifferenceOnlyToggle={(val) => {
              setDifferenceOnly(val);
              setCurrentPage(1);
            }}
            onAttentionOnlyToggle={(val) => {
              setAttentionOnly(val);
              setCurrentPage(1);
            }}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            onSelectRequirement={(reqId) => setSelectedRequirementId(reqId)}
          />
        ) : null}

        {/* Side-by-Side Requirement Drawer */}
        <SideBySideRequirementDrawer
          tenderId={tenderId}
          requirementId={selectedRequirementId}
          selectedBidderIds={selectedBidderIds}
          onClose={() => setSelectedRequirementId(null)}
        />
      </div>
    </div>
  );
}
