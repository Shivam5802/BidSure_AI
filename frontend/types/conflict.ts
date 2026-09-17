export type ConflictType =
  | 'ENTITY_NAME_CONFLICT'
  | 'IDENTIFIER_CONFLICT'
  | 'NUMERIC_VALUE_CONFLICT'
  | 'DATE_CONFLICT'
  | 'VALIDITY_CONFLICT'
  | 'PERCENTAGE_CONFLICT'
  | 'BOOLEAN_CONFLICT'
  | 'COUNT_CONFLICT'
  | 'PERIOD_CONFLICT'
  | 'DOCUMENT_CONTEXT_CONFLICT';

export type ConflictStatus =
  | 'DETECTED'
  | 'UNDER_REVIEW'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'DISMISSED'
  | 'SUPERSEDED';

export type ConflictSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ConflictRole = 'CONFLICTING_SOURCE' | 'SUPPORTING_SOURCE' | 'CONTEXT_SOURCE';

export interface EvidenceConflictItem {
  id: string;
  conflictId: string;
  evidenceId: string;
  role: ConflictRole;
  normalizedValueSnapshot?: any;
  sourceSnapshot?: {
    rawValue?: string;
    documentName?: string;
    documentType?: string;
    pageNumber?: number;
    sourceText?: string;
  };
  evidence?: {
    id: string;
    fieldKey: string;
    fieldLabel: string;
    rawValue: string;
    normalizedValue?: any;
    valueType: string;
    unit?: string | null;
    sourceText: string;
    pageNumber: number;
    bidDocumentId: string;
    bidDocument?: {
      id: string;
      originalFilename: string;
      documentType: string;
    };
  };
  createdAt: string;
}

export interface EvidenceConflict {
  id: string;
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
  contextSnapshot?: Record<string, any>;
  detectedBy: string;
  detectorVersion: string;
  requiresInvestigation: boolean;
  investigationId?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  resolution?: string | null;
  resolutionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: EvidenceConflictItem[];
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
