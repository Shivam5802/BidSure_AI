import { request } from './client';

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    bidders: number;
    officers: number;
    admins: number;
  };
  tenders: {
    total: number;
    active: number;
    closed: number;
  };
  bids: {
    total: number;
    submitted: number;
    pendingReview: number;
    qualified: number;
    disqualified: number;
    failedVerifications: number;
  };
  incidents: {
    open: number;
    total: number;
  };
  integrations: {
    healthy: number;
    total: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    actor: string;
    category: string;
  }>;
  alerts: Array<{
    id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
    message: string;
    actionLink: string;
    actionLabel: string;
  }>;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'PROCUREMENT_OFFICER' | 'BIDDER';
  status: 'ACTIVE' | 'DISABLED';
  department: string;
  designation: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  completeness: number;
  verificationStatus: string;
  internalNotesCount: number;
}

export interface AdminUserDetail {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    department: string | null;
    designation: string | null;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
  };
  profile: any | null;
  applicationsCount: number;
  tendersCount: number;
  internalNotes: Array<{
    id: string;
    authorId: string;
    authorName: string;
    note: string;
    createdAt: string;
  }>;
}

export interface RolePermissionMatrix {
  roles: Array<{
    role: string;
    title: string;
    description: string;
    userCount: number;
    isImmutable: boolean;
  }>;
  permissions: Array<{
    id: string;
    category: string;
    label: string;
  }>;
  matrix: Record<string, string[]>;
}

export interface AdminTenderOverviewItem {
  id: string;
  referenceNumber: string;
  title: string;
  organization: string;
  status: string;
  closingDate: string;
  daysRemaining: number;
  officerName: string;
  officerEmail: string;
  bidCount: number;
  submittedBidsCount: number;
  qualifiedCount: number;
  disqualifiedCount: number;
  hasOperationalIssues: boolean;
}

export interface AdminBidMonitoringItem {
  id: string;
  applicationNumber: string;
  tenderId: string;
  tenderReference: string;
  tenderTitle: string;
  bidderId: string;
  bidderName: string;
  bidderEmail: string;
  submittedAt: string | null;
  status: string;
  documentsSubmitted: number;
  gstin: string;
  pan: string;
  officerDecision: string | null;
  officerNotes: string | null;
  verificationStatus: string;
  isStuck: boolean;
}

export interface StatutoryComplianceRule {
  id: string;
  ruleCode: string;
  name: string;
  category: string;
  description: string;
  applicability: string;
  mandatoryByDefault: boolean;
  enabled: boolean;
  version: number;
  parameters: Record<string, any>;
  changeHistory: Array<{
    version: number;
    changedBy: string;
    changedAt: string;
    reason: string;
    changes: Record<string, any>;
  }>;
}

export interface VerificationIntegrationItem {
  id: string;
  code: string;
  name: string;
  category: string;
  endpoint: string;
  mode: 'LIVE' | 'SANDBOX' | 'MOCK' | 'UNCONFIGURED';
  enabled: boolean;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNCONFIGURED';
  latencyMs: number;
  lastSuccessfulCheck: string | null;
  lastError: string | null;
  requestSuccessRate: number;
  environmentNote: string;
}

export interface AdminAuditLogEntry {
  id: string;
  event: string;
  actor: string;
  createdAt: string;
  tenderId?: string | null;
  metadata?: Record<string, any> | null;
}

export interface AdminSystemHealth {
  timestamp: string;
  status: string;
  backend: {
    status: string;
    runtime: string;
    uptimeSeconds: number;
    pid: number;
  };
  database: {
    status: string;
    engine: string;
    poolStatus: string;
    latencyMs: number;
  };
  aiEngine: {
    status: string;
    provider: string;
    quotaConsumedToday: number;
    quotaTotal: number;
    averageLatencyMs: number;
  };
  memory: {
    totalMB: number;
    usedMB: number;
    freeMB: number;
    usagePercent: number;
  };
  storage: {
    status: string;
    driver: string;
    usedMB: number;
    availableMB: number;
  };
  backgroundWorkers: {
    ocrQueueStatus: string;
    activeExtractionJobs: number;
    completedJobs24h: number;
    failedJobs24h: number;
  };
}

export interface AdminIncident {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  description: string;
  reportedBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolutionNotes: string | null;
  resolvedAt: string | null;
}

export interface PlatformSettings {
  platformName: string;
  organizationName: string;
  contactEmail: string;
  supportPhone: string;
  maxDocumentSizeMB: number;
  allowedFileTypes: string[];
  sessionTimeoutHours: number;
  auditRetentionDays: number;
  mfaRequiredForStaff: boolean;
  aiAutoEvaluation: boolean;
  strictGstVerification: boolean;
  debarmentAutoCheck: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  updatedAt: string;
  updatedBy: string;
}

export const adminApi = {
  // 1. Dashboard
  getMetrics: () => request<AdminDashboardStats>('/api/admin/metrics'),

  // 2. User Management
  listUsers: (query?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.search) params.set('search', query.search);
    if (query?.role) params.set('role', query.role);
    if (query?.status) params.set('status', query.status);
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    return request<{ users: AdminUserRecord[]; pagination: any }>(`/api/admin/users?${params.toString()}`);
  },

  getUserDetail: (id: string) => request<AdminUserDetail>(`/api/admin/users/${id}`),

  updateUserStatus: (id: string, status: 'ACTIVE' | 'DISABLED', reason: string) =>
    request<any>(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),

  updateUserRole: (id: string, role: string, reason: string) =>
    request<any>(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, reason }),
    }),

  addUserNote: (id: string, note: string) =>
    request<any>(`/api/admin/users/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  // 3. Roles Matrix
  getRolesMatrix: () => request<RolePermissionMatrix>('/api/admin/roles/matrix'),

  // 4. Tender & Bid Oversight
  getTenderOversight: (query?: { search?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (query?.search) params.set('search', query.search);
    if (query?.status) params.set('status', query.status);
    return request<AdminTenderOverviewItem[]>(`/api/admin/tenders?${params.toString()}`);
  },

  getBidMonitoring: (query?: { search?: string; status?: string; tenderId?: string }) => {
    const params = new URLSearchParams();
    if (query?.search) params.set('search', query.search);
    if (query?.status) params.set('status', query.status);
    if (query?.tenderId) params.set('tenderId', query.tenderId);
    return request<AdminBidMonitoringItem[]>(`/api/admin/bids?${params.toString()}`);
  },

  // 5. Compliance Rules
  getComplianceRules: () => request<StatutoryComplianceRule[]>('/api/admin/compliance-rules'),

  updateComplianceRule: (id: string, data: { enabled?: boolean; parameters?: Record<string, any>; reason: string }) =>
    request<StatutoryComplianceRule>(`/api/admin/compliance-rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // 6. Integrations
  getIntegrations: () => request<VerificationIntegrationItem[]>('/api/admin/integrations'),

  testIntegration: (id: string) =>
    request<VerificationIntegrationItem>(`/api/admin/integrations/${id}/test`, {
      method: 'POST',
    }),

  updateIntegration: (id: string, data: { enabled?: boolean; mode?: string }) =>
    request<VerificationIntegrationItem>(`/api/admin/integrations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // 7. Audit
  getAuditLogs: (query?: { actor?: string; event?: string; search?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.actor) params.set('actor', query.actor);
    if (query?.event) params.set('event', query.event);
    if (query?.search) params.set('search', query.search);
    if (query?.limit) params.set('limit', String(query.limit));
    return request<{ logs: AdminAuditLogEntry[]; total: number; cryptoSeal: any }>(`/api/admin/audit-logs?${params.toString()}`);
  },

  // 8. System Health
  getSystemHealth: () => request<AdminSystemHealth>('/api/admin/system-health'),

  // 9. Incidents
  getIncidents: (query?: { status?: string; severity?: string }) => {
    const params = new URLSearchParams();
    if (query?.status) params.set('status', query.status);
    if (query?.severity) params.set('severity', query.severity);
    return request<AdminIncident[]>(`/api/admin/incidents?${params.toString()}`);
  },

  createIncident: (data: { title: string; category: string; severity: string; description: string }) =>
    request<AdminIncident>('/api/admin/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateIncident: (id: string, data: { status?: string; assignedTo?: string; resolutionNotes?: string }) =>
    request<AdminIncident>(`/api/admin/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // 10. Settings
  getSettings: () => request<PlatformSettings>('/api/admin/settings'),

  updateSettings: (settings: Partial<PlatformSettings>) =>
    request<PlatformSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};
