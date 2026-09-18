'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import { PublishedTenderSummary } from '@/types/application';
import {
  Layers,
  Search,
  Filter,
  Calendar,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BidderTendersPage() {
  const [tenders, setTenders] = useState<PublishedTenderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    let isMounted = true;
    async function loadTenders() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getPublishedTenders({
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          search: searchQuery.trim() || undefined,
        });
        if (isMounted) {
          setTenders(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load published tenders.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    const debounce = setTimeout(loadTenders, 250);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [searchQuery, selectedCategory]);

  const categories = ['ALL', 'TECHNICAL', 'FINANCIAL', 'STATUTORY', 'HSE', 'EXPERIENCE'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Electronic Tender Opportunities
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Official published tenders open for bidder proposal submission and verification
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tender title, reference number, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tender List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2.5">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Fetching published tenders...</p>
          </div>
        </div>
      ) : tenders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center">
          <Layers className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No published tenders found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'Try adjusting your search criteria or category filter.'
              : 'There are currently no tenders in PUBLISHED state.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tenders.map((tender) => {
            const formattedValue = tender.estimatedValue
              ? `₹${(tender.estimatedValue / 10000000).toFixed(2)} Crore`
              : 'Not Disclosed';

            return (
              <div
                key={tender.id}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm transition hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {tender.tenderNumber}
                      </span>
                      <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Published • Active
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {tender.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {tender.organization}
                        {tender.department ? ` (${tender.department})` : ''}
                      </span>
                      <span>•</span>
                      <span>
                        Estimated Value: <strong className="text-slate-700 dark:text-slate-200">{formattedValue}</strong>
                      </span>
                      {tender.submissionDeadline && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Calendar className="h-3.5 w-3.5" />
                            Deadline: {new Date(tender.submissionDeadline).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    {tender.summary && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 pt-1">
                        {tender.summary}
                      </p>
                    )}

                    {/* Requirements & Categories */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {tender.requirementsCount} Verified Requirements
                      </span>
                      {tender.categories?.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
                    <Link href={`/bidder/tenders/${tender.id}`}>
                      <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 px-4 py-2">
                        Inspect Requirements & Apply
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
