import {
  TenderRequirement,
  RequirementEvidenceMapping,
  MappingType,
  MappingStatus,
} from '@prisma/client';

export enum RequirementCoverageState {
  NO_EVIDENCE = 'NO_EVIDENCE',
  PARTIAL = 'PARTIAL',
  COVERED = 'COVERED',
  AMBIGUOUS = 'AMBIGUOUS',
  CONFLICTING = 'CONFLICTING',
}

export interface RequirementCoverageSummary {
  requirementId: string;
  requirementCode: string;
  requirementText: string;
  category: string;
  expectedEvidence: string[];
  coverageState: RequirementCoverageState;
  mappedEvidenceCount: number;
  confirmedCount: number;
  reviewRequiredCount: number;
  missingExpectedEvidence: string[];
  mappings: RequirementEvidenceMapping[];
  explanation: string;
}

export interface BidderCoverageSummary {
  bidderId: string;
  totalRequirements: number;
  coveredCount: number;
  partialCount: number;
  noEvidenceCount: number;
  ambiguousCount: number;
  conflictingCount: number;
  requirementSummaries: RequirementCoverageSummary[];
}

export class MappingCoverageService {
  /**
   * Computes requirement coverage summary for a bidder across tender requirements
   */
  calculateBidderCoverage(
    bidderId: string,
    requirements: TenderRequirement[],
    mappings: RequirementEvidenceMapping[]
  ): BidderCoverageSummary {
    const requirementSummaries: RequirementCoverageSummary[] = [];

    let coveredCount = 0;
    let partialCount = 0;
    let noEvidenceCount = 0;
    let ambiguousCount = 0;
    let conflictingCount = 0;

    for (const req of requirements) {
      // Filter active mappings for this requirement
      const reqMappings = mappings.filter(
        (m) => m.tenderRequirementId === req.id && m.status !== MappingStatus.SUPERSEDED && m.status !== MappingStatus.REJECTED
      );

      const summary = this.calculateRequirementCoverage(req, reqMappings);
      requirementSummaries.push(summary);

      switch (summary.coverageState) {
        case RequirementCoverageState.COVERED:
          coveredCount++;
          break;
        case RequirementCoverageState.PARTIAL:
          partialCount++;
          break;
        case RequirementCoverageState.NO_EVIDENCE:
          noEvidenceCount++;
          break;
        case RequirementCoverageState.AMBIGUOUS:
          ambiguousCount++;
          break;
        case RequirementCoverageState.CONFLICTING:
          conflictingCount++;
          break;
      }
    }

    return {
      bidderId,
      totalRequirements: requirements.length,
      coveredCount,
      partialCount,
      noEvidenceCount,
      ambiguousCount,
      conflictingCount,
      requirementSummaries,
    };
  }

  /**
   * Calculates coverage state for a single requirement
   */
  calculateRequirementCoverage(
    requirement: TenderRequirement,
    mappings: RequirementEvidenceMapping[]
  ): RequirementCoverageSummary {
    const expected = requirement.evidenceRequired || [];
    const mappedCount = mappings.length;
    const confirmedCount = mappings.filter((m) => m.status === MappingStatus.CONFIRMED).length;
    const reviewRequiredCount = mappings.filter(
      (m) => m.status === MappingStatus.REVIEW_REQUIRED || m.status === MappingStatus.PROPOSED
    ).length;

    let coverageState: RequirementCoverageState = RequirementCoverageState.NO_EVIDENCE;
    let explanation = '';
    const missingExpectedEvidence: string[] = [];

    if (mappedCount === 0) {
      coverageState = RequirementCoverageState.NO_EVIDENCE;
      explanation = `No document or evidence item has been mapped to expected requirement evidence (${expected.join(', ') || 'required evidence'}).`;
      missingExpectedEvidence.push(...expected);
    } else if (mappings.some((m) => m.mappingType === MappingType.CONFLICTING)) {
      coverageState = RequirementCoverageState.CONFLICTING;
      explanation = `Mapped evidence items contain conflicting extracted values for requirement ${requirement.requirementCode}.`;
    } else if (mappings.some((m) => m.mappingType === MappingType.POTENTIAL || m.confidence < 0.75)) {
      coverageState = RequirementCoverageState.AMBIGUOUS;
      explanation = `Evidence is mapped with low/medium confidence or requires procurement officer review.`;
    } else if (expected.length > 1 && mappedCount < expected.length) {
      coverageState = RequirementCoverageState.PARTIAL;
      explanation = `Evidence is mapped for part of the multi-part evidence requirement (${mappedCount} of ${expected.length} expected types mapped).`;
    } else {
      coverageState = RequirementCoverageState.COVERED;
      explanation = `Candidate/confirmed evidence mapped for requirement ${requirement.requirementCode}. (Note: COVERED indicates evidence availability, not compliance validation).`;
    }

    return {
      requirementId: requirement.id,
      requirementCode: requirement.requirementCode,
      requirementText: requirement.requirementText,
      category: requirement.category,
      expectedEvidence: expected,
      coverageState,
      mappedEvidenceCount: mappedCount,
      confirmedCount,
      reviewRequiredCount,
      missingExpectedEvidence,
      mappings,
      explanation,
    };
  }
}

export const mappingCoverageService = new MappingCoverageService();
