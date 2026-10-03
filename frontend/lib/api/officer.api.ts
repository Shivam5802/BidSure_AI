import { request } from './client';

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
  createdAt: string;
  officerId: string;
  officerName: string;
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

export const officerApi = {
  async getDashboardStats(): Promise<OfficerDashboardStats> {
    const res = await request<{ success: boolean; data: OfficerDashboardStats }>('/api/officer/dashboard-stats');
    return res.data;
  },

  async getReceivedBids(tenderId?: string, status?: string): Promise<OfficerBidItem[]> {
    const params = new URLSearchParams();
    if (tenderId) params.append('tenderId', tenderId);
    if (status && status !== 'ALL') params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
      const res = await request<{ success: boolean; data: OfficerBidItem[] }>(`/api/officer/bids${qs}`);
      return Array.isArray(res?.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  async recordDecision(data: {
    applicationId: string;
    decision: 'QUALIFIED' | 'NOT_QUALIFIED' | 'CLARIFICATION_REQUIRED' | 'UNDER_REVIEW';
    reason: string;
    relevantRequirement?: string;
    reviewedEvidence?: string[];
  }): Promise<{ success: boolean; decision: string; reason: string; officer: string; timestamp: string }> {
    const res = await request<{ success: boolean; data: any }>('/api/officer/decisions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async listClarifications(filters?: { tenderId?: string; bidderId?: string; status?: string }): Promise<ClarificationRequestItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.tenderId) params.append('tenderId', filters.tenderId);
      if (filters?.bidderId) params.append('bidderId', filters.bidderId);
      if (filters?.status) params.append('status', filters.status);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await request<{ success: boolean; data: ClarificationRequestItem[] }>(`/api/officer/clarifications${qs}`);
      return Array.isArray(res?.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  async createClarification(data: {
    tenderId: string;
    bidderId: string;
    applicationId?: string;
    requirementId?: string;
    requirementTitle?: string;
    documentId?: string;
    subject: string;
    question: string;
    deadline: string;
  }): Promise<ClarificationRequestItem> {
    const res = await request<{ success: boolean; data: ClarificationRequestItem }>('/api/officer/clarifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async listNotifications(): Promise<OfficerNotificationItem[]> {
    try {
      const res = await request<{ success: boolean; data: OfficerNotificationItem[] }>('/api/officer/notifications');
      return Array.isArray(res?.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const res = await request<{ success: boolean }>(`/api/officer/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return res.success;
  },

  async markAllNotificationsRead(): Promise<boolean> {
    const res = await request<{ success: boolean }>('/api/officer/notifications/read-all', {
      method: 'POST',
    });
    return res.success;
  },
};
