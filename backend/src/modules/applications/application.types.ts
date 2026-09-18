import { ApplicationStatus } from '@prisma/client';

export { ApplicationStatus };

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
  uploadedAt: Date;
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
  submittedAt: Date | null;
  clarificationNotes: string | null;
  officerDecision: string | null;
  officerNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
