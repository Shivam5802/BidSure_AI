'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, AdminDashboardStats } from '@/lib/api/admin.api';
import {
  Users,
  ShieldCheck,
  Layers,
  Activity,
  FileText,
  BookOpen,
  Calculator,
  BrainCircuit,
  History,
  SlidersHorizontal,
  Bell,
  Lock,
  ArrowRight,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  AlertCircle,
  TrendingUp,
  Building2,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await adminApi.getMetrics();
        if (isMounted) setStats(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load system administration metrics.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-8 w-8 animate-spin text-[#1464B4] dark:text-[#58A6FF]" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading system administration metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1464B4] to-cyan-500 text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Platform System Administration
                </h1>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-[10px] font-bold text-[#1464B4] dark:text-[#58A6FF]">
                  GFR 2017 & GeM
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized Governance, User Lifecycle, Statutory Rules & Compliance Oversight
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/admin/users">
              <Button className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs">
                <Users className="mr-1.5 h-3.5 w-3.5" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/tenders">
              <Button variant="outline" className="rounded-xl text-xs font-semibold">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Tender Oversight
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Notice: {error} Using cached platform data.</span>
        </div>
      )}

      {/* Operational Alerts */}
      {stats?.alerts && stats.alerts.length > 0 && (
        <div className="space-y-2">
          {stats.alerts.map((alt) => (
            <div
              key={alt.id}
              className={`flex items-center justify-between gap-3 rounded-xl p-3.5 text-xs border ${
                alt.severity === 'CRITICAL'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                  : alt.severity === 'HIGH' || alt.severity === 'MEDIUM'
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                  : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="font-medium">{alt.message}</span>
              </div>
              <Link
                href={alt.actionLink}
                className="font-bold underline hover:no-underline text-xs shrink-0 flex items-center gap-1"
              >
                {alt.actionLabel}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 4 Primary Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Users</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950 text-[#1464B4] dark:text-[#58A6FF]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.users.total ?? 0}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {stats?.users.active ?? 0} Active
              </span>
              <span>•</span>
              <span className="text-rose-500 font-semibold">{stats?.users.suspended ?? 0} Suspended</span>
            </div>
          </div>
        </div>

        {/* Tenders Managed */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Platform Tenders</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.tenders.total ?? 0}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {stats?.tenders.active ?? 0} Active
              </span>
              <span>•</span>
              <span>{stats?.tenders.closed ?? 0} Closed</span>
            </div>
          </div>
        </div>

        {/* Total Bids Submitted */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bids Monitored</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.bids.total ?? 0}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {stats?.bids.pendingReview ?? 0} In Review
              </span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{stats?.bids.qualified ?? 0} Qualified</span>
            </div>
          </div>
        </div>

        {/* System & Integrations */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Adapters & Incidents</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{stats?.integrations.healthy}/{stats?.integrations.total}</span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Adapters Up</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {stats?.incidents.open ?? 0} Open Incidents
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Breakdown Sub-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Vendors / Bidders</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{stats?.users.bidders ?? 0}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Procurement Officers</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{stats?.users.officers ?? 0}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Platform Admins</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">{stats?.users.admins ?? 0}</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Disqualified Bids</div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">{stats?.bids.disqualified ?? 0}</div>
        </div>
      </div>

      {/* Quick Access Matrix */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Administrative Control Centers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { title: 'User Management', desc: 'Central user registry & status', href: '/admin/users', icon: Users, color: 'text-blue-500' },
            { title: 'Officer Management', desc: 'Manage GeM procurement staff', href: '/admin/officers', icon: Building2, color: 'text-indigo-500' },
            { title: 'Roles & Permissions', desc: 'Least privilege RBAC matrix', href: '/admin/roles', icon: ShieldCheck, color: 'text-emerald-500' },
            { title: 'Tenders Overview', desc: 'Active tenders & dossiers', href: '/admin/tenders', icon: FileText, color: 'text-cyan-500' },
            { title: 'Bid Monitoring', desc: 'Cross-tender bid evaluations', href: '/admin/bids', icon: BookOpen, color: 'text-amber-500' },
            { title: 'Compliance Rules', desc: 'PAN, GST, MSME rule engines', href: '/admin/compliance-rules', icon: Calculator, color: 'text-violet-500' },
            { title: 'Verification Adapters', desc: 'GSTN, NSDL, DigiLocker status', href: '/admin/integrations', icon: BrainCircuit, color: 'text-sky-500' },
            { title: 'Forensic Audit Logs', desc: 'Sealed immutable event ledger', href: '/admin/audit', icon: History, color: 'text-rose-500' },
            { title: 'System Health', desc: 'Telemetry, CPU, Memory & DB', href: '/admin/system-health', icon: Activity, color: 'text-teal-500' },
            { title: 'Reports & Analytics', desc: 'Exportable administrative reports', href: '/admin/reports', icon: SlidersHorizontal, color: 'text-orange-500' },
            { title: 'Incident Desk', desc: 'Operational anomalies & alerts', href: '/admin/incidents', icon: Bell, color: 'text-red-500' },
            { title: 'Platform Settings', desc: 'Global configurations & policies', href: '/admin/settings', icon: Lock, color: 'text-slate-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-3.5 hover:border-[#1464B4] dark:hover:border-[#58A6FF] transition shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#1464B4] dark:group-hover:text-[#58A6FF] transition group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#1464B4] dark:group-hover:text-[#58A6FF]">
                    {item.title}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Platform Activity</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time audit events across users, tenders, and compliance engines</p>
          </div>
          <Link href="/admin/audit" className="text-xs font-bold text-[#1464B4] dark:text-[#58A6FF] hover:underline flex items-center gap-1">
            View All Audit Logs
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(stats?.recentActivity || []).map((act) => (
            <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-[#1464B4] shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{act.title}</div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">{act.description}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-2">
                    <span>Actor: {act.actor}</span>
                    <span>•</span>
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono">{act.category}</span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 shrink-0">
                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
