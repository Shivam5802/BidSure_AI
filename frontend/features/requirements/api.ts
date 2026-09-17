import { request } from '@/lib/api/client';
import {
  BlueprintData,
  ComplianceBlueprint,
  TenderRequirement,
  RequirementFilterState,
} from './types';

export const requirementApi = {
  triggerExtraction: (tenderId: string) =>
    request<{
      jobId: string;
      blueprintId: string;
      blueprintVersion: number;
      totalExtracted: number;
      draftCount: number;
      reviewCount: number;
      conflictCount: number;
      duplicateCount: number;
    }>(`api/tenders/${tenderId}/requirements/extract`, {
      method: 'POST',
    }),

  getBlueprint: (tenderId: string, version?: number) => {
    const query = version ? `?version=${version}` : '';
    return request<BlueprintData>(`api/tenders/${tenderId}/blueprint${query}`);
  },

  getBlueprintVersions: (tenderId: string) =>
    request<ComplianceBlueprint[]>(`api/tenders/${tenderId}/blueprint/versions`),

  listRequirements: (tenderId: string, filters?: Partial<RequirementFilterState>) => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.ambiguity) params.append('ambiguity', 'true');
    if (filters?.conflict) params.append('conflict', 'true');
    if (filters?.duplicate) params.append('duplicate', 'true');
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<TenderRequirement[]>(`api/tenders/${tenderId}/requirements${query}`);
  },

  getRequirement: (tenderId: string, requirementId: string) =>
    request<TenderRequirement>(`api/tenders/${tenderId}/requirements/${requirementId}`),

  updateRequirement: (
    tenderId: string,
    requirementId: string,
    payload: Partial<TenderRequirement>
  ) =>
    request<TenderRequirement>(`api/tenders/${tenderId}/requirements/${requirementId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  approveRequirement: (tenderId: string, requirementId: string) =>
    request<TenderRequirement>(`api/tenders/${tenderId}/requirements/${requirementId}/approve`, {
      method: 'POST',
    }),

  rejectRequirement: (tenderId: string, requirementId: string) =>
    request<TenderRequirement>(`api/tenders/${tenderId}/requirements/${requirementId}/reject`, {
      method: 'POST',
    }),

  lockBlueprint: (tenderId: string, blueprintId: string) =>
    request<ComplianceBlueprint>(`api/tenders/${tenderId}/blueprint/lock`, {
      method: 'POST',
      body: JSON.stringify({ blueprintId }),
    }),
};
