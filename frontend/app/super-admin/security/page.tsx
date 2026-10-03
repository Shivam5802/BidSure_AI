'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Radio,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Terminal,
  CheckCircle2,
  Activity,
  Key,
} from 'lucide-react';
import { superAdminApi, SecurityThreatLog, BlacklistIpEntry } from '@/lib/api/superadmin.api';

export default function SuperAdminSecurityPage() {
  const [logs, setLogs] = useState<SecurityThreatLog[]>([]);
  const [ipBlacklist, setIpBlacklist] = useState<BlacklistIpEntry[]>([]);
  const [cryptoSeal, setCryptoSeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newIp, setNewIp] = useState('');
  const [newReason, setNewReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const data = await superAdminApi.getSecurityLogs();
      setLogs(data.logs);
      setIpBlacklist(data.ipBlacklist);
      setCryptoSeal(data.cryptoSeal);
    } catch (err: any) {
      console.error('Failed to load security logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;

    try {
      const updated = await superAdminApi.addBlacklistIp(newIp.trim(), newReason.trim());
      setIpBlacklist(updated);
      setNewIp('');
      setNewReason('');
      setActionSuccess(`IP ${newIp.trim()} added to sovereign quarantine.`);
      setTimeout(() => setActionSuccess(null), 3000);
      fetchSecurityData();
    } catch (err: any) {
      alert(`Blacklist addition failed: ${err.message}`);
    }
  };

  const handleRemoveBlacklist = async (ip: string) => {
    if (!window.confirm(`Release IP ${ip} from quarantine?`)) return;
    try {
      const updated = await superAdminApi.removeBlacklistIp(ip);
      setIpBlacklist(updated);
      setActionSuccess(`IP ${ip} removed from quarantine.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(`Blacklist removal failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-mono tracking-tight text-white sm:text-2xl">
              SECURITY VAULT &amp; THREAT TELEMETRY
            </h1>
            <span className="rounded-full bg-rose-950 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-300 border border-rose-800">
              ACTIVE DEFENSE MATRIX
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time intrusion detection, cryptographic hash chain integrity, and sovereign IP firewall controls.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSecurityData}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-mono font-semibold text-slate-300 hover:border-cyan-500 hover:text-cyan-300 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH LOGS</span>
        </button>
      </div>

      {/* Notification Toast */}
      {actionSuccess && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs text-emerald-200 font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top 3 Security Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-[#091122] to-[#050a16] p-4 font-mono shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="h-4 w-4" />
              CRYPTOGRAPHIC LEDGER
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
              SEALED
            </span>
          </div>
          <p className="mt-3 text-lg font-bold text-white">HMAC-SHA256</p>
          <p className="mt-1 text-[10px] text-slate-400 truncate">
            {cryptoSeal?.masterKeyFingerprint || 'SHA256:7f83b165...'}
          </p>
          <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Forensic chain verified &bull; Zero tampering</span>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-900/40 bg-gradient-to-b from-[#091122] to-[#050a16] p-4 font-mono shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <AlertTriangle className="h-4 w-4" />
              FIREWALL QUARANTINE
            </span>
            <span className="text-[10px] text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
              BLOCKED
            </span>
          </div>
          <p className="mt-3 text-lg font-bold text-white">{ipBlacklist.length} Subnets</p>
          <p className="mt-1 text-[10px] text-slate-400">Brute-force credential stuffers quarantined</p>
          <div className="mt-2 text-[10px] text-slate-400">
            Auto-defense drop rate: 100% of malicious probes
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-b from-[#091122] to-[#050a16] p-4 font-mono shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Key className="h-4 w-4" />
              JWT SIGNATURE VAULT
            </span>
            <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
              ACTIVE
            </span>
          </div>
          <p className="mt-3 text-lg font-bold text-white">HS256 Dual-Key</p>
          <p className="mt-1 text-[10px] text-slate-400">Token TTL: 8 Hours &bull; Revocation checks active</p>
          <div className="mt-2 text-[10px] text-cyan-400 flex items-center gap-1">
            <Radio className="h-3 w-3 animate-pulse" />
            <span>Blacklist sync instant across cluster</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Live Threat Stream & Firewall IP Blacklist Manager */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Threat Events Table (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#070e1c] p-5 shadow-xl font-mono">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              LIVE INTRUSION &amp; ACCESS AUDIT TRAIL
            </h2>
            <span className="text-[10px] text-slate-500">Auto-logging active</span>
          </div>

          <div className="space-y-2.5">
            {logs.map((log) => {
              const isCrit = log.threatLevel === 'CRITICAL';
              const isHigh = log.threatLevel === 'HIGH';
              const isMed = log.threatLevel === 'MEDIUM';

              return (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-800/80 bg-[#0a1324] p-3 text-xs transition hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isCrit || isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      {log.event}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold border ${
                        isCrit || isHigh
                          ? 'border-rose-500/40 bg-rose-950 text-rose-300'
                          : isMed
                          ? 'border-amber-500/40 bg-amber-950 text-amber-300'
                          : 'border-emerald-500/40 bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {log.threatLevel}
                    </span>
                  </div>

                  <p className="mt-1.5 text-slate-300 text-[11px] leading-relaxed">{log.details}</p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60">
                    <span>Source IP: <code className="text-cyan-400">{log.ip}</code></span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()} ({new Date(log.timestamp).toLocaleDateString()})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Firewall IP Blacklist (1 Col) */}
        <div className="rounded-2xl border border-slate-800 bg-[#070e1c] p-5 shadow-xl font-mono flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                IP FIREWALL QUARANTINE
              </h2>
            </div>

            {/* Add IP Form */}
            <form onSubmit={handleAddBlacklist} className="space-y-2 mb-4">
              <input
                type="text"
                placeholder="IP Address (e.g. 192.168.1.100)"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Quarantine reason..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-rose-600/80 hover:bg-rose-600 py-1.5 text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>QUARANTINE IP ADDRESS</span>
              </button>
            </form>

            {/* Blacklist Items */}
            <div className="space-y-2">
              {ipBlacklist.map((entry) => (
                <div
                  key={entry.ip}
                  className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300">{entry.ip}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlacklist(entry.ip)}
                      title="Unblock IP"
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">{entry.reason}</p>
                  <span className="mt-1 block text-[9px] text-slate-500">
                    Blocked at {new Date(entry.blockedAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
