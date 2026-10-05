'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, RolePermissionMatrix } from '@/lib/api/admin.api';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  KeyRound,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminRolesPage() {
  const [matrixData, setMatrixData] = useState<RolePermissionMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await adminApi.getRolesMatrix();
        if (isMounted) setMatrixData(data);
      } catch (err: any) {
        console.error('Failed to load matrix:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-cyan-400">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3 text-xs">CALCULATING SOVEREIGN AUTHORIZATION TOPOLOGY...</span>
      </div>
    );
  }

  const roles = matrixData?.roles || [];
  const permissions = matrixData?.permissions || [];
  const matrix = matrixData?.matrix || {};

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
                  Super Admin Role & Permission Control
                </h1>
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-400 border border-cyan-800/80">
                  SOVEREIGN RBAC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect platform capability grants, enforce least-privilege boundaries, and maintain immutable root protection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Defense Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
        <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold text-cyan-400">
            <KeyRound className="h-4 w-4 shrink-0" />
            NON-CIRCUMVENTABLE PERMISSION ENFORCEMENT
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Every privileged Fastify route runs strictly verified <code className="bg-slate-900 px-1 py-0.5 rounded font-mono text-cyan-300">requireRole()</code> hooks. No frontend route bypass or parameter tampering can grant unauthenticated access to system secrets or bidder vaults.
          </p>
        </div>

        <div className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold text-rose-400">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            IMMUTABLE ROOT SAFETY LOCK
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            The designated primary Super Administrator account is structurally immutable. Any programmatic or administrative attempt to suspend, deactivate, or demote the root account is intercepted and rejected with an audit alert.
          </p>
        </div>
      </div>

      {/* Roles Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {roles.map((r) => (
          <div key={r.role} className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase">
                <span>TIER</span>
                {r.isImmutable && <span className="text-rose-400 font-bold">IMMUTABLE</span>}
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-2">{r.title}</h3>
              <p className="text-[11px] font-sans text-slate-400 mt-2 leading-relaxed">{r.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Grants</span>
              <span className="text-cyan-400 font-bold">{matrix[r.role]?.length || 0} permissions</span>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] shadow-xl overflow-hidden font-mono">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Sovereign Permission Matrix</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Granular capability distribution across platform actors</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#040812] text-[10px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Capability & Identifier</th>
                <th className="px-5 py-3">Domain</th>
                <th className="px-4 py-3 text-center">Bidder</th>
                <th className="px-4 py-3 text-center">Officer</th>
                <th className="px-4 py-3 text-center">Admin</th>
                <th className="px-4 py-3 text-center text-cyan-400">Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {permissions.map((p) => {
                const hasBidder = matrix.BIDDER?.includes(p.id);
                const hasOfficer = matrix.PROCUREMENT_OFFICER?.includes(p.id);
                const hasAdmin = matrix.ADMIN?.includes(p.id);
                const hasSuperAdmin = matrix.SUPER_ADMIN?.includes(p.id);

                return (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-200">{p.label}</div>
                      <div className="font-mono text-[10px] text-cyan-500/80">{p.id}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-[11px]">{p.category}</td>
                    <td className="px-4 py-3 text-center">
                      {hasBidder ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" /> : <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasOfficer ? <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-400" /> : <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasAdmin ? <CheckCircle2 className="mx-auto h-4 w-4 text-blue-400" /> : <span className="text-slate-700">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasSuperAdmin ? <CheckCircle2 className="mx-auto h-4 w-4 text-cyan-400" /> : <span className="text-slate-700">—</span>}
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
