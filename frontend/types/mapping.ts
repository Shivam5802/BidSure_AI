export type MappingType =
  | 'DIRECT'
  | 'INDIRECT'
  | 'PARTIAL'
  | 'POTENTIAL'
  | 'CONFLICTING'
  | 'IRRELEVANT';

export type MappingStatus =
  | 'PROPOSED'
  | 'REVIEW_REQUIRED'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'SUPERSEDED';

export type RequirementCoverageState =
  | 'NO_EVIDENCE'
  | 'PARTIAL'
  | 'COVERED'
  | 'AMBIGUOUS'
  | 'CONFLICTING';

export interface MatchingSignals {
  documentTypeMatch: number;
  fieldMatch: number;
  categoryMatch: number;
  keywordMatch: number;
  semanticMatch: number;
  expectedEvidenceMatch?: number;
  explanation?: string;
  sourceContext?: {
    documentName?: string;
    documentType?: string;
    pageNumber?: number;
    sourceText?: string;
  };
}

export interface RequirementEvidenceMapping {
  id: string;
  tenderRequirementId: string;
  bidderId: string;
  bidSubmissionId: string;
  evidenceId: string;
  mappingType: MappingType;
  status: MappingStatus;
  confidence: number;
  reason: string;
  matchedField: string | null;
  matchedCategory: string | null;
  matchingSignals: MatchingSignals | null;
  source: string;
  createdBy: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewReason: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface RequirementCoverageSummary {
  requirementId: string;
  requirementCode: string;
  requirementText: string;
  category: string;
  expectedEvidence: string[];
  coverageState: RequirementCoverageState;
  mappedEvidenceCount: number;
  confirmedCount: number;
  reviewRequiredCount: number;
  missingExpectedEvidence: string[];
  mappings: RequirementEvidenceMapping[];
  explanation: string;
}

export interface BidderCoverageSummary {
  bidderId: string;
  totalRequirements: number;
  coveredCount: number;
  partialCount: number;
  noEvidenceCount: number;
  ambiguousCount: number;
  conflictingCount: number;
  requirementSummaries: RequirementCoverageSummary[];
}
