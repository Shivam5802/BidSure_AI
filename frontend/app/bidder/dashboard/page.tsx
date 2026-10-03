'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { api } from '@/lib/api/client';
import { TenderApplicationData, PublishedTenderSummary } from '@/types/application';
import {
  Layers,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building2,
  FileText,
  ShieldCheck,
  FolderLock,
  Search,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  FileUp,
  Activity,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Wave } from '@/components/ui/LoadingState';

export default function BidderDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<TenderApplicationData[]>([]);
  const [publishedTenders, setPublishedTenders] = useState<PublishedTenderSummary[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [compliance, setCompliance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [appsRes, tendersRes, profRes, metricsRes, compRes] = await Promise.all([
          api.getMyApplications().catch(() => []),
          api.getPublishedTenders().catch(() => []),
          api.getBidderProfile().catch(() => null),
          api.getBidderOverviewMetrics().catch(() => null),
          api.getBidderComplianceSummary().catch(() => null),
        ]);

        if (isMounted) {
          setApplications(appsRes);
          setPublishedTenders(tendersRes);
          setProfile(profRes);
          setMetrics(metricsRes);
          setCompliance(compRes);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const draftApps = applications.filter((a) => a.status === 'DRAFT');
  const submittedApps = applications.filter((a) => a.status !== 'DRAFT' && a.status !== 'WITHDRAWN');
  const qualifiedApps = applications.filter((a) => a.status === 'QUALIFIED');

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <Wave className="h-6 text-[#1a6aef]" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 animate-pulse">
            Loading bidder compliance dashboard...
          </p>
        </div>
      </div>
    );
  }

  const profilePct = metrics?.profileCompletionPercent ?? 0;
  const docsSubmitted = metrics?.documentsSubmitted ?? 0;
  const docsVerified = metrics?.documentsVerified ?? 0;
  const expiredDocs = metrics?.expiredDocuments ?? 0;
  const activeInconsistencies = metrics?.activeInconsistencies ?? 0;
  const awaitingRegs = metrics?.registrationsAwaitingVerification ?? 0;
  const upcomingDeadlines = metrics?.upcomingDeadlines || [];
  const recentActivity = metrics?.recentActivity || [];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1464B4] text-white shadow-lg shadow-blue-600/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {profile?.legalName || profile?.companyName || user?.name || 'Registered Bidder Enterprise'}
                </h1>
                <span className="rounded bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Active GeM Vendor
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Authorized Signatory: <span className="font-semibold text-slate-700 dark:text-slate-300">{profile?.representative?.fullName || user?.name}</span> •{' '}
                {profile?.gstin ? `GSTIN: ${profile.gstin}` : user?.email} • {profile?.businessType || 'Private Limited'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/bidder/documents">
              <Button variant="outline" className="rounded-xl text-xs font-semibold">
                <FolderLock className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Document Vault
              </Button>
            </Link>
            <Link href="/bidder/tenders">
              <Button className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20">
                <Search className="mr-1.5 h-3.5 w-3.5" />
                Browse Tenders
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Profile Completion */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Profile Completion</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1464B4] dark:text-blue-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {profilePct}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1464B4] transition-all duration-500"
              style={{ width: `${profilePct}%` }}
            />
          </div>
          <Link href="/bidder/profile" className="mt-2.5 inline-flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Complete details <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        {/* Vault Documents */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Vault Documents</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {docsVerified}/{docsSubmitted}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Verified</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {expiredDocs > 0 ? `${expiredDocs} expired document(s)` : 'All documents active'}
          </p>
          <Link href="/bidder/documents" className="mt-2.5 inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            Open Vault <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        {/* Compliance Inconsistencies */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Compliance Health</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              activeInconsistencies > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
            }`}>
              {activeInconsistencies > 0 ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {compliance?.overallReadinessScore ?? 100}%
            </span>
            <span className="text-[11px] font-medium text-slate-500">Readiness</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {activeInconsistencies > 0 ? `${activeInconsistencies} issue(s) needing resolution` : 'Zero data mismatches detected'}
          </p>
          <Link href="/bidder/compliance" className="mt-2.5 inline-flex items-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Compliance Center <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        {/* Bids Submitted */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tender Bids</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {submittedApps.length}
            </span>
            <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
              Submitted ({draftApps.length} draft)
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {qualifiedApps.length} bids qualified by officers
          </p>
          <Link href="/bidder/applications" className="mt-2.5 inline-flex items-center text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline">
            Track Applications <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Prioritized Action Banner if issues exist */}
      {activeInconsistencies > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                  Attention Required: {activeInconsistencies} Compliance Inconsistencies Detected
                </h3>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-400/90 leading-relaxed">
                  Our automated pre-check detected conflicting identifiers or missing registrations between your profile and submitted records. Resolve these before bidding to prevent immediate disqualification.
                </p>
              </div>
            </div>
            <Link href="/bidder/compliance">
              <Button size="sm" className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0">
                Resolve Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Two Column Layout: Upcoming Deadlines & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Submission Deadlines */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#1464B4]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Tenders & Deadlines</h2>
            </div>
            <Link href="/bidder/tenders" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              View All ({publishedTenders.length})
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No closing deadlines within 30 days.</p>
            ) : (
              upcomingDeadlines.map((t: any) => (
                <div
                  key={t.tenderId}
                  className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="space-y-1 pr-4">
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono">{t.referenceNumber}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                        <Clock className="h-3 w-3" />
                        {t.daysRemaining === 0 ? 'Closes today' : `${t.daysRemaining} days remaining`}
                      </span>
                    </div>
                  </div>
                  <Link href={`/bidder/tenders/${t.tenderId}`}>
                    <Button size="sm" variant="outline" className="rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50">
                      Apply
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit & Verification Activity */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Compliance Activity</h2>
            </div>
            <Link href="/bidder/reports" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Full Audit Trail
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent compliance alerts.</p>
            ) : (
              recentActivity.map((act: any) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {act.action}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
