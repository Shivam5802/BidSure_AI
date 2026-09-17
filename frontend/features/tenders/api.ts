import { api, API_BASE_URL, ApiError } from '@/lib/api/client';
import {
  Tender,
  TenderDetailsResponse,
  TenderDocument,
  DocumentWithPages,
  DocumentPage,
  CreateTenderPayload,
} from './types';

export const tenderApi = {
  createTender: (payload: CreateTenderPayload): Promise<Tender> =>
    api.post<Tender>('api/tenders', payload),

  getTender: (tenderId: string): Promise<TenderDetailsResponse> =>
    api.get<TenderDetailsResponse>(`api/tenders/${tenderId}`),

  listTenders: (): Promise<Tender[]> => api.get<Tender[]>('api/tenders'),

  uploadDocuments: async (tenderId: string, files: File[]): Promise<{ uploaded: TenderDocument[] }> => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    const url = `${API_BASE_URL.replace(/\/$/, '')}/api/tenders/${tenderId}/documents`;

    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json().catch(() => {
      throw new ApiError('INVALID_JSON', 'Failed to parse upload response');
    });

    if (!json.success || !res.ok) {
      throw new ApiError(
        json.error?.code || `HTTP_${res.status}`,
        json.error?.message || 'Upload failed',
        json.error?.details
      );
    }

    return json.data;
  },

  startProcessing: (
    tenderId: string,
    documentIds?: string[]
  ): Promise<{ jobId: string; documentIds: string[]; status: string }> =>
    api.post<{ jobId: string; documentIds: string[]; status: string }>(
      `api/tenders/${tenderId}/documents/process`,
      { documentIds }
    ),

  getDocumentStatus: (
    tenderId: string,
    documentId: string
  ): Promise<{
    id: string;
    processingStatus: string;
    processingProgress: number;
    currentStage: string;
    ocrUsed: boolean;
    pageCount: number;
    error: string | null;
  }> =>
    api.get(`api/tenders/${tenderId}/documents/${documentId}/status`),

  getDocument: (tenderId: string, documentId: string): Promise<DocumentWithPages> =>
    api.get<DocumentWithPages>(`api/tenders/${tenderId}/documents/${documentId}`),

  getDocumentPage: (
    tenderId: string,
    documentId: string,
    pageNumber: number
  ): Promise<DocumentPage> =>
    api.get<DocumentPage>(`api/tenders/${tenderId}/documents/${documentId}/pages/${pageNumber}`),

  retryDocument: (tenderId: string, documentId: string): Promise<{ retrying: boolean }> =>
    api.post<{ retrying: boolean }>(`api/tenders/${tenderId}/documents/${documentId}/retry`),
};
