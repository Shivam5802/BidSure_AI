import React, { useState, useEffect } from 'react';
import { RequirementEvidenceMapping } from '@/types';
import { mappingApi } from '@/lib/api/mapping.api';
import { CoverageBadge } from './CoverageBadge';
import { AlertCircle, Check, X, Sparkles, Filter, RefreshCw } from 'lucide-react';

interface MappingReviewQueueProps {
  tenderId?: string;
}

export const MappingReviewQueue: React.FC<MappingReviewQueueProps> = ({ tenderId }) => {
  const [queue, setQueue] = useState<RequirementEvidenceMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await mappingApi.getReviewQueue(tenderId);
      setQueue(res.items || []);
    } catch (err) {
      console.error('Failed to fetch mapping review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [tenderId]);

  const handleConfirm = async (id: string) => {
    await mappingApi.confirmMapping(id);
    await loadQueue();
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    await mappingApi.rejectMapping(id, rejectReason.trim());
    setRejectingId(null);
    setRejectReason('');
    await loadQueue();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100">Evidence Mapping Review Queue</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-500/30">
            {queue.length} items require attention
          </span>
        </div>
        <button
          onClick={loadQueue}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Refresh queue"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">Loading review queue...</div>
      ) : queue.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 text-slate-400 space-y-2">
          <Check className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-200">Review Queue Empty</p>
          <p className="text-xs text-slate-500">All candidate mappings have been processed or confirmed by procurement officers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      Requirement: {item.tenderRequirementId}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.mappingType}
                    </span>
                    <span className="font-mono text-xs text-slate-400">Confidence: {Math.round(item.confidence * 100)}%</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-2 font-medium">{item.reason}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleConfirm(item.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Confirm Mapping
                  </button>
                  <button
                    onClick={() => setRejectingId(rejectingId === item.id ? null : item.id)}
                    className="px-3 py-1.5 bg-rose-950/80 text-rose-300 border border-rose-500/30 hover:bg-rose-900 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>

              {/* Source info */}
              {item.matchingSignals?.sourceContext && (
                <div className="text-xs font-mono text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <span>Document: {item.matchingSignals.sourceContext.documentName || 'Bid Document'}</span>
                  <span>Page {item.matchingSignals.sourceContext.pageNumber || 1}</span>
                </div>
              )}

              {/* Inline Reject Form */}
              {rejectingId === item.id && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Mandatory rejection reason..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setRejectingId(null)} className="px-2 py-1 text-xs text-slate-400">
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={!rejectReason.trim()}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded disabled:opacity-50"
                    >
                      Submit Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
