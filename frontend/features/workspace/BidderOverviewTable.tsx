import React from 'react';
import { Users, ExternalLink, FileText, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface BidderOverviewTableProps {
  tenderId: string;
  bidders: {
    bidderId: string;
    bidderCode: string;
    legalName: string;
    status: string;
    documentCount: number;
    evidenceCount: number;
    passCount: number;
    failCount: number;
    reviewCount: number;
    notEvaluableCount: number;
    conflictCount: number;
    investigationCount: number;
    lastActivityAt?: string | null;
  }[];
}

export const BidderOverviewTable: React.FC<BidderOverviewTableProps> = ({ tenderId, bidders }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Submitted Bidders Overview ({bidders.length})
            </h2>
            <p className="text-xs text-slate-500">
              Audit-proven breakdown per bidder (No automated winner prediction or qualification ranking)
            </p>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Bidder Name</th>
                <th className="p-4">Documents</th>
                <th className="p-4 text-center">PASS</th>
                <th className="p-4 text-center">FAIL</th>
                <th className="p-4 text-center">REVIEW</th>
                <th className="p-4 text-center">N/E</th>
                <th className="p-4 text-center">Conflicts</th>
                <th className="p-4 text-center">Investigations</th>
                <th className="p-4 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bidders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-xs text-slate-500">
                    No submitted bidder proposals received yet for this tender dossier.
                  </td>
                </tr>
              ) : (
                bidders.map((b) => (
                <tr key={b.bidderId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {b.bidderCode}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{b.legalName}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Status: {b.status}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                    {b.documentCount} Docs ({b.evidenceCount} Facts)
                  </td>

                  <td className="p-4 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {b.passCount}
                  </td>

                  <td className="p-4 text-center font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {b.failCount}
                  </td>

                  <td className="p-4 text-center font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {b.reviewCount}
                  </td>

                  <td className="p-4 text-center font-bold text-slate-500 font-mono">
                    {b.notEvaluableCount}
                  </td>

                  <td className="p-4 text-center font-bold font-mono">
                    {b.conflictCount > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        {b.conflictCount}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  <td className="p-4 text-center font-bold font-mono">
                    {b.investigationCount > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {b.investigationCount}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <Link
                      href={`/tenders/${tenderId}/bidders/${b.bidderId}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition inline-flex items-center gap-1 shadow-xs"
                    >
                      Open Workspace
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
