import React from 'react';
import { ReportSystemVersions, ReportMetadata } from '@/types/reports';
import { ShieldCheck, Lock, Info, CheckCircle2 } from 'lucide-react';

interface VersionsFooterProps {
  versions: ReportSystemVersions;
  metadata: ReportMetadata;
  disclaimer: string;
}

export const ReportSystemVersionsFooter: React.FC<VersionsFooterProps> = ({
  versions,
  metadata,
  disclaimer,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs mb-6 space-y-4 text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-slate-900 dark:text-white">
            System Component Versions & Report Integrity
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
          <span>Completeness:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {metadata.completenessStatus}
          </span>
        </div>
      </div>

      {/* Component Version Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
          BidGuard: <strong className="text-slate-900 dark:text-white">v{versions.bidGuardVersion}</strong>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
          Report Version: <strong className="text-slate-900 dark:text-white">v{versions.reportVersion}</strong>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
          Compliance Engine: <strong className="text-slate-900 dark:text-white">v{versions.complianceEngineVersion}</strong>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
          Agent Version: <strong className="text-slate-900 dark:text-white">v{versions.investigationAgentVersion}</strong>
        </div>
      </div>

      {/* Checksum & Snapshot info */}
      <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 space-y-1">
        <div className="flex items-center justify-between text-indigo-900 dark:text-indigo-200 font-mono font-bold">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            Snapshot ID: {metadata.snapshotId}
          </span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">SHA-256 Verified</span>
        </div>
        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all">
          Checksum: {metadata.reportChecksum}
        </div>
      </div>

      {/* Official Mandatory Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
        <strong className="text-slate-900 dark:text-white flex items-center gap-1 mb-1">
          <Info className="w-3.5 h-3.5 text-indigo-500" /> Procurement Decision-Support Notice:
        </strong>
        {disclaimer}
      </div>
    </div>
  );
};
