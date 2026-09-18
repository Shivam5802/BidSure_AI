'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { TenderApplicationData } from '@/types/application';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BidderApplicationsPage() {
  const [applications, setApplications] = useState<TenderApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DRAFT' | 'SUBMITTED' | 'QUALIFIED'>('ALL');

  useEffect(() => {
    let isMounted = true;
    async function loadApps() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getMyApplications();
        if (isMounted) {
          setApplications(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load applications.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadApps();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredApps = applications.filter((app) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DRAFT') return app.status === 'DRAFT';
    if (activeFilter === 'SUBMITTED') return app.status !== 'DRAFT' && app.status !== 'QUALIFIED' && app.status !== 'WITHDRAWN';
    if (activeFilter === 'QUALIFIED') return app.status === 'QUALIFIED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            My Tender Applications
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Track submitted dossiers, continue pending drafts, and review officer evaluations
          </p>
        </div>
        <Link href="/bidder/tenders">
          <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Apply to Another Tender
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(['ALL', 'DRAFT', 'SUBMITTED', 'QUALIFIED'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeFilter === filter
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {filter === 'ALL' ? `All Applications (${applications.length})` : filter}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2.5">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading your applications...</p>
          </div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No applications found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {activeFilter !== 'ALL'
              ? `You currently have no applications matching the "${activeFilter}" filter.`
              : 'You have not submitted or drafted any tender applications yet.'}
          </p>
          <Link href="/bidder/tenders" className="mt-4 inline-block">
            <Button size="sm" className="rounded-xl bg-indigo-600 text-white text-xs">
              Explore Available Tenders
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm transition hover:border-indigo-300 dark:hover:border-indigo-500/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {app.applicationNumber}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        app.status === 'QUALIFIED'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW' || app.status === 'EVALUATING'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                          : app.status === 'DRAFT'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tender Application • #{app.tenderId}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{app.documents?.length || 0} Uploaded Evidence Documents</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Created: {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    {app.submittedAt && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>

                  {app.officerDecision && (
                    <div className="mt-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3 border border-slate-200 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Officer Note / Decision: </span>
                      <span className="text-slate-600 dark:text-slate-400">{app.officerDecision}</span>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0">
                  <Link href={`/bidder/applications/${app.id}`}>
                    <Button
                      size="sm"
                      className={`rounded-xl text-xs font-bold ${
                        app.status === 'DRAFT'
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      {app.status === 'DRAFT' ? 'Continue Application' : 'Inspect Dossier'}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
