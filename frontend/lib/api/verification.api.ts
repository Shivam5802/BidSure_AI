import { api } from './client';
import {
  VerificationRequest,
  VerificationResult,
  VerificationComparison,
  ProviderMetadata,
  VerificationSummaryDTO,
  VerificationType,
} from '@/types/verification';

export async function createBidderVerification(
  bidderId: string,
  payload: {
    tenderId: string;
    bidSubmissionId: string;
    requirementId?: string;
    evidenceId?: string;
    verificationType: VerificationType;
    providerCode?: string;
    requestedIdentifier: string;
    requestedFields?: string[];
  }
): Promise<VerificationRequest> {
  return api.post<VerificationRequest>(`api/bidders/${bidderId}/verifications`, payload);
}

export async function getBidderVerifications(
  bidderId: string,
  query?: { verificationType?: string; status?: string }
): Promise<{ bidderId: string; count: number; verifications: VerificationRequest[] }> {
  const params = new URLSearchParams();
  if (query?.verificationType) params.set('verificationType', query.verificationType);
  if (query?.status) params.set('status', query.status);

  const qs = params.toString() ? `?${params.toString()}` : '';
  return api.get<{ bidderId: string; count: number; verifications: VerificationRequest[] }>(
    `api/bidders/${bidderId}/verifications${qs}`
  );
}

export async function getVerificationDetail(verificationId: string): Promise<VerificationRequest> {
  return api.get<VerificationRequest>(`api/verifications/${verificationId}`);
}

export async function getVerificationResult(verificationId: string): Promise<VerificationResult> {
  return api.get<VerificationResult>(`api/verifications/${verificationId}/result`);
}

export async function getVerificationComparison(
  verificationId: string
): Promise<{ verificationId: string; comparisons: VerificationComparison[] }> {
  return api.get<{ verificationId: string; comparisons: VerificationComparison[] }>(
    `api/verifications/${verificationId}/comparison`
  );
}

export async function retryVerification(
  verificationId: string,
  payload?: { providerCode?: string }
): Promise<VerificationRequest> {
  return api.post<VerificationRequest>(`api/verifications/${verificationId}/retry`, payload || {});
}

export async function verifyEvidence(
  evidenceId: string,
  payload: {
    tenderId: string;
    bidderId: string;
    verificationType?: VerificationType;
    providerCode?: string;
  }
): Promise<VerificationRequest> {
  return api.post<VerificationRequest>(`api/evidence/${evidenceId}/verify-external`, payload);
}

export async function getTenderVerificationSummary(
  tenderId: string
): Promise<{ tenderId: string; summary: VerificationSummaryDTO }> {
  return api.get<{ tenderId: string; summary: VerificationSummaryDTO }>(
    `api/tenders/${tenderId}/verifications/summary`
  );
}

export async function getVerificationProviders(): Promise<{ count: number; providers: ProviderMetadata[] }> {
  return api.get<{ count: number; providers: ProviderMetadata[] }>('api/verifications/providers');
}
