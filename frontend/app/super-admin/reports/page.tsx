'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, AdminDashboardStats } from '@/lib/api/admin.api';
import {
  BarChart3,
  SlidersHorizontal,
  Download,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  PieChart,
  ShieldCheck,
  Building,
  Layers,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminReportsPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30D');

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getMetrics();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load report metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExportSummaryCSV = () => {
    if (!stats) return;
    const rows = [
      ['Report Domain', 'Indicator', 'Measured Metric'],
      ['Platform Governance', 'Total Registered Identities', String(stats.users.total)],
      ['Platform Governance', 'Active Accounts', String(stats.users.active)],
      ['Platform Governance', 'Suspended Accounts', String(stats.users.suspended)],
      ['Platform Governance', 'Commercial Bidders', String(stats.users.bidders)],
      ['Platform Governance', 'Procurement Officers', String(stats.users.officers)],
      ['Platform Governance', 'Platform Administrators', String(stats.users.admins)],
      ['GeM Procurement', 'Total Published Tenders', String(stats.tenders.total)],
      ['GeM Procurement', 'Active Tenders in Window', String(stats.tenders.active)],
      ['GeM Procurement', 'Closed / Evaluated Tenders', String(stats.tenders.closed)],
      ['Bid Verification', 'Total Received Bids', String(stats.bids.total)],
      ['Bid Verification', 'Submitted Dossiers', String(stats.bids.submitted)],
      ['Bid Verification', 'Pending Verification Review', String(stats.bids.pendingReview)],
      ['Bid Verification', 'Statutorily Qualified', String(stats.bids.qualified)],
      ['Bid Verification', 'Disqualified on Non-Compliance', String(stats.bids.disqualified)],
      ['Gateway Connectors', 'Operational Statutory Gateways', `${stats.integrations.healthy}/${stats.integrations.total}`],
      ['Platform Security', 'Open Critical Incidents', String(stats.incidents.open)],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BidSure_SuperAdmin_Intelligence_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-700 text-white shadow-lg shadow-amber-500/20 border border-amber-400/30">
              <BarChart3 className="h-6 w-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-wide">Platform Intelligence & Statutory Reporting</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-950 text-amber-400 border border-amber-800 rounded">
                  OFFICIAL AUDIT EXPORT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Executive macro-analytics on procurement qualification velocity, verification dropouts, and statutory throughput
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportSummaryCSV}
              disabled={!stats}
              className="rounded-xl border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 text-xs font-semibold gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export Executive CSV
            </Button>
            <Button
              variant="outline"
              onClick={loadStats}
              disabled={isLoading}
              className="rounded-xl border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* SIH Statutory Non-Violation Caveat */}
        <div className="mt-5 rounded-xl border border-amber-900/40 bg-amber-950/20 p-3.5 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-amber-300">Statutory Reporting Standard: </span>
            A document verification failure or format mismatch must never be treated as an established regulatory violation or fraud. In the GeM procurement framework, technical non-conformities trigger a clarification window for the vendor before any final officer determination.
          </div>
        </div>
      </div>

      {isLoading && !stats ? (
        <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-12 text-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-cyan-400" />
          <p className="text-xs">Computing platform-wide statutory statistics...</p>
        </div>
      ) : !stats ? (
        <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-8 text-center text-slate-500 text-xs">
          Report metrics unavailable.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Macro KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Registered Identities</span>
                <Building className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{stats.users.total}</div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="text-emerald-400">{stats.users.active} Active</span>
                <span>•</span>
                <span className="text-rose-400">{stats.users.suspended} Suspended</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Active Tender Dossiers</span>
                <FileText className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-purple-400">{stats.tenders.active}</div>
              <p className="text-[11px] text-slate-400 font-mono">Out of {stats.tenders.total} lifetime notices</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Bids Evaluated</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{stats.bids.submitted}</div>
              <p className="text-[11px] text-slate-400 font-mono">{stats.bids.qualified} Qualified ({Math.round(((stats.bids.qualified || 1) / (stats.bids.submitted || 1)) * 100)}%)</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Gateway Adapter Availability</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {stats.integrations.healthy} / {stats.integrations.total}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">100% statutory sandbox uptime</p>
            </div>
          </div>

          {/* Detailed Analytical Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bid Evaluation Pipeline Distribution */}
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-cyan-400" />
                  Bid Compliance Pipeline Breakdown
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">{stats.bids.total} Proposals</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Statutoriily Qualified Bids</span>
                    <span className="text-emerald-400 font-bold">{stats.bids.qualified}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, ((stats.bids.qualified / (stats.bids.total || 1)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Pending Compliance Review & Clarification</span>
                    <span className="text-amber-400 font-bold">{stats.bids.pendingReview}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, ((stats.bids.pendingReview / (stats.bids.total || 1)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Disqualified (Statutory Non-Compliance)</span>
                    <span className="text-rose-400 font-bold">{stats.bids.disqualified}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-rose-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, ((stats.bids.disqualified / (stats.bids.total || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Disqualification reasons are traceable directly to rule codes (GST, PAN, MSME, or Debarment).
              </div>
            </div>

            {/* Platform Role Distribution */}
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Building className="h-4 w-4 text-purple-400" />
                  User & Role Governance Distribution
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">{stats.users.total} Identities</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Commercial Bidders / Vendors:</span>
                  <span className="text-cyan-400 font-bold">{stats.users.bidders} Accounts</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Government Procurement Officers:</span>
                  <span className="text-purple-400 font-bold">{stats.users.officers} Officers</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Administrative Staff:</span>
                  <span className="text-amber-400 font-bold">{stats.users.admins} Admins</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Open Security Incidents:</span>
                  <span className="text-rose-400 font-bold">{stats.incidents.open} Active</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Accounts are authenticated via JWT bearer tokens with Argon2/Bcrypt password hashing.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
