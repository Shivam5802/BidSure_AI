'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, AdminSystemHealth } from '@/lib/api/admin.api';
import {
  Activity,
  Server,
  Database,
  BrainCircuit,
  HardDrive,
  Cpu,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const data = await adminApi.getSystemHealth();
      setHealth(data);
    } catch (err: any) {
      console.error('Failed to load system health:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => {
      fetchHealth();
    }, 15000); // 15s live telemetry poll
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !health) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="h-8 w-8 animate-spin text-[#1464B4]" />
          <p className="text-xs text-slate-500">Querying platform infrastructure telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/20">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Platform Infrastructure Telemetry</h1>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time operational status across Node.js runtime, PostgreSQL database, Google Gemini AI core, and NVMe storage
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            disabled={refreshing}
            onClick={() => fetchHealth(true)}
            className="rounded-xl text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* 4 Infrastructure Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend API Runtime */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fastify Server Engine</span>
            <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{health?.backend.status}</span>
            </div>
            <div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <div>Runtime: {health?.backend.runtime}</div>
              <div>Uptime: {Math.floor((health?.backend.uptimeSeconds || 0) / 60)} minutes</div>
              <div>PID: {health?.backend.pid}</div>
            </div>
          </div>
        </div>

        {/* Database Layer */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Database Layer</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{health?.database.poolStatus}</span>
            </div>
            <div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <div>Engine: {health?.database.engine}</div>
              <div>Roundtrip: {health?.database.latencyMs}ms</div>
              <div>SSL Encryption: ACTIVE</div>
            </div>
          </div>
        </div>

        {/* AI & Compliance Engine */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI Intelligence Core</span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BrainCircuit className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{health?.aiEngine.status}</span>
            </div>
            <div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <div className="truncate">{health?.aiEngine.provider}</div>
              <div>Tokens: {health?.aiEngine.quotaConsumedToday.toLocaleString()} / day</div>
              <div>Inference: {health?.aiEngine.averageLatencyMs}ms</div>
            </div>
          </div>
        </div>

        {/* Memory & Storage */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Server Resources</span>
            <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {health?.memory.usagePercent}% Used
            </div>
            <div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <div>RAM: {health?.memory.usedMB} / {health?.memory.totalMB} MB</div>
              <div>Storage: {health?.storage.availableMB} MB Available</div>
              <div>Volume: {health?.storage.status}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Workers Telemetry */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Background OCR & Compliance Pipelines</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
            <span className="text-[10px] text-slate-400 uppercase">OCR Extraction Queue</span>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              {health?.backgroundWorkers.ocrQueueStatus}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
            <span className="text-[10px] text-slate-400 uppercase">Active Extraction Jobs</span>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
              {health?.backgroundWorkers.activeExtractionJobs}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
            <span className="text-[10px] text-slate-400 uppercase">Completed in 24h</span>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
              {health?.backgroundWorkers.completedJobs24h}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
            <span className="text-[10px] text-slate-400 uppercase">Failed in 24h</span>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
              {health?.backgroundWorkers.failedJobs24h}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
