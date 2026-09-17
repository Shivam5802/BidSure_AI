export type EvidenceValueType =
  | 'STRING'
  | 'CURRENCY'
  | 'PERCENTAGE'
  | 'DATE'
  | 'IDENTIFIER'
  | 'INTEGER'
  | 'DECIMAL'
  | 'BOOLEAN'
  | 'ENTITY'
  | 'ADDRESS';

export type EvidenceStatus =
  | 'EXTRACTED'
  | 'REVIEW_REQUIRED'
  | 'VERIFIED_BY_HUMAN'
  | 'REJECTED';

export type ExtractionMethod =
  | 'AI_EXTRACTION'
  | 'OCR'
  | 'TEXT_EXTRACTION'
  | 'HUMAN_VERIFIED';

export type ExtractionRunStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export interface EvidenceExtractionRun {
  id: string;
  bidDocumentId: string;
  status: ExtractionRunStatus;
  extractorVersion: string;
  schemaVersion: string;
  startedAt: string;
  completedAt?: string | null;
  error?: string | null;
}

export interface ExtractedEvidence {
  id: string;
  bidDocumentId: string;
  documentPageId?: string | null;
  evidenceBlockId?: string | null;
  extractionRunId?: string | null;
  fieldKey: string;
  fieldLabel: string;
  rawValue: string;
  normalizedValue?: any;
  valueType: EvidenceValueType;
  unit?: string | null;
  sourceText: string;
  pageNumber: number;
  boundingBox?: Record<string, unknown> | null;
  confidence: number;
  extractionMethod: ExtractionMethod;
  status: EvidenceStatus;
  conflictFlag: boolean;
  conflictReason?: string | null;
  reviewReason?: string | null;
  originalValue?: any;
  humanReviewed: boolean;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceSummary {
  totalExtracted: number;
  highConfidence: number;
  reviewRequired: number;
  humanVerified: number;
  conflicts: number;
}

export interface EvidenceDocumentResponse {
  document: {
    id: string;
    originalFilename: string;
    documentType: string;
    bidSubmissionId: string;
  };
  latestRun: EvidenceExtractionRun | null;
  evidence: ExtractedEvidence[];
  summary: EvidenceSummary;
}

export interface HumanCorrectionPayload {
  rawValue: string;
  normalizedValue?: any;
  valueType?: EvidenceValueType;
  unit?: string;
  reason: string;
  reviewer?: string;
}

export interface AddManualEvidencePayload {
  fieldKey: string;
  rawValue: string;
  pageNumber?: number;
  sourceText: string;
  reviewer?: string;
  reason?: string;
}
