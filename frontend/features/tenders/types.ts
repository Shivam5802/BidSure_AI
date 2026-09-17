export type TenderStatus = 'DRAFT' | 'PROCESSING' | 'READY' | 'PARTIAL' | 'FAILED';

export type DocumentProcessingStatus =
  | 'UPLOADED'
  | 'VALIDATING'
  | 'STORED'
  | 'PROCESSING'
  | 'OCR_PROCESSING'
  | 'EXTRACTING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED';

export type DocumentPageStatus = 'COMPLETED' | 'PARTIAL' | 'FAILED';

export type EvidenceBlockType =
  | 'PARAGRAPH'
  | 'HEADING'
  | 'TABLE'
  | 'TABLE_ROW'
  | 'TABLE_CELL'
  | 'LIST'
  | 'HEADER'
  | 'FOOTER'
  | 'IMAGE'
  | 'OTHER';

export interface Tender {
  id: string;
  title: string;
  referenceNumber: string;
  organization: string;
  closingDate: string;
  description?: string | null;
  status: TenderStatus;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenderDocument {
  id: string;
  tenderId: string;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  pageCount: number;
  processingStatus: DocumentProcessingStatus;
  processingProgress: number;
  currentStage: string;
  ocrUsed: boolean;
  processingStartedAt?: string | null;
  processingCompletedAt?: string | null;
  processingError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceBlock {
  id: string;
  pageId: string;
  blockType: EvidenceBlockType;
  content: string;
  sequence: number;
  boundingBox?: Record<string, unknown> | null;
  confidence?: number | null;
  createdAt: string;
}

export interface DocumentPage {
  id: string;
  documentId: string;
  pageNumber: number;
  processingStatus: DocumentPageStatus;
  hasTextLayer: boolean;
  ocrUsed: boolean;
  textContent: string;
  textConfidence?: number | null;
  reviewRequired: boolean;
  createdAt: string;
  evidenceBlocks: EvidenceBlock[];
}

export interface DocumentWithPages extends TenderDocument {
  pages: DocumentPage[];
}

export interface TenderSummaryStatistics {
  documentCount: number;
  totalPages: number;
  processedPages: number;
  ocrPages: number;
  tablesDetected: number;
  reviewRequired: number;
  status: string;
}

export interface TenderDetailsResponse {
  tender: Tender & {
    documents: TenderDocument[];
    documentCount: number;
    totalPageCount: number;
  };
  statistics: TenderSummaryStatistics;
}

export interface CreateTenderPayload {
  title: string;
  referenceNumber: string;
  organization: string;
  closingDate: string;
  description?: string;
}
