import { request } from './client';

export interface SystemMetricsData {
  cluster: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptimeSeconds: number;
    cpuCount: number;
    cpuModel: string;
    cpuLoadPercent: number;
    memoryTotalMB: number;
    memoryUsedMB: number;
    memoryUsagePercent: number;
  };
  database: {
    status: string;
    poolActive: number;
    poolIdle: number;
    poolMax: number;
    latencyMs: number;
    sslEncrypted: boolean;
  };
  aiCoreEngine: {
    primaryProvider: string;
    status: string;
    tokenConsumption24h: number;
    tokenQuotaDaily: number;
    avgInferenceLatencyMs: number;
    activeBatches: number;
  };
  cache: {
    hitRatePercent: number;
    keysCount: number;
    memoryUsedMB: number;
    status: string;
  };
  usersCount: {
    total: number;
    superAdmins: number;
    admins: number;
    officers: number;
    bidders: number;
  };
  systemConfig: SystemConfigData;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'PROCUREMENT_OFFICER';
  status: 'ACTIVE' | 'DISABLED';
  department: string;
  designation: string;
  phone: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface SecurityThreatLog {
  id: string;
  timestamp: string;
  event: string;
  ip: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  details: string;
}

export interface BlacklistIpEntry {
  ip: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
}

export interface SystemConfigData {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  aiAutoScoring: boolean;
  strictGemCompliance: boolean;
  publicRegistration: boolean;
  maxDocumentSizeMB: number;
  ocrPrecisionMode: string;
  activeTokenTtlHours: number;
  requireMfaForAdmins: boolean;
  auditLogSha256Sealed: boolean;
  lastBackupAt: string;
  lastCachePurgedAt: string;
}

export const superAdminApi = {
  async getMetrics(): Promise<SystemMetricsData> {
    return request<SystemMetricsData>('/api/super-admin/metrics');
  },

  async listAdministrators(): Promise<AdminUserRecord[]> {
    return request<AdminUserRecord[]>('/api/super-admin/admins');
  },

  async createAdministrator(data: {
    name: string;
    email: string;
    password: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'PROCUREMENT_OFFICER';
    department?: string;
    designation?: string;
    phone?: string;
  }): Promise<{ id: string; name: string; email: string; role: string }> {
    return request('/api/super-admin/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAdminStatus(id: string, status: 'ACTIVE' | 'DISABLED'): Promise<any> {
    return request(`/api/super-admin/admins/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getSecurityLogs(): Promise<{
    logs: SecurityThreatLog[];
    ipBlacklist: BlacklistIpEntry[];
    cryptoSeal: {
      algorithm: string;
      status: string;
      masterKeyFingerprint: string;
      lastSealedAt: string;
    };
  }> {
    return request('/api/super-admin/security-logs');
  },

  async addBlacklistIp(ip: string, reason: string): Promise<BlacklistIpEntry[]> {
    return request<BlacklistIpEntry[]>('/api/super-admin/firewall/blacklist', {
      method: 'POST',
      body: JSON.stringify({ ip, reason }),
    });
  },

  async removeBlacklistIp(ip: string): Promise<BlacklistIpEntry[]> {
    return request<BlacklistIpEntry[]>(`/api/super-admin/firewall/blacklist/${encodeURIComponent(ip)}`, {
      method: 'DELETE',
    });
  },

  async getSystemConfig(): Promise<SystemConfigData> {
    return request<SystemConfigData>('/api/super-admin/system-config');
  },

  async updateSystemConfig(config: Partial<SystemConfigData>): Promise<SystemConfigData> {
    return request<SystemConfigData>('/api/super-admin/system-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  async triggerBackup(): Promise<{ backupId: string; sizeMB: number; checksumSha256: string; timestamp: string }> {
    return request('/api/super-admin/maintenance/backup', {
      method: 'POST',
    });
  },

  async purgeCache(): Promise<{ flushedAt: string; purgedKeys: number }> {
    return request('/api/super-admin/maintenance/purge-cache', {
      method: 'POST',
    });
  },

  async toggleLockdown(): Promise<{ maintenanceMode: boolean }> {
    return request('/api/super-admin/emergency-lockdown', {
      method: 'POST',
    });
  },
};
