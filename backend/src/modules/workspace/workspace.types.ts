import {
  RequirementCategory,
  EvaluationStatus,
  ConflictSeverity,
  ConflictStatus,
  ConflictType,
  InvestigationStatus,
} from '@prisma/client';

export {
  RequirementCategory,
  EvaluationStatus,
  ConflictSeverity,
  ConflictStatus,
  ConflictType,
  InvestigationStatus,
};

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ActionItemType =
  | 'CRITICAL_CONFLICT'
  | 'HIGH_CONFLICT'
  | 'INVESTIGATION_HUMAN_REVIEW'
  | 'EVALUATION_FAIL'
  | 'EVALUATION_REVIEW'
  | 'EVALUATION_NOT_EVALUABLE'
  | 'BLUEPRINT_PENDING_APPROVAL'
  | 'RULE_PENDING_APPROVAL'
  | 'EVIDENCE_REVIEW_REQUIRED'
  | 'DOCUMENT_CLASSIFICATION_REVIEW';

export interface PriorityActionItem {
  id: string;
  type: ActionItemType;
  priority: PriorityLevel;
  title: string;
  reason: string;
  bidderId?: string | null;
  bidderName?: string | null;
  bidderCode?: string | null;
  requirementId?: string | null;
  requirementCode?: string | null;
  documentId?: string | null;
  documentName?: string | null;
  conflictId?: string | null;
  investigationId?: string | null;
  evaluationId?: string | null;
  currentState: string;
  createdAt: Date | string;
  recommendedRoute: string;
}

export interface WorkspaceSummary {
  tender: {
    id: string;
    title: string;
    referenceNumber: string;
    organization: string;
    status: string;
    closingDate: Date | string;
    createdAt: Date | string;
    description?: string | null;
  };
  counts: {
    bidderCount: number;
    activeBidderCount: number;
    requirementCount: number;
    approvedRequirementCount: number;
    reviewRequirementCount: number;
    passCount: number;
    failCount: number;
    reviewCount: number;
    notEvaluableCount: number;
    notApplicableCount: number;
    conflictCount: number;
    unresolvedConflictCount: number;
    criticalConflictCount: number;
    investigationCount: number;
    pendingInvestigationCount: number;
    humanReviewInvestigationCount: number;
  };
  actions: PriorityActionItem[];
  bidderSummary: {
    bidderId: string;
    bidderCode: string;
    legalName: string;
    status: string;
    documentCount: number;
    evidenceCount: number;
    passCount: number;
    failCount: number;
    reviewCount: number;
    notEvaluableCount: number;
    conflictCount: number;
    investigationCount: number;
    lastActivityAt?: Date | string | null;
  }[];
  evidenceCoverage: {
    coveredCount: number;
    partialCount: number;
    missingCount: number;
    conflictingCount: number;
    coveragePercentage: number;
  };
  recentActivity: {
    id: string;
    event: string;
    actor: string;
    timestamp: Date | string;
    metadata?: any;
  }[];
  processingStatus: {
    status: string;
    documentsProcessed: number;
    documentsTotal: number;
    stage: string;
  };
}

export interface MatrixQueryDTO {
  page?: number;
  pageSize?: number;
  search?: string;
  bidderId?: string;
  result?: EvaluationStatus;
  category?: RequirementCategory;
  priority?: PriorityLevel;
}

export interface MatrixRowItem {
  requirementId: string;
  requirementCode: string;
  requirementText: string;
  category: RequirementCategory;
  clauseReference?: string | null;
  mandatory: string;
  bidderResults: Record<
    string,
    {
      evaluationId?: string;
      result: EvaluationStatus | 'NO_RESULT';
      reasonCode?: string;
      summary?: string;
      explanation?: string;
      hasConflict?: boolean;
      hasInvestigation?: boolean;
    }
  >;
}

export interface PaginatedMatrixResult {
  items: MatrixRowItem[];
  bidders: { bidderId: string; bidderCode: string; legalName: string }[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface WhyExplanationResult {
  evaluationId?: string;
  requirement: {
    id: string;
    requirementCode: string;
    requirementText: string;
    normalizedRequirementText: string;
    clauseReference?: string | null;
    category: RequirementCategory;
    mandatory: string;
  };
  rule?: {
    id: string;
    ruleCode: string;
    name: string;
    ruleType: string;
    definition: any;
  } | null;
  bidder: {
    id: string;
    bidderCode: string;
    legalName: string;
  };
  evaluation: {
    result: EvaluationStatus;
    reasonCode: string;
    summary: string;
    explanation: string;
    calculationTrace?: any;
    engineVersion: string;
    evaluatedAt: Date | string;
  };
  evidenceSources: {
    evidenceId: string;
    fieldKey: string;
    fieldLabel: string;
    rawValue: string;
    normalizedValue: any;
    documentName: string;
    pageNumber: number;
    sourceText: string;
  }[];
  linkedConflict?: {
    id: string;
    conflictType: string;
    severity: string;
    description: string;
  } | null;
  linkedInvestigation?: {
    id: string;
    status: string;
    recommendation?: string | null;
  } | null;
}
