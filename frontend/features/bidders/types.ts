export type BidderStatus = 'ACTIVE' | 'WITHDRAWN' | 'ARCHIVED';

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'WITHDRAWN';

export type BidDocumentType =
  | 'FINANCIAL_STATEMENT'
  | 'CA_CERTIFICATE'
  | 'GST_CERTIFICATE'
  | 'PAN_DOCUMENT'
  | 'UDYAM_MSME_CERTIFICATE'
  | 'STARTUP_CERTIFICATE'
  | 'NSIC_CERTIFICATE'
  | 'EPFO_ESIC_DOCUMENT'
  | 'EXPERIENCE_CERTIFICATE'
  | 'OEM_AUTHORIZATION'
  | 'MAKE_IN_INDIA_LOCAL_CONTENT'
  | 'BID_SECURITY'
  | 'TECHNICAL_COMPLIANCE_DOCUMENT'
  | 'BLACKLISTING_DECLARATION'
  | 'DECLARATION_AFFIDAVIT'
  | 'COMPANY_REGISTRATION'
  | 'OTHER'
  | 'UNKNOWN';

export type ClassificationStatus = 'PENDING' | 'CLASSIFIED' | 'REVIEW_REQUIRED' | 'UNKNOWN' | 'FAILED';

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

export type RequirementCategory =
  | 'ELIGIBILITY'
  | 'FINANCIAL'
  | 'TECHNICAL'
  | 'STATUTORY'
  | 'POLICY'
  | 'TENDER_SPECIFIC';

export interface EvidenceBlock {
  id: string;
  pageId: string;
  blockType: string;
  content: string;
  sequence: number;
  confidence: number | null;
}

export interface DocumentPage {
  id: string;
  bidDocumentId?: string;
  pageNumber: number;
  processingStatus: string;
  hasTextLayer: boolean;
  ocrUsed: boolean;
  textContent: string;
  textConfidence: number | null;
  reviewRequired: boolean;
  evidenceBlocks?: EvidenceBlock[];
}

export interface BidDocument {
  id: string;
  bidSubmissionId: string;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  pageCount: number;
  documentType: BidDocumentType;
  classificationStatus: ClassificationStatus;
  classificationConfidence: number | null;
  classificationReason: string | null;
  possibleRequirementCategories: RequirementCategory[];
  possibleRequirementIds: string[];
  reviewRequired: boolean;
  originalClassification?: any;
  humanReviewed: boolean;
  reviewedBy: string | null;
  reviewedAt: string | null;
  processingStatus: DocumentProcessingStatus;
  processingProgress: number;
  currentStage: string;
  ocrUsed: boolean;
  processingStartedAt?: string | null;
  processingCompletedAt?: string | null;
  processingError?: string | null;
  uploadedById?: string | null;
  createdAt: string;
  updatedAt: string;
  pages?: DocumentPage[];
}

export interface BidSubmission {
  id: string;
  tenderId: string;
  bidderId: string;
  submissionReference: string;
  status: SubmissionStatus;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: BidDocument[];
}

export interface Bidder {
  id: string;
  tenderId: string;
  bidderCode: string;
  legalName: string;
  displayName: string | null;
  status: BidderStatus;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  submissions?: BidSubmission[];
  documentCount?: number;
  classifiedCount?: number;
  reviewRequiredCount?: number;
  failedCount?: number;
}

export const BID_DOCUMENT_TYPE_LABELS: Record<BidDocumentType, string> = {
  FINANCIAL_STATEMENT: 'Financial Statement / Balance Sheet',
  CA_CERTIFICATE: 'CA Turnover Certificate (with UDIN)',
  GST_CERTIFICATE: 'GST Registration Certificate',
  PAN_DOCUMENT: 'PAN Card / Tax Identity',
  UDYAM_MSME_CERTIFICATE: 'Udyam MSME Certificate',
  STARTUP_CERTIFICATE: 'DPIIT Startup Recognition Certificate',
  NSIC_CERTIFICATE: 'NSIC Registration Certificate',
  EPFO_ESIC_DOCUMENT: 'EPFO / ESIC Registration Document',
  EXPERIENCE_CERTIFICATE: 'Past Experience / Work Order Certificate',
  OEM_AUTHORIZATION: 'OEM / Manufacturer Authorization Form',
  MAKE_IN_INDIA_LOCAL_CONTENT: 'Make In India Local Content Declaration',
  BID_SECURITY: 'Bid Security / EMD / Bank Guarantee',
  TECHNICAL_COMPLIANCE_DOCUMENT: 'Technical Specification Compliance Matrix',
  BLACKLISTING_DECLARATION: 'Non-Blacklisting Affidavit / Declaration',
  DECLARATION_AFFIDAVIT: 'General Affidavit / Statutory Declaration',
  COMPANY_REGISTRATION: 'Company Registration / Incorporation Certificate',
  OTHER: 'Other Supporting Document',
  UNKNOWN: 'Unknown / Unclassified Document',
};
