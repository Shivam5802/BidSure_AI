import React from 'react';
import { Users, FileText, CheckCircle2, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { Bidder } from '../types';

interface BidderDashboardHeaderProps {
  bidders: Bidder[];
  onRefresh?: () => void;
}

export const BidderDashboardHeader: React.FC<BidderDashboardHeaderProps> = ({ bidders, onRefresh }) => {
  const totalBidders = bidders.length;
  const activeBidders = bidders.filter((b) => b.status === 'ACTIVE').length;
  
  let totalDocs = 0;
  let classifiedDocs = 0;
  let reviewRequiredDocs = 0;
  let failedDocs = 0;

  bidders.forEach((b) => {
    totalDocs += b.documentCount || 0;
    classifiedDocs += b.classifiedCount || 0;
    reviewRequiredDocs += b.reviewRequiredCount || 0;
    failedDocs += b.failedCount || 0;
  });

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Bidder & Document Ingestion
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Register bidders, manage supporting document uploads, automatic AI classification & human review workflow.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Workspace
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Users className="w-4 h-4 text-indigo-500" />
            Total Bidders
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{totalBidders}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Active Bidders
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{activeBidders}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <FileText className="w-4 h-4 text-blue-500" />
            Total Documents
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{totalDocs}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            Classified
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{classifiedDocs}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Review Required
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">{reviewRequiredDocs}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <XCircle className="w-4 h-4 text-rose-500" />
            Failed / Corrupt
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1.5">{failedDocs}</p>
        </div>
      </div>
    </div>
  );
};
