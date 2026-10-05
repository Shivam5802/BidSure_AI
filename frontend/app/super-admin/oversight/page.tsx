'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, AdminTenderOverviewItem, AdminBidMonitoringItem } from '@/lib/api/admin.api';
import {
  Layers,
  FileText,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuperAdminOversightPage() {
  const [activeTab, setActiveTab] = useState<'TENDERS' | 'BIDS'>('TENDERS');
  const [tenders, setTenders] = useState<AdminTenderOverviewItem[]>([]);
  const [bids, setBids] = useState<AdminBidMonitoringItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOversightData = async () => {
    try {
      setIsLoading(true);
      const [tendersData, bidsData] = await Promise.all([
        adminApi.getTenderOversight({ search: search.trim() || undefined }),
        adminApi.getBidMonitoring({ search: search.trim() || undefined }),
      ]);
      setTenders(tendersData);
      setBids(bidsData);
    } catch (err: any) {
      console.error('Failed to load oversight data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOversightData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOversightData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-mono font-bold tracking-wider text-slate-100 uppercase">
                  Global Tender & Bid Oversight
                </h1>
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-400 border border-cyan-800/80">
                  READ-ORIENTED SOVEREIGN AUDIT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor all procurement dossiers, vendor submissions, officer assignments, and statutory compliance evaluations
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={fetchOversightData}
            className="rounded-xl border-slate-700 bg-slate-900/80 text-xs font-mono text-cyan-400 hover:bg-slate-800 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            REFRESH
          </Button>
        </div>
      </div>

      {/* Non-Interference Sovereign Notice */}
      <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-4 text-xs text-slate-300 flex items-start gap-3">
        <ShieldAlert className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyan-400">GFR Procurement Integrity Guard: </span>
          Super Admin oversight is read-oriented and auditable. Root authority does NOT permit silent alteration of tender criteria, bidder proposals, or officer award determinations.
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="rounded-2xl border border-slate-800 bg-[#060c18] p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setActiveTab('TENDERS')}
            className={`rounded-xl text-xs font-mono font-bold px-4 ${
              activeTab === 'TENDERS'
                ? 'bg-cyan-600 text-black hover:bg-cyan-500'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            TENDERS ({tenders.length})
          </Button>
          <Button
            onClick={() => setActiveTab('BIDS')}
            className={`rounded-xl text-xs font-mono font-bold px-4 ${
              activeTab === 'BIDS'
                ? 'bg-cyan-600 text-black hover:bg-cyan-500'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            BIDS STREAM ({bids.length})
          </Button>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search reference, title, or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500 font-mono"
          />
        </form>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center font-mono text-cyan-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>QUERYING DOSSIERS & PROPOSALS...</span>
        </div>
      ) : activeTab === 'TENDERS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenders.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-800 bg-[#060c18] p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                      {t.referenceNumber}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-2">{t.title}</h3>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                    {t.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-400">
                  <div>Org: {t.organization}</div>
                  <div>Officer: {t.officerName} ({t.officerEmail})</div>
                  <div>Closing: {new Date(t.closingDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div>Bids: <span className="text-slate-100 font-bold">{t.bidCount}</span></div>
                  <div>Qualified: <span className="text-emerald-400 font-bold">{t.qualifiedCount}</span></div>
                </div>

                <Link href={`/tenders/${t.id}/workspace`}>
                  <Button size="sm" className="h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs border border-slate-800 gap-1 font-mono">
                    <span>Inspect</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-[#060c18] shadow-xl overflow-hidden font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#040812] text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Proposal ID & Vendor</th>
                  <th className="px-5 py-3">Tender Ref</th>
                  <th className="px-5 py-3">Tax IDs</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Verdict</th>
                  <th className="px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {bids.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-3 font-mono">
                      <div className="font-semibold text-slate-100">{b.bidderName}</div>
                      <div className="text-[10px] text-cyan-400">{b.applicationNumber}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-300 font-mono text-[11px]">{b.tenderReference}</td>
                    <td className="px-5 py-3 font-mono text-[10px] text-slate-400">
                      <div>GST: {b.gstin}</div>
                      <div>PAN: {b.pan}</div>
                    </td>
                    <td className="px-5 py-3 font-mono">
                      <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-800">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono">
                      <span className={`text-[10px] font-bold ${b.verificationStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {b.verificationStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-[11px] font-mono">
                      {b.submittedAt ? new Date(b.submittedAt).toLocaleString() : 'Draft'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
