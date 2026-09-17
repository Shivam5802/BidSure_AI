import { TenderRequirement, ExtractedEvidence, BidDocumentType, MappingType, MappingStatus, RequirementCategory } from '@prisma/client';
import { mappingCandidateGenerator, CandidatePair } from './mapping-candidate-generator.service.js';
import { aiSemanticMatcher } from './ai-semantic-matcher.service.js';
import { MatchingSignals } from './mapping.repository.js';

export interface EvaluatedMappingProposal {
  tenderRequirementId: string;
  bidderId: string;
  bidSubmissionId: string;
  evidenceId: string;
  mappingType: MappingType;
  status: MappingStatus;
  confidence: number;
  reason: string;
  matchedField: string | null;
  matchedCategory: RequirementCategory | null;
  matchingSignals: MatchingSignals;
  source: string;
}

export type RichExtractedEvidence = ExtractedEvidence & { documentType: BidDocumentType; documentName: string };

export class MappingEngine {
  /**
   * Processes a list of requirements and bidder evidence items to evaluate mapping proposals
   */
  async evaluateMappingsForSubmission(
    bidderId: string,
    bidSubmissionId: string,
    requirements: TenderRequirement[],
    evidenceItems: RichExtractedEvidence[]
  ): Promise<EvaluatedMappingProposal[]> {
    // Step 1: Generate candidate pairs using heuristic signal filter
    const candidatePairs = mappingCandidateGenerator.generateCandidates(requirements, evidenceItems);

    const proposals: EvaluatedMappingProposal[] = [];

    // Track evidence conflicts per requirement
    const reqEvidenceMap = new Map<string, Array<{ ev: ExtractedEvidence; proposal: EvaluatedMappingProposal }>>();

    for (const pair of candidatePairs) {
      const richEv = evidenceItems.find((e) => e.id === pair.evidence.id);
      const docName = richEv ? richEv.documentName : 'Bid Document';

      const proposal = await this.evaluateSingleCandidate(bidderId, bidSubmissionId, pair, docName);
      proposals.push(proposal);

      const existing = reqEvidenceMap.get(pair.requirement.id) || [];
      existing.push({ ev: pair.evidence, proposal });
      reqEvidenceMap.set(pair.requirement.id, existing);
    }

    // Step 2: Conflict detection pass
    // If multiple evidence items mapped to same requirement have conflicting values (e.g. legal entity names differ),
    // mark mappings as CONFLICTING and status REVIEW_REQUIRED
    for (const [, items] of reqEvidenceMap.entries()) {
      if (items.length > 1) {
        const distinctValues = new Set(items.map((i) => i.ev.rawValue.trim().toLowerCase()));
        if (distinctValues.size > 1 && items.some((i) => i.ev.fieldKey === 'legal_name' || i.ev.fieldKey === 'turnover')) {
          for (const item of items) {
            item.proposal.mappingType = MappingType.CONFLICTING;
            item.proposal.status = MappingStatus.REVIEW_REQUIRED;
            item.proposal.reason = `Conflicting evidence values extracted across documents for requirement ${item.proposal.tenderRequirementId} (${Array.from(distinctValues).join(' vs ')}).`;
          }
        }
      }
    }

    return proposals;
  }

  /**
   * Evaluates a single requirement-evidence candidate pair
   */
  async evaluateSingleCandidate(
    bidderId: string,
    bidSubmissionId: string,
    pair: CandidatePair,
    documentName = 'Bid Document'
  ): Promise<EvaluatedMappingProposal> {
    const { requirement, evidence, signals, isDirectMatch, matchedField } = pair;

    let mappingType: MappingType = MappingType.POTENTIAL;
    let confidence = pair.candidateScore;
    let semanticMatchScore = 0.8;
    let reason = '';

    if (isDirectMatch) {
      mappingType = MappingType.DIRECT;
      confidence = Math.min(0.98, Math.max(0.88, signals.fieldMatch * 0.4 + signals.documentTypeMatch * 0.3 + 0.28));
      reason = `Evidence field "${evidence.fieldLabel}" directly corresponds to expected evidence for requirement ${requirement.requirementCode}.`;
    } else {
      const aiResult = await aiSemanticMatcher.matchSemanticCandidate({
        requirementCode: requirement.requirementCode,
        requirementText: requirement.requirementText,
        normalizedRequirementText: requirement.normalizedRequirementText,
        category: requirement.category,
        expectedEvidence: requirement.evidenceRequired,
        evidenceFieldKey: evidence.fieldKey,
        evidenceFieldLabel: evidence.fieldLabel,
        evidenceRawValue: evidence.rawValue,
        evidenceSourceText: evidence.sourceText,
        documentType: pair.bidDocumentType,
        documentName,
        pageNumber: evidence.pageNumber,
      });

      mappingType = aiResult.mappingType;
      semanticMatchScore = aiResult.semanticMatchScore;
      reason = aiResult.reason;

      confidence = Number(
        (
          signals.documentTypeMatch * 0.25 +
          signals.fieldMatch * 0.35 +
          signals.categoryMatch * 0.10 +
          signals.expectedEvidenceMatch * 0.10 +
          semanticMatchScore * 0.20
        ).toFixed(2)
      );
    }

    let status: MappingStatus = MappingStatus.PROPOSED;
    if (mappingType === MappingType.CONFLICTING || confidence < 0.70 || mappingType === MappingType.POTENTIAL) {
      status = MappingStatus.REVIEW_REQUIRED;
    }

    const matchingSignals: MatchingSignals = {
      documentTypeMatch: signals.documentTypeMatch,
      fieldMatch: signals.fieldMatch,
      categoryMatch: signals.categoryMatch,
      keywordMatch: signals.keywordMatch,
      semanticMatch: semanticMatchScore,
      expectedEvidenceMatch: signals.expectedEvidenceMatch,
      explanation: reason,
      sourceContext: {
        documentName,
        documentType: pair.bidDocumentType,
        pageNumber: evidence.pageNumber,
        sourceText: evidence.sourceText,
      },
    };

    return {
      tenderRequirementId: requirement.id,
      bidderId,
      bidSubmissionId,
      evidenceId: evidence.id,
      mappingType,
      status,
      confidence,
      reason,
      matchedField: matchedField || evidence.fieldKey,
      matchedCategory: requirement.category,
      matchingSignals,
      source: isDirectMatch ? 'DETERMINISTIC_ENGINE' : 'AI_SEMANTIC_ENGINE',
    };
  }
}

export const mappingEngine = new MappingEngine();
