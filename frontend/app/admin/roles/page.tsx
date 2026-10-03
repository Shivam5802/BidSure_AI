'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, RolePermissionMatrix } from '@/lib/api/admin.api';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  XCircle,
  Users,
  AlertTriangle,
  Info,
  RefreshCw,
  Loader2,
  KeyRound,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RolesAndPermissionsPage() {
  const [matrixData, setMatrixData] = useState<RolePermissionMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadMatrix() {
      try {
        setIsLoading(true);
        const data = await adminApi.getRolesMatrix();
        if (isMounted) setMatrixData(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load permission matrix.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadMatrix();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-8 w-8 animate-spin text-[#1464B4]" />
          <p className="text-xs text-slate-500">Loading sovereign access governance policies...</p>
        </div>
      </div>
    );
  }

  const roles = matrixData?.roles || [];
  const permissions = matrixData?.permissions || [];
  const matrix = matrixData?.matrix || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Roles & Permissions Management</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Role-based access control (RBAC), least-privilege matrix, and sovereign authorization boundaries
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Governance & Security Safeguards Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1464B4] dark:text-[#58A6FF]">
            <KeyRound className="h-4 w-4 shrink-0" />
            Least-Privilege Enforcement
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            All server-side endpoints enforce strict cryptographic Bearer JWT validation. Front-end visibility toggles are backed by mandatory <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded font-mono">requireRole()</code> Fastify middleware guards.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            Privilege Escalation Barriers
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Platform Administrators cannot grant themselves Super Admin privileges or elevate bidder privileges. The primary Root Super Administrator account is structurally immutable against suspension or role modification.
          </p>
        </div>
      </div>

      {/* Role Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => (
          <div
            key={r.role}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role Definition</span>
                {r.isImmutable && (
                  <span className="rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 text-[9px] font-bold">
                    Immutable
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{r.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{r.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Active Grants</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {matrix[r.role]?.length || 0} permissions
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Granular Permission Matrix Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Platform Capability Matrix</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive map of granular permissions assigned to each system role</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Permission Identifier & Scope</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-4 py-3.5 text-center">Bidder</th>
                <th className="px-4 py-3.5 text-center">Procurement Officer</th>
                <th className="px-4 py-3.5 text-center">Administrator</th>
                <th className="px-4 py-3.5 text-center">Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissions.map((p) => {
                const hasBidder = matrix.BIDDER?.includes(p.id);
                const hasOfficer = matrix.PROCUREMENT_OFFICER?.includes(p.id);
                const hasAdmin = matrix.ADMIN?.includes(p.id);
                const hasSuperAdmin = matrix.SUPER_ADMIN?.includes(p.id);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{p.label}</div>
                      <div className="font-mono text-[10px] text-slate-400">{p.id}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasBidder ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasOfficer ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasAdmin ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-blue-500" />
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasSuperAdmin ? (
                        <CheckCircle2 className="mx-auto h-4 w-4 text-rose-500" />
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
