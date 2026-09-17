export type InvestigationStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'REQUIRES_HUMAN'
  | 'FAILED'
  | 'CANCELLED';

export type InvestigationTriggerType =
  | 'MISSING_EVIDENCE'
  | 'CONFLICTING_EVIDENCE'
  | 'AMBIGUOUS_VALUE'
  | 'AMBIGUOUS_REQUIREMENT'
  | 'ENTITY_MISMATCH'
  | 'DATE_AMBIGUITY'
  | 'INSUFFICIENT_EVIDENCE'
  | 'UNSUPPORTED_RULE'
  | 'MULTI_DOCUMENT_CONFLICT'
  | 'EVALUATION_REVIEW'
  | 'EVALUATION_NOT_EVALUABLE'
  | 'OFFICER_REQUESTED';

export type InvestigationSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type HumanReviewDecision =
  | 'ACCEPT_RECOMMENDATION'
  | 'REQUEST_MORE_REVIEW'
  | 'MARK_RESOLVED'
  | 'DISMISS';

export interface EvidenceReference {
  evidenceId?: string | null;
  documentId?: string | null;
  documentName?: string;
  pageId?: string | null;
  pageNumber?: number;
  fieldKey?: string;
  sourceText?: string;
  rawValue?: any;
  normalizedValue?: any;
}

export interface ContradictionItem {
  documentA: string;
  documentB: string;
  pageA?: number;
  pageB?: number;
  valueA: any;
  valueB: any;
  fieldKey: string;
  description: string;
}

export interface InvestigationResult {
  caseSummary: string;
  issueType: InvestigationTriggerType;
  finding: string;
  evidenceReviewed: EvidenceReference[];
  contradictions: ContradictionItem[];
  missingEvidence: string[];
  knownFacts: string[];
  unknownFacts: string[];
  reasoningSteps: string[];
  recommendation: string;
  recommendedHumanAction: string;
  uncertainty: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  requiresHumanReview: boolean;
  sourceReferences: EvidenceReference[];
}

export interface ComplianceInvestigation {
  id: string;
  tenderId: string;
  bidderId: string;
  bidSubmissionId: string;
  evaluationId: string;
  requirementId: string;
  ruleId?: string | null;
  triggerType: InvestigationTriggerType;
  status: InvestigationStatus;
  severity: InvestigationSeverity;
  question?: string | null;
  summary?: string | null;
  finding?: string | null;
  recommendation?: string | null;
  uncertainty?: string | null;
  confidence?: number | null;
  resultData?: InvestigationResult | null;
  toolCallLogs?: any[] | null;
  agentVersion: string;
  modelProvider: string;
  modelName: string;
  startedAt?: string | null;
  completedAt?: string | null;
  createdById?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewDecision?: HumanReviewDecision | null;
  reviewReason?: string | null;
  createdAt: string;
  updatedAt: string;
  tender?: { id: string; title: string; referenceNumber: string };
  bidder?: { id: string; bidderCode: string; legalName: string };
  requirement?: { requirementCode: string; category: string };
}
