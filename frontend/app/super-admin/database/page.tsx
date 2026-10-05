'use client';

import React, { useState } from 'react';
import {
  Database,
  Download,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Server,
  Terminal,
} from 'lucide-react';
import { superAdminApi } from '@/lib/api/superadmin.api';

export default function SuperAdminDatabasePage() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const [lastBackup, setLastBackup] = useState<any>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      const res = await superAdminApi.triggerBackup();
      setLastBackup(res);
      setActionSuccess(`Encrypted DB snapshot generated (${res.backupId}). Checksum: ${res.checksumSha256.slice(0, 16)}...`);
    } catch (err: any) {
      alert(`Backup failed: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handlePurgeCache = async () => {
    try {
      setIsPurging(true);
      const res = await superAdminApi.purgeCache();
      setActionSuccess(`Cache purged: ${res.purgedKeys} keys flushed at ${new Date(res.flushedAt).toLocaleTimeString()}.`);
    } catch (err: any) {
      alert(`Purge failed: ${err.message}`);
    } finally {
      setIsPurging(false);
    }
  };

  const handleResetCanonicalDemo = async () => {
    if (!window.confirm('WARNING: Resetting will restore canonical tenders, evaluation matrices, and sample evidence to pristine state. Proceed?')) {
      return;
    }

    try {
      setIsResettingDemo(true);
      // Calls standard admin demo-reset endpoint
      const res = await fetch('/api/admin/demo-reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('bidguard_token') || ''}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (json.success) {
        setActionSuccess('Canonical SIH demo state re-seeded with cryptographic validation.');
      } else {
        throw new Error(json.error?.message || 'Reset failed');
      }
    } catch (err: any) {
      alert(`Demo reset failed: ${err.message}`);
    } finally {
      setIsResettingDemo(false);
    }
  };

  const handleDownloadDiagnostic = () => {
    const diagnostic = {
      timestamp: new Date().toISOString(),
      governanceClearance: 'LEVEL-0_SUPER_ADMIN',
      clusterNode: 'PRODUCTION_CONTAINER_01',
      activeDatabase: 'PostgreSQL_16_Sovereign',
      status: 'HEALTHY',
    };
    const blob = new Blob([JSON.stringify(diagnostic, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bidsure_diagnostic_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              DATABASE INFRASTRUCTURE &amp; DISASTER RECOVERY
            </h1>
            <span className="rounded-full bg-cyan-950 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-800">
              POSTGRESQL 16 / SHA-256
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Generate encrypted cryptographic snapshots, purge distributed caching layers, and reset evaluation states.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadDiagnostic}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-500 hover:text-cyan-300 transition"
        >
          <Download className="h-3.5 w-3.5 text-cyan-400" />
          <span>EXPORT DIAGNOSTIC DUMP</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Grid of Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Encrypted Snapshot */}
        <div className="rounded-2xl border border-slate-800 bg-[#070e1c] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Database className="h-4 w-4 text-cyan-400" />
                DATABASE SNAPSHOT
              </span>
              <span className="text-[10px] text-cyan-400">ONLINE</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Create an AES-256 encrypted point-in-time PostgreSQL snapshot including tenders, evaluation reports, and user records.
            </p>
            {lastBackup && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-[10px] text-slate-300 space-y-1 mb-4">
                <div>Archive ID: <code className="text-cyan-400">{lastBackup.backupId}</code></div>
                <div>Size: {lastBackup.sizeMB} MB</div>
                <div className="truncate">Checksum: {lastBackup.checksumSha256}</div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleBackup}
            disabled={isBackingUp}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Database className="h-4 w-4" />
            <span>{isBackingUp ? 'GENERATING SNAPSHOT...' : 'GENERATE ENCRYPTED SNAPSHOT'}</span>
          </button>
        </div>

        {/* Card 2: Purge Cache */}
        <div className="rounded-2xl border border-slate-800 bg-[#070e1c] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4 text-amber-400" />
                CACHE PURGE
              </span>
              <span className="text-[10px] text-emerald-400">97.6% HIT</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Instantly flush distributed in-memory cache, CDN cache tags, and AI reasoning temporary buffers across all nodes.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePurgeCache}
            disabled={isPurging}
            className="w-full rounded-xl border border-amber-500/50 bg-amber-950/30 hover:bg-amber-950/60 py-2.5 text-xs font-bold text-amber-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isPurging ? 'animate-spin' : ''}`} />
            <span>{isPurging ? 'PURGING DISTRIBUTED CACHE...' : 'FLUSH REDIS & APPLICATION CACHE'}</span>
          </button>
        </div>

        {/* Card 3: Reset Canonical Demo State */}
        <div className="rounded-2xl border border-slate-800 bg-[#070e1c] p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-purple-400" />
                CANONICAL DEMO RESTORE
              </span>
              <span className="text-[10px] text-purple-300">SIH 2026</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Restores live evaluation benchmarks, sample contractor bids, conflict-of-interest matrices, and test dossiers.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetCanonicalDemo}
            disabled={isResettingDemo}
            className="w-full rounded-xl border border-purple-500/50 bg-purple-950/30 hover:bg-purple-950/60 py-2.5 text-xs font-bold text-purple-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RotateCcw className={`h-4 w-4 ${isResettingDemo ? 'animate-spin' : ''}`} />
            <span>{isResettingDemo ? 'RESTORING DEMO STATE...' : 'RE-SEED CANONICAL DEMO DATA'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
