import { api } from './client';
import {
  ComparisonSummaryResponse,
  ComparisonMatrixResponse,
  RequirementDetailComparisonResponse,
} from '@/types/comparison';

export const comparisonApi = {
  getSummary: async (tenderId: string, bidderIds?: string[]) => {
    const params = new URLSearchParams();
    if (bidderIds && bidderIds.length > 0) {
      params.append('bidderIds', bidderIds.join(','));
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<ComparisonSummaryResponse>(`api/tenders/${tenderId}/comparison/summary${queryString}`);
  },

  getMatrix: async (tenderId: string, query: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.keys(query).forEach((key) => {
      if (query[key] !== undefined && query[key] !== null && query[key] !== 'ALL' && query[key] !== '') {
        if (Array.isArray(query[key])) {
          params.append(key, query[key].join(','));
        } else {
          params.append(key, String(query[key]));
        }
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<ComparisonMatrixResponse>(`api/tenders/${tenderId}/comparison/matrix${queryString}`);
  },

  getRequirementDetail: async (tenderId: string, requirementId: string, bidderIds?: string[]) => {
    const params = new URLSearchParams();
    if (bidderIds && bidderIds.length > 0) {
      params.append('bidderIds', bidderIds.join(','));
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<RequirementDetailComparisonResponse>(
      `api/tenders/${tenderId}/comparison/requirements/${requirementId}${queryString}`
    );
  },
};
