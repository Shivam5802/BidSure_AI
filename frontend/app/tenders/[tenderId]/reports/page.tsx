'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Plus,
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { reportsApi } from '@/lib/api/reports.api';
import { ReportMetadata, ReportDataSnapshot } from '@/types/reports';
import { ReportHeaderBanner } from '@/features/reports/ReportHeaderBanner';
import { ReportExecutiveSummaryCards } from '@/features/reports/ReportExecutiveSummaryCards';
import { ReportRequirementTraceTable } from '@/features/reports/ReportRequirementTraceTable';
import { ReportConflictsSection } from '@/features/reports/ReportConflictsSection';
import { ReportInvestigationsSection } from '@/features/reports/ReportInvestigationsSection';
import { ReportAuditTimelineView } from '@/features/reports/ReportAuditTimelineView';
import { ReportSystemVersionsFooter } from '@/features/reports/ReportSystemVersionsFooter';
import { ReportHistoryTable } from '@/features/reports/ReportHistoryTable';
import { QuickNavToolbar } from '@/features/workspace/QuickNavToolbar';

interface ReportsPageProps {
  params: Promise<{
    tenderId: string;
  }>;
}

export default function ReportsLandingPage({ params }: ReportsPageProps) {
  const resolvedParams = use(params);
  const tenderId = resolvedParams.tenderId;

  const [reports, setReports] = useState<ReportMetadata[]>([]);
  const [activeReport, setActiveReport] = useState<ReportDataSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, [tenderId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const history = await reportsApi.listReports(tenderId);
      setReports(history);

      if (history.length > 0) {
        const latest = await reportsApi.getReport(history[0].id);
        setActiveReport(latest);
      } else {
        // Automatically generate initial report if none exists
        const initial = await reportsApi.generateTenderReport(tenderId);
        setActiveReport(initial);
        setReports([initial.metadata]);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNew = async () => {
    setGenerating(true);
    try {
      const fresh = await reportsApi.generateTenderReport(tenderId, true);
      setActiveReport(fresh);
      const updatedHistory = await reportsApi.listReports(tenderId);
      setReports(updatedHistory);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectReport = async (reportId: string) => {
    setLoading(true);
    try {
      const snapshot = await reportsApi.getReport(reportId);
      setActiveReport(snapshot);
    } catch (err) {
      console.error('Failed to fetch report snapshot:', err);
    } finally {
      setLoading(false);
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
            onClick={handleGenerateNew}
            disabled={generating}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Generate New Report Snapshot
          </button>
        </div>

        <QuickNavToolbar tenderId={tenderId} />

        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium">Generating immutable compliance audit report snapshot...</p>
          </div>
        ) : activeReport ? (
          <>
            {/* Header Banner */}
            <ReportHeaderBanner snapshot={activeReport} onRegenerate={handleGenerateNew} />

            {/* Executive Summary Cards */}
            <ReportExecutiveSummaryCards summary={activeReport.executiveSummary} />

            {/* Requirement Compliance Audit Trail */}
            <ReportRequirementTraceTable requirements={activeReport.requirements} tenderId={tenderId} />

            {/* Evidence Conflicts Section */}
            <ReportConflictsSection conflicts={activeReport.conflicts} />

            {/* AI Investigation Records Section */}
            <ReportInvestigationsSection investigations={activeReport.investigations} />

            {/* Chronological Audit Timeline */}
            <ReportAuditTimelineView timeline={activeReport.auditTimeline} />

            {/* System Component Versions & Disclaimer Footer */}
            <ReportSystemVersionsFooter
              versions={activeReport.systemVersions}
              metadata={activeReport.metadata}
              disclaimer={activeReport.disclaimer}
            />

            {/* Report History & Saved Snapshots */}
            <ReportHistoryTable reports={reports} onSelectReport={handleSelectReport} />
          </>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            Failed to load compliance report.
          </div>
        )}
      </div>
    </div>
  );
}
