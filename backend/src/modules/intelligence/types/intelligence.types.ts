export type IndicatorCategory =
  | 'EVIDENCE_GAP'
  | 'COMPLIANCE_REVIEW'
  | 'COMPLIANCE_FAILURE'
  | 'CONFLICT'
  | 'EXTERNAL_VERIFICATION'
  | 'DOCUMENT_PROCESSING'
  | 'INVESTIGATION'
  | 'AUDIT';

export type IndicatorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const PRIORITY_ORDERING_DISCLAIMER =
  'Priority indicates which issues require attention first; it does not indicate bidder preference or procurement outcome.';

export interface IndicatorSourceReference {
  type: string;
  id: string;
  label?: string;
  route?: string;
}

export interface IntelligenceIndicator {
  id: string;
  category: IndicatorCategory;
  code: string;
  severity: IndicatorSeverity;
  title: string;
  description: string;
  count: number;
  entityType?: string;
  entityId?: string;
  bidderCode?: string;
  bidderName?: string;
  sourceReferences: IndicatorSourceReference[];
  recommendedAction: string;
  recommendedRoute: string;
  createdAt: string;
}

export interface PriorityActionItem {
  id: string;
  priority: IndicatorSeverity;
  category: IndicatorCategory;
  title: string;
  reason: string;
  bidderCode?: string;
  bidderName?: string;
  entityType: string;
  entityId: string;
  recommendedRoute: string;
  actionLabel: string;
  sourceReferences?: IndicatorSourceReference[];
  createdAt: string;
}

export interface TenderHealthSnapshot {
  tenderId: string;
  tenderTitle: string;
  referenceNumber: string;
  totalRequirements: number;
  executableRulesCount: number;
  evidenceCoveragePercentage: number;
  passCount: number;
  failCount: number;
  reviewCount: number;
  notEvaluableCount: number;
  unresolvedConflictCount: number;
  externalMismatchCount: number;
  openInvestigationCount: number;
  dataTimestamp: string;
}

export interface EvidenceCoverageAnalytics {
  coveredCount: number;
  coveredPercentage: number;
  partialCount: number;
  partialPercentage: number;
  missingCount: number;
  missingPercentage: number;
  conflictingCount: number;
  conflictingPercentage: number;
  ambiguousCount: number;
  ambiguousPercentage: number;
  totalMappedRequirements: number;
}

export interface ComplianceDistribution {
  passCount: number;
  failCount: number;
  reviewCount: number;
  notEvaluableCount: number;
  notApplicableCount: number;
  totalEvaluated: number;
  byCategory: Record<
    string,
    { pass: number; fail: number; review: number; notEvaluable: number; notApplicable: number }
  >;
}

export interface BidderAnalyticsSummary {
  bidderId: string;
  bidderCode: string;
  legalName: string;
  requirementsEvaluated: number;
  passCount: number;
  failCount: number;
  reviewCount: number;
  notEvaluableCount: number;
  evidenceCoveragePercentage: number;
  conflictCount: number;
  investigationCount: number;
  verificationCount: number;
  verificationMismatchCount: number;
}

export interface DocumentProcessingAnalytics {
  tenderDocuments: {
    total: number;
    processed: number;
    processing: number;
    failed: number;
    ocrUsedCount: number;
  };
  bidDocuments: {
    total: number;
    processed: number;
    processing: number;
    failed: number;
    ocrUsedCount: number;
  };
}

export interface VerificationAnalyticsSummary {
  totalRequests: number;
  matchCount: number;
  mismatchCount: number;
  reviewRequiredCount: number;
  unavailableCount: number;
  errorCount: number;
  notFoundCount: number;
  providerMode: string;
  byType: Record<string, { total: number; match: number; mismatch: number; review: number }>;
  latestVerificationTimestamp?: string | null;
}

export interface InvestigationAnalyticsSummary {
  totalCount: number;
  completedCount: number;
  requiresHumanCount: number;
  runningCount: number;
  failedCount: number;
  byTriggerType: Record<string, number>;
}

export interface ConflictAnalyticsSummary {
  totalCount: number;
  unresolvedCount: number;
  investigatingCount: number;
  resolvedCount: number;
  dismissedCount: number;
  byType: Record<string, number>;
}

export interface AuditabilityMetrics {
  requirementProvenancePercentage: number; // Reqs with source references
  evidencePageProvenancePercentage: number; // Evidence facts with page number & source text
  evaluationVersionTracePercentage: number; // Evaluations with rule version
  auditEventsRecordedCount: number;
  evidenceTraceabilityPercentage: number; // (Evaluations with complete provenance chain / applicable evaluations)
  automationCoveragePercentage: number; // (Evaluations performed by approved rules / total applicable evaluations)
  humanReviewRatePercentage: number; // (Evaluations requiring human review / total evaluated)
  verificationCoveragePercentage: number | null; // (Requirements with completed external verification / applicable requirements)
}

export interface SystemPerformanceMetrics {
  tenderProcessingDurationMs?: number | null;
  requirementExtractionDurationMs?: number | null;
  evidenceExtractionDurationMs?: number | null;
  evaluationRuntimeMs?: number | null;
  verificationRuntimeMs?: number | null;
  reportGenerationDurationMs?: number | null;
  investigationRuntimeMs?: number | null;
}

export interface MeasuredEffortMetrics {
  documentsProcessed: number;
  requirementsExtracted: number;
  rulesExecuted: number;
  evaluationsPerformed: number;
  verificationsExecuted: number;
  investigationsAssisted: number;
  auditRecordsRecorded: number;
}

export interface ProjectedImpactTargets {
  disclaimer: string;
  targetVerificationEffortReduction: string;
  targetManualComparisonReduction: string;
  targetEvaluationConsistencyImprovement: string;
}

export interface EffortAnalytics {
  measured: MeasuredEffortMetrics;
  projected: ProjectedImpactTargets;
}

export interface AiContributionAnalytics {
  aiAssistedActivities: Array<{
    activity: string;
    description: string;
    component: string;
  }>;
  deterministicActivities: Array<{
    activity: string;
    description: string;
    component: string;
  }>;
  humanGovernanceActivities: Array<{
    activity: string;
    description: string;
    role: string;
  }>;
}

export interface BenchmarkRecordInput {
  tenderId: string;
  scenarioName: string;
  baselineMethod?: string;
  baselineDurationSeconds: number;
  bidguardDurationSeconds: number;
  requirementsCount?: number;
  documentsCount?: number;
  operators?: string;
  notes?: string;
}

export interface IntelligenceFilterQuery {
  severity?: IndicatorSeverity;
  category?: IndicatorCategory;
  mandatory?: string;
  bidderId?: string;
}
