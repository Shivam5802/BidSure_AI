'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Bidder,
  bidderApi,
  BidderDashboardHeader,
  BidderList,
  AddBidderModal,
} from '@/features/bidders';

interface PageProps {
  params: Promise<{ tenderId: string }>;
}

export default function TenderBiddersPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tenderId = resolvedParams.tenderId;
  const router = useRouter();

  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchBidders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bidderApi.getBidders(tenderId);
      setBidders(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load bidders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId) {
      void fetchBidders();
    }
  }, [tenderId]);

  const handleAddBidder = async (data: { bidderCode: string; legalName: string; displayName?: string }) => {
    await bidderApi.createBidder(tenderId, data);
    await fetchBidders();
  };

  const handleSelectBidder = (bidderId: string) => {
    router.push(`/tenders/${tenderId}/bidders/${bidderId}`);
  };

  return (
    <div className="space-y-6 pb-16 font-sans transition-colors duration-200">
      {/* Dashboard Header Metrics */}
      <BidderDashboardHeader bidders={bidders} onRefresh={fetchBidders} />

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Bidders Inventory Table */}
        {isLoading ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading participating bidders...</p>
          </div>
        ) : (
          <BidderList
            bidders={bidders}
            onSelectBidder={handleSelectBidder}
            onAddBidderClick={() => setIsAddModalOpen(true)}
          />
        )}

      {/* Add Bidder Modal */}
      <AddBidderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBidder}
      />
    </div>
  );
}
