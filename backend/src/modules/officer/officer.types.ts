export interface OfficerDashboardStats {
  totalTenders: number;
  activeTenders: number;
  totalBids: number;
  bidsAwaitingReview: number;
  complianceCompleted: number;
  bidsRequiringManualReview: number;
  missingDocumentsCount: number;
  upcomingDeadlines: Array<{
    tenderId: string;
    tenderReference: string;
    title: string;
    closingDate: string;
    daysRemaining: number;
    bidCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    timestamp: string;
    type: string;
    description: string;
    tenderReference?: string;
    actor: string;
  }>;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface OfficerBidItem {
  id: string;
  applicationNumber: string;
  tenderId: string;
  tenderTitle: string;
  tenderReference: string;
  bidderId: string;
  bidderName: string;
  submittedAt: string | null;
  status: string;
  documentCompleteness: number; // 0-100%
  totalDocumentsSubmitted: number;
  requiredDocumentsCount: number;
  complianceScore: number;
  riskLevel: RiskLevel;
  pendingVerificationCount: number;
  verifiedChecksCount: number;
  failedChecksCount: number;
  missingDocuments: string[];
  manualReviewRequired: boolean;
  isSimulated: boolean;
  officerDecision: string | null;
  officerNotes: string | null;
  evaluatedAt: string | null;
}

export interface ClarificationRequestItem {
  id: string;
  tenderId: string;
  tenderReference: string;
  bidderId: string;
  bidderName: string;
  applicationId?: string;
  requirementId?: string | null;
  requirementTitle?: string | null;
  documentId?: string | null;
  subject: string;
  question: string;
  deadline: string;
  status: 'PENDING' | 'RESPONDED' | 'EXPIRED' | 'CLOSED';
  bidderResponse?: string | null;
  responseSubmittedAt?: string | null;
  responseDocuments?: Array<{ id: string; name: string; url?: string; storageKey?: string }>;
  createdAt: string;
  officerId: string;
  officerName: string;
}

export interface CreateClarificationInput {
  tenderId: string;
  bidderId: string;
  applicationId?: string;
  requirementId?: string;
  requirementTitle?: string;
  documentId?: string;
  subject: string;
  question: string;
  deadline: string;
}

export interface RecordOfficerDecisionInput {
  applicationId: string;
  decision: 'QUALIFIED' | 'NOT_QUALIFIED' | 'CLARIFICATION_REQUIRED' | 'UNDER_REVIEW';
  reason: string;
  relevantRequirement?: string;
  reviewedEvidence?: string[];
}

export interface OfficerNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'BID_SUBMITTED' | 'CLARIFICATION_REPLIED' | 'EVALUATION_DONE' | 'DEADLINE_ALERT' | 'COMPLIANCE_WARNING';
  tenderId?: string;
  bidderName?: string;
  read: boolean;
  createdAt: string;
}
