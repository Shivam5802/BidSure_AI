'use client';

import React, { useState, useEffect } from 'react';
import { ComplianceDistribution } from '@/types/intelligence';
import { intelligenceApi } from '@/lib/api/intelligence.api';
import { CheckCircle2, XCircle, AlertCircle, HelpCircle, MinusCircle, Filter, Database } from 'lucide-react';

interface ComplianceDistributionChartProps {
  tenderId: string;
  initialDistribution?: ComplianceDistribution;
}

export const ComplianceDistributionChart: React.FC<ComplianceDistributionChartProps> = ({
  tenderId,
  initialDistribution,
}) => {
  const [distribution, setDistribution] = useState<ComplianceDistribution | null>(initialDistribution || null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchFiltered() {
      setIsLoading(true);
      try {
        const res = await intelligenceApi.getComplianceDistribution(tenderId, {
          category: categoryFilter,
        });
        if (res.compliance) {
          setDistribution(res.compliance);
        }
      } catch (e) {
        console.error('Failed to load filtered compliance distribution', e);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchFiltered();
  }, [tenderId, categoryFilter]);

  if (!distribution) return null;

  const total = Math.max(distribution.totalEvaluated, 1);
  const passPct = Math.round((distribution.passCount / total) * 100);
  const failPct = Math.round((distribution.failCount / total) * 100);
  const reviewPct = Math.round((distribution.reviewCount / total) * 100);
  const notEvalPct = Math.round((distribution.notEvaluableCount / total) * 100);
  const notAppPct = Math.round((distribution.notApplicableCount / total) * 100);

  const categories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Mandatory', value: 'MANDATORY' },
    { label: 'Financial', value: 'FINANCIAL' },
    { label: 'Technical', value: 'TECHNICAL' },
    { label: 'Statutory', value: 'STATUTORY' },
    { label: 'Policy', value: 'POLICY' },
    { label: 'Tender Specific', value: 'TENDER_SPECIFIC' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Compliance Distribution</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic rule evaluation outcomes (Factual counts, no scoring)
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stacked Distribution Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Evaluated Criteria Distribution</span>
          <span>{distribution.totalEvaluated} Total Records</span>
        </div>
        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          {distribution.passCount > 0 && (
            <div
              style={{ width: `${passPct}%` }}
              className="bg-emerald-500 hover:opacity-90 transition-all cursor-pointer"
              title={`PASS: ${distribution.passCount} (${passPct}%)`}
            />
          )}
          {distribution.failCount > 0 && (
            <div
              style={{ width: `${failPct}%` }}
              className="bg-rose-500 hover:opacity-90 transition-all cursor-pointer"
              title={`FAIL: ${distribution.failCount} (${failPct}%)`}
            />
          )}
          {distribution.reviewCount > 0 && (
            <div
              style={{ width: `${reviewPct}%` }}
              className="bg-amber-500 hover:opacity-90 transition-all cursor-pointer"
              title={`REVIEW: ${distribution.reviewCount} (${reviewPct}%)`}
            />
          )}
          {distribution.notEvaluableCount > 0 && (
            <div
              style={{ width: `${notEvalPct}%` }}
              className="bg-purple-500 hover:opacity-90 transition-all cursor-pointer"
              title={`NOT EVALUABLE: ${distribution.notEvaluableCount} (${notEvalPct}%)`}
            />
          )}
          {distribution.notApplicableCount > 0 && (
            <div
              style={{ width: `${notAppPct}%` }}
              className="bg-slate-400 hover:opacity-90 transition-all cursor-pointer"
              title={`NOT APPLICABLE: ${distribution.notApplicableCount} (${notAppPct}%)`}
            />
          )}
        </div>
      </div>

      {/* Count Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PASS</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">
            {distribution.passCount}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">{passPct}% of evaluated</div>
        </div>

        <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>FAIL</span>
          </div>
          <div className="text-xl font-extrabold text-rose-900 dark:text-rose-200 mt-1">
            {distribution.failCount}
          </div>
          <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">{failPct}% of evaluated</div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>REVIEW</span>
          </div>
          <div className="text-xl font-extrabold text-amber-900 dark:text-amber-200 mt-1">
            {distribution.reviewCount}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{reviewPct}% of evaluated</div>
        </div>

        <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>NOT EVAL</span>
          </div>
          <div className="text-xl font-extrabold text-purple-900 dark:text-purple-200 mt-1">
            {distribution.notEvaluableCount}
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">{notEvalPct}% of evaluated</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
            <MinusCircle className="w-3.5 h-3.5" />
            <span>N/A</span>
          </div>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">
            {distribution.notApplicableCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{notAppPct}% of evaluated</div>
        </div>
      </div>

      {/* Data Source Footnote */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
        <Database className="w-3 h-3" />
        <span>Source: Compliance Evaluation Engine (Deterministic Rule Execution)</span>
      </div>
    </div>
  );
};
