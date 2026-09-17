export type RequirementCategory =
  | 'ELIGIBILITY'
  | 'FINANCIAL'
  | 'TECHNICAL'
  | 'STATUTORY'
  | 'POLICY'
  | 'TENDER_SPECIFIC';

export type EvaluationStatus = 'PASS' | 'FAIL' | 'REVIEW' | 'NOT_EVALUABLE';

export type DifferenceState =
  | 'ALL_SAME'
  | 'MIXED_RESULTS'
  | 'SOME_UNEVALUABLE'
  | 'SOME_REVIEW'
  | 'CONFLICTING_RESULTS'
  | 'NOT_APPLICABLE_VARIATION';

export interface SelectedBidderSummary {
  bidderId: string;
  bidderCode: string;
  legalName: string;
  displayName?: string | null;
  status: string;
  submissionStatus: string;
  documentCount: number;
  evidenceCount: number;
  passCount: number;
  failCount: number;
  reviewCount: number;
  notEvaluableCount: number;
  notApplicableCount: number;
  unresolvedConflictCount: number;
  activeInvestigationCount: number;
  evidenceCoverage: {
    covered: number;
    partial: number;
    missing: number;
    conflicting: number;
    coveragePercentage: number;
  };
}

export interface ComparisonSummaryResponse {
  tender: {
    id: string;
    title: string;
    referenceNumber: string;
    organization: string;
  };
  totalBidders: number;
  biddersWithCompletedEvaluation: number;
  biddersRequiringReview: number;
  biddersWithUnresolvedIssues: number;
  selectedBidders: SelectedBidderSummary[];
}

export interface MatrixEvaluationCell {
  evaluationId?: string;
  result: EvaluationStatus | 'NO_RESULT';
  applicability?: string;
  reasonCode?: string;
  summary?: string;
  explanation?: string;
  version?: number;
}

export interface ComparisonMatrixItem {
  requirementId: string;
  requirementCode: string;
  clauseReference: string | null;
  requirementText: string;
  category: RequirementCategory;
  mandatory: string;
  evaluations: Record<string, MatrixEvaluationCell>;
  differenceState: DifferenceState;
  hasDifference: boolean;
  hasAttention: boolean;
  conflictCount: number;
  investigationCount: number;
}

export interface ComparisonMatrixResponse {
  items: ComparisonMatrixItem[];
  selectedBidders: SelectedBidderSummary[];
  tender: {
    id: string;
    title: string;
    referenceNumber: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  tenderIntelligence: {
    totalRequirementsEvaluated: number;
    differingOutcomeCount: number;
    unresolvedIssueRequirementCount: number;
    evidenceConflictRequirementCount: number;
    highestUnresolvedRequirement?: {
      requirementId: string;
      requirementCode: string;
      requirementText: string;
      unresolvedCount: number;
    } | null;
  };
}

export interface RequirementDetailComparisonItem {
  bidderId: string;
  bidderCode: string;
  legalName: string;
  evaluation: {
    evaluationId?: string;
    result: EvaluationStatus | 'NO_RESULT';
    reasonCode?: string;
    summary?: string;
    explanation?: string;
    calculationTrace?: any;
    version?: number;
    evaluatedAt?: string;
  };
  evidenceList: Array<{
    id: string;
    fieldKey: string;
    fieldLabel: string;
    rawValue: string;
    normalizedValue?: any;
    unit?: string | null;
    pageNumber: number;
    documentName: string;
    confidence: number;
    status: string;
    conflictFlag: boolean;
    conflictReason?: string | null;
  }>;
  conflicts: Array<{
    id: string;
    conflictType: string;
    severity: string;
    description: string;
    status: string;
  }>;
  investigations: Array<{
    id: string;
    status: string;
    triggerType: string;
    summary?: string | null;
    recommendation?: string | null;
  }>;
}

export interface RequirementDetailComparisonResponse {
  requirement: {
    id: string;
    requirementCode: string;
    clauseReference: string | null;
    requirementText: string;
    category: RequirementCategory;
    mandatory: string;
    condition?: string | null;
  };
  rule: {
    id: string;
    ruleCode: string;
    name: string;
    ruleType: string;
    definition: any;
  } | null;
  bidders: RequirementDetailComparisonItem[];
}
