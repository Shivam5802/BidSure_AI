export type BusinessType =
  | 'Proprietorship'
  | 'Partnership'
  | 'LLP'
  | 'Private Limited'
  | 'Public Limited'
  | 'Other';

export type RegistrationVerificationStatus =
  | 'NOT_SUBMITTED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'VERIFICATION_FAILED'
  | 'EXPIRED'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'NOT_APPLICABLE';

export type DocumentCategory =
  | 'REGISTRATION'
  | 'CERTIFICATE'
  | 'FINANCIAL_RECORD'
  | 'DECLARATION'
  | 'TECHNICAL'
  | 'EXPERIENCE'
  | 'OTHER';

export interface TurnoverRecord {
  financialYear: string; // e.g. 'FY 2021-22'
  turnoverInCrores: number;
  audited: boolean;
  auditorFirm?: string;
}

export interface VendorProfileData {
  id: string;
  userId: string;
  legalName: string;
  tradeName?: string | null;
  businessType: BusinessType;
  companyRegistrationNumber?: string | null;
  dateOfEstablishment?: string | null;
  category?: string | null;
  registeredAddress: string;
  state?: string | null;
  district?: string | null;
  city?: string | null;
  pinCode?: string | null;
  websiteUrl?: string | null;
  companyDescription?: string | null;
  logoUrl?: string | null;
  turnoverDetails?: TurnoverRecord[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthorizedRepresentativeData {
  id: string;
  vendorProfileId: string;
  fullName: string;
  designation: string;
  officialEmail: string;
  mobileNumber: string;
  signatoryDetails?: string | null;
  powerOfAttorneyUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorRegistrationData {
  id: string;
  vendorProfileId: string;
  registrationType: string; // 'PAN' | 'GSTIN' | 'UDYAM' | 'STARTUP_INDIA' | 'NSIC' | 'OEM_AUTHORIZATION' | 'EPFO_ESIC' | 'MAKE_IN_INDIA' | 'OTHER'
  registrationNumber: string;
  issuingAuthority: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  documentUrl?: string | null;
  documentName?: string | null;
  verificationStatus: RegistrationVerificationStatus;
  verificationSource?: string | null;
  failureReason?: string | null;
  lastVerifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorDocumentData {
  id: string;
  vendorProfileId: string;
  category: DocumentCategory;
  documentType: string;
  title: string;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  version: number;
  verificationStatus: RegistrationVerificationStatus;
  rejectionReason?: string | null;
  uploadedAt: Date;
  updatedAt: Date;
}

export interface ComplianceIssueData {
  id: string;
  vendorProfileId: string;
  issueType: 'MISMATCH' | 'EXPIRED' | 'MISSING_MANDATORY' | 'CONFLICTING_DATES' | 'UNVERIFIED';
  fieldKey: string;
  affectedDocument?: string | null;
  detectedValue?: string | null;
  expectedValue?: string | null;
  reason: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedAction: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorNotificationData {
  id: string;
  vendorProfileId: string;
  title: string;
  message: string;
  type: 'EXPIRY_WARNING' | 'VERIFICATION_SUCCESS' | 'VERIFICATION_FAILED' | 'CLARIFICATION_REQUEST' | 'TENDER_DEADLINE' | 'COMPLIANCE_ALERT';
  read: boolean;
  actionUrl?: string | null;
  createdAt: Date;
}

export interface VendorOverviewMetrics {
  profileCompletionPercent: number;
  totalRequiredDocuments: number;
  documentsSubmitted: number;
  documentsVerified: number;
  documentsPending: number;
  missingDocuments: number;
  expiredDocuments: number;
  activeInconsistencies: number;
  registrationsAwaitingVerification: number;
  activeTendersCount: number;
  submittedBidsCount: number;
  pendingCorrectionsCount: number;
  upcomingDeadlines: Array<{
    tenderId: string;
    title: string;
    referenceNumber: string;
    closingDate: string;
    daysRemaining: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    type: string;
  }>;
}
