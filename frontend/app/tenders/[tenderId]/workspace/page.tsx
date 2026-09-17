'use client';

import React, { useState, useEffect, use } from 'react';
import { WorkspaceSummary } from '@/types/workspace';
import { workspaceApi } from '@/lib/api/workspace.api';
import {
  TenderWorkspaceHeader,
  OverviewCards,
  PriorityActionQueue,
  RequirementComplianceMatrixView,
  RequirementWhyDrawer,
  ConflictIntelligencePanel,
  InvestigationPanel,
  EvidenceCoveragePanel,
  BidderOverviewTable,
  RecentActivityFeed,
  QuickNavToolbar,
} from '@/features/workspace';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface PageProps {
  params: Promise<{ tenderId: string }>;
}

export default function ProcurementCommandCenterPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { tenderId } = resolvedParams;

  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedWhyReqId, setSelectedWhyReqId] = useState<string | null>(null);
  const [selectedWhyBidderId, setSelectedWhyBidderId] = useState<string | null>(null);
  const [isWhyDrawerOpen, setIsWhyDrawerOpen] = useState(false);

  const fetchWorkspaceSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await workspaceApi.getWorkspaceSummary(tenderId);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load Procurement Officer Command Center.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId) {
      void fetchWorkspaceSummary();
    }
  }, [tenderId]);

  const handleOpenWhyExplanation = (requirementId: string, bidderId: string) => {
    setSelectedWhyReqId(requirementId);
    setSelectedWhyBidderId(bidderId);
    setIsWhyDrawerOpen(true);
  };

  if (isLoading && !summary) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading Procurement Officer Command Center...</p>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Workspace Load Error</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={fetchWorkspaceSummary}
            className="w-full py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            Retry Workspace
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Quick Shortcut Toolbar */}
        <QuickNavToolbar tenderId={tenderId} />

        {/* 1. Persistent Tender Header */}
        <TenderWorkspaceHeader
          tender={summary.tender}
          bidderCount={summary.counts.bidderCount}
          processingStage={summary.processingStatus.stage}
          onRefresh={fetchWorkspaceSummary}
        />

        {/* 2. Overview Counts & Intelligence Cards */}
        <OverviewCards counts={summary.counts} />

        {/* 3. Priority Action Queue ("Action Required") */}
        <PriorityActionQueue actions={summary.actions} />

        {/* 4. Central Requirement Compliance Matrix */}
        <RequirementComplianceMatrixView
          tenderId={tenderId}
          onOpenWhyExplanation={handleOpenWhyExplanation}
        />

        {/* 5. Tender Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ConflictIntelligencePanel
            tenderId={tenderId}
            unresolvedCount={summary.counts.unresolvedConflictCount}
            criticalCount={summary.counts.criticalConflictCount}
            totalCount={summary.counts.conflictCount}
            bidders={summary.bidderSummary.filter((b) => b.conflictCount > 0)}
          />

          <InvestigationPanel
            tenderId={tenderId}
            humanReviewCount={summary.counts.humanReviewInvestigationCount}
            pendingCount={summary.counts.pendingInvestigationCount}
            totalCount={summary.counts.investigationCount}
            bidders={summary.bidderSummary.filter((b) => b.investigationCount > 0)}
          />

          <EvidenceCoveragePanel coverage={summary.evidenceCoverage} />
        </div>

        {/* 6. Submitted Bidders Overview Table */}
        <BidderOverviewTable tenderId={tenderId} bidders={summary.bidderSummary} />

        {/* 7. Recent Activity Audit Log */}
        <RecentActivityFeed activities={summary.recentActivity} />
      </div>

      {/* Requirement Why? Trace Explanation Drawer */}
      <RequirementWhyDrawer
        tenderId={tenderId}
        requirementId={selectedWhyReqId}
        bidderId={selectedWhyBidderId}
        isOpen={isWhyDrawerOpen}
        onClose={() => setIsWhyDrawerOpen(false)}
      />
    </div>
  );
}
