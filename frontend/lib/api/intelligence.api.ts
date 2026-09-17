import { api } from './client';
import {
  TenderHealthSnapshot,
  IntelligenceIndicator,
  PriorityActionItem,
  ComplianceDistribution,
  EvidenceCoverageAnalytics,
  BidderAnalyticsSummary,
  DocumentProcessingAnalytics,
  VerificationAnalyticsSummary,
  InvestigationAnalyticsSummary,
  ConflictAnalyticsSummary,
  AuditabilityMetrics,
  SystemPerformanceMetrics,
  EffortAnalytics,
  AiContributionAnalytics,
  BenchmarkSession,
  BenchmarkRecordInput,
} from '@/types/intelligence';

export const intelligenceApi = {
  getSummary: async (tenderId: string) => {
    return api.get<TenderHealthSnapshot>(`api/tenders/${tenderId}/intelligence/summary`);
  },

  getIndicatorsAndActions: async (
    tenderId: string,
    query: { severity?: string; category?: string; bidderId?: string } = {}
  ) => {
    const params = new URLSearchParams();
    if (query.severity && query.severity !== 'ALL') params.append('severity', query.severity);
    if (query.category && query.category !== 'ALL') params.append('category', query.category);
    if (query.bidderId && query.bidderId !== 'ALL') params.append('bidderId', query.bidderId);
    const qs = params.toString() ? `?${params.toString()}` : '';

    return api.get<{
      tenderId: string;
      indicatorCount: number;
      indicators: IntelligenceIndicator[];
      actionCount: number;
      priorityActions: PriorityActionItem[];
    }>(`api/tenders/${tenderId}/intelligence/indicators${qs}`);
  },

  getComplianceDistribution: async (
    tenderId: string,
    query: { category?: string; mandatory?: string } = {}
  ) => {
    const params = new URLSearchParams();
    if (query.category && query.category !== 'ALL') params.append('category', query.category);
    if (query.mandatory) params.append('mandatory', query.mandatory);
    const qs = params.toString() ? `?${params.toString()}` : '';

    return api.get<{
      tenderId: string;
      compliance: ComplianceDistribution;
    }>(`api/tenders/${tenderId}/intelligence/compliance${qs}`);
  },

  getEvidenceCoverage: async (tenderId: string) => {
    return api.get<{
      tenderId: string;
      evidenceCoverage: EvidenceCoverageAnalytics;
    }>(`api/tenders/${tenderId}/intelligence/evidence`);
  },

  getBidderAnalytics: async (tenderId: string) => {
    return api.get<{
      tenderId: string;
      count: number;
      bidders: BidderAnalyticsSummary[];
    }>(`api/tenders/${tenderId}/intelligence/bidders`);
  },

  getDocumentProcessing: async (tenderId: string) => {
    return api.get<{
      tenderId: string;
      processing: DocumentProcessingAnalytics;
    }>(`api/tenders/${tenderId}/intelligence/processing`);
  },

  getVerificationAnalytics: async (tenderId: string) => {
    return api.get<{
      tenderId: string;
      verifications: VerificationAnalyticsSummary;
    }>(`api/tenders/${tenderId}/intelligence/verification`);
  },

  getInvestigationAnalytics: async (tenderId: string) => {
    return api.get<{
      tenderId: string;
      investigations: InvestigationAnalyticsSummary;
    }>(`api/tenders/${tenderId}/intelligence/investigations`);
  },

  getConflictAnalytics: async (tenderId: string) => {
    return api.get<{
      tenderId: string;
      conflicts: ConflictAnalyticsSummary;
    }>(`api/tenders/${tenderId}/intelligence/conflicts`);
  },

  getAuditabilityMetrics: async (tenderId: string) => {
    return api.get<{
      tenderId: string;
      auditability: AuditabilityMetrics;
    }>(`api/tenders/${tenderId}/intelligence/auditability`);
  },

  getPerformanceMetrics: async (tenderId: string) => {
    return api.get<{
      tenderId: string;
      performance: SystemPerformanceMetrics;
    }>(`api/tenders/${tenderId}/intelligence/performance`);
  },

  getEffortAnalytics: async (tenderId: string) => {
    return api.get<{
      tenderId: string;
      effort: EffortAnalytics;
    }>(`api/tenders/${tenderId}/intelligence/effort`);
  },

  getAiContributionAnalytics: async (tenderId: string) => {
    return api.get<AiContributionAnalytics>(`api/tenders/${tenderId}/intelligence/ai-contribution`);
  },

  recordBenchmark: async (tenderId: string, input: BenchmarkRecordInput) => {
    return api.post<BenchmarkSession>(`api/tenders/${tenderId}/intelligence/benchmark`, input);
  },

  getBenchmarks: async (tenderId: string) => {
    return api.get<{
      tenderId: string;
      count: number;
      benchmarks: BenchmarkSession[];
    }>(`api/tenders/${tenderId}/intelligence/benchmark`);
  },
};
