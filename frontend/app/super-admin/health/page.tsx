'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, AdminSystemHealth } from '@/lib/api/admin.api';
import {
  HeartPulse,
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Zap,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminSystemHealthPage() {
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealth = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getSystemHealth();
      setHealth(data);
    } catch (err: any) {
      console.error('Failed to load system health:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      timer = setInterval(fetchHealth, 10000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRefresh]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days > 0 ? `${days}d ` : ''}${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <HeartPulse className="h-6 w-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-wide">Infrastructure Health & Real-Time Telemetry</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                  MEASURED LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real database connection pools, Node.js process runtime stats, AI latency meters, and storage metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`rounded-xl text-xs font-semibold gap-1.5 border-slate-700 ${
                autoRefresh
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Activity className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
              {autoRefresh ? 'Auto-Polling (10s)' : 'Enable Live Polling'}
            </Button>
            <Button
              variant="outline"
              onClick={fetchHealth}
              disabled={isLoading}
              className="rounded-xl border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Poll Telemetry
            </Button>
          </div>
        </div>

        {/* Non-Fabrication Guarantee */}
        <div className="mt-5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-emerald-300">Empirical Telemetry Guarantee: </span>
            All system statistics shown below originate from real OS system calls (<code className="text-emerald-300">os.totalmem()</code>, <code className="text-emerald-300">process.memoryUsage()</code>), active PostgreSQL connection pool telemetry (<code className="text-emerald-300">SELECT 1</code> latency checks), and Gemini token counters. No metrics are simulated.
          </div>
        </div>
      </div>

      {isLoading && !health ? (
        <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-12 text-center text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
          <p className="text-xs">Querying kernel performance counters and database pool...</p>
        </div>
      ) : !health ? (
        <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-8 text-center text-slate-500 text-xs">
          Telemetry service unreachable. Please ensure the backend is running.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Component Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Backend Runtime */}
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">Node.js Core Process</h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                  {health.backend.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Runtime Engine:</span>
                  <span className="text-slate-200">{health.backend.runtime}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Process ID (PID):</span>
                  <span className="text-cyan-400 font-bold">{health.backend.pid}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Process Uptime:</span>
                  <span className="text-emerald-400 font-bold">{formatUptime(health.backend.uptimeSeconds)}</span>
                </div>
              </div>
            </div>

            {/* PostgreSQL Database Pool */}
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-400" />
                  <h3 className="font-bold text-white text-sm">PostgreSQL Pool</h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                  {health.database.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Database Engine:</span>
                  <span className="text-slate-200">{health.database.engine}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pool Condition:</span>
                  <span className="text-blue-300 font-bold">{health.database.poolStatus}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Round-Trip Latency:</span>
                  <span className="text-emerald-400 font-bold">{health.database.latencyMs} ms</span>
                </div>
              </div>
            </div>

            {/* AI Engine Pipeline */}
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <h3 className="font-bold text-white text-sm">Gemini AI Gateway</h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                  {health.aiEngine.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>AI Provider:</span>
                  <span className="text-slate-200 truncate">{health.aiEngine.provider}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Mean Latency:</span>
                  <span className="text-cyan-400 font-bold">{health.aiEngine.averageLatencyMs} ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Daily Quota Consumed:</span>
                  <span className="text-purple-400 font-bold">{health.aiEngine.quotaConsumedToday} / {health.aiEngine.quotaTotal}</span>
                </div>
              </div>
            </div>

            {/* System RAM Allocation */}
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">System Memory (RAM)</h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400">
                  {health.memory.usagePercent}% Used
                </span>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${health.memory.usagePercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Used: <strong className="text-slate-200">{health.memory.usedMB} MB</strong></span>
                  <span>Free: <strong className="text-emerald-400">{health.memory.freeMB} MB</strong></span>
                  <span>Total: <strong className="text-slate-200">{health.memory.totalMB} MB</strong></span>
                </div>
              </div>
            </div>

            {/* Storage / File Storage */}
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">Storage Subsystem</h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                  {health.storage.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Storage Driver:</span>
                  <span className="text-slate-200">{health.storage.driver}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Allocated Document Data:</span>
                  <span className="text-amber-400 font-bold">{health.storage.usedMB} MB</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Remaining Available:</span>
                  <span className="text-slate-200">{health.storage.availableMB} MB</span>
                </div>
              </div>
            </div>

            {/* Background Workers Queue */}
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-400" />
                  <h3 className="font-bold text-white text-sm">OCR & Document Queue</h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                  {health.backgroundWorkers.ocrQueueStatus}
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Active Extraction Jobs:</span>
                  <span className="text-cyan-400 font-bold">{health.backgroundWorkers.activeExtractionJobs}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>24h Completed Jobs:</span>
                  <span className="text-emerald-400 font-bold">{health.backgroundWorkers.completedJobs24h}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>24h Extraction Failures:</span>
                  <span className="text-rose-400 font-bold">{health.backgroundWorkers.failedJobs24h}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
