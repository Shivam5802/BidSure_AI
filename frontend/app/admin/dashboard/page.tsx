'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api/client';
import {
  Users,
  ShieldCheck,
  Layers,
  Activity,
  UserCheck,
  UserX,
  ArrowRight,
  Server,
  Database,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const [officers, setOfficers] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAdminData() {
      try {
        setIsLoading(true);
        setError(null);
        const [officersRes, healthRes] = await Promise.all([
          api.listOfficers().catch(() => []),
          api.checkHealth().catch(() => null),
        ]);

        if (isMounted) {
          setOfficers(officersRes);
          setHealth(healthRes);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load system administration data.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadAdminData();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeOfficers = officers.filter((o) => o.isActive);
  const inactiveOfficers = officers.filter((o) => !o.isActive);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading system administration metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-600/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Platform System Administration
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized Governance, Procurement Officer Provisioning & System Health
              </p>
            </div>
          </div>
          <Link href="/admin/officers">
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Manage Procurement Officers
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Active Officers</span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {activeOfficers.length}
          </div>
          <span className="mt-2 block text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            Authorized to evaluate tenders
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Deactivated Officers</span>
            <UserX className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            {inactiveOfficers.length}
          </div>
          <span className="mt-2 block text-[11px] text-slate-500 dark:text-slate-400">
            Access revoked or retired
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">System Backend Status</span>
            <Activity className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {health?.status === 'healthy' ? 'Operational' : 'Online'}
          </div>
          <span className="mt-2 block text-[11px] text-slate-500 dark:text-slate-400">
            Node.js Fastify Microservices
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">AI Evaluation Pipeline</span>
            <Server className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            Quad-State
          </div>
          <span className="mt-2 block text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
            Deterministic Engine Active
          </span>
        </div>
      </div>

      {/* Officers Quick Table & Platform Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Procurement Officer Directory</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Authorized evaluators and administrators</p>
            </div>
            <Link href="/admin/officers" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Manage All Officers ({officers.length}) <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Officer Name</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {officers.slice(0, 5).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{o.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{o.email}</div>
                    </td>
                    <td className="py-2.5 px-3">{o.department || 'Public Procurement'}</td>
                    <td className="py-2.5 px-3">{o.designation || 'Officer'}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          o.isActive
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {o.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: Security & Governance */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Admin Governance Rules</h2>
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3">
              <span className="font-bold text-slate-900 dark:text-white block">Strict Officer RBAC</span>
              Officers have sole authority to author tender criteria, publish tenders, and finalize evaluations.
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3">
              <span className="font-bold text-slate-900 dark:text-white block">Instant Access Revocation</span>
              Deactivating an officer prevents session token renewal and removes their access immediately.
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3">
              <span className="font-bold text-slate-900 dark:text-white block">Audit Trail Non-Repudiation</span>
              All officer creations, status toggles, and updates are logged in the immutable audit event stream.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
