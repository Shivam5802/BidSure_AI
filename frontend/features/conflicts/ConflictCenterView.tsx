import React, { useState, useEffect } from 'react';
import { EvidenceConflict, ConflictStatus, ConflictSeverity, ConflictGraphData } from '@/types/conflict';
import { conflictApi } from '@/lib/api/conflict.api';
import {
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Network,
  Bot,
  Shield,
  Loader2,
  CheckCircle2,
  Eye,
  Layers,
} from 'lucide-react';
import { ConflictStatusBadge } from './ConflictStatusBadge';
import { ConflictDetailDrawer } from './ConflictDetailDrawer';
import { EvidenceConflictGraphView } from './EvidenceConflictGraphView';

interface ConflictCenterViewProps {
  bidderId: string;
  bidderName?: string;
  tenderId?: string;
}

export const ConflictCenterView: React.FC<ConflictCenterViewProps> = ({
  bidderId,
  bidderName = 'Bidder',
  tenderId,
}) => {
  const [conflicts, setConflicts] = useState<EvidenceConflict[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedConflict, setSelectedConflict] = useState<EvidenceConflict | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [graphData, setGraphData] = useState<ConflictGraphData | null>(null);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [activeGraphTitle, setActiveGraphTitle] = useState('');

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchConflicts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await conflictApi.getConflictsForBidder(bidderId);
      setConflicts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load conflicts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bidderId) {
      void fetchConflicts();
    }
  }, [bidderId]);

  const handleRunDetection = async () => {
    setIsDetecting(true);
    setError(null);
    try {
      await conflictApi.detectConflicts(bidderId, tenderId);
      await fetchConflicts();
    } catch (err: any) {
      setError(err.message || 'Failed to run contradiction detection.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleOpenGraph = async (conflict: EvidenceConflict) => {
    try {
      const graph = await conflictApi.getConflictGraph(conflict.id);
      setGraphData(graph);
      setActiveGraphTitle(`${conflict.fieldKey.toUpperCase()} Conflict Graph`);
      setIsGraphOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load graph data.');
    }
  };

  const handleUpdateStatus = async (
    conflictId: string,
    status: ConflictStatus,
    resolution?: string,
    reason?: string
  ) => {
    await conflictApi.updateConflictStatus(conflictId, {
      status,
      resolution,
      resolutionReason: reason,
      reviewerId: 'procurement_officer',
    });
    await fetchConflicts();
  };

  const handleInvestigate = async (conflictId: string) => {
    await conflictApi.investigateConflict(conflictId, 'procurement_officer');
    await fetchConflicts();
    if (selectedConflict && selectedConflict.id === conflictId) {
      const updated = await conflictApi.getConflictById(conflictId);
      setSelectedConflict(updated);
    }
  };

  // Compute Statistics from real records
  const totalCount = conflicts.length;
  const criticalCount = conflicts.filter((c) => c.severity === 'CRITICAL').length;
  const highCount = conflicts.filter((c) => c.severity === 'HIGH').length;
  const mediumCount = conflicts.filter((c) => c.severity === 'MEDIUM').length;
  const lowCount = conflicts.filter((c) => c.severity === 'LOW').length;
  const unresolvedCount = conflicts.filter(
    (c) => c.status === 'DETECTED' || c.status === 'UNDER_REVIEW' || c.status === 'INVESTIGATING'
  ).length;
  const resolvedCount = conflicts.filter((c) => c.status === 'RESOLVED' || c.status === 'DISMISSED').length;

  // Filtered conflicts
  const filteredConflicts = conflicts.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && c.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        c.fieldKey.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.conflictType.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500">Total Conflicts</span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{totalCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400">Critical</span>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">{criticalCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">High</span>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{highCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-blue-600 dark:text-blue-400">Medium</span>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{mediumCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500">Low</span>
          <p className="text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">{lowCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-300">Unresolved</span>
          <p className="text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">{unresolvedCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Resolved</span>
          <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">{resolvedCount}</p>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Contradiction Detection Engine & Conflict Center
            </h2>
            <p className="text-xs text-slate-500">
              Identifies conflicting facts across bidder documents with auditable Evidence Conflict Graph
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunDetection}
            disabled={isDetecting}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-xs transition flex items-center gap-2"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning Evidence...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Run Contradiction Detection
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search conflicts by field or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="DETECTED">Detected</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800">
          {error}
        </div>
      )}

      {/* Conflict Inventory Table */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading contradiction records...</p>
        </div>
      ) : filteredConflicts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Evidence Contradictions Detected</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All extracted bidder evidence records pass deterministic context comparability checks without conflicting claims.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Conflict Field</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Evidence Sources</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredConflicts.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      <div className="space-y-0.5">
                        <span className="font-bold">{c.fieldKey.toUpperCase()}</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-mono">
                          {c.description.split('\n')[0]}
                        </p>
                      </div>
                    </td>

                    <td className="p-4">
                      <ConflictStatusBadge conflictType={c.conflictType} />
                    </td>

                    <td className="p-4">
                      <ConflictStatusBadge severity={c.severity} />
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300 font-mono">
                      {c.items?.length || 2} Sources
                    </td>

                    <td className="p-4">
                      <ConflictStatusBadge status={c.status} />
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenGraph(c)}
                          className="px-2.5 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 font-semibold text-[11px] transition flex items-center gap-1"
                        >
                          <Network className="w-3.5 h-3.5" />
                          Graph
                        </button>

                        <button
                          onClick={() => {
                            setSelectedConflict(c);
                            setIsDrawerOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 font-semibold text-[11px] transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SIH Trust Footer */}
      <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-indigo-800 dark:text-indigo-300">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>BidGuard detected the conflict — it did not decide which document was correct.</strong>
          </span>
        </div>
        <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
          AI investigation is advisory. Final procurement decisions remain with the authorized Procurement Officer.
        </span>
      </div>

      {/* Drawer */}
      <ConflictDetailDrawer
        conflict={selectedConflict}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onInvestigate={handleInvestigate}
        onOpenGraph={(c) => {
          setIsDrawerOpen(false);
          void handleOpenGraph(c);
        }}
      />

      {/* Graph Modal */}
      <EvidenceConflictGraphView
        graphData={graphData}
        isOpen={isGraphOpen}
        onClose={() => setIsGraphOpen(false)}
        conflictTitle={activeGraphTitle}
      />
    </div>
  );
};
