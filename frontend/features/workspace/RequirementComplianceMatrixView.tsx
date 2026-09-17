import React, { useState, useEffect } from 'react';
import { PaginatedMatrixResult, MatrixRowItem, EvaluationStatus, RequirementCategory } from '@/types/workspace';
import { workspaceApi } from '@/lib/api/workspace.api';
import {
  Calculator,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  HelpCircle as WhyIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface RequirementComplianceMatrixViewProps {
  tenderId: string;
  onOpenWhyExplanation: (requirementId: string, bidderId: string) => void;
}

export const RequirementComplianceMatrixView: React.FC<RequirementComplianceMatrixViewProps> = ({
  tenderId,
  onOpenWhyExplanation,
}) => {
  const [matrixData, setMatrixData] = useState<PaginatedMatrixResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [bidderFilter, setBidderFilter] = useState<string>('ALL');

  const fetchMatrix = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await workspaceApi.getComplianceMatrix(tenderId, {
        page,
        pageSize: 15,
        search,
        result: resultFilter !== 'ALL' ? resultFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        bidderId: bidderFilter !== 'ALL' ? bidderFilter : undefined,
      });
      setMatrixData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance matrix.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId) {
      void fetchMatrix();
    }
  }, [tenderId, page, resultFilter, categoryFilter, bidderFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchMatrix();
  };

  const renderResultBadge = (
    result: EvaluationStatus | 'NO_RESULT',
    reqId: string,
    bidderId: string
  ) => {
    switch (result) {
      case 'PASS':
        return (
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              PASS
            </span>
            <button
              onClick={() => onOpenWhyExplanation(reqId, bidderId)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              title="View Why? Explanation Trace"
            >
              <WhyIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      case 'FAIL':
        return (
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              FAIL
            </span>
            <button
              onClick={() => onOpenWhyExplanation(reqId, bidderId)}
              className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-[10px] transition"
              title="View Why? Evaluation Fail Trace"
            >
              Why?
            </button>
          </div>
        );
      case 'REVIEW':
        return (
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              REVIEW
            </span>
            <button
              onClick={() => onOpenWhyExplanation(reqId, bidderId)}
              className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 font-bold text-[10px] transition"
              title="View Why? Review Trace"
            >
              Why?
            </button>
          </div>
        );
      case 'NOT_EVALUABLE':
        return (
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              N/E
            </span>
            <button
              onClick={() => onOpenWhyExplanation(reqId, bidderId)}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 font-bold text-[10px] transition"
              title="View Why? Evidence Missing Trace"
            >
              Why?
            </button>
          </div>
        );
      default:
        return <span className="text-[11px] text-slate-400 font-mono">-</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Requirement Compliance Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Cross-bidder compliance evaluation matrix driven by authoritative deterministic rules
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search requirement code, text, clause..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="ELIGIBILITY">Eligibility</option>
              <option value="FINANCIAL">Financial</option>
              <option value="TECHNICAL">Technical</option>
              <option value="STATUTORY">Statutory</option>
              <option value="POLICY">Policy</option>
              <option value="TENDER_SPECIFIC">Tender Specific</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Result:</span>
            <select
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Results</option>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="REVIEW">REVIEW</option>
              <option value="NOT_EVALUABLE">NOT_EVALUABLE</option>
            </select>
          </div>

          {matrixData?.bidders && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Bidder:</span>
              <select
                value={bidderFilter}
                onChange={(e) => {
                  setBidderFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
              >
                <option value="ALL">All Bidders</option>
                {matrixData.bidders.map((b) => (
                  <option key={b.bidderId} value={b.bidderId}>
                    {b.bidderCode} - {b.legalName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800">
          {error}
        </div>
      )}

      {/* Matrix Table */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading compliance matrix...</p>
        </div>
      ) : !matrixData || matrixData.items.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Matching Requirements</h3>
          <p className="text-xs text-slate-500">Adjust your category or result filters to view evaluation results.</p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 min-w-[280px]">Requirement</th>
                  <th className="p-4">Category</th>
                  {matrixData.bidders.map((b) => (
                    <th key={b.bidderId} className="p-4 min-w-[140px]">
                      <div className="font-mono text-indigo-600 dark:text-indigo-400">{b.bidderCode}</div>
                      <div className="text-[10px] text-slate-500 font-normal truncate max-w-[130px]">
                        {b.legalName}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {matrixData.items.map((row) => (
                  <tr key={row.requirementId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-medium">
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {row.requirementCode}
                        </span>
                        <p className="text-xs text-slate-900 dark:text-white line-clamp-2">{row.requirementText}</p>
                        {row.clauseReference && (
                          <span className="text-[10px] text-slate-400">Clause: {row.clauseReference}</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {row.category}
                      </span>
                    </td>

                    {matrixData.bidders.map((b) => {
                      const resItem = row.bidderResults[b.bidderId] || { result: 'NO_RESULT' };
                      return (
                        <td key={b.bidderId} className="p-4">
                          {renderResultBadge(resItem.result, row.requirementId, b.bidderId)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {matrixData.pagination.page} of {matrixData.pagination.totalPages} ({matrixData.pagination.total} Total Requirements)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(matrixData.pagination.totalPages, p + 1))}
                disabled={page >= matrixData.pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 disabled:opacity-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
