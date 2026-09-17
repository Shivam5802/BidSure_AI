import {
  ConflictType,
  ConflictStatus,
  ConflictSeverity,
  ConflictRole,
} from '@prisma/client';

export { ConflictType, ConflictStatus, ConflictSeverity, ConflictRole };

export interface NormalizedComparableFact {
  evidenceId: string;
  bidDocumentId: string;
  documentPageId?: string | null;
  fieldKey: string;
  fieldLabel: string;
  rawValue: string;
  normalizedValue: any;
  valueType: string;
  unit?: string | null;
  entityReference?: string | null;
  financialYear?: string | null;
  normalizedPeriod?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  sourceDate?: string | null;
  documentType: string;
  documentName: string;
  pageNumber: number;
  confidence: number;
  evidenceStatus: string;
  sourceText: string;
}

export enum ComparabilityResultType {
  CANDIDATE_COMPARISON = 'CANDIDATE_COMPARISON',
  DIFFERENT_PERIOD = 'DIFFERENT_PERIOD',
  DIFFERENT_ENTITY = 'DIFFERENT_ENTITY',
  EQUAL_VALUE = 'EQUAL_VALUE',
  AMBIGUOUS_COMPARISON = 'AMBIGUOUS_COMPARISON',
  INSUFFICIENT_CONTEXT = 'INSUFFICIENT_CONTEXT',
}

export interface ComparabilityCheckResult {
  type: ComparabilityResultType;
  reason: string;
  fieldKey: string;
  period1?: string | null;
  period2?: string | null;
  entity1?: string | null;
  entity2?: string | null;
}

export interface DetectedConflictDraft {
  tenderId: string;
  bidderId: string;
  bidSubmissionId: string;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  status: ConflictStatus;
  fieldKey: string;
  description: string;
  fingerprint: string;
  confidence: number;
  contextSnapshot: Record<string, any>;
  detectedBy: string;
  detectorVersion: string;
  requiresInvestigation: boolean;
  items: {
    evidenceId: string;
    role: ConflictRole;
    normalizedValueSnapshot: any;
    sourceSnapshot: Record<string, any>;
  }[];
}

export interface ConflictGraphNode {
  id: string;
  type:
    | 'TENDER'
    | 'REQUIREMENT'
    | 'RULE'
    | 'EVALUATION'
    | 'BIDDER'
    | 'DOCUMENT'
    | 'PAGE'
    | 'EVIDENCE'
    | 'CONFLICT'
    | 'INVESTIGATION';
  label: string;
  sublabel?: string;
  status?: string;
  severity?: string;
  metadata?: Record<string, any>;
}

export interface ConflictGraphEdge {
  id: string;
  source: string;
  target: string;
  label:
    | 'REQUIRES'
    | 'TESTED_BY'
    | 'SUPPORTED_BY'
    | 'EXTRACTED_FROM'
    | 'LOCATED_ON'
    | 'CONFLICTS_WITH'
    | 'INVESTIGATED_BY';
}

export interface ConflictGraphData {
  nodes: ConflictGraphNode[];
  edges: ConflictGraphEdge[];
}

export interface UpdateConflictStatusDTO {
  status: ConflictStatus;
  resolution?: string;
  resolutionReason?: string;
  reviewerId?: string;
}

export interface DetectConflictsDTO {
  bidderId: string;
  tenderId?: string;
  triggerSource?: string;
}
