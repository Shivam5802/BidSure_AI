'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminApi, AdminBidMonitoringItem } from '@/lib/api/admin.api';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Building2,
  FileText,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function BidMonitoringContent() {
  const searchParams = useSearchParams();
  const initialTenderId = searchParams.get('tenderId') || '';

  const [bids, setBids] = useState<AdminBidMonitoringItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tenderIdFilter, setTenderIdFilter] = useState(initialTenderId);

  const fetchBids = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getBidMonitoring({
        search: search.trim() || undefined,
        status: statusFilter,
        tenderId: tenderIdFilter || undefined,
      });
      setBids(data);
    } catch (err: any) {
      console.error('Failed to load bids monitoring:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [statusFilter, tenderIdFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBids();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Cross-Tender Bid Monitoring</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitor all vendor proposal submissions, automated compliance states, and stuck verification pipelines
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={fetchBids}
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
              placeholder="Search by application number, vendor name, or tender reference..."
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
              <option value="ALL">All Bid Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="EVALUATING">Evaluating</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="NOT_QUALIFIED">Not Qualified / Disqualified</option>
              <option value="DRAFT">Draft</option>
            </select>

            {tenderIdFilter && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTenderIdFilter('')}
                className="rounded-xl text-xs"
              >
                Clear Tender Filter
              </Button>
            )}

            <Button type="submit" className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold px-4">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Bids Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Application & Bidder</th>
                <th className="px-5 py-3.5">Tender Reference</th>
                <th className="px-5 py-3.5">Tax Identifiers</th>
                <th className="px-5 py-3.5">Docs</th>
                <th className="px-5 py-3.5">Processing Status</th>
                <th className="px-5 py-3.5">Verification</th>
                <th className="px-5 py-3.5">Submission Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1464B4] mb-2" />
                    Loading bid proposal stream...
                  </td>
                </tr>
              ) : bids.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No bid submissions found matching filter criteria.
                  </td>
                </tr>
              ) : (
                bids.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{b.bidderName}</span>
                        {b.isStuck && (
                          <span className="rounded bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5" title="Submission pending review for over 3 days">
                            STUCK
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-[#1464B4] dark:text-[#58A6FF]">{b.applicationNumber}</div>
                      <div className="text-[10px] text-slate-400">{b.bidderEmail}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900 dark:text-white">{b.tenderTitle}</div>
                      <div className="font-mono text-[10px] text-slate-400">{b.tenderReference}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px]">
                      <div>GST: {b.gstin}</div>
                      <div className="text-slate-400">PAN: {b.pan}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {b.documentsSubmitted} files
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          b.status === 'QUALIFIED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : b.status === 'NOT_QUALIFIED'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          b.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : b.verificationStatus === 'FAILED'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                        }`}
                      >
                        {b.verificationStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                      {b.submittedAt ? new Date(b.submittedAt).toLocaleString() : 'Draft Mode'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminBidMonitoringPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading bid monitoring interface...</div>}>
      <BidMonitoringContent />
    </Suspense>
  );
}
