'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import { reportsApi } from '@/lib/api/reports.api';
import { ReportDataSnapshot } from '@/types/reports';
import { ReportHeaderBanner } from '@/features/reports/ReportHeaderBanner';
import { ReportExecutiveSummaryCards } from '@/features/reports/ReportExecutiveSummaryCards';
import { ReportRequirementTraceTable } from '@/features/reports/ReportRequirementTraceTable';
import { ReportConflictsSection } from '@/features/reports/ReportConflictsSection';
import { ReportInvestigationsSection } from '@/features/reports/ReportInvestigationsSection';
import { ReportAuditTimelineView } from '@/features/reports/ReportAuditTimelineView';
import { ReportSystemVersionsFooter } from '@/features/reports/ReportSystemVersionsFooter';

interface BidderReportPageProps {
  params: Promise<{
    tenderId: string;
    bidderId: string;
  }>;
}

export default function BidderComplianceReportPage({ params }: BidderReportPageProps) {
  const resolvedParams = use(params);
  const { tenderId, bidderId } = resolvedParams;

  const [activeReport, setActiveReport] = useState<ReportDataSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [tenderId, bidderId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const report = await reportsApi.generateBidderReport(tenderId, bidderId);
      setActiveReport(report);
    } catch (err) {
      console.error('Failed to load bidder compliance report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/tenders/${tenderId}/reports`}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Report History
          </Link>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Loading bidder compliance audit report...</p>
          </div>
        ) : activeReport ? (
          <>
            <ReportHeaderBanner snapshot={activeReport} onRegenerate={loadReport} />
            <ReportExecutiveSummaryCards summary={activeReport.executiveSummary} />
            <ReportRequirementTraceTable requirements={activeReport.requirements} tenderId={tenderId} />
            <ReportConflictsSection conflicts={activeReport.conflicts} />
            <ReportInvestigationsSection investigations={activeReport.investigations} />
            <ReportAuditTimelineView timeline={activeReport.auditTimeline} />
            <ReportSystemVersionsFooter
              versions={activeReport.systemVersions}
              metadata={activeReport.metadata}
              disclaimer={activeReport.disclaimer}
            />
          </>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            Failed to load bidder compliance report.
          </div>
        )}
      </div>
    </div>
  );
}
