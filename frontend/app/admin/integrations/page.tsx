'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, VerificationIntegrationItem } from '@/lib/api/admin.api';
import {
  BrainCircuit,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RefreshCw,
  Loader2,
  Info,
  Server,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<VerificationIntegrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getIntegrations();
      setIntegrations(data);
    } catch (err: any) {
      console.error('Failed to load integrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleTestPing = async (id: string) => {
    setTestingId(id);
    setFeedback(null);
    try {
      const updated = await adminApi.testIntegration(id);
      setIntegrations((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setFeedback(`Health check completed for ${updated.name}: Status ${updated.healthStatus} (${updated.latencyMs}ms).`);
    } catch (err: any) {
      setFeedback(`Health check error: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleEnabled = async (id: string, current: boolean) => {
    try {
      const updated = await adminApi.updateIntegration(id, { enabled: !current });
      setIntegrations((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/20">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Verification Adapters & Gateways</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitor GSTN, NSDL PAN, Udyam MSME, and DigiLocker connectors with latency meters & safe health-check ping
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={fetchIntegrations}
            className="rounded-xl text-xs font-semibold gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center justify-between gap-3 rounded-xl p-3.5 text-xs bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold underline hover:no-underline">Dismiss</button>
        </div>
      )}

      {/* Sovereign Integration Transparency Notice */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-800 dark:text-amber-300">Integration Mode Disclosure: </span>
          In strict accordance with SIH demonstration governance, simulated adapters are clearly labelled as <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">MOCK</code> or <code className="bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded font-mono">SANDBOX</code>. Mock adapters emulate authentic government ledger response schemas without asserting live sovereign connectivity.
        </div>
      </div>

      {/* Integrations Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#1464B4]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          item.mode === 'LIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.mode === 'SANDBOX'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : item.mode === 'MOCK'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {item.mode}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{item.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{item.endpoint}</div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.healthStatus === 'HEALTHY'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : item.healthStatus === 'UNCONFIGURED'
                        ? 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    {item.healthStatus}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                  {item.environmentNote}
                </p>

                {item.lastError && (
                  <div className="mt-2 text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900/40">
                    {item.lastError}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-2 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Latency</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{item.latencyMs}ms</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-2 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Success Rate</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{item.requestSuccessRate}%</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-2 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  {item.lastSuccessfulCheck ? `Checked ${new Date(item.lastSuccessfulCheck).toLocaleTimeString()}` : 'Not checked'}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleEnabled(item.id, item.enabled)}
                    className="h-8 rounded-lg text-[11px]"
                  >
                    {item.enabled ? 'Disable' : 'Enable'}
                  </Button>

                  <Button
                    size="sm"
                    disabled={testingId === item.id || item.mode === 'UNCONFIGURED'}
                    onClick={() => handleTestPing(item.id)}
                    className="rounded-lg bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold h-8 gap-1.5"
                  >
                    {testingId === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                    <span>Run Ping</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
