import { api } from './client';
import {
  RequirementEvidenceMapping,
  BidderCoverageSummary,
  MappingType,
} from '@/types';

export interface GenerateMappingsResponse {
  generatedCount: number;
  mappings: RequirementEvidenceMapping[];
  summary: BidderCoverageSummary;
}

export const mappingApi = {
  generateMappings: (bidderId: string) =>
    api.post<GenerateMappingsResponse>(`api/bidders/${bidderId}/mappings/generate`),

  getBidderMappings: (bidderId: string) =>
    api.get<{ bidderId: string; summary: BidderCoverageSummary; mappings: RequirementEvidenceMapping[] }>(
      `api/bidders/${bidderId}/mappings`
    ),

  getRequirementMappings: (requirementId: string, bidderId?: string) =>
    api.get<{ requirementId: string; mappings: RequirementEvidenceMapping[] }>(
      `api/requirements/${requirementId}/mappings${bidderId ? `?bidderId=${bidderId}` : ''}`
    ),

  getEvidenceMappings: (evidenceId: string) =>
    api.get<{ evidenceId: string; mappings: RequirementEvidenceMapping[] }>(
      `api/evidence/${evidenceId}/mappings`
    ),

  confirmMapping: (mappingId: string, reviewer = 'procurement_officer') =>
    api.post<RequirementEvidenceMapping>(`api/mappings/${mappingId}/confirm`, { reviewer }),

  rejectMapping: (mappingId: string, reason: string, reviewer = 'procurement_officer') =>
    api.post<RequirementEvidenceMapping>(`api/mappings/${mappingId}/reject`, { reason, reviewer }),

  createManualMapping: (data: {
    tenderRequirementId: string;
    evidenceId: string;
    bidderId: string;
    mappingType?: MappingType;
    reason: string;
    createdBy?: string;
  }) => api.post<RequirementEvidenceMapping>('api/mappings/manual', data),

  getMappingHistory: (mappingId: string) =>
    api.get<{ mappingId: string; history: RequirementEvidenceMapping[] }>(
      `api/mappings/${mappingId}/history`
    ),

  getReviewQueue: (tenderId?: string) =>
    api.get<{ queueCount: number; items: RequirementEvidenceMapping[] }>(
      `api/mappings/review-queue${tenderId ? `?tenderId=${tenderId}` : ''}`
    ),
};
