import React from 'react';
import { ArrowLeft, Building2, Calendar, FileText, RefreshCw, ShieldCheck, Clock, Users } from 'lucide-react';
import Link from 'next/link';

interface TenderWorkspaceHeaderProps {
  tender: {
    id: string;
    title: string;
    referenceNumber: string;
    organization: string;
    status: string;
    closingDate: string;
    createdAt: string;
    description?: string | null;
  };
  bidderCount: number;
  processingStage?: string;
  onRefresh?: () => void;
}

export const TenderWorkspaceHeader: React.FC<TenderWorkspaceHeaderProps> = ({
  tender,
  bidderCount,
  processingStage = 'READY',
  onRefresh,
}) => {
  const formattedDate = new Date(tender.closingDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition">
            Procurement
          </Link>
          <span>/</span>
          <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition">
            Tenders
          </Link>
          <span>/</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono">{tender.referenceNumber}</span>
        </nav>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Workspace
          </button>
        )}
      </div>

      {/* Main Title & Metadata */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {tender.referenceNumber}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {tender.status.replace('_', ' ')}
            </span>
            {processingStage && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                Stage: {processingStage}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {tender.title}
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {tender.organization}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Closing: {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {bidderCount} Submitted Bidders
            </span>
          </p>
        </div>

        {/* Action Button & SIH Trust Badge */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {tender.status !== 'PUBLISHED' ? (
            <button
              onClick={async () => {
                try {
                  const { api } = await import('@/lib/api/client');
                  await api.publishTender(tender.id);
                  if (onRefresh) onRefresh();
                } catch (e: any) {
                  alert(e.message || 'Failed to publish tender.');
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Publish to Bidder Portal
            </button>
          ) : (
            <Link
              href={`/bidder/tenders/${tender.id}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/80 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              View on Bidder Portal ↗
            </Link>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 dark:text-white block text-[10px] uppercase tracking-wider">
                Officer Decision Support
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Source-grounded facts • Human-in-the-loop authority
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
