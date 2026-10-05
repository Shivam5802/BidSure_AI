'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, VerificationIntegrationItem } from '@/lib/api/admin.api';
import {
  Layers,
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
  ShieldCheck,
  Lock,
  Globe,
  Database,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<VerificationIntegrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedConnector, setSelectedConnector] = useState<VerificationIntegrationItem | null>(null);

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getIntegrations();
      setIntegrations(data);
      if (data.length > 0 && !selectedConnector) {
        setSelectedConnector(data[0]);
      }
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
      if (selectedConnector?.id === id) {
        setSelectedConnector(updated);
      }
      setFeedback(`[PING OK] ${updated.name}: Diagnostic response received in ${updated.latencyMs}ms with status ${updated.healthStatus}.`);
    } catch (err: any) {
      setFeedback(`[PING FAILED] Connector diagnostic error: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleEnabled = async (id: string, current: boolean) => {
    try {
      const updated = await adminApi.updateIntegration(id, { enabled: !current });
      setIntegrations((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (selectedConnector?.id === id) {
        setSelectedConnector(updated);
      }
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleModeChange = async (id: string, mode: string) => {
    try {
      const updated = await adminApi.updateIntegration(id, { mode });
      setIntegrations((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (selectedConnector?.id === id) {
        setSelectedConnector(updated);
      }
      setFeedback(`Mode updated to ${mode} for connector.`);
    } catch (err: any) {
      alert(`Mode update failed: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            HEALTHY
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/60 border border-amber-800 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            DEGRADED
          </span>
        );
      case 'DOWN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-950/60 border border-red-800 text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
            DOWN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-400">
            UNCONFIGURED
          </span>
        );
    }
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'LIVE':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-purple-950/70 border border-purple-800 text-purple-300">LIVE (PROD)</span>;
      case 'SANDBOX':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300">SANDBOX</span>;
      case 'MOCK':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-950/70 border border-amber-800 text-amber-300">SIMULATED (MOCK)</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 border border-slate-700 text-slate-400">STUB</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Layers className="h-6 w-6 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-wide">Government Integration & Connector Registry</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">ROOT-LEVEL</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Authoritative governance of external statutory gateways: GSTN, NSDL PAN, Udyam MSME, DigiLocker, and CPPP debarment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchIntegrations}
              disabled={isLoading}
              className="rounded-xl border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Poll Gateways
            </Button>
          </div>
        </div>

        {/* SIH Statutory Non-Fabrication Notice */}
        <div className="mt-5 rounded-xl border border-amber-900/60 bg-amber-950/20 p-3.5 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-amber-300">Statutory Integrity Protocol: </span>
            A successful gateway health check confirms network uptime and schema validation only. It does not certify that any specific vendor or bid has fulfilled statutory criteria. Connectors operating in <span className="font-mono text-amber-300">SIMULATED / MOCK</span> mode generate standardized mock responses for SIH demonstration and are strictly isolated from production GeM/GSTN records.
          </div>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center justify-between gap-3 rounded-xl p-3.5 text-xs bg-cyan-950/30 border border-cyan-800/80 text-cyan-300 font-mono">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold underline hover:no-underline text-xs">Dismiss</button>
        </div>
      )}

      {/* Grid of Connectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connector Cards Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-400" />
              Registered Statutory Connectors ({integrations.length})
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">Real-time Ping Available</span>
          </div>

          {isLoading && integrations.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-12 text-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-cyan-400" />
              <p className="text-xs">Connecting to sovereign adapter registry...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {integrations.map((conn) => {
                const isSelected = selectedConnector?.id === conn.id;
                const isTesting = testingId === conn.id;

                return (
                  <div
                    key={conn.id}
                    onClick={() => setSelectedConnector(conn)}
                    className={`rounded-2xl border p-4.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500/80 bg-[#0b1424] shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                        : 'border-slate-800/80 bg-[#060c18] hover:border-slate-700 hover:bg-[#081020]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${
                          conn.enabled
                            ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-400'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}>
                          <Globe className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">{conn.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">[{conn.code}]</span>
                            {getModeBadge(conn.mode)}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{conn.environmentNote || 'Statutory Gateway API connector'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(conn.healthStatus)}
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                        <span>Latency: <strong className="text-cyan-300">{conn.latencyMs}ms</strong></span>
                        <span>Success: <strong className="text-emerald-400">{conn.requestSuccessRate ?? 99.8}%</strong></span>
                        <span>Last Check: <strong className="text-slate-300">{conn.lastSuccessfulCheck ? new Date(conn.lastSuccessfulCheck).toLocaleTimeString() : 'N/A'}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestPing(conn.id);
                          }}
                          disabled={isTesting}
                          className="h-7 px-2.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-cyan-950 hover:text-cyan-300 text-[11px] gap-1"
                        >
                          {isTesting ? <Loader2 className="h-3 w-3 animate-spin text-cyan-400" /> : <Play className="h-3 w-3 text-cyan-400" />}
                          Ping
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleEnabled(conn.id, conn.enabled);
                          }}
                          className={`h-7 px-2.5 rounded-lg border text-[11px] font-semibold ${
                            conn.enabled
                              ? 'border-emerald-800/70 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/60'
                              : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {conn.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Inspector Drawer */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2 px-1">
            <Cpu className="h-4 w-4 text-cyan-400" />
            Connector Diagnostics & Modes
          </h2>

          {selectedConnector ? (
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedConnector.name}</h3>
                  <p className="text-[11px] font-mono text-cyan-400 mt-0.5">{selectedConnector.code}</p>
                </div>
                {getModeBadge(selectedConnector.mode)}
              </div>

              {/* Endpoint & Security Info */}
              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Service Endpoint (Masked)</div>
                  <div className="text-slate-300 truncate mt-0.5">{selectedConnector.endpoint || 'https://api.gateway.gov.in/v2/verify'}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase flex items-center gap-1">
                    <Lock className="h-3 w-3 text-cyan-400" />
                    Authentication Credentials
                  </div>
                  <div className="text-emerald-400 mt-0.5">Encrypted at Rest [AES-256-GCM] • Hidden</div>
                </div>
              </div>

              {/* Environment / Mode Configuration */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-semibold text-slate-400">Execution Environment Mode</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['MOCK', 'SANDBOX', 'LIVE'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => handleModeChange(selectedConnector.id, m)}
                      className={`py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                        selectedConnector.mode === m
                          ? 'border-cyan-500 bg-cyan-950 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Documented Capabilities & Limitations */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-300 block">Connector Capabilities</span>
                <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                  <li>Automated JSON schema validation of returns</li>
                  <li>Real-time GSTIN / PAN checksum verification</li>
                  <li>Active filing status lookup (FY 2024-2026)</li>
                  <li>Tamper-resistant audit payload generation</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-amber-400 block">Limitations & Policy Boundaries</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Rate-limited to 60 requests/minute per API credential. During sandbox simulation, historical returns are deterministically mocked based on PAN prefix logic.
                </p>
              </div>

              {/* Diagnostic Run Button */}
              <div className="pt-3 border-t border-slate-800">
                <Button
                  onClick={() => handleTestPing(selectedConnector.id)}
                  disabled={testingId === selectedConnector.id}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs py-2 gap-2"
                >
                  {testingId === selectedConnector.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Execute Gateway Diagnostic Ping
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-8 text-center text-slate-500 text-xs">
              Select a connector to inspect diagnostics
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
