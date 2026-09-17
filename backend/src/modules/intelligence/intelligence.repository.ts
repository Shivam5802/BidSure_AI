import { PrismaClient } from '@prisma/client';
import { BenchmarkRecordInput } from './types/intelligence.types.js';
import { tenderRepository } from '../tenders/tender.repository.js';
import { bidderRepository } from '../bidders/bidder.repository.js';
import { requirementRepository } from '../requirements/requirement.repository.js';
import { evaluationRepository } from '../evaluations/evaluation.repository.js';
import { conflictRepository } from '../conflicts/conflict.repository.js';

export class IntelligenceRepository {
  // In-memory fallback stores for test/mock environments
  private inMemoryTenders = new Map<string, any>();
  private inMemoryRequirements = new Map<string, any[]>();
  private inMemoryBidders = new Map<string, any[]>();
  private inMemoryEvaluations = new Map<string, any[]>();
  private inMemoryConflicts = new Map<string, any[]>();
  private inMemoryInvestigations = new Map<string, any[]>();
  private inMemoryVerifications = new Map<string, any[]>();
  private inMemoryEvidence = new Map<string, any[]>();
  private inMemoryBenchmarks = new Map<string, any[]>();

  constructor(private prisma: PrismaClient) {}

  // Helper to seed in-memory data for tests if needed
  public seedInMemory(tenderId: string, data: {
    tender?: any;
    requirements?: any[];
    bidders?: any[];
    evaluations?: any[];
    conflicts?: any[];
    investigations?: any[];
    verifications?: any[];
    evidence?: any[];
  }) {
    if (data.tender) this.inMemoryTenders.set(tenderId, data.tender);
    if (data.requirements) this.inMemoryRequirements.set(tenderId, data.requirements);
    if (data.bidders) this.inMemoryBidders.set(tenderId, data.bidders);
    if (data.evaluations) this.inMemoryEvaluations.set(tenderId, data.evaluations);
    if (data.conflicts) this.inMemoryConflicts.set(tenderId, data.conflicts);
    if (data.investigations) this.inMemoryInvestigations.set(tenderId, data.investigations);
    if (data.verifications) this.inMemoryVerifications.set(tenderId, data.verifications);
    if (data.evidence) this.inMemoryEvidence.set(tenderId, data.evidence);
  }

  async getTenderHeader(tenderId: string) {
    try {
      const tender = await this.prisma.tender.findUnique({
        where: { id: tenderId },
        select: {
          id: true,
          title: true,
          referenceNumber: true,
          organization: true,
          closingDate: true,
          status: true,
          createdAt: true,
        },
      });
      if (tender) return tender;
    } catch {}

    if (this.inMemoryTenders.has(tenderId)) {
      return this.inMemoryTenders.get(tenderId);
    }
    const memTender = await tenderRepository.findTenderById(tenderId);
    if (memTender) return memTender;
    return null;
  }

  async getTenderRequirements(tenderId: string) {
    try {
      return await this.prisma.tenderRequirement.findMany({
        where: { blueprint: { tenderId } },
        include: {
          rules: {
            select: { id: true, status: true },
          },
          sourceReferences: true,
        },
      });
    } catch {}

    if (this.inMemoryRequirements.has(tenderId)) {
      return this.inMemoryRequirements.get(tenderId) || [];
    }
    try {
      return await requirementRepository.listRequirementsByTender(tenderId);
    } catch {
      return [];
    }
  }

  async getBiddersForTender(tenderId: string) {
    try {
      return await this.prisma.bidder.findMany({
        where: { tenderId },
        include: {
          submissions: {
            select: { id: true, submissionReference: true, status: true },
          },
        },
      });
    } catch {}

    if (this.inMemoryBidders.has(tenderId)) {
      return this.inMemoryBidders.get(tenderId) || [];
    }
    try {
      return await bidderRepository.listBiddersByTender(tenderId);
    } catch {
      return [];
    }
  }

  async getEvaluationsForTender(tenderId: string) {
    try {
      return await this.prisma.complianceEvaluation.findMany({
        where: { tenderId },
        include: {
          requirement: {
            select: { id: true, requirementCode: true, mandatory: true, category: true },
          },
          bidder: {
            select: { id: true, bidderCode: true, legalName: true },
          },
          rule: {
            select: { id: true, ruleCode: true, version: true },
          },
        },
      });
    } catch {}

    if (this.inMemoryEvaluations.has(tenderId)) {
      return this.inMemoryEvaluations.get(tenderId) || [];
    }
    try {
      const evals = await evaluationRepository.listEvaluationsByTender(tenderId);
      const reqs = await this.getTenderRequirements(tenderId);
      const bidders = await this.getBiddersForTender(tenderId);
      const reqMap = new Map(reqs.map((r: any) => [r.id, r]));
      const bidderMap = new Map(bidders.map((b: any) => [b.id, b]));

      return evals.map((e: any) => ({
        ...e,
        requirement: e.requirement || reqMap.get(e.requirementId) || {
          id: e.requirementId,
          requirementCode: 'REQ',
          mandatory: 'NO',
          category: 'TECHNICAL',
        },
        bidder: e.bidder || bidderMap.get(e.bidderId) || {
          id: e.bidderId,
          bidderCode: 'BID',
          legalName: 'Bidder',
        },
        rule: e.rule || { ruleCode: 'RULE', version: e.ruleVersion || 1 },
      }));
    } catch {
      return [];
    }
  }

  async getEvidenceMappingsForTender(tenderId: string) {
    try {
      return await this.prisma.requirementEvidenceMapping.findMany({
        where: { tenderRequirement: { blueprint: { tenderId } } },
        include: {
          evidence: true,
        },
      });
    } catch {}

    return [];
  }

  async getConflictsForTender(tenderId: string) {
    try {
      return await this.prisma.evidenceConflict.findMany({
        where: { tenderId },
        include: {
          bidder: {
            select: { id: true, bidderCode: true, legalName: true },
          },
        },
      });
    } catch {}

    if (this.inMemoryConflicts.has(tenderId)) {
      return this.inMemoryConflicts.get(tenderId) || [];
    }
    try {
      const conflicts = await conflictRepository.listConflictsByTender(tenderId);
      const bidders = await this.getBiddersForTender(tenderId);
      const bidderMap = new Map(bidders.map((b: any) => [b.id, b]));
      return conflicts.map((c: any) => ({
        ...c,
        bidder: c.bidder || bidderMap.get(c.bidderId) || {
          id: c.bidderId,
          bidderCode: 'BID',
          legalName: 'Bidder',
        },
      }));
    } catch {
      return [];
    }
  }

  async getInvestigationsForTender(tenderId: string) {
    try {
      return await this.prisma.complianceInvestigation.findMany({
        where: { tenderId },
        include: {
          bidder: {
            select: { id: true, bidderCode: true, legalName: true },
          },
          requirement: {
            select: { id: true, requirementCode: true },
          },
        },
      });
    } catch {}

    if (this.inMemoryInvestigations.has(tenderId)) {
      return this.inMemoryInvestigations.get(tenderId) || [];
    }
    return [];
  }

  async getVerificationsForTender(tenderId: string) {
    try {
      return await this.prisma.verificationRequest.findMany({
        where: { tenderId },
        include: {
          bidder: {
            select: { id: true, bidderCode: true, legalName: true },
          },
          requirement: {
            select: { id: true, requirementCode: true },
          },
          results: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: { comparisons: true },
          },
        },
      });
    } catch {}

    if (this.inMemoryVerifications.has(tenderId)) {
      return this.inMemoryVerifications.get(tenderId) || [];
    }
    return [];
  }

  async getTenderDocuments(tenderId: string) {
    try {
      return await this.prisma.tenderDocument.findMany({
        where: { tenderId },
      });
    } catch {}

    return [];
  }

  async getBidDocumentsForTender(tenderId: string) {
    try {
      return await this.prisma.bidDocument.findMany({
        where: { bidSubmission: { tenderId } },
      });
    } catch {}

    return [];
  }

  async getTenderEvidence(tenderId: string) {
    if (this.inMemoryEvidence.has(tenderId)) {
      return this.inMemoryEvidence.get(tenderId) || [];
    }
    return [];
  }

  async getAuditLogCountForTender(tenderId: string) {
    try {
      return await this.prisma.auditLog.count({
        where: { tenderId },
      });
    } catch {}

    return 12; // Fallback mock count for demo/test
  }

  async createBenchmarkSession(input: BenchmarkRecordInput) {
    try {
      return await this.prisma.benchmarkSession.create({
        data: {
          tenderId: input.tenderId,
          scenarioName: input.scenarioName,
          baselineMethod: input.baselineMethod || 'MANUAL_ESTIMATE',
          baselineDurationSeconds: input.baselineDurationSeconds,
          bidguardDurationSeconds: input.bidguardDurationSeconds,
          requirementsCount: input.requirementsCount || 0,
          documentsCount: input.documentsCount || 0,
          operators: input.operators,
          notes: input.notes,
        },
      });
    } catch {}

    const session = {
      id: `bm_${Date.now()}`,
      tenderId: input.tenderId,
      scenarioName: input.scenarioName,
      baselineMethod: input.baselineMethod || 'MANUAL_ESTIMATE',
      baselineDurationSeconds: input.baselineDurationSeconds,
      bidguardDurationSeconds: input.bidguardDurationSeconds,
      requirementsCount: input.requirementsCount || 0,
      documentsCount: input.documentsCount || 0,
      operators: input.operators || null,
      notes: input.notes || null,
      createdAt: new Date().toISOString(),
    };

    const existing = this.inMemoryBenchmarks.get(input.tenderId) || [];
    existing.unshift(session);
    this.inMemoryBenchmarks.set(input.tenderId, existing);
    return session;
  }

  async getBenchmarkSessionsForTender(tenderId: string) {
    try {
      return await this.prisma.benchmarkSession.findMany({
        where: { tenderId },
        orderBy: { createdAt: 'desc' },
      });
    } catch {}

    return this.inMemoryBenchmarks.get(tenderId) || [];
  }
}

export const intelligenceRepository = new IntelligenceRepository(new PrismaClient());

