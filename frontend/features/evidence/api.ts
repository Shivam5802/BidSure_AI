import { request } from '@/lib/api/client';
import {
  ExtractedEvidence,
  EvidenceExtractionRun,
  EvidenceDocumentResponse,
  HumanCorrectionPayload,
  AddManualEvidencePayload,
} from './types';

export const evidenceApi = {
  triggerExtraction: (documentId: string) =>
    request<EvidenceExtractionRun>(`api/bid-documents/${documentId}/extract-evidence`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  getEvidenceForDocument: (documentId: string) =>
    request<EvidenceDocumentResponse>(`api/bid-documents/${documentId}/evidence`),

  getEvidenceById: (evidenceId: string) =>
    request<{ evidence: ExtractedEvidence; auditLogs: any[] }>(`api/evidence/${evidenceId}`),

  updateEvidenceByHuman: (evidenceId: string, data: HumanCorrectionPayload) =>
    request<ExtractedEvidence>(`api/evidence/${evidenceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),

  verifyEvidenceFact: (evidenceId: string, reviewer?: string) =>
    request<ExtractedEvidence>(`api/evidence/${evidenceId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ reviewer }),
      headers: { 'Content-Type': 'application/json' },
    }),

  rejectEvidenceFact: (evidenceId: string, reason: string, reviewer?: string) =>
    request<ExtractedEvidence>(`api/evidence/${evidenceId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, reviewer }),
      headers: { 'Content-Type': 'application/json' },
    }),

  addManualEvidence: (documentId: string, data: AddManualEvidencePayload) =>
    request<ExtractedEvidence>(`api/bid-documents/${documentId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),
};
