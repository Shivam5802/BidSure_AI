import { api } from './client';
import {
  WorkspaceSummary,
  PaginatedMatrixResult,
  PriorityActionItem,
  WhyExplanationResult,
} from '@/types/workspace';

export const workspaceApi = {
  getWorkspaceSummary: async (tenderId: string) => {
    return api.get<WorkspaceSummary>(`api/tenders/${tenderId}/workspace`);
  },

  getComplianceMatrix: async (tenderId: string, query: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.keys(query).forEach((key) => {
      if (query[key] !== undefined && query[key] !== null && query[key] !== 'ALL' && query[key] !== '') {
        params.append(key, String(query[key]));
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<PaginatedMatrixResult>(`api/tenders/${tenderId}/workspace/matrix${queryString}`);
  },

  getPriorityActions: async (tenderId: string, query: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.keys(query).forEach((key) => {
      if (query[key] !== undefined && query[key] !== null && query[key] !== 'ALL') {
        params.append(key, String(query[key]));
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<PriorityActionItem[]>(`api/tenders/${tenderId}/workspace/actions${queryString}`);
  },

  getWhyExplanation: async (tenderId: string, requirementId: string, bidderId: string) => {
    return api.get<WhyExplanationResult>(
      `api/tenders/${tenderId}/workspace/why?requirementId=${encodeURIComponent(
        requirementId
      )}&bidderId=${encodeURIComponent(bidderId)}`
    );
  },

  searchWorkspace: async (tenderId: string, searchQuery: string) => {
    return api.get<{
      query: string;
      bidders: any[];
      requirements: any[];
      recentActivity: any[];
    }>(`api/tenders/${tenderId}/workspace/search?q=${encodeURIComponent(searchQuery)}`);
  },
};
