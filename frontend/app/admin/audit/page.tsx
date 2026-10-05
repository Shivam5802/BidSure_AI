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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogEntry[]>([]);
  const [cryptoSeal, setCryptoSeal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAuditLogs({
        actor: actorFilter.trim() || undefined,
        event: eventFilter,
        search: search.trim() || undefined,
        limit: 100,
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
    link.setAttribute('download', `BidSure_Forensic_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-md shadow-rose-500/20">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Forensic Audit Vault</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized tamper-evident chronological ledger of all platform administrative, tender, and verification actions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Export Audit CSV
            </Button>
            <Button
              variant="outline"
              onClick={fetchAuditLogs}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Cryptographic Seal Verification Banner */}
      {cryptoSeal && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-xs text-slate-700 dark:text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <span>Tamper-Evident HMAC-SHA256 Cryptographic Seal: Verified</span>
                <span className="rounded bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.2 font-mono text-[9px]">
                  {cryptoSeal.status}
                </span>
              </div>
              <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Root Fingerprint: {cryptoSeal.masterKeyFingerprint}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 shrink-0 font-mono">
            Sealed: {new Date(cryptoSeal.lastSealedAt).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] p-4 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit trail by event ID, actor email, or metadata..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#1464B4]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Filter by actor..."
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />

            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
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

            <Button type="submit" className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white text-xs font-semibold px-4">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071324] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Audit ID</th>
                <th className="px-5 py-3.5">Event Type</th>
                <th className="px-5 py-3.5">Actor Identity</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Context & Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1464B4] mb-2" />
                    Validating cryptographic ledger...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-sans">
                    No audit records matching query parameters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3 text-slate-400">{log.id}</td>
                    <td className="px-5 py-3">
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-bold text-slate-800 dark:text-slate-200 text-[10px]">
                        {log.event}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-900 dark:text-white font-sans">{log.actor}</td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-[10px] text-slate-500 max-w-xs truncate">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
