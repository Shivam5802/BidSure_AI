import { PrismaClient } from '@prisma/client';
import { bidderRepository } from '../bidders/bidder.repository.js';
import { requirementRepository } from '../requirements/requirement.repository.js';
import { evaluationRepository } from '../evaluations/evaluation.repository.js';
import { conflictRepository } from '../conflicts/conflict.repository.js';
import { evidenceRepository } from '../evidence/evidence.repository.js';
import { investigationRepository } from '../investigation/investigation.repository.js';
import { ruleRepository } from '../rules/rule.repository.js';

export class ComparisonRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  async getTender(tenderId: string) {
    try {
      const tender = await this.prisma.tender.findUnique({
        where: { id: tenderId },
      });
      if (tender) return tender;
    } catch {}

    // Fallback mock tender info
    return {
      id: tenderId,
      title: 'Pipeline Equipment Procurement Tender',
      referenceNumber: 'CPCL-2026-042',
      organization: 'Chennai Petroleum Corporation Limited',
      status: 'READY',
      closingDate: new Date(Date.now() + 864000000),
      createdAt: new Date(),
      description: 'AI-driven compliance review for pipeline equipment procurement',
    };
  }

  async getTenderBidders(tenderId: string) {
    try {
      const bidders = await this.prisma.bidder.findMany({
        where: { tenderId },
        include: {
          submissions: {
            include: {
              documents: true,
            },
          },
        },
      });
      if (bidders && bidders.length > 0) return bidders;
    } catch {}

    return bidderRepository.listBiddersByTender(tenderId);
  }

  async getTenderRequirements(tenderId: string) {
    try {
      const requirements = await this.prisma.tenderRequirement.findMany({
        where: { blueprint: { tenderId } },
        include: {
          rules: {
            where: { status: 'APPROVED' },
            orderBy: { version: 'desc' },
            take: 1,
          },
        },
      });
      if (requirements && requirements.length > 0) return requirements;
    } catch {}

    const reqs = await requirementRepository.listRequirementsByTender(tenderId);
    const enrichedReqs = [];
    for (const r of reqs) {
      const rules = await ruleRepository.listRulesByRequirement(r.id);
      enrichedReqs.push({
        ...r,
        rules,
      });
    }
    return enrichedReqs;
  }

  async getEvaluationsForBidders(tenderId: string, bidderIds: string[]) {
    try {
      const evaluations = await this.prisma.complianceEvaluation.findMany({
        where: {
          tenderId,
          bidderId: { in: bidderIds },
        },
        orderBy: { version: 'desc' },
      });
      if (evaluations && evaluations.length > 0) return evaluations;
    } catch {}

    const allEvals: any[] = [];
    for (const bId of bidderIds) {
      const evs = await evaluationRepository.listEvaluationsByBidder(bId);
      allEvals.push(...evs);
    }
    return allEvals;
  }

  async getConflictsForBidders(tenderId: string, bidderIds: string[]) {
    try {
      const conflicts = await this.prisma.evidenceConflict.findMany({
        where: {
          tenderId,
          bidderId: { in: bidderIds },
        },
      });
      if (conflicts && conflicts.length > 0) return conflicts;
    } catch {}

    const allConflicts: any[] = [];
    for (const bId of bidderIds) {
      const cnfs = await conflictRepository.listConflictsByBidder(bId);
      allConflicts.push(...cnfs);
    }
    return allConflicts;
  }

  async getInvestigationsForBidders(tenderId: string, bidderIds: string[]) {
    try {
      const investigations = await this.prisma.complianceInvestigation.findMany({
        where: {
          tenderId,
          bidderId: { in: bidderIds },
        },
      });
      if (investigations && investigations.length > 0) return investigations;
    } catch {}

    return investigationRepository.getInvestigationsByTenderId(tenderId);
  }

  async getEvidenceForBidders(tenderId: string, bidderIds: string[]) {
    try {
      const evidence = await this.prisma.extractedEvidence.findMany({
        where: {
          bidDocument: {
            bidSubmission: {
              tenderId,
              bidderId: { in: bidderIds },
            },
          },
        },
        include: {
          bidDocument: {
            include: {
              bidSubmission: true,
            },
          },
        },
      });
      if (evidence && evidence.length > 0) return evidence;
    } catch {}

    const allEvidence: any[] = [];
    for (const bId of bidderIds) {
      const evs = await evidenceRepository.listEvidenceByBidder(bId);
      allEvidence.push(...evs);
    }
    return allEvidence;
  }

  async getRequirementMappingsForBidders(tenderId: string, bidderIds: string[]) {
    try {
      const mappings = await this.prisma.requirementEvidenceMapping.findMany({
        where: {
          bidderId: { in: bidderIds },
          tenderRequirement: {
            blueprint: { tenderId },
          },
        },
        include: {
          evidence: true,
        },
      });
      if (mappings && mappings.length > 0) return mappings;
    } catch {}

    return [];
  }
}

const globalForComparisonRepo = globalThis as unknown as { comparisonRepository: ComparisonRepository };
export const comparisonRepository = globalForComparisonRepo.comparisonRepository || new ComparisonRepository();
if (process.env.NODE_ENV !== 'production') globalForComparisonRepo.comparisonRepository = comparisonRepository;
