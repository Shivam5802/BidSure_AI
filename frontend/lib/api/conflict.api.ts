import { api } from './client';
import {
  EvidenceConflict,
  EvidenceConflictItem,
  ConflictGraphData,
  ConflictStatus,
} from '@/types/conflict';

export const conflictApi = {
  /**
   * Run contradiction detection for a bidder
   */
  detectConflicts: async (bidderId: string, tenderId?: string) => {
    const query = tenderId ? `?tenderId=${encodeURIComponent(tenderId)}` : '';
    return api.post<{
      bidderId: string;
      tenderId: string;
      detectedCount: number;
      conflicts: EvidenceConflict[];
    }>(`api/bidders/${bidderId}/conflicts/detect${query}`);
  },

  /**
   * List all detected conflicts for a bidder
   */
  getConflictsForBidder: async (bidderId: string) => {
    return api.get<EvidenceConflict[]>(`api/bidders/${bidderId}/conflicts`);
  },

  /**
   * Get specific conflict details
   */
  getConflictById: async (conflictId: string) => {
    return api.get<EvidenceConflict>(`api/conflicts/${conflictId}`);
  },

  /**
   * Get visual evidence conflict graph
   */
  getConflictGraph: async (conflictId: string) => {
    return api.get<ConflictGraphData>(`api/conflicts/${conflictId}/graph`);
  },

  /**
   * Get linked evidence sources for a conflict
   */
  getLinkedEvidence: async (conflictId: string) => {
    return api.get<EvidenceConflictItem[]>(`api/conflicts/${conflictId}/evidence`);
  },

  /**
   * Update review status / record human officer resolution
   */
  updateConflictStatus: async (
    conflictId: string,
    payload: {
      status: ConflictStatus;
      resolution?: string;
      resolutionReason?: string;
      reviewerId?: string;
    }
  ) => {
    return api.patch<EvidenceConflict>(`api/conflicts/${conflictId}/status`, payload);
  },

  /**
   * Trigger Feature 1H AI Compliance Investigation Agent for a conflict
   */
  investigateConflict: async (conflictId: string, requesterId?: string) => {
    return api.post<{ conflictId: string; investigation: any }>(
      `api/conflicts/${conflictId}/investigate`,
      { requesterId }
    );
  },
};
