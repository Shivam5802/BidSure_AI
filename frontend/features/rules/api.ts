import { request } from '@/lib/api/client';
import {
  ComplianceRule,
  RuleEvaluationResult,
  RuleCoverageStatistics,
  RuleFilterState,
} from './types';

export const ruleApi = {
  getRules: (tenderId: string, filters?: Partial<RuleFilterState>) => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.ruleType && filters.ruleType !== 'ALL') params.append('ruleType', filters.ruleType);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<ComplianceRule[]>(`api/tenders/${tenderId}/rules${query}`);
  },

  getRule: (tenderId: string, ruleId: string) =>
    request<ComplianceRule>(`api/tenders/${tenderId}/rules/${ruleId}`),

  updateRule: (tenderId: string, ruleId: string, payload: Partial<ComplianceRule>) =>
    request<ComplianceRule>(`api/tenders/${tenderId}/rules/${ruleId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  approveRule: (tenderId: string, ruleId: string) =>
    request<ComplianceRule>(`api/tenders/${tenderId}/rules/${ruleId}/approve`, {
      method: 'POST',
    }),

  rejectRule: (tenderId: string, ruleId: string) =>
    request<ComplianceRule>(`api/tenders/${tenderId}/rules/${ruleId}/reject`, {
      method: 'POST',
    }),

  simulateRule: (tenderId: string, ruleId: string, evidence: Record<string, unknown>) =>
    request<RuleEvaluationResult>(`api/tenders/${tenderId}/rules/${ruleId}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ evidence }),
    }),

  getCoverageStatistics: (tenderId: string) =>
    request<RuleCoverageStatistics>(`api/tenders/${tenderId}/rules/coverage`),
};
