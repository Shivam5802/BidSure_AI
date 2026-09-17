import React from 'react';
import { Download, FileText, CheckCircle2, Shield, RefreshCw, AlertTriangle, Copy, Check } from 'lucide-react';
import { ReportDataSnapshot } from '@/types/reports';
import { reportsApi } from '@/lib/api/reports.api';

interface HeaderBannerProps {
  snapshot: ReportDataSnapshot;
  onRegenerate?: () => void;
}

export const ReportHeaderBanner: React.FC<HeaderBannerProps> = ({ snapshot, onRegenerate }) => {
  const [copied, setCopied] = React.useState(false);
  const downloadUrl = reportsApi.getDownloadUrl(snapshot.metadata.id);

  const copyChecksum = () => {
    navigator.clipboard.writeText(snapshot.metadata.reportChecksum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-mono text-xs font-bold">
              {snapshot.tender.referenceNumber}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              {snapshot.metadata.reportType === 'BIDDER_COMPLIANCE'
                ? 'Bidder Compliance Report'
                : 'Tender Compliance Report'}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                snapshot.metadata.completenessStatus === 'COMPLETE'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
              }`}
            >
              {snapshot.metadata.completenessStatus}
            </span>
          </div>

          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Explainable Compliance Audit Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tender: <strong>{snapshot.tender.title}</strong> ({snapshot.tender.organization})
            {snapshot.bidder && (
              <span>
                {' '}
                — Bidder: <strong>{snapshot.bidder.legalName}</strong> ({snapshot.bidder.bidderCode})
              </span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </a>

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
              Generate Updated
            </button>
          )}
        </div>
      </div>

      {/* Stale Warning Banner */}
      {snapshot.metadata.isStale && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              This report reflects the tender state as of{' '}
              <strong>{new Date(snapshot.metadata.generatedAt).toLocaleString()}</strong>. Newer evidence or evaluation activity exists.
            </span>
          </div>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold shrink-0 hover:bg-amber-700 transition"
            >
              Generate Updated Report
            </button>
          )}
        </div>
      )}

      {/* Metadata Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Generated:</span>{' '}
          {new Date(snapshot.metadata.generatedAt).toLocaleString()}
        </div>
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Report Version:</span>{' '}
          v{snapshot.metadata.reportVersion} (Engine v{snapshot.metadata.engineVersion})
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300">SHA-256 Checksum:</span>{' '}
          <span className="font-mono text-[11px] truncate max-w-[140px]" title={snapshot.metadata.reportChecksum}>
            {snapshot.metadata.reportChecksum.substring(0, 16)}...
          </span>
          <button
            onClick={copyChecksum}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            title="Copy checksum"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
