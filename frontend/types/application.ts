export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CLARIFICATION_REQUIRED'
  | 'EVALUATING'
  | 'QUALIFIED'
  | 'NOT_QUALIFIED'
  | 'WITHDRAWN';

export interface BidderCompanyProfile {
  companyName: string;
  companyType?: string;
  gstin?: string;
  pan?: string;
  registeredAddress?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ApplicationDocument {
  id: string;
  originalFilename: string;
  documentType: string;
  fileSize: number;
  mimeType: string;
  status: string;
  uploadedAt: string | Date;
  storageKey?: string;
}

export interface TenderApplicationData {
  id: string;
  tenderId: string;
  bidderId: string;
  userId: string;
  applicationNumber: string;
  status: ApplicationStatus;
  companyDetails: BidderCompanyProfile;
  documents: ApplicationDocument[];
  submittedAt: string | Date | null;
  clarificationNotes: string | null;
  officerDecision: string | null;
  officerNotes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PublishedTenderSummary {
  id: string;
  tenderNumber: string;
  title: string;
  organization: string;
  department?: string;
  estimatedValue?: number;
  currency?: string;
  submissionDeadline?: string | Date;
  status: string;
  publishedAt?: string | Date;
  summary?: string;
  requirementsCount: number;
  categories: string[];
}

export interface PublishedTenderDetail extends PublishedTenderSummary {
  description?: string;
  requirements: Array<{
    id: string;
    requirementNumber: string;
    description: string;
    category: string;
    mandatory: boolean;
    verificationMethod?: string;
    acceptanceCriteria?: string;
  }>;
  eligibilityChecklist: Array<{
    category: string;
    title: string;
    description: string;
    mandatory: boolean;
    recommendedDocument: string;
  }>;
}

export interface OfficerItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  department?: string;
  designation?: string;
  phone?: string;
  createdAt: string | Date;
  lastLoginAt?: string | Date | null;
}
