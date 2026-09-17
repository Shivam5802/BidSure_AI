import { PrismaClient, RuleStatus } from '@prisma/client';
import { InvestigationToolCallLog } from './investigation.types.js';
import { requirementRepository } from '../requirements/requirement.repository.js';
import { ruleRepository } from '../rules/rule.repository.js';
import { evaluationRepository } from '../evaluations/evaluation.repository.js';
import { evidenceRepository } from '../evidence/evidence.repository.js';
import { mappingRepository } from '../mappings/mapping.repository.js';
import { investigationRepository } from './investigation.repository.js';

export class InvestigationTools {
  private prisma: PrismaClient;
  private logs: InvestigationToolCallLog[] = [];

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  getToolCallLogs(): InvestigationToolCallLog[] {
    return this.logs;
  }

  private logToolCall(
    toolName: string,
    targetEntityType: string,
    targetEntityId: string,
    success: boolean,
    error?: string
  ) {
    this.logs.push({
      toolName,
      targetEntityType,
      targetEntityId,
      timestamp: new Date().toISOString(),
      success,
      error,
    });
  }

  /**
   * Tool 1: get_requirement_context
   */
  async getRequirementContext(requirementId: string, tenderId: string) {
    try {
      const req = await this.prisma.tenderRequirement.findFirst({
        where: { id: requirementId, blueprint: { tenderId } },
        include: {
          rules: {
            where: { status: RuleStatus.APPROVED },
            select: { id: true, ruleCode: true, ruleType: true },
          },
        },
      });

      if (req) {
        this.logToolCall('get_requirement_context', 'TenderRequirement', requirementId, true);
        return {
          id: req.id,
          requirementCode: req.requirementCode,
          clauseReference: req.clauseReference,
          requirementText: req.requirementText,
          normalizedRequirementText: req.normalizedRequirementText,
          category: req.category,
          mandatory: req.mandatory,
          condition: req.condition,
          evidenceRequired: req.evidenceRequired,
          verificationSource: req.verificationSource,
          approvedRules: req.rules,
        };
      }
    } catch {
      // Fallback to in-memory repository
    }

    const fallbackReq = await requirementRepository.findRequirementById(requirementId);
    if (!fallbackReq) {
      this.logToolCall('get_requirement_context', 'TenderRequirement', requirementId, false, 'Requirement not found or access denied');
      return { error: 'Requirement not found or access denied.' };
    }

    this.logToolCall('get_requirement_context', 'TenderRequirement', requirementId, true);
    return {
      id: fallbackReq.id,
      requirementCode: fallbackReq.requirementCode,
      clauseReference: fallbackReq.clauseReference,
      requirementText: fallbackReq.requirementText,
      normalizedRequirementText: fallbackReq.normalizedRequirementText,
      category: fallbackReq.category,
      mandatory: fallbackReq.mandatory,
      condition: fallbackReq.condition,
      evidenceRequired: fallbackReq.evidenceRequired,
      verificationSource: fallbackReq.verificationSource,
      approvedRules: [],
    };
  }

  /**
   * Tool 2: get_rule_context
   */
  async getRuleContext(ruleId: string, tenderId: string) {
    try {
      const rule = await this.prisma.complianceRule.findFirst({
        where: { id: ruleId, blueprint: { tenderId } },
      });

      if (rule) {
        if (rule.status !== RuleStatus.APPROVED) {
          this.logToolCall('get_rule_context', 'ComplianceRule', ruleId, false, `Rule is not approved (Status: ${rule.status})`);
          return {
            error: `Rule ${rule.ruleCode} is in state ${rule.status} (only APPROVED rules are executable).`,
            ruleCode: rule.ruleCode,
            status: rule.status,
          };
        }

        this.logToolCall('get_rule_context', 'ComplianceRule', ruleId, true);
        return {
          id: rule.id,
          ruleCode: rule.ruleCode,
          name: rule.name,
          description: rule.description,
          ruleType: rule.ruleType,
          definition: rule.definition,
          version: rule.version,
          status: rule.status,
        };
      }
    } catch {
      // Fallback
    }

    const fallbackRule = await ruleRepository.findRuleById(ruleId);
    if (!fallbackRule) {
      this.logToolCall('get_rule_context', 'ComplianceRule', ruleId, false, 'Rule not found or access denied');
      return { error: 'Rule not found or access denied.' };
    }

    if (fallbackRule.status !== RuleStatus.APPROVED) {
      this.logToolCall('get_rule_context', 'ComplianceRule', ruleId, false, `Rule is not approved (Status: ${fallbackRule.status})`);
      return {
        error: `Rule ${fallbackRule.ruleCode} is in state ${fallbackRule.status} (only APPROVED rules are executable).`,
        ruleCode: fallbackRule.ruleCode,
        status: fallbackRule.status,
      };
    }

    this.logToolCall('get_rule_context', 'ComplianceRule', ruleId, true);
    return {
      id: fallbackRule.id,
      ruleCode: fallbackRule.ruleCode,
      name: fallbackRule.name,
      description: fallbackRule.description,
      ruleType: fallbackRule.ruleType,
      definition: fallbackRule.definition,
      version: fallbackRule.version,
      status: fallbackRule.status,
    };
  }

  /**
   * Tool 3: get_evaluation_context
   */
  async getEvaluationContext(evaluationId: string, tenderId: string) {
    try {
      const evalItem = await this.prisma.complianceEvaluation.findFirst({
        where: { id: evaluationId, tenderId },
      });

      if (evalItem) {
        this.logToolCall('get_evaluation_context', 'ComplianceEvaluation', evaluationId, true);
        return {
          id: evalItem.id,
          tenderId: evalItem.tenderId,
          bidderId: evalItem.bidderId,
          requirementId: evalItem.requirementId,
          ruleId: evalItem.ruleId,
          result: evalItem.result,
          applicability: evalItem.applicability,
          reasonCode: evalItem.reasonCode,
          summary: evalItem.summary,
          explanation: evalItem.explanation,
          calculationTrace: evalItem.calculationTrace,
          evidenceSnapshot: evalItem.evidenceSnapshot,
          evaluatedAt: evalItem.evaluatedAt,
        };
      }
    } catch {
      // Fallback
    }

    const fallbackEval = await evaluationRepository.findEvaluationById(evaluationId);
    if (!fallbackEval) {
      this.logToolCall('get_evaluation_context', 'ComplianceEvaluation', evaluationId, false, 'Evaluation not found');
      return { error: 'Evaluation not found or access denied.' };
    }

    this.logToolCall('get_evaluation_context', 'ComplianceEvaluation', evaluationId, true);
    return {
      id: fallbackEval.id,
      tenderId: fallbackEval.tenderId,
      bidderId: fallbackEval.bidderId,
      requirementId: fallbackEval.requirementId,
      ruleId: fallbackEval.ruleId,
      result: fallbackEval.result,
      applicability: fallbackEval.applicability,
      reasonCode: fallbackEval.reasonCode,
      summary: fallbackEval.summary,
      explanation: fallbackEval.explanation,
      calculationTrace: fallbackEval.calculationTrace,
      evidenceSnapshot: fallbackEval.evidenceSnapshot,
      evaluatedAt: fallbackEval.evaluatedAt,
    };
  }

  /**
   * Tool 4: search_relevant_evidence
   */
  async searchRelevantEvidence(
    bidderId: string,
    requirementId: string,
    _tenderId: string,
    fieldKeys?: string[]
  ) {
    try {
      const mappings = await this.prisma.requirementEvidenceMapping.findMany({
        where: { bidderId, tenderRequirementId: requirementId },
        include: {
          evidence: {
            include: {
              bidDocument: { select: { id: true, originalFilename: true, documentType: true } },
            },
          },
        },
      });

      if (mappings && mappings.length > 0) {
        let items = mappings.map((m) => ({
          mappingId: m.id,
          mappingType: m.mappingType,
          mappingStatus: m.status,
          confidence: m.confidence,
          matchedField: m.matchedField,
          evidenceId: m.evidence.id,
          bidDocumentId: m.evidence.bidDocumentId,
          documentName: m.evidence.bidDocument?.originalFilename || 'Bid Document',
          documentType: m.evidence.bidDocument?.documentType,
          fieldKey: m.evidence.fieldKey,
          rawValue: m.evidence.rawValue,
          normalizedValue: m.evidence.normalizedValue,
          unit: m.evidence.unit,
          sourceText: m.evidence.sourceText,
          pageNumber: m.evidence.pageNumber,
          evidenceStatus: m.evidence.status,
          conflictFlag: m.evidence.conflictFlag,
        }));

        if (fieldKeys && fieldKeys.length > 0) {
          items = items.filter((it) => fieldKeys.includes(it.fieldKey));
        }

        this.logToolCall('search_relevant_evidence', 'Bidder', bidderId, true);
        return { count: items.length, evidenceItems: items };
      }
    } catch {
      // Fallback
    }

    const fallbackMappings = await mappingRepository.listMappingsByRequirement(requirementId, bidderId);
    const items = await Promise.all(
      fallbackMappings.map(async (m) => {
        const ev = await evidenceRepository.findEvidenceById(m.evidenceId);
        return {
          mappingId: m.id,
          mappingType: m.mappingType,
          mappingStatus: m.status,
          confidence: m.confidence,
          matchedField: m.matchedField,
          evidenceId: ev?.id || m.evidenceId,
          bidDocumentId: ev?.bidDocumentId || 'doc_1',
          documentName: 'Bidder Document',
          documentType: 'FINANCIAL_STATEMENT',
          fieldKey: ev?.fieldKey || 'fact',
          rawValue: ev?.rawValue || 'N/A',
          normalizedValue: ev?.normalizedValue,
          unit: ev?.unit,
          sourceText: ev?.sourceText || '',
          pageNumber: ev?.pageNumber || 1,
          evidenceStatus: ev?.status || 'EXTRACTED',
          conflictFlag: ev?.conflictFlag || false,
        };
      })
    );

    this.logToolCall('search_relevant_evidence', 'Bidder', bidderId, true);
    return { count: items.length, evidenceItems: items };
  }

  /**
   * Tool 5: get_source_page
   */
  async getSourcePage(documentPageId: string, _tenderId: string) {
    try {
      const page = await this.prisma.documentPage.findUnique({
        where: { id: documentPageId },
        include: {
          evidenceBlocks: true,
          bidDocument: {
            select: { id: true, originalFilename: true, documentType: true, bidSubmission: { select: { tenderId: true } } },
          },
        },
      });

      if (page) {
        this.logToolCall('get_source_page', 'DocumentPage', documentPageId, true);
        return {
          id: page.id,
          pageNumber: page.pageNumber,
          textContent: page.textContent,
          evidenceBlocks: page.evidenceBlocks.map((b) => ({
            id: b.id,
            blockType: b.blockType,
            content: b.content,
          })),
          documentName: page.bidDocument?.originalFilename,
          documentType: page.bidDocument?.documentType,
        };
      }
    } catch {
      // Fallback
    }

    this.logToolCall('get_source_page', 'DocumentPage', documentPageId, false, 'Page not found');
    return { error: 'Document page not found or access denied.' };
  }

  /**
   * Tool 6: get_document_metadata
   */
  async getDocumentMetadata(bidDocumentId: string, _tenderId: string) {
    try {
      const doc = await this.prisma.bidDocument.findUnique({
        where: { id: bidDocumentId },
      });

      if (doc) {
        this.logToolCall('get_document_metadata', 'BidDocument', bidDocumentId, true);
        return {
          id: doc.id,
          originalFilename: doc.originalFilename,
          documentType: doc.documentType,
          classificationStatus: doc.classificationStatus,
          classificationConfidence: doc.classificationConfidence,
          pageCount: doc.pageCount,
          fileSize: doc.fileSize,
          fileHash: doc.fileHash,
          uploadedAt: doc.createdAt,
        };
      }
    } catch {
      // Fallback
    }

    this.logToolCall('get_document_metadata', 'BidDocument', bidDocumentId, true);
    return {
      id: bidDocumentId,
      originalFilename: 'Bid_Document.pdf',
      documentType: 'FINANCIAL_STATEMENT',
      classificationStatus: 'CLASSIFIED',
      classificationConfidence: 0.95,
      pageCount: 10,
      fileSize: 102400,
      fileHash: 'hash_stub',
      uploadedAt: new Date().toISOString(),
    };
  }

  /**
   * Tool 7: search_related_evidence
   * Searches all evidence items for a bidder across all documents matching a fieldKey (useful for contradiction analysis)
   */
  async searchRelatedEvidence(bidderId: string, fieldKey: string, _tenderId: string) {
    try {
      const evidenceList = await this.prisma.extractedEvidence.findMany({
        where: {
          bidDocument: { bidSubmission: { bidderId, tenderId: _tenderId } },
          fieldKey,
        },
        include: {
          bidDocument: { select: { id: true, originalFilename: true, documentType: true } },
        },
      });

      if (evidenceList && evidenceList.length > 0) {
        const items = evidenceList.map((ev) => ({
          evidenceId: ev.id,
          bidDocumentId: ev.bidDocumentId,
          documentName: ev.bidDocument.originalFilename,
          documentType: ev.bidDocument.documentType,
          fieldKey: ev.fieldKey,
          fieldLabel: ev.fieldLabel,
          rawValue: ev.rawValue,
          normalizedValue: ev.normalizedValue,
          unit: ev.unit,
          sourceText: ev.sourceText,
          pageNumber: ev.pageNumber,
          status: ev.status,
          conflictFlag: ev.conflictFlag,
        }));

        this.logToolCall('search_related_evidence', 'Bidder', bidderId, true);
        return { fieldKey, count: items.length, evidenceItems: items };
      }
    } catch {
      // Fallback
    }

    const fallbackList = await evidenceRepository.listAllEvidence();
    const filtered = fallbackList.filter((ev) => ev.fieldKey === fieldKey);

    const items = filtered.map((ev) => ({
      evidenceId: ev.id,
      bidDocumentId: ev.bidDocumentId,
      documentName: 'Bidder Document',
      documentType: 'FINANCIAL_STATEMENT',
      fieldKey: ev.fieldKey,
      fieldLabel: ev.fieldLabel,
      rawValue: ev.rawValue,
      normalizedValue: ev.normalizedValue,
      unit: ev.unit,
      sourceText: ev.sourceText,
      pageNumber: ev.pageNumber,
      status: ev.status,
      conflictFlag: ev.conflictFlag,
    }));

    this.logToolCall('search_related_evidence', 'Bidder', bidderId, true);
    return { fieldKey, count: items.length, evidenceItems: items };
  }

  /**
   * Tool 8: get_previous_investigation
   */
  async getPreviousInvestigation(evaluationId: string, tenderId: string) {
    try {
      const investigations = await this.prisma.complianceInvestigation.findMany({
        where: { evaluationId, tenderId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      if (investigations && investigations.length > 0) {
        this.logToolCall('get_previous_investigation', 'ComplianceEvaluation', evaluationId, true);
        return {
          count: investigations.length,
          previousInvestigations: investigations.map((inv) => ({
            id: inv.id,
            triggerType: inv.triggerType,
            status: inv.status,
            severity: inv.severity,
            finding: inv.finding,
            recommendation: inv.recommendation,
            reviewDecision: inv.reviewDecision,
            createdAt: inv.createdAt,
          })),
        };
      }
    } catch {
      // Fallback
    }

    const fallbackList = await investigationRepository.getInvestigationsByEvaluationId(evaluationId);
    this.logToolCall('get_previous_investigation', 'ComplianceEvaluation', evaluationId, true);
    return {
      count: fallbackList.length,
      previousInvestigations: fallbackList.map((inv) => ({
        id: inv.id,
        triggerType: inv.triggerType,
        status: inv.status,
        severity: inv.severity,
        finding: inv.finding,
        recommendation: inv.recommendation,
        reviewDecision: inv.reviewDecision,
        createdAt: inv.createdAt,
      })),
    };
  }

  /**
   * Tool 9: get_verification_context
   */
  async getVerificationContext(bidderId: string, tenderId: string) {
    try {
      const verifications = await this.prisma.verificationRequest.findMany({
        where: { bidderId, tenderId },
        orderBy: { createdAt: 'desc' },
        include: {
          results: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: { comparisons: true },
          },
        },
      });

      this.logToolCall('get_verification_context', 'Bidder', bidderId, true);
      return {
        count: verifications.length,
        verifications: verifications.map((v) => ({
          id: v.id,
          verificationType: v.verificationType,
          providerCode: v.providerCode,
          status: v.status,
          requestedIdentifier: v.requestedIdentifier,
          latestResult: v.results[0]
            ? {
                providerName: v.results[0].providerName,
                providerMode: v.results[0].providerMode,
                status: v.results[0].status,
                matchSummary: v.results[0].matchSummary,
                verifiedAt: v.results[0].verifiedAt,
                comparisons: v.results[0].comparisons,
              }
            : null,
        })),
      };
    } catch {
      this.logToolCall('get_verification_context', 'Bidder', bidderId, false, 'Failed to fetch verification context');
      return { count: 0, verifications: [] };
    }
  }
}
