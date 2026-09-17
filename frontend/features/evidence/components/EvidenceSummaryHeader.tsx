import React from 'react';
import {
  FileCheck2,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  AlertOctagon,
  RefreshCw,
} from 'lucide-react';
import { EvidenceSummary, EvidenceExtractionRun } from '../types';

interface EvidenceSummaryHeaderProps {
  document: {
    id: string;
    originalFilename: string;
    documentType: string;
  };
  latestRun: EvidenceExtractionRun | null;
  summary: EvidenceSummary;
  onTriggerExtraction: () => void;
  onOpenAddManual: () => void;
  onRefresh: () => void;
  isExtracting?: boolean;
}

export const EvidenceSummaryHeader: React.FC<EvidenceSummaryHeaderProps> = ({
  document,
  latestRun,
  summary,
  onTriggerExtraction,
  onOpenAddManual,
  onRefresh,
  isExtracting = false,
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              {document.documentType}
            </span>
            {latestRun && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Run ID: {latestRun.id.substring(0, 8)} • Engine v{latestRun.extractorVersion}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2.5">
            <FileCheck2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {document.originalFilename}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Source-Grounded Evidence Facts & Verified Parameters Inspector
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={onOpenAddManual}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Add Manual Fact
          </button>

          <button
            onClick={onTriggerExtraction}
            disabled={isExtracting}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
          >
            <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
            {isExtracting ? 'Extracting...' : 'Re-Run AI Extraction'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <FileCheck2 className="w-4 h-4 text-indigo-500" />
            Total Facts
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {summary.totalExtracted}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            High Confidence
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
            {summary.highConfidence}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            Review Required
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">
            {summary.reviewRequired}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            Human Verified
          </div>
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1.5">
            {summary.humanVerified}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            Conflicts
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1.5">
            {summary.conflicts}
          </p>
        </div>
      </div>
    </div>
  );
};
