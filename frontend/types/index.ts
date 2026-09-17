export type UserRole = 'PROCUREMENT_OFFICER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface HealthCheckData {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

export interface ApiMetadataData {
  name: string;
  fullName: string;
  version: string;
  description: string;
  documentationUrl: string;
  healthUrl: string;
}

export * from './mapping';
export * from './evaluation';
export * from './investigation';
export * from './conflict';
export * from './workspace';
export type {
  IndicatorCategory,
  IndicatorSeverity,
  IndicatorSourceReference,
  IntelligenceIndicator,
  TenderHealthSnapshot,
  EvidenceCoverageAnalytics,
  ComplianceDistribution,
  BidderAnalyticsSummary,
  DocumentProcessingAnalytics,
  VerificationAnalyticsSummary,
  InvestigationAnalyticsSummary,
  ConflictAnalyticsSummary,
  AuditabilityMetrics,
  SystemPerformanceMetrics,
  MeasuredEffortMetrics,
  ProjectedImpactTargets,
  EffortAnalytics,
  AiContributionAnalytics,
  BenchmarkSession,
  BenchmarkRecordInput,
} from './intelligence';
export { PRIORITY_ORDERING_DISCLAIMER } from './intelligence';
