'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, AlertCircle, Cpu } from 'lucide-react';
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
    <div className="space-y-6 pb-12 font-sans transition-colors duration-200">
      {/* Coverage Banner */}
      <RuleCoverageCard coverage={coverage} />

      {error && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-6 py-3 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[640px] h-[calc(100vh-230px)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-xs">
        {/* Column 1: Rule List Navigator (4/12 width) */}
        <div className="lg:col-span-4 h-full border-r border-slate-200 dark:border-slate-800">
          <RuleList
            rules={rules}
            selectedRuleId={selectedRule?.id || null}
            filters={filters}
            onFilterChange={setFilters}
            onSelectRule={(r) => setSelectedRule(r)}
          />
        </div>

        {/* Column 2: Selected Rule Detail & Simulator Action (8/12 width) */}
        <div className="lg:col-span-8 h-full bg-slate-50/30 dark:bg-slate-900/20">
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
