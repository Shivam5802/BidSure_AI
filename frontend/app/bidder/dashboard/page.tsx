'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { api } from '@/lib/api/client';
import { TenderApplicationData, PublishedTenderSummary } from '@/types/application';
import {
  Layers,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Building2,
  FileText,
  ShieldCheck,
  Loader2,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BidderDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<TenderApplicationData[]>([]);
  const [publishedTenders, setPublishedTenders] = useState<PublishedTenderSummary[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const [appsRes, tendersRes, profRes] = await Promise.all([
          api.getMyApplications().catch(() => []),
          api.getPublishedTenders().catch(() => []),
          api.getBidderProfile().catch(() => null),
        ]);

        if (isMounted) {
          setApplications(appsRes);
          setPublishedTenders(tendersRes);
          setProfile(profRes);
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading contractor portal workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {profile?.companyName || user?.name || 'Bidder Organization'}
                </h1>
                <span className="rounded bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Verified Vendor
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Authorized Signatory: <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.name}</span> •{' '}
                {profile?.gstin ? `GSTIN: ${profile.gstin}` : user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/bidder/tenders">
              <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20">
                <Layers className="mr-1.5 h-3.5 w-3.5" />
                Browse Active Tenders
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

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Active Published Tenders</span>
            <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {publishedTenders.length}
          </div>
          <Link href="/bidder/tenders" className="mt-2 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Browse Opportunities <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Draft Applications</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {draftApps.length}
          </div>
          <Link href="/bidder/applications" className="mt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
            Continue In-Progress <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Submitted & Evaluating</span>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {submittedApps.length}
          </div>
          <span className="mt-2 block text-[11px] text-slate-500 dark:text-slate-400">
            Under Officer & AI Review
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Pre-Qualified Tenders</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {qualifiedApps.length}
          </div>
          <span className="mt-2 block text-[11px] text-slate-500 dark:text-slate-400">
            Compliant with All Clauses
          </span>
        </div>
      </div>

      {/* Two-Column Section: My Applications & Available Tenders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Recent Applications */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">My Tender Applications</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Submissions, drafts, and evaluation statuses</p>
            </div>
            <Link href="/bidder/applications" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All ({applications.length})
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">No applications created yet</p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Browse published government tenders to begin an electronic compliance application.
              </p>
              <Link href="/bidder/tenders" className="mt-4 inline-block">
                <Button size="sm" className="rounded-xl bg-indigo-600 text-xs text-white">
                  Browse Tenders
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-4 transition hover:border-indigo-300 dark:hover:border-indigo-500/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {app.applicationNumber}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">
                        Tender #{app.tenderId.slice(0, 16)}...
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {app.documents?.length || 0} Evidence Documents Uploaded
                        {app.submittedAt ? ` • Submitted ${new Date(app.submittedAt).toLocaleDateString()}` : ' • Draft in progress'}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          app.status === 'QUALIFIED'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW' || app.status === 'EVALUATING'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                            : app.status === 'DRAFT'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end">
                    <Link href={`/bidder/applications/${app.id}`}>
                      <Button size="sm" variant="outline" className="rounded-lg text-[11px] h-7 px-3">
                        {app.status === 'DRAFT' ? 'Continue Application' : 'Inspect Dossier'}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Published Tenders */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Published Tenders</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Open for bidder electronic application</p>
            </div>
            <Link href="/bidder/tenders" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              View Directory
            </Link>
          </div>

          {publishedTenders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
              <Layers className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">No published tenders currently active</p>
            </div>
          ) : (
            <div className="space-y-3">
              {publishedTenders.slice(0, 4).map((tender) => (
                <div
                  key={tender.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-4 transition hover:border-indigo-300 dark:hover:border-indigo-500/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {tender.tenderNumber}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                        {tender.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {tender.organization} • {tender.requirementsCount} Requirements • Value: ₹{((tender.estimatedValue || 0) / 10000000).toFixed(1)} Cr
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[9px] font-bold uppercase">
                      Open
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end">
                    <Link href={`/bidder/tenders/${tender.id}`}>
                      <Button size="sm" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[11px] h-7 px-3 text-white">
                        Inspect Requirements & Apply
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Governance & Trust Banner */}
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-xs">Deterministic Compliance Protocol</h4>
          <p className="mt-1">
            All submitted applications are indexed and cross-referenced against tender technical & financial criteria.
            Our multi-tier verification process ensures non-repudiation, tamper-evident audit logging, and transparent evaluation before final award.
          </p>
        </div>
      </div>
    </div>
  );
}
