'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Filter,
  Layers,
  Building2,
  FileText,
  Scale,
} from 'lucide-react';
import { tenderApi } from '@/features/tenders/api';
import { Tender } from '@/features/tenders/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface BidderCompareRow {
  requirement: string;
  category: string;
  mandatory: boolean;
  bdr1: { status: 'PASS' | 'FAIL' | 'WARNING'; value: string; note: string };
  bdr2: { status: 'PASS' | 'FAIL' | 'WARNING'; value: string; note: string };
  bdr3: { status: 'PASS' | 'FAIL' | 'WARNING'; value: string; note: string };
}

export default function OfficerBidComparisonPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    async function load() {
      try {
        const list = await tenderApi.listTenders();
        setTenders(list);
        if (list.length > 0) {
          setSelectedTenderId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    void load();
  }, []);

  const comparisonRows: BidderCompareRow[] = [
    {
      requirement: 'Udyam / MSME Registration Certificate',
      category: 'STATUTORY',
      mandatory: true,
      bdr1: { status: 'PASS', value: 'UDYAM-MH-12-0049281', note: 'Active Medium Enterprise Verified' },
      bdr2: { status: 'PASS', value: 'UDYAM-DL-03-0091823', note: 'Active Large Scale MSME Verified' },
      bdr3: { status: 'PASS', value: 'UDYAM-GJ-01-0028190', note: 'Active Medium Enterprise Verified' },
    },
    {
      requirement: 'Average Annual Turnover (Min ₹150 Cr)',
      category: 'FINANCIAL',
      mandatory: true,
      bdr1: { status: 'PASS', value: '₹580 Cr (Avg)', note: 'Audited CA Balance Sheets Satisfied' },
      bdr2: { status: 'PASS', value: '₹412.5 Cr (Avg)', note: 'Audited CA Balance Sheets Satisfied' },
      bdr3: { status: 'WARNING', value: '₹148 Cr (Avg)', note: 'Marginally under ₹150 Cr threshold (Pending Review)' },
    },
    {
      requirement: 'Make in India Class-I Local Content (≥ 50%)',
      category: 'LOCAL_CONTENT',
      mandatory: true,
      bdr1: { status: 'PASS', value: '68.5% Domestic Value', note: 'Class-I Local Supplier Purchase Preference' },
      bdr2: { status: 'PASS', value: '54.2% Domestic Value', note: 'Class-I Local Supplier Purchase Preference' },
      bdr3: { status: 'PASS', value: '51.0% Domestic Value', note: 'Class-I Local Supplier Purchase Preference' },
    },
    {
      requirement: 'Clean Non-Blacklisting / Debarment Undertaking',
      category: 'STATUTORY',
      mandatory: true,
      bdr1: { status: 'PASS', value: 'Notarized Jan 2026', note: 'Verified against CVC Debarment database' },
      bdr2: { status: 'PASS', value: 'Notarized Jan 2026', note: 'Verified against CVC Debarment database' },
      bdr3: { status: 'FAIL', value: 'Outdated (Nov 2024)', note: 'Lacks required CA stamp & current affidavit' },
    },
    {
      requirement: 'OEM Warranty & Service Undertaking (Valves & Piping)',
      category: 'TECHNICAL',
      mandatory: true,
      bdr1: { status: 'PASS', value: 'Direct OEM Authorized', note: 'Manufacturer warranty authorization verified' },
      bdr2: { status: 'FAIL', value: 'Omitted from Envelope', note: 'Missing mandatory Annexure-IV authorization' },
      bdr3: { status: 'PASS', value: 'Direct OEM Authorized', note: 'Manufacturer warranty authorization verified' },
    },
    {
      requirement: 'EPFO & ESIC Prompt Labor Contribution',
      category: 'STATUTORY',
      mandatory: true,
      bdr1: { status: 'PASS', value: 'Clean ECR challans', note: 'Zero statutory defaults' },
      bdr2: { status: 'PASS', value: 'Clean ECR challans', note: 'Zero statutory defaults' },
      bdr3: { status: 'PASS', value: 'Clean ECR challans', note: 'Zero statutory defaults' },
    },
  ];

  const filtered = comparisonRows.filter((r) => {
    if (filterCategory !== 'ALL' && r.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Bid Comparison Matrix Workspace
            </h1>
            <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
              Side-by-Side Evaluation
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare compliance parameters, financial eligibility, and technical checklists across bidders for the selected tender.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/officer/bids">
            <Button size="sm" variant="outline" className="gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              Bids Register
            </Button>
          </Link>
          <Link href={`/tenders/${selectedTenderId}/comparison`}>
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              Deep-Dive Matrix
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Selected Tender:
          </label>
          <select
            value={selectedTenderId}
            onChange={(e) => setSelectedTenderId(e.target.value)}
            className="text-sm font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            {tenders.map((t) => (
              <option key={t.id} value={t.id}>
                {t.referenceNumber} — {t.title.substring(0, 45)}...
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Category:
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="STATUTORY">Statutory</option>
            <option value="FINANCIAL">Financial</option>
            <option value="TECHNICAL">Technical</option>
            <option value="LOCAL_CONTENT">Local Content</option>
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-4 w-1/4">Requirement Parameter</th>
                <th className="py-4 px-4 w-1/4">
                  <div className="font-bold text-slate-900 dark:text-white">Larsen & Toubro Heavy Eng.</div>
                  <div className="text-[11px] text-emerald-600 font-mono">BDR-001 • 96% Score</div>
                </th>
                <th className="py-4 px-4 w-1/4">
                  <div className="font-bold text-slate-900 dark:text-white">Tata Projects Limited</div>
                  <div className="text-[11px] text-amber-600 font-mono">BDR-002 • 81% Score</div>
                </th>
                <th className="py-4 px-4 w-1/4">
                  <div className="font-bold text-slate-900 dark:text-white">Reliance Industrial Infra</div>
                  <div className="text-[11px] text-rose-600 font-mono">BDR-003 • 64% Score</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{row.requirement}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{row.category} • Mandatory</div>
                  </td>

                  {/* Bidder 1 */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white text-xs">
                      {row.bdr1.status === 'PASS' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      {row.bdr1.status === 'FAIL' && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                      {row.bdr1.status === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                      {row.bdr1.value}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{row.bdr1.note}</div>
                  </td>

                  {/* Bidder 2 */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white text-xs">
                      {row.bdr2.status === 'PASS' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      {row.bdr2.status === 'FAIL' && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                      {row.bdr2.status === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                      {row.bdr2.value}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{row.bdr2.note}</div>
                  </td>

                  {/* Bidder 3 */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white text-xs">
                      {row.bdr3.status === 'PASS' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      {row.bdr3.status === 'FAIL' && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                      {row.bdr3.status === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                      {row.bdr3.value}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{row.bdr3.note}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
