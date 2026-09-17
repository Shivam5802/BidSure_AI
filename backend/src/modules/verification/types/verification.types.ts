import {
  VerificationType,
  VerificationRequestStatus,
  VerificationProviderMode,
  VerificationResultStatus,
  VerificationComparisonType,
  VerificationComparisonStatus,
} from '@prisma/client';

export {
  VerificationType,
  VerificationRequestStatus,
  VerificationProviderMode,
  VerificationResultStatus,
  VerificationComparisonType,
  VerificationComparisonStatus,
};

export type FieldPresence = 'present' | 'missing' | 'unknown' | 'not_supported';

export interface NormalizedVerificationField<T = unknown> {
  value: T | null;
  presence: FieldPresence;
  rawString?: string;
}

export interface NormalizedVerificationResult {
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
  fieldMap?: Record<string, NormalizedVerificationField>;
}

export interface VerificationRequestOptions {
  tenderId: string;
  bidderId: string;
  bidSubmissionId: string;
  requirementId?: string;
  evidenceId?: string;
  verificationType: VerificationType;
  providerCode?: string;
  requestedIdentifier: string;
  requestedFields?: string[];
  requestedById?: string;
}

export interface VerificationExecutionRequest {
  requestId: string;
  tenderId: string;
  bidderId: string;
  bidSubmissionId: string;
  requirementId?: string;
  evidenceId?: string;
  verificationType: VerificationType;
  providerCode: string;
  requestedIdentifier: string;
  requestedFields?: string[];
  requestedById?: string;
}

export interface VerificationAdapterResult {
  providerCode: string;
  providerName: string;
  providerMode: VerificationProviderMode;
  status: VerificationResultStatus;
  responseSnapshot: Record<string, unknown>;
  normalizedResult: NormalizedVerificationResult;
  matchSummary?: string;
  confidence?: number;
  sourceReference?: string;
  verifiedAt: Date;
  expiresAt?: Date;
  errorCode?: string;
  errorMessage?: string;
}

export interface VerificationAdapter {
  providerCode: string;
  providerName: string;
  providerMode: VerificationProviderMode;
  supportedVerificationTypes: VerificationType[];

  verify(request: VerificationExecutionRequest): Promise<VerificationAdapterResult>;
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

export interface CrossCheckFieldPair {
  fieldKey: string;
  evidenceValue: string | null;
  verifiedValue: string | null;
  comparisonType: VerificationComparisonType;
}

export interface CrossCheckResultItem {
  fieldKey: string;
  evidenceValue: string | null;
  verifiedValue: string | null;
  comparisonType: VerificationComparisonType;
  comparisonStatus: VerificationComparisonStatus;
  differenceSummary?: string;
  comparisonMethod: string;
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

export enum VerificationErrorCode {
  VERIFICATION_PROVIDER_NOT_FOUND = 'VERIFICATION_PROVIDER_NOT_FOUND',
  VERIFICATION_PROVIDER_UNAVAILABLE = 'VERIFICATION_PROVIDER_UNAVAILABLE',
  VERIFICATION_TIMEOUT = 'VERIFICATION_TIMEOUT',
  VERIFICATION_INVALID_RESPONSE = 'VERIFICATION_INVALID_RESPONSE',
  VERIFICATION_INVALID_IDENTIFIER = 'VERIFICATION_INVALID_IDENTIFIER',
  VERIFICATION_NOT_AUTHORIZED = 'VERIFICATION_NOT_AUTHORIZED',
  VERIFICATION_MISSING_EVIDENCE = 'VERIFICATION_MISSING_EVIDENCE',
  VERIFICATION_CONFIGURATION_ERROR = 'VERIFICATION_CONFIGURATION_ERROR',
  VERIFICATION_DUPLICATE_REQUEST = 'VERIFICATION_DUPLICATE_REQUEST',
}
