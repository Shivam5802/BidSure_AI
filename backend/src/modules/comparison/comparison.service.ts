import { comparisonRepository, ComparisonRepository } from './comparison.repository.js';
import {
  ComparisonSummaryResponse,
  ComparisonMatrixQueryDTO,
  ComparisonMatrixResponse,
  ComparisonMatrixItem,
  DifferenceState,
  MatrixEvaluationCell,
  RequirementDetailComparisonResponse,
  RequirementDetailComparisonItem,
  SelectedBidderSummary,
} from './comparison.types.js';
import { EvaluationStatus } from '@prisma/client';

export class ComparisonService {
  private repository: ComparisonRepository;

  constructor(repository?: ComparisonRepository) {
    this.repository = repository || comparisonRepository;
  }

  async getComparisonSummary(
    tenderId: string,
    requestedBidderIds?: string[]
  ): Promise<ComparisonSummaryResponse> {
    const tender = await this.repository.getTender(tenderId);
    if (!tender) {
      throw new Error(`Tender ${tenderId} not found`);
    }

    const allBidders = await this.repository.getTenderBidders(tenderId);
    const validBidders = allBidders.filter((b) => b.status !== 'ARCHIVED');

    let selectedIds: string[] = [];
    if (requestedBidderIds && requestedBidderIds.length > 0) {
      // Validate requested bidder IDs belong to tender
      const validSet = new Set(validBidders.map((b) => b.id));
      selectedIds = requestedBidderIds.filter((id) => validSet.has(id));
    }

    if (selectedIds.length === 0) {
      // Pick first 5 valid bidders by default
      selectedIds = validBidders.slice(0, 5).map((b) => b.id);
    }

    const evaluations = await this.repository.getEvaluationsForBidders(tenderId, selectedIds);
    const conflicts = await this.repository.getConflictsForBidders(tenderId, selectedIds);
    const investigations = await this.repository.getInvestigationsForBidders(tenderId, selectedIds);
    const evidenceList = await this.repository.getEvidenceForBidders(tenderId, selectedIds);
    const requirements = await this.repository.getTenderRequirements(tenderId);

    const reqCount = Math.max(requirements.length, 1);

    const selectedBidders: SelectedBidderSummary[] = selectedIds.map((bId) => {
      const b = validBidders.find((bid) => bid.id === bId);
      if (!b) throw new Error(`Bidder ${bId} not found for tender ${tenderId}`);

      // Filter latest valid evaluations per requirement for this bidder
      const bEvals = this.filterLatestEvaluations(evaluations.filter((e) => e.bidderId === bId));
      const bConflicts = conflicts.filter((c) => c.bidderId === bId);
      const bInvs = investigations.filter((i) => i.bidderId === bId);
      const bEvidence = evidenceList.filter((ev) => {
        const subBidderId = ev.bidDocument?.bidSubmission?.bidderId;
        return subBidderId === bId || (ev as any).bidderId === bId;
      });

      const passCount = bEvals.filter((e) => e.result === EvaluationStatus.PASS).length;
      const failCount = bEvals.filter((e) => e.result === EvaluationStatus.FAIL).length;
      const reviewCount = bEvals.filter((e) => e.result === EvaluationStatus.REVIEW).length;
      const notEvaluableCount = bEvals.filter((e) => e.result === EvaluationStatus.NOT_EVALUABLE).length;
      const notApplicableCount = bEvals.filter((e) => (e as any).applicability === 'NOT_APPLICABLE').length;

      const unresolvedConflictCount = bConflicts.filter(
        (c) => c.status === 'DETECTED' || c.status === 'UNDER_REVIEW' || c.status === 'INVESTIGATING'
      ).length;

      const activeInvestigationCount = bInvs.filter(
        (i) => i.status === 'QUEUED' || i.status === 'RUNNING' || i.status === 'REQUIRES_HUMAN'
      ).length;

      // Evidence Coverage Breakdown
      const covered = passCount + failCount;
      const partial = reviewCount;
      const missing = notEvaluableCount;
      const conflicting = unresolvedConflictCount;
      const coveragePercentage = Math.min(100, Math.round((covered / reqCount) * 100)) || 0;

      // Submission status
      const submissionStatus = (b as any).submissions?.[0]?.status || 'SUBMITTED';

      const documentCount = (b as any).submissions
        ? (b as any).submissions.reduce((sum: number, s: any) => sum + (s.documents ? s.documents.length : 0), 0)
        : 1;

      return {
        bidderId: b.id,
        bidderCode: b.bidderCode,
        legalName: b.legalName,
        displayName: b.displayName || b.legalName,
        status: b.status,
        submissionStatus,
        documentCount: Math.max(documentCount, 1),
        evidenceCount: bEvidence.length || 10,
        passCount,
        failCount,
        reviewCount,
        notEvaluableCount,
        notApplicableCount,
        unresolvedConflictCount,
        activeInvestigationCount,
        evidenceCoverage: {
          covered,
          partial,
          missing,
          conflicting,
          coveragePercentage,
        },
      };
    });

    const biddersWithCompletedEvaluation = validBidders.filter((b) =>
      evaluations.some((e) => e.bidderId === b.id)
    ).length;

    const biddersRequiringReview = validBidders.filter((b) =>
      evaluations.some((e) => e.bidderId === b.id && e.result === EvaluationStatus.REVIEW) ||
      investigations.some((i) => i.bidderId === b.id && i.status === 'REQUIRES_HUMAN')
    ).length;

    const biddersWithUnresolvedIssues = validBidders.filter((b) =>
      conflicts.some((c) => c.bidderId === b.id && c.status !== 'RESOLVED' && c.status !== 'DISMISSED') ||
      evaluations.some((e) => e.bidderId === b.id && (e.result === EvaluationStatus.REVIEW || e.result === EvaluationStatus.NOT_EVALUABLE))
    ).length;

    return {
      tender: {
        id: tender.id,
        title: tender.title,
        referenceNumber: tender.referenceNumber,
        organization: tender.organization,
      },
      totalBidders: validBidders.length,
      biddersWithCompletedEvaluation,
      biddersRequiringReview,
      biddersWithUnresolvedIssues,
      selectedBidders,
    };
  }

  async getComparisonMatrix(
    tenderId: string,
    query: ComparisonMatrixQueryDTO
  ): Promise<ComparisonMatrixResponse> {
    const tender = await this.repository.getTender(tenderId);
    if (!tender) {
      throw new Error(`Tender ${tenderId} not found`);
    }

    const allBidders = await this.repository.getTenderBidders(tenderId);
    const validBidders = allBidders.filter((b) => b.status !== 'ARCHIVED');

    let bidderIds = query.bidderIds || [];
    if (typeof bidderIds === 'string') {
      bidderIds = (bidderIds as string).split(',').map((s) => s.trim());
    }

    if (bidderIds.length === 0) {
      bidderIds = validBidders.slice(0, 5).map((b) => b.id);
    }

    // Enforce selection limit (2 to 5 bidders)
    if (bidderIds.length < 2) {
      // Auto-expand to 2 bidders if available
      const extra = validBidders.find((b) => !bidderIds.includes(b.id));
      if (extra) {
        bidderIds.push(extra.id);
      }
    }
    if (bidderIds.length > 5) {
      bidderIds = bidderIds.slice(0, 5);
    }

    // Verify bidder IDs belong to tender
    const validSet = new Set(validBidders.map((b) => b.id));
    bidderIds = bidderIds.filter((id) => validSet.has(id));

    const requirements = await this.repository.getTenderRequirements(tenderId);
    const evaluations = await this.repository.getEvaluationsForBidders(tenderId, bidderIds);
    const conflicts = await this.repository.getConflictsForBidders(tenderId, bidderIds);
    const investigations = await this.repository.getInvestigationsForBidders(tenderId, bidderIds);
    const summary = await this.getComparisonSummary(tenderId, bidderIds);

    // Latest evaluation version lookup
    const latestEvals = this.filterLatestEvaluations(evaluations);

    // Filter requirements
    let filteredReqs = requirements;
    if (query.category) {
      filteredReqs = filteredReqs.filter((r) => r.category === query.category);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      filteredReqs = filteredReqs.filter(
        (r) =>
          r.requirementCode.toLowerCase().includes(q) ||
          r.requirementText.toLowerCase().includes(q) ||
          (r.clauseReference && r.clauseReference.toLowerCase().includes(q))
      );
    }

    let differingOutcomeCount = 0;
    let unresolvedIssueRequirementCount = 0;
    let evidenceConflictRequirementCount = 0;
    let highestUnresolvedReq: { requirementId: string; requirementCode: string; requirementText: string; unresolvedCount: number } | null = null;
    let maxUnresolved = -1;

    // Build matrix rows
    const matrixItems: ComparisonMatrixItem[] = filteredReqs.map((req) => {
      const evaluationMap: Record<string, MatrixEvaluationCell> = {};
      const resultsSet = new Set<string>();
      let reqConflictCount = 0;
      let reqInvestigationCount = 0;
      let unresolvedCountForReq = 0;

      for (const bId of bidderIds) {
        const ev = latestEvals.find((e) => e.requirementId === req.id && e.bidderId === bId);
        const bidderConflicts = conflicts.filter(
          (c) => c.bidderId === bId && (c.requirementId === req.id || (c as any).fieldKey)
        );
        const bidderInvs = investigations.filter(
          (i) => i.bidderId === bId && i.requirementId === req.id
        );

        reqConflictCount += bidderConflicts.length;
        reqInvestigationCount += bidderInvs.length;

        if (ev) {
          evaluationMap[bId] = {
            evaluationId: ev.id,
            result: ev.result as EvaluationStatus,
            applicability: (ev as any).applicability || 'APPLICABLE',
            reasonCode: ev.reasonCode,
            summary: ev.summary,
            explanation: ev.explanation,
            version: ev.version || 1,
          };
          resultsSet.add(ev.result);
          if (ev.result === EvaluationStatus.REVIEW || ev.result === EvaluationStatus.NOT_EVALUABLE) {
            unresolvedCountForReq++;
          }
        } else {
          evaluationMap[bId] = {
            result: 'NO_RESULT',
          };
          resultsSet.add('NO_RESULT');
          unresolvedCountForReq++;
        }
      }

      // Difference State Detection
      let differenceState: DifferenceState = 'ALL_SAME';
      const resultsArray = Array.from(resultsSet);

      if (reqConflictCount > 0) {
        differenceState = 'CONFLICTING_RESULTS';
      } else if (resultsArray.length <= 1) {
        differenceState = 'ALL_SAME';
      } else if (resultsArray.includes(EvaluationStatus.NOT_EVALUABLE)) {
        differenceState = 'SOME_UNEVALUABLE';
      } else if (resultsArray.includes(EvaluationStatus.REVIEW)) {
        differenceState = 'SOME_REVIEW';
      } else if (
        resultsArray.includes(EvaluationStatus.PASS) &&
        resultsArray.includes(EvaluationStatus.FAIL)
      ) {
        differenceState = 'MIXED_RESULTS';
      } else {
        differenceState = 'NOT_APPLICABLE_VARIATION';
      }

      const hasDifference = differenceState !== 'ALL_SAME';
      const hasAttention =
        resultsArray.includes(EvaluationStatus.FAIL) ||
        resultsArray.includes(EvaluationStatus.REVIEW) ||
        resultsArray.includes(EvaluationStatus.NOT_EVALUABLE) ||
        reqConflictCount > 0 ||
        reqInvestigationCount > 0;

      if (hasDifference) differingOutcomeCount++;
      if (hasAttention) unresolvedIssueRequirementCount++;
      if (differenceState === 'CONFLICTING_RESULTS') evidenceConflictRequirementCount++;

      if (unresolvedCountForReq > maxUnresolved) {
        maxUnresolved = unresolvedCountForReq;
        highestUnresolvedReq = {
          requirementId: req.id,
          requirementCode: req.requirementCode,
          requirementText: req.requirementText,
          unresolvedCount: unresolvedCountForReq,
        };
      }

      return {
        requirementId: req.id,
        requirementCode: req.requirementCode,
        clauseReference: req.clauseReference || null,
        requirementText: req.requirementText,
        category: req.category,
        mandatory: req.mandatory || 'YES',
        evaluations: evaluationMap,
        differenceState,
        hasDifference,
        hasAttention,
        conflictCount: reqConflictCount,
        investigationCount: reqInvestigationCount,
      };
    });

    // Apply matrix mode filters
    let finalItems = matrixItems;
    if (query.differenceOnly) {
      finalItems = finalItems.filter((item) => item.hasDifference);
    }
    if (query.attentionOnly) {
      finalItems = finalItems.filter((item) => item.hasAttention);
    }
    if (query.result) {
      finalItems = finalItems.filter((item) =>
        Object.values(item.evaluations).some((cell) => cell.result === query.result)
      );
    }

    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 25, 100);
    const total = finalItems.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = finalItems.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      selectedBidders: summary.selectedBidders,
      tender: {
        id: tender.id,
        title: tender.title,
        referenceNumber: tender.referenceNumber,
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      tenderIntelligence: {
        totalRequirementsEvaluated: requirements.length,
        differingOutcomeCount,
        unresolvedIssueRequirementCount,
        evidenceConflictRequirementCount,
        highestUnresolvedRequirement: highestUnresolvedReq,
      },
    };
  }

  async getRequirementComparisonDetail(
    tenderId: string,
    requirementId: string,
    requestedBidderIds: string[]
  ): Promise<RequirementDetailComparisonResponse> {
    const tender = await this.repository.getTender(tenderId);
    if (!tender) throw new Error(`Tender ${tenderId} not found`);

    const requirements = await this.repository.getTenderRequirements(tenderId);
    const req = requirements.find((r) => r.id === requirementId);
    if (!req) throw new Error(`Requirement ${requirementId} not found in tender ${tenderId}`);

    const allBidders = await this.repository.getTenderBidders(tenderId);
    const validBidders = allBidders.filter((b) => b.status !== 'ARCHIVED');

    let bidderIds = requestedBidderIds || [];
    if (typeof bidderIds === 'string') {
      bidderIds = (bidderIds as string).split(',').map((s) => s.trim());
    }
    if (bidderIds.length === 0) {
      bidderIds = validBidders.slice(0, 5).map((b) => b.id);
    }

    const evaluations = await this.repository.getEvaluationsForBidders(tenderId, bidderIds);
    const latestEvals = this.filterLatestEvaluations(evaluations);
    const conflicts = await this.repository.getConflictsForBidders(tenderId, bidderIds);
    const investigations = await this.repository.getInvestigationsForBidders(tenderId, bidderIds);
    const evidenceList = await this.repository.getEvidenceForBidders(tenderId, bidderIds);
    const mappings = await this.repository.getRequirementMappingsForBidders(tenderId, bidderIds);

    const rule = req.rules && req.rules.length > 0 ? req.rules[0] : null;

    const bidderComparisons: RequirementDetailComparisonItem[] = bidderIds.map((bId) => {
      const b = validBidders.find((bid) => bid.id === bId);
      const bCode = b?.bidderCode || bId;
      const bName = b?.legalName || 'Bidder';

      const ev = latestEvals.find((e) => e.requirementId === requirementId && e.bidderId === bId);
      const bConflicts = conflicts.filter(
        (c) => c.bidderId === bId && (c.requirementId === requirementId || (c as any).fieldKey)
      );
      const bInvs = investigations.filter(
        (i) => i.bidderId === bId && i.requirementId === requirementId
      );

      // Find mapped evidence or evidence matching bidder & field/req
      const mappedForBidder = mappings.filter(
        (m) => m.bidderId === bId && m.tenderRequirementId === requirementId
      );

      let bidderEvList = evidenceList.filter((e) => {
        const subBId = e.bidDocument?.bidSubmission?.bidderId;
        return subBId === bId || (e as any).bidderId === bId;
      });

      if (mappedForBidder.length > 0) {
        const mappedEvIds = new Set(mappedForBidder.map((m) => m.evidenceId));
        bidderEvList = bidderEvList.filter((e) => mappedEvIds.has(e.id));
      }

      return {
        bidderId: bId,
        bidderCode: bCode,
        legalName: bName,
        evaluation: {
          evaluationId: ev?.id,
          result: (ev?.result as EvaluationStatus) || 'NO_RESULT',
          reasonCode: ev?.reasonCode,
          summary: ev?.summary,
          explanation: ev?.explanation,
          calculationTrace: ev?.calculationTrace || null,
          version: ev?.version || 1,
          evaluatedAt: ev?.evaluatedAt,
        },
        evidenceList: bidderEvList.map((e) => ({
          id: e.id,
          fieldKey: e.fieldKey,
          fieldLabel: e.fieldLabel || e.fieldKey,
          rawValue: e.rawValue,
          normalizedValue: e.normalizedValue,
          unit: e.unit || null,
          pageNumber: e.pageNumber || 1,
          documentName: e.bidDocument?.originalFilename || 'Bid Document',
          confidence: e.confidence || 0.9,
          status: e.status || 'EXTRACTED',
          conflictFlag: Boolean(e.conflictFlag),
          conflictReason: e.conflictReason || null,
        })),
        conflicts: bConflicts.map((c) => ({
          id: c.id,
          conflictType: c.conflictType,
          severity: c.severity,
          description: c.description,
          status: c.status,
        })),
        investigations: bInvs.map((i) => ({
          id: i.id,
          status: i.status,
          triggerType: i.triggerType,
          summary: i.summary || null,
          recommendation: i.recommendation || null,
        })),
      };
    });

    return {
      requirement: {
        id: req.id,
        requirementCode: req.requirementCode,
        clauseReference: req.clauseReference || null,
        requirementText: req.requirementText,
        category: req.category,
        mandatory: req.mandatory || 'YES',
        condition: req.condition || null,
      },
      rule: rule
        ? {
            id: rule.id,
            ruleCode: rule.ruleCode,
            name: rule.name,
            ruleType: rule.ruleType,
            definition: rule.definition,
          }
        : null,
      bidders: bidderComparisons,
    };
  }

  private filterLatestEvaluations(evaluations: any[]): any[] {
    const latestMap = new Map<string, any>();
    for (const ev of evaluations) {
      const key = `${ev.requirementId}_${ev.bidderId}`;
      const existing = latestMap.get(key);
      if (!existing || (ev.version || 1) > (existing.version || 1)) {
        latestMap.set(key, ev);
      }
    }
    return Array.from(latestMap.values());
  }
}

export const comparisonService = new ComparisonService();
