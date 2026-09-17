import { api } from './client';
import { ReportMetadata, ReportDataSnapshot, ReportAuditTimelineItem } from '@/types/reports';

export const reportsApi = {
  generateTenderReport: async (tenderId: string, forceNew = false) => {
    return api.post<ReportDataSnapshot>(`api/tenders/${tenderId}/reports`, {
      reportType: 'TENDER_COMPLIANCE',
      forceNew,
    });
  },

  generateBidderReport: async (tenderId: string, bidderId: string, forceNew = false) => {
    return api.post<ReportDataSnapshot>(`api/tenders/${tenderId}/bidders/${bidderId}/reports`, {
      reportType: 'BIDDER_COMPLIANCE',
      bidderId,
      forceNew,
    });
  },

  listReports: async (tenderId: string, bidderId?: string) => {
    const params = bidderId ? `?bidderId=${encodeURIComponent(bidderId)}` : '';
    return api.get<ReportMetadata[]>(`api/tenders/${tenderId}/reports${params}`);
  },

  getReport: async (reportId: string) => {
    return api.get<ReportDataSnapshot>(`api/reports/${reportId}`);
  },

  getReportStatus: async (reportId: string) => {
    return api.get<{
      id: string;
      status: string;
      completenessStatus: string;
      isStale: boolean;
      generatedAt: string;
      checksum: string;
    }>(`api/reports/${reportId}/status`);
  },

  getDownloadUrl: (reportId: string) => {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/reports/${reportId}/download`;
  },

  getAuditTimeline: async (reportId: string) => {
    return api.get<ReportAuditTimelineItem[]>(`api/reports/${reportId}/audit`);
  },
};
