'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, AdminTenderOverviewItem } from '@/lib/api/admin.api';
import {
  FileText,
  Search,
  Filter,
  Layers,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminTendersOversightPage() {
  const [tenders, setTenders] = useState<AdminTenderOverviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchTenders = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getTenderOversight({
        search: search.trim() || undefined,
        status: statusFilter,
      });
      setTenders(data);
    } catch (err: any) {
      console.error('Failed to load tenders oversight:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTenders();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-md shadow-cyan-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tenders Administrative Oversight</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitor live procurement dossiers, bid accumulation rates, officer assignments, and operational compliance
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={fetchTenders}
            className="rounded-xl text-xs font-semibold gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-4 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by tender reference number, title, or procurement organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#1464B4]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published (Live)</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY">Ready</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
            </select>

            <Button type="submit" className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold px-4">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Tenders Grid / Cards */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#1464B4]" />
        </div>
      ) : tenders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-12 text-center text-slate-500">
          No tenders matching the filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenders.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1464B4]/40 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-[#1464B4] dark:text-[#58A6FF] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      {t.referenceNumber}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                      {t.title}
                    </h3>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                      t.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : t.status === 'CLOSED'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t.organization}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>Responsible: {t.officerName} ({t.officerEmail})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Closes: {new Date(t.closingDate).toLocaleDateString()} ({t.daysRemaining} days left)</span>
                  </div>
                </div>

                {t.hasOperationalIssues && (
                  <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>Operational alert: Submitted bids pending officer review.</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Bids</span>
                    <span className="font-bold text-slate-900 dark:text-white">{t.bidCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Submitted</span>
                    <span className="font-bold text-slate-900 dark:text-white">{t.submittedBidsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Qualified</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{t.qualifiedCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/bids?tenderId=${t.id}`}>
                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-[11px]">
                      View Bids
                    </Button>
                  </Link>
                  <Link href={`/tenders/${t.id}/workspace`}>
                    <Button size="sm" className="h-8 rounded-lg bg-[#1464B4] hover:bg-blue-700 text-white text-[11px] gap-1">
                      <span>Dossier</span>
                      <ExternalLink className="h-3 w-3" />
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
