import React, { useState } from 'react';
import { Search, CheckSquare, Square, X, Users, AlertCircle } from 'lucide-react';
import { SelectedBidderSummary } from '@/types/comparison';

interface BidderSelectorProps {
  allBidders: SelectedBidderSummary[];
  selectedBidderIds: string[];
  onChangeSelection: (ids: string[]) => void;
}

export const BidderSelector: React.FC<BidderSelectorProps> = ({
  allBidders,
  selectedBidderIds,
  onChangeSelection,
}) => {
  const [search, setSearch] = useState('');

  const filteredBidders = allBidders.filter(
    (b) =>
      b.legalName.toLowerCase().includes(search.toLowerCase()) ||
      b.bidderCode.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBidder = (id: string) => {
    if (selectedBidderIds.includes(id)) {
      if (selectedBidderIds.length <= 2) {
        // Enforce minimum 2 bidders
        return;
      }
      onChangeSelection(selectedBidderIds.filter((bId) => bId !== id));
    } else {
      if (selectedBidderIds.length >= 5) {
        // Enforce maximum 5 bidders
        return;
      }
      onChangeSelection([...selectedBidderIds, id]);
    }
  };

  const selectAllVisible = () => {
    const visibleIds = filteredBidders.map((b) => b.bidderId).slice(0, 5);
    onChangeSelection(visibleIds);
  };

  const clearSelection = () => {
    if (allBidders.length >= 2) {
      onChangeSelection(allBidders.slice(0, 2).map((b) => b.bidderId));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Select Bidders to Compare
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select 2 to 5 bidders to inspect requirement-level compliance side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={selectAllVisible}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Select Top Visible
          </button>
          <button
            onClick={clearSelection}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search bidder by legal name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {selectedBidderIds.length >= 5 && (
        <div className="mb-3 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          Maximum limit of 5 bidders selected. Unselect a bidder to add another.
        </div>
      )}

      {/* Bidder List Checkbox Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredBidders.map((bidder) => {
          const isSelected = selectedBidderIds.includes(bidder.bidderId);
          const isDisabled = !isSelected && selectedBidderIds.length >= 5;

          return (
            <div
              key={bidder.bidderId}
              onClick={() => !isDisabled && toggleBidder(bidder.bidderId)}
              className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500/70 shadow-xs'
                  : isDisabled
                  ? 'border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {bidder.displayName || bidder.legalName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {bidder.bidderCode}
                  </div>
                </div>
              </div>

              {/* Status Pill Counts */}
              <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold">
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  {bidder.passCount} PASS
                </span>
                {bidder.failCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
                    {bidder.failCount} FAIL
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
