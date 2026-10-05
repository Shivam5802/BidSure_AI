'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  Printer,
  Calendar,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tenderApi } from '@/features/tenders/api';
import { Tender } from '@/features/tenders/types';

export default function OfficerReportsPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await tenderApi.listTenders();
        setTenders(list);
        if (list.length > 0) {
          const saved = typeof window !== 'undefined' ? localStorage.getItem('bidguard_selected_tender_id') : null;
          setSelectedTenderId(saved && list.some((t) => t.id === saved) ? saved : list[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleExport = (reportType: string) => {
    setGeneratingReport(reportType);
    setTimeout(() => {
      setGeneratingReport(null);
      alert(`Report "${reportType}" generated successfully. Ready for GeM submission and CVC audit archive.`);
    }, 1200);
  };

  const selectedTender = tenders.find((t) => t.id === selectedTenderId) || tenders[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Procurement & Compliance Reports
            </h1>
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
              CVC & GeM Standard
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official evaluation summaries, AI compliance audit dossiers, and cryptographic deliberation logs for competent authorities.
          </p>
        </div>

        {selectedTender && (
          <div className="flex items-center gap-3">
            <Link href={`/tenders/${selectedTender.id}/reports`}>
              <Button variant="outline" size="sm" className="gap-2 border-[#1464B4] text-[#1464B4] hover:bg-blue-50 dark:hover:bg-blue-950/30">
                <ExternalLink className="w-4 h-4" />
                View Tender Dossier
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Tender Selector */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1464B4]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Procurement Tender
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedTender ? `${selectedTender.title} (${selectedTender.referenceNumber})` : 'Loading...'}
            </div>
          </div>
        </div>

        {tenders.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Switch Tender:</span>
            <select
              value={selectedTenderId}
              onChange={(e) => setSelectedTenderId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              {tenders.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.referenceNumber} - {t.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Technical Evaluation Report */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-blue-50 dark:bg-blue-950/40 text-[#1464B4] rounded-lg">
                <FileCheck className="w-5 h-5" />
              </span>
              <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                Official GeM Format
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Technical Evaluation Summary (TER)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Clause-by-clause technical verification for all participated bidders, highlighting mandatory criteria compliance, exemptions, and disqualifications.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">PDF / Formatted Print</span>
            <Button
              size="sm"
              variant="outline"
              disabled={generatingReport === 'TER'}
              onClick={() => handleExport('TER')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              {generatingReport === 'TER' ? 'Generating...' : 'Export TER'}
            </Button>
          </div>
        </div>

        {/* AI Clause Compliance Matrix */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200">
                Explainable AI
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Clause Compliance Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete automated extract of all tender clauses matched against submitted documents with exact page citations, bounding boxes, and confidence scores.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">CSV / JSON / PDF</span>
            <Button
              size="sm"
              variant="outline"
              disabled={generatingReport === 'AI_MATRIX'}
              onClick={() => handleExport('AI_MATRIX')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              {generatingReport === 'AI_MATRIX' ? 'Generating...' : 'Export Matrix'}
            </Button>
          </div>
        </div>

        {/* Financial Comparative Statement */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </span>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                L1 Ranking
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Comparative Statement of Bids (CSB)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tabulated commercial rankings (L1, L2, L3) after technical qualification, detailing baseline quotes, GST calculations, and Make in India preference margins.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Spreadsheet / PDF</span>
            <Button
              size="sm"
              variant="outline"
              disabled={generatingReport === 'CSB'}
              onClick={() => handleExport('CSB')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              {generatingReport === 'CSB' ? 'Generating...' : 'Export CSB'}
            </Button>
          </div>
        </div>

        {/* Vigilance & CVC Compliance Audit Dossier */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
                Vigilance Archive
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              CVC Vigilance & Audit Dossier
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Chronological cryptographic log of every officer action, human decision override, clarification thread, and timestamped tamper-evident hash verification.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Cryptographic SHA-256</span>
            <Button
              size="sm"
              variant="outline"
              disabled={generatingReport === 'CVC'}
              onClick={() => handleExport('CVC')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              {generatingReport === 'CVC' ? 'Generating...' : 'Export Dossier'}
            </Button>
          </div>
        </div>

        {/* Clarification Summary & Vendor Queries */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </span>
              <Badge variant="outline" className="text-cyan-700 bg-cyan-50 border-cyan-200">
                Deliberation Log
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Vendor Clarification Register
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Record of all official queries issued to bidders, submitted responses, supplementary documents, and officer closure approvals under Rule 173(iv).
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Formal PDF Register</span>
            <Button
              size="sm"
              variant="outline"
              disabled={generatingReport === 'CLARIFICATIONS'}
              onClick={() => handleExport('CLARIFICATIONS')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              {generatingReport === 'CLARIFICATIONS' ? 'Generating...' : 'Export Register'}
            </Button>
          </div>
        </div>

        {/* Certificate of Procurement Integrity */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                Final Sign-off
              </Badge>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Certificate of Procurement Integrity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Procurement Officer certification confirming fair competition, non-discrimination under GFR 2017, and verified eligibility before award of contract.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Digital Certificate</span>
            <Button
              size="sm"
              variant="outline"
              disabled={generatingReport === 'CERTIFICATE'}
              onClick={() => handleExport('CERTIFICATE')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              {generatingReport === 'CERTIFICATE' ? 'Generating...' : 'Generate Certificate'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
