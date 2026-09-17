export type VerificationType =
  | 'GST'
  | 'PAN'
  | 'UDYAM'
  | 'STARTUP_INDIA'
  | 'NSIC'
  | 'EPFO_ESIC'
  | 'DIGILOCKER'
  | 'MCA'
  | 'MAKE_IN_INDIA'
  | 'OEM_AUTHORIZATION'
  | 'BLACKLISTING'
  | 'DEBARMENT';

export type VerificationRequestStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'MATCH'
  | 'MISMATCH'
  | 'UNAVAILABLE'
  | 'ERROR'
  | 'REVIEW_REQUIRED'
  | 'CANCELLED';

export type VerificationProviderMode = 'MOCK' | 'SANDBOX' | 'LIVE';

export type VerificationResultStatus =
  | 'MATCH'
  | 'MISMATCH'
  | 'UNAVAILABLE'
  | 'ERROR'
  | 'REVIEW_REQUIRED'
  | 'NOT_FOUND';

export type VerificationComparisonType =
  | 'IDENTIFIER_MATCH'
  | 'ENTITY_NAME_MATCH'
  | 'DATE_MATCH'
  | 'STATUS_MATCH'
  | 'ADDRESS_MATCH'
  | 'CATEGORY_MATCH'
  | 'PERCENTAGE_MATCH'
  | 'BOOLEAN_MATCH';

export type VerificationComparisonStatus =
  | 'MATCH'
  | 'MISMATCH'
  | 'NOT_COMPARABLE'
  | 'MISSING_EVIDENCE'
  | 'MISSING_VERIFICATION_FIELD'
  | 'REVIEW_REQUIRED';

export interface VerificationComparison {
  id: string;
  verificationResultId: string;
  evidenceId?: string | null;
  fieldKey: string;
  evidenceValue?: string | null;
  verifiedValue?: string | null;
  comparisonType: VerificationComparisonType;
  comparisonStatus: VerificationComparisonStatus;
  differenceSummary?: string | null;
  comparisonMethod: string;
  createdAt: string;
}

export interface VerificationResult {
  id: string;
  verificationRequestId: string;
  providerCode: string;
  providerName: string;
  providerMode: VerificationProviderMode;
  status: VerificationResultStatus;
  responseSnapshot: Record<string, unknown>;
  normalizedResult: {
    identifier: string;
    legalName?: string | null;
    registrationStatus?: string | null;
    registrationDate?: string | null;
    validityDate?: string | null;
    entityType?: string | null;
    address?: string | null;
    category?: string | null;
    percentage?: number | null;
    sourceTimestamp?: string | null;
    additionalAttributes?: Record<string, unknown>;
  };
  matchSummary?: string | null;
  confidence?: number | null;
  sourceReference?: string | null;
  verifiedAt: string;
  expiresAt?: string | null;
  comparisons?: VerificationComparison[];
}

export interface VerificationRequest {
  id: string;
  tenderId: string;
  bidderId: string;
  bidSubmissionId: string;
  requirementId?: string | null;
  evidenceId?: string | null;
  verificationType: VerificationType;
  providerCode: string;
  status: VerificationRequestStatus;
  requestedIdentifier: string;
  requestedFields?: string[] | null;
  requestSnapshot?: Record<string, unknown> | null;
  requestedById?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  tender?: { id: string; referenceNumber: string; title: string };
  bidder?: { id: string; legalName: string; bidderCode: string };
  submission?: { id: string; submissionReference: string };
  requirement?: { id: string; requirementCode: string; requirementText: string };
  evidence?: { id: string; fieldKey: string; rawValue: string; sourceText: string; pageNumber: number };
  results?: VerificationResult[];
}

export interface ProviderMetadata {
  providerCode: string;
  providerName: string;
  verificationTypes: VerificationType[];
  mode: VerificationProviderMode;
  enabled: boolean;
  supportsLive: boolean;
  description: string;
}

export interface VerificationSummaryDTO {
  totalCount: number;
  matchCount: number;
  mismatchCount: number;
  reviewRequiredCount: number;
  unavailableCount: number;
  notFoundCount: number;
  errorCount: number;
}
