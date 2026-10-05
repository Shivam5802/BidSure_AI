'use client';

import React, { useEffect, useState } from 'react';
import { adminApi, AdminAuditLogEntry } from '@/lib/api/admin.api';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Download,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Lock,
  FileCode,
  Eye,
  X,
  AlertOctagon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogEntry[]>([]);
  const [cryptoSeal, setCryptoSeal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [inspectingLog, setInspectingLog] = useState<AdminAuditLogEntry | null>(null);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAuditLogs({
        actor: actorFilter.trim() || undefined,
        event: eventFilter,
        search: search.trim() || undefined,
        limit: 150,
      });
      setLogs(data.logs);
      setCryptoSeal(data.cryptoSeal);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [eventFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAuditLogs();
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Event ID', 'Event Type', 'Actor', 'Timestamp', 'Tender ID', 'Metadata'];
    const rows = logs.map((l) => [
      l.id,
      l.event,
      l.actor,
      new Date(l.createdAt).toISOString(),
      l.tenderId || '',
      JSON.stringify(l.metadata || {}).replace(/"/g, '""'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BidSure_Forensic_Audit_Vault_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-rose-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-red-700 text-white shadow-lg shadow-rose-500/20 border border-rose-400/30">
              <History className="h-6 w-6 text-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-white tracking-wide">Forensic Audit & Accountability Ledger</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-800 rounded">
                  APPEND-ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tamper-evident, cryptographically chained record of all administrative, tender, compliance, and authorization mutations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="rounded-xl border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 text-xs font-semibold gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export Forensic CSV
            </Button>
            <Button
              variant="outline"
              onClick={fetchAuditLogs}
              disabled={isLoading}
              className="rounded-xl border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Ledger
            </Button>
          </div>
        </div>

        {/* Non-Erasure Constitutional Policy */}
        <div className="mt-5 rounded-xl border border-rose-900/40 bg-rose-950/20 p-3.5 flex items-start gap-3">
          <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-rose-300">Immutable Audit Protocol: </span>
            In strict compliance with statutory accountability, Super Admin credentials contain zero truncate, drop, or edit permissions over the audit store. All events are recorded sequentially with SHA-256 state hashes.
          </div>
        </div>
      </div>

      {/* Cryptographic Seal Verification Banner */}
      {cryptoSeal && (
        <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-emerald-300 flex items-center gap-2">
                <span>Cryptographic HMAC-SHA256 Ledger Seal: VALIDATED</span>
                <span className="rounded bg-emerald-900/80 text-emerald-300 px-1.5 py-0.5 font-mono text-[9px] border border-emerald-700">
                  {cryptoSeal.status}
                </span>
              </div>
              <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                Key Fingerprint: {cryptoSeal.masterKeyFingerprint}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 shrink-0 font-mono">
            Chained State: {cryptoSeal.lastSealedAt ? new Date(cryptoSeal.lastSealedAt).toLocaleString() : 'Continuous'}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4 shadow-md">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail by event ID, actor email, or metadata..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-900/80 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Actor email..."
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-900/80 border border-slate-700 text-white placeholder:text-slate-500"
            />

            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-900/80 border border-slate-700 text-slate-300"
            >
              <option value="ALL">All Event Types</option>
              <option value="LOGIN_SUCCESS">Login Success</option>
              <option value="OFFICER_ACTIVATED">Account Activated</option>
              <option value="OFFICER_DEACTIVATED">Account Suspended</option>
              <option value="OFFICER_UPDATED">User / Role Modified</option>
              <option value="TENDER_PUBLISHED">Tender Published</option>
              <option value="RULE_EDITED">Rule Edited</option>
              <option value="RULE_SIMULATED">Rule Simulated</option>
              <option value="VERIFICATION_COMPLETED">Verification Completed</option>
            </select>

            <Button type="submit" className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Log ID</th>
                <th className="px-5 py-3.5">Event Signature</th>
                <th className="px-5 py-3.5">Actor Identity</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Metadata Payload</th>
                <th className="px-5 py-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-400 mb-2" />
                    Querying cryptographic ledger records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    No audit records matching query parameters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3 text-slate-400 font-mono text-[10px]">{log.id.slice(0, 16)}...</td>
                    <td className="px-5 py-3">
                      <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 font-bold text-cyan-300 text-[10px]">
                        {log.event}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-200 font-sans">{log.actor}</td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-[10px] text-slate-400 max-w-xs truncate font-mono">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setInspectingLog(log)}
                        className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Metadata Forensic Inspector Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0b1424] border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Forensic Record Inspector</h3>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Log Entry ID:</span>
                <span className="text-cyan-300">{inspectingLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Event Action:</span>
                <span className="text-white font-bold">{inspectingLog.event}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Actor Identity:</span>
                <span className="text-slate-200">{inspectingLog.actor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-200">{new Date(inspectingLog.createdAt).toISOString()}</span>
              </div>
              {inspectingLog.tenderId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Associated Tender:</span>
                  <span className="text-cyan-300">{inspectingLog.tenderId}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-mono text-slate-400 mb-1 block">Full Un-truncated Metadata JSON</label>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-60">
                {JSON.stringify(inspectingLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setInspectingLog(null)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
