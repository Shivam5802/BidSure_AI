import React from 'react';
import { Building2, FileCheck, AlertTriangle, ArrowRight, PlusCircle, Inbox } from 'lucide-react';
import { Bidder } from '../types';

interface BidderListProps {
  bidders: Bidder[];
  onSelectBidder: (bidderId: string) => void;
  onAddBidderClick: () => void;
}

export const BidderList: React.FC<BidderListProps> = ({ bidders, onSelectBidder, onAddBidderClick }) => {
  if (bidders.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl">
        <Inbox className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No bidders registered yet</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
          Register participating bidders for this tender to begin uploading and classifying supporting bid documents.
        </p>
        <button
          onClick={onAddBidderClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add First Bidder
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-850">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Participating Bidders Inventory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {bidders.length} bidder(s) registered under this tender reference.
          </p>
        </div>
        <button
          onClick={onAddBidderClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Bidder
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-6">Bidder Code</th>
              <th className="py-3 px-6">Legal Entity Name</th>
              <th className="py-3 px-6 text-center">Submissions</th>
              <th className="py-3 px-6 text-center">Total Docs</th>
              <th className="py-3 px-6 text-center">Classified</th>
              <th className="py-3 px-6 text-center">Review Required</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
            {bidders.map((bidder) => {
              const activeSub = bidder.submissions?.find((s) => s.status !== 'WITHDRAWN');
              return (
                <tr
                  key={bidder.id}
                  onClick={() => onSelectBidder(bidder.id)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 cursor-pointer transition-colors"
                >
                  <td className="py-4 px-6 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {bidder.bidderCode}
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {bidder.legalName}
                    </div>
                    {bidder.displayName && (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {bidder.displayName}
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {activeSub ? activeSub.submissionReference : 'Draft'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center font-semibold text-slate-900 dark:text-white">
                    {bidder.documentCount || 0}
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <FileCheck className="w-3.5 h-3.5" />
                      {bidder.classifiedCount || 0}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    {(bidder.reviewRequiredCount || 0) > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-3 h-3" />
                        {bidder.reviewRequiredCount} Review
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBidder(bidder.id);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                      Workspace
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
