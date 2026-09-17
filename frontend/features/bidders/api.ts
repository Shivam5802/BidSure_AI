import { request } from '@/lib/api/client';
import { Bidder, BidSubmission, BidDocument, BidDocumentType } from './types';

export const bidderApi = {
  createBidder: (tenderId: string, data: { bidderCode: string; legalName: string; displayName?: string }) =>
    request<{ bidder: Bidder; activeSubmission: BidSubmission }>(`api/tenders/${tenderId}/bidders`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),

  getBidders: (tenderId: string) =>
    request<Bidder[]>(`api/tenders/${tenderId}/bidders`),

  getBidderDetails: (tenderId: string, bidderId: string) =>
    request<{ bidder: Bidder; submissions: BidSubmission[] }>(`api/tenders/${tenderId}/bidders/${bidderId}`),

  getOrCreateSubmission: (tenderId: string, bidderId: string) =>
    request<BidSubmission>(`api/tenders/${tenderId}/bidders/${bidderId}/submissions`, {
      method: 'POST',
    }),

  uploadBidDocuments: async (submissionId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Native fetch for multipart formData uploads
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiBase}/api/bid-submissions/${submissionId}/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || err.message || 'Upload failed');
    }

    const data = await res.json();
    return data.data as Array<{ document: BidDocument; isDuplicate: boolean; message: string; error?: string }>;
  },

  getSubmissionDocuments: (submissionId: string) =>
    request<BidDocument[]>(`api/bid-submissions/${submissionId}/documents`),

  getBidDocumentDetails: (documentId: string) =>
    request<{ document: BidDocument; submission: BidSubmission; bidder: Bidder }>(`api/bid-documents/${documentId}`),

  updateClassification: (
    documentId: string,
    data: { documentType: BidDocumentType; reason?: string; reviewedBy?: string }
  ) =>
    request<BidDocument>(`api/bid-documents/${documentId}/classification`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }),

  retryProcessing: (documentId: string) =>
    request<{ message: string }>(`api/bid-documents/${documentId}/retry`, {
      method: 'POST',
    }),
};
