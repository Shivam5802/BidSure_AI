import { RequirementCategory, EvaluationStatus, MandatoryStatus, RuleType } from '@prisma/client';

export type ReportType = 'TENDER_COMPLIANCE' | 'BIDDER_COMPLIANCE';
export type ReportStatus = 'QUEUED' | 'GENERATING' | 'COMPLETED' | 'PARTIAL' | 'FAILED' | 'EXPIRED';

export interface ReportMetadata {
  id: string;
  tenderId: string;
  bidderId?: string | null;
  reportType: ReportType;
  status: ReportStatus;
  reportVersion: string;
  engineVersion: string;
  generatedBy: string;
  generatedAt: Date;
  reportChecksum: string;
  snapshotId: string;
  isStale: boolean;
  completenessStatus: 'COMPLETE' | 'PARTIAL' | 'FAILED';
  fileKey?: string | null;
}

export interface ReportTenderHeader {
  id: string;
  title: string;
  referenceNumber: string;
  organization: string;
  closingDate: Date;
  description?: string | null;
}

export interface ReportBidderHeader {
  id: string;
  bidderCode: string;
  legalName: string;
  displayName?: string | null;
  submissionStatus: string;
  submittedAt?: Date | null;
  documentCount: number;
}

export interface ReportVerificationSummary {
  total: number;
  match: number;
  mismatch: number;
  reviewRequired: number;
  unavailable: number;
  providerMode: string;
  disclaimer: string;
}

export interface ReportExecutiveSummary {
  totalRequirements: number;
  passCount: number;
  failCount: number;
  reviewCount: number;
  notEvaluableCount: number;
  notApplicableCount: number;
  conflictCount: number;
  unresolvedConflictCount: number;
  investigationCount: number;
  activeInvestigationCount: number;
  coveragePercentage: number;
  verificationSummary?: ReportVerificationSummary;
}

export interface ReportEvidenceItem {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  rawValue: string;
  normalizedValue?: any;
  unit?: string | null;
  documentName: string;
  pageNumber: number;
  confidence: number;
  status: string;
  conflictFlag: boolean;
  conflictReason?: string | null;
}

export interface ReportConflictItem {
  id: string;
  conflictType: string;
  severity: string;
  status: string;
  fieldKey: string;
  description: string;
  fingerprint: string;
  resolvedBy?: string | null;
  resolvedAt?: Date | null;
  resolutionReason?: string | null;
}

export interface ReportInvestigationItem {
  id: string;
  triggerType: string;
  status: string;
  severity: string;
  question?: string | null;
  summary?: string | null;
  finding?: string | null;
  recommendation?: string | null;
  uncertainty?: string | null;
  confidence?: number | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  reviewDecision?: string | null;
  reviewReason?: string | null;
  modelProvider?: string;
  modelName?: string;
}

export interface ReportRequirementAuditItem {
  requirement: {
    id: string;
    requirementCode: string;
    clauseReference: string | null;
    requirementText: string;
    category: RequirementCategory;
    mandatory: MandatoryStatus;
    condition?: string | null;
  };
  rule: {
    id: string;
    ruleCode: string;
    name: string;
    ruleType: RuleType;
    definition: any;
    version: number;
  } | null;
  evaluation: {
    id?: string;
    result: EvaluationStatus | 'NO_RESULT';
    reasonCode?: string;
    summary?: string;
    explanation?: string;
    calculationTrace?: any;
    version?: number;
    evaluatedAt?: Date;
    evaluatedBy?: string;
    engineVersion?: string;
  };
  evidenceList: ReportEvidenceItem[];
  conflicts: ReportConflictItem[];
  investigations: ReportInvestigationItem[];
  whyExplanation: {
    summary: string;
    traceSteps: string[];
  };
}

export interface ReportAuditTimelineItem {
  id: string;
  timestamp: Date;
  actor: string;
  event: string;
  metadata?: any;
}

export interface ReportSystemVersions {
  bidGuardVersion: string;
  reportVersion: string;
  complianceEngineVersion: string;
  ruleVersion: string;
  evidenceExtractionVersion: string;
  investigationAgentVersion: string;
  conflictDetectorVersion: string;
}

export interface ReportDataSnapshot {
  metadata: ReportMetadata;
  tender: ReportTenderHeader;
  bidder?: ReportBidderHeader | null;
  executiveSummary: ReportExecutiveSummary;
  requirements: ReportRequirementAuditItem[];
  conflicts: ReportConflictItem[];
  investigations: ReportInvestigationItem[];
  auditTimeline: ReportAuditTimelineItem[];
  systemVersions: ReportSystemVersions;
  disclaimer: string;
}

export interface CreateReportRequestDTO {
  reportType?: ReportType;
  bidderId?: string;
  forceNew?: boolean;
}
