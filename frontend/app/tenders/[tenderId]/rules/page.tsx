'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, AlertCircle, Cpu } from 'lucide-react';
import {
  ComplianceRule,
  RuleCoverageStatistics,
  RuleFilterState,
  RuleEvaluationResult,
  ruleApi,
  RuleCoverageCard,
  RuleList,
  RuleDetail,
  RuleSimulatorModal,
} from '@/features/rules';
import { ThemeToggle } from '@/components/theme';

interface PageProps {
  params: Promise<{ tenderId: string }>;
}

export default function TenderRulesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tenderId = resolvedParams.tenderId;
  const router = useRouter();

  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [coverage, setCoverage] = useState<RuleCoverageStatistics | null>(null);
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);
  const [simulatingRule, setSimulatingRule] = useState<ComplianceRule | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<RuleFilterState>({
    status: 'ALL',
    ruleType: 'ALL',
    search: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rData, cData] = await Promise.all([
        ruleApi.getRules(tenderId, filters),
        ruleApi.getCoverageStatistics(tenderId),
      ]);
      setRules(rData);
      setCoverage(cData);

      if (rData.length > 0) {
        setSelectedRule((prev) => {
          if (prev) {
            const found = rData.find((r) => r.id === prev.id);
            if (found) return found;
          }
          return rData[0]!;
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tender compliance rules.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [tenderId, filters.status, filters.ruleType, filters.search]);

  const handleApprove = async (ruleId: string) => {
    try {
      const updated = await ruleApi.approveRule(tenderId, ruleId);
      setSelectedRule(updated);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve rule.');
    }
  };

  const handleReject = async (ruleId: string) => {
    try {
      const updated = await ruleApi.rejectRule(tenderId, ruleId);
      setSelectedRule(updated);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to reject rule.');
    }
  };

  const handleSimulate = async (evidence: Record<string, unknown>): Promise<RuleEvaluationResult> => {
    if (!simulatingRule) throw new Error('No rule selected for simulation');
    return ruleApi.simulateRule(tenderId, simulatingRule.id, evidence);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tender Hub
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">BidGuard AI — Automated Rule Engine</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Coverage Banner */}
      <RuleCoverageCard coverage={coverage} />

      {error && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-6 py-3 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-230px)]">
        {/* Column 1: Rule List Navigator (4/12 width) */}
        <div className="lg:col-span-4 h-full">
          <RuleList
            rules={rules}
            selectedRuleId={selectedRule?.id || null}
            filters={filters}
            onFilterChange={setFilters}
            onSelectRule={(r) => setSelectedRule(r)}
          />
        </div>

        {/* Column 2: Selected Rule Detail & Simulator Action (8/12 width) */}
        <div className="lg:col-span-8 h-full bg-slate-900/20">
          <RuleDetail
            rule={selectedRule}
            onApprove={handleApprove}
            onReject={handleReject}
            onOpenSimulator={(r) => setSimulatingRule(r)}
          />
        </div>
      </div>

      {/* Simulator Modal */}
      {simulatingRule && (
        <RuleSimulatorModal
          rule={simulatingRule}
          onClose={() => setSimulatingRule(null)}
          onSimulate={handleSimulate}
        />
      )}
    </div>
  );
}
