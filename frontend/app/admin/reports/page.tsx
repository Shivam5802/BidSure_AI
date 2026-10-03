'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, AdminDashboardStats } from '@/lib/api/admin.api';
import {
  SlidersHorizontal,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminReportsPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30D');

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        setIsLoading(true);
        const data = await adminApi.getMetrics();
        if (isMounted) setStats(data);
      } catch (err: any) {
        console.error('Failed to load report metrics:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleExportSummaryCSV = () => {
    if (!stats) return;
    const rows = [
      ['Metric Category', 'Metric Indicator', 'Value'],
      ['Platform Users', 'Total Registered Users', String(stats.users.total)],
      ['Platform Users', 'Active Accounts', String(stats.users.active)],
      ['Platform Users', 'Suspended Accounts', String(stats.users.suspended)],
      ['Platform Users', 'Commercial Bidders', String(stats.users.bidders)],
      ['Platform Users', 'Procurement Officers', String(stats.users.officers)],
      ['Tender Dossiers', 'Total Tenders', String(stats.tenders.total)],
      ['Tender Dossiers', 'Active / Live Tenders', String(stats.tenders.active)],
      ['Tender Dossiers', 'Closed Tenders', String(stats.tenders.closed)],
      ['Bid Proposals', 'Total Bids Monitored', String(stats.bids.total)],
      ['Bid Proposals', 'Submitted Bids', String(stats.bids.submitted)],
      ['Bid Proposals', 'Pending Compliance Review', String(stats.bids.pendingReview)],
      ['Bid Proposals', 'Statutorily Qualified Bids', String(stats.bids.qualified)],
      ['Bid Proposals', 'Disqualified Bids', String(stats.bids.disqualified)],
      ['Integrations', 'Operational Verification Adapters', `${stats.integrations.healthy}/${stats.integrations.total}`],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BidSure_Executive_Administrative_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1464B4]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20">
              <SlidersHorizontal className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Administrative Reports & Analytics</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Executive procurement analytics, qualification trends, statutory compliance breakdown, and exportable reports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportSummaryCSV}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export Executive CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Compliance Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Verification Success Rate */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Statutory Qualification Ratio</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.bids.total
                ? Math.round(((stats.bids.qualified || 0) / stats.bids.total) * 100)
                : 100}%
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Proportion of evaluated bids successfully clearing mandatory GFR 2017 & statutory checks
            </p>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Awaiting Officer Action</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.bids.pendingReview ?? 0}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Submissions requiring final manual verification determination or clarification review
            </p>
          </div>
        </div>

        {/* Debarment & Disqualifications */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Disqualification Records</span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats?.bids.disqualified ?? 0}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Submissions with failed mandatory statutory criteria or negative debarment records
            </p>
          </div>
        </div>
      </div>

      {/* Structured Analytics Summary Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Platform Operational Digest</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Consolidated metrics summary across all system domains</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Domain</th>
                <th className="px-5 py-3.5">Metric Indicator</th>
                <th className="px-5 py-3.5 font-mono">Count / Value</th>
                <th className="px-5 py-3.5">Regulatory Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">User Accounts</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">Total Registered Bidders</td>
                <td className="px-5 py-3 font-mono font-bold text-slate-900 dark:text-white">{stats?.users.bidders}</td>
                <td className="px-5 py-3 text-slate-400 text-[11px]">GeM Supplier Registry</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">User Accounts</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">Authorized Procurement Officers</td>
                <td className="px-5 py-3 font-mono font-bold text-slate-900 dark:text-white">{stats?.users.officers}</td>
                <td className="px-5 py-3 text-slate-400 text-[11px]">GFR 2017 Competent Authority</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">Procurement Dossiers</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">Active Public Tenders</td>
                <td className="px-5 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{stats?.tenders.active}</td>
                <td className="px-5 py-3 text-slate-400 text-[11px]">Central Public Procurement Portal</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">Bid Proposals</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">Statutory Compliance Verified</td>
                <td className="px-5 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{stats?.bids.qualified}</td>
                <td className="px-5 py-3 text-slate-400 text-[11px]">Automated AI Compliance Engine</td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">Security & Incidents</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">Open Administrative Incidents</td>
                <td className="px-5 py-3 font-mono font-bold text-amber-600 dark:text-amber-400">{stats?.incidents.open}</td>
                <td className="px-5 py-3 text-slate-400 text-[11px]">National Cyber Security Directives</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
