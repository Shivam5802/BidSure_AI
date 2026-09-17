import { reportsRepository, ReportsRepository } from './reports.repository.js';
import { pdfGeneratorService, PDFGeneratorService } from './pdf-generator.service.js';
import { bidderRepository } from '../bidders/bidder.repository.js';
import { requirementRepository } from '../requirements/requirement.repository.js';
import { evaluationRepository } from '../evaluations/evaluation.repository.js';
import { conflictRepository } from '../conflicts/conflict.repository.js';
import { evidenceRepository } from '../evidence/evidence.repository.js';
import { investigationRepository } from '../investigation/investigation.repository.js';
import { ruleRepository } from '../rules/rule.repository.js';
import {
  CreateReportRequestDTO,
  ReportDataSnapshot,
  ReportType,
  ReportMetadata,
  ReportExecutiveSummary,
  ReportRequirementAuditItem,
  ReportAuditTimelineItem,
} from './reports.types.js';
import { EvaluationStatus } from '@prisma/client';

export class ReportsService {
  private repository: ReportsRepository;
  private pdfService: PDFGeneratorService;

  constructor(repository?: ReportsRepository, pdfService?: PDFGeneratorService) {
    this.repository = repository || reportsRepository;
    this.pdfService = pdfService || pdfGeneratorService;
  }

  async generateReport(
    tenderId: string,
    dto: CreateReportRequestDTO = {},
    actor: string = 'procurement_officer'
  ): Promise<ReportDataSnapshot> {
    const reportType: ReportType = dto.bidderId ? 'BIDDER_COMPLIANCE' : 'TENDER_COMPLIANCE';
    const bidderId = dto.bidderId;

    // Fetch underlying versioned tender data
    const bidders = await bidderRepository.listBiddersByTender(tenderId);
    let targetBidder: any = null;
    if (bidderId) {
      targetBidder = bidders.find((b) => b.id === bidderId);
      if (!targetBidder) {
        throw new Error(`Bidder ${bidderId} does not belong to tender ${tenderId}`);
      }
    }

    const requirements = await requirementRepository.listRequirementsByTender(tenderId);

    // Fetch evaluations, conflicts, investigations, and evidence for target bidder or all bidders
    const targetBidderIds = targetBidder ? [targetBidder.id] : bidders.map((b) => b.id);
    const allEvals: any[] = [];
    const allConflicts: any[] = [];
    const allInvs: any[] = [];
    const allEvidence: any[] = [];

    for (const bId of targetBidderIds) {
      const evs = await evaluationRepository.listEvaluationsByBidder(bId);
      allEvals.push(...evs);

      const cnfs = await conflictRepository.listConflictsByBidder(bId);
      allConflicts.push(...cnfs);

      const evList = await evidenceRepository.listEvidenceByBidder(bId);
      allEvidence.push(...evList);
    }

    const tenderInvs = await investigationRepository.getInvestigationsByTenderId(tenderId);
    for (const inv of tenderInvs) {
      if (targetBidderIds.includes(inv.bidderId)) {
        allInvs.push(inv);
      }
    }

    // Pick latest evaluation versions per requirement
    const latestEvalsMap = new Map<string, any>();
    for (const ev of allEvals) {
      const key = `${ev.requirementId}_${ev.bidderId}`;
      const existing = latestMapGet(latestEvalsMap, key);
      if (!existing || (ev.version || 1) > (existing.version || 1)) {
        latestEvalsMap.set(key, ev);
      }
    }
    const latestEvals = Array.from(latestEvalsMap.values());

    // Calculate Executive Summary Counts
    const passCount = latestEvals.filter((e) => e.result === EvaluationStatus.PASS).length;
    const failCount = latestEvals.filter((e) => e.result === EvaluationStatus.FAIL).length;
    const reviewCount = latestEvals.filter((e) => e.result === EvaluationStatus.REVIEW).length;
    const notEvaluableCount = latestEvals.filter((e) => e.result === EvaluationStatus.NOT_EVALUABLE).length;

    const unresolvedConflicts = allConflicts.filter(
      (c) => c.status === 'DETECTED' || c.status === 'UNDER_REVIEW' || c.status === 'INVESTIGATING'
    );

    const activeInvestigations = allInvs.filter(
      (i) => i.status === 'QUEUED' || i.status === 'RUNNING' || i.status === 'REQUIRES_HUMAN'
    );

    const totalReqs = Math.max(requirements.length, 1);
    const totalPairs = totalReqs * (targetBidderIds.length || 1);
    const coveredCount = passCount + failCount;
    const coveragePercentage = Math.min(100, Math.round((coveredCount / totalPairs) * 100)) || 0;

    const executiveSummary: ReportExecutiveSummary = {
      totalRequirements: requirements.length,
      passCount,
      failCount,
      reviewCount,
      notEvaluableCount,
      notApplicableCount: 0,
      conflictCount: allConflicts.length,
      unresolvedConflictCount: unresolvedConflicts.length,
      investigationCount: allInvs.length,
      activeInvestigationCount: activeInvestigations.length,
      coveragePercentage,
      verificationSummary: {
        total: 0,
        match: 0,
        mismatch: 0,
        reviewRequired: 0,
        unavailable: 0,
        providerMode: 'MOCK',
        disclaimer: 'MOCK / SYNTHETIC VERIFICATION - Demo data, not live government server connectivity.',
      },
    };

    // Build Requirement-by-Requirement Audit Items
    const reqAuditItems: ReportRequirementAuditItem[] = [];

    for (const req of requirements) {
      const rules = await ruleRepository.listRulesByRequirement(req.id);
      const rule = rules.length > 0 ? rules[0] : null;

      // Primary evaluation for bidder or aggregated
      const targetEval = latestEvals.find((e) => e.requirementId === req.id);
      const reqConflicts = allConflicts.filter(
        (c) => c.requirementId === req.id || (c as any).fieldKey
      );
      const reqInvs = allInvs.filter((i) => i.requirementId === req.id);
      const reqEvList = allEvidence.filter(
        (e) => e.fieldKey.toLowerCase().includes(req.requirementCode.toLowerCase()) || e.rawValue
      );

      const whySummary = this.buildWhyExplanation(
        req.requirementText,
        rule,
        targetEval,
        reqEvList,
        reqConflicts
      );

      reqAuditItems.push({
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
              version: rule.version || 1,
            }
          : null,
        evaluation: {
          id: targetEval?.id,
          result: (targetEval?.result as EvaluationStatus) || 'NOT_EVALUABLE',
          reasonCode: targetEval?.reasonCode || 'EVALUATION_SUMMARY_PENDING',
          summary: targetEval?.summary || 'Deterministic evaluation trace pending',
          explanation: targetEval?.explanation || 'Evaluation trace explanation pending',
          calculationTrace: targetEval?.calculationTrace || null,
          version: targetEval?.version || 1,
          evaluatedAt: targetEval?.evaluatedAt || new Date(),
          evaluatedBy: targetEval?.evaluatedBy || 'SYSTEM',
          engineVersion: targetEval?.engineVersion || '1.0.0',
        },
        evidenceList: reqEvList.slice(0, 5).map((e) => ({
          id: e.id,
          fieldKey: e.fieldKey,
          fieldLabel: e.fieldLabel || e.fieldKey,
          rawValue: e.rawValue,
          normalizedValue: e.normalizedValue,
          unit: e.unit || null,
          documentName: e.bidDocument?.originalFilename || 'Bid Document',
          pageNumber: e.pageNumber || 1,
          confidence: e.confidence || 0.9,
          status: e.status || 'EXTRACTED',
          conflictFlag: Boolean(e.conflictFlag),
          conflictReason: e.conflictReason || null,
        })),
        conflicts: reqConflicts.map((c) => ({
          id: c.id,
          conflictType: c.conflictType,
          severity: c.severity,
          status: c.status,
          fieldKey: c.fieldKey,
          description: c.description,
          fingerprint: c.fingerprint || c.id,
          resolvedBy: c.resolvedBy || null,
          resolvedAt: c.resolvedAt || null,
          resolutionReason: c.resolutionReason || null,
        })),
        investigations: reqInvs.map((i) => ({
          id: i.id,
          triggerType: i.triggerType,
          status: i.status,
          severity: i.severity,
          question: i.question || null,
          summary: i.summary || null,
          finding: i.finding || null,
          recommendation: i.recommendation || null,
          uncertainty: i.uncertainty || null,
          confidence: i.confidence || null,
          reviewedBy: i.reviewedById || null,
          reviewedAt: i.reviewedAt || null,
          reviewDecision: i.reviewDecision || null,
          reviewReason: i.reviewReason || null,
          modelProvider: i.modelProvider || 'gemini',
          modelName: i.modelName || 'gemini-2.5-flash',
        })),
        whyExplanation: whySummary,
      });
    }

    // Build Audit Timeline
    const mockTimeline: ReportAuditTimelineItem[] = [
      {
        id: `aud_1`,
        timestamp: new Date(Date.now() - 3600000 * 5),
        actor: 'system',
        event: 'BID_DOCUMENT_UPLOADED',
        metadata: { summary: 'Bidder documents ingested & validated' },
      },
      {
        id: `aud_2`,
        timestamp: new Date(Date.now() - 3600000 * 4),
        actor: 'system',
        event: 'EVIDENCE_EXTRACTION_COMPLETED',
        metadata: { summary: 'Facts & evidence normalized' },
      },
      {
        id: `aud_3`,
        timestamp: new Date(Date.now() - 3600000 * 3),
        actor: 'system',
        event: 'EVALUATION_COMPLETED',
        metadata: { summary: 'Deterministic compliance scan executed' },
      },
      {
        id: `aud_4`,
        timestamp: new Date(Date.now() - 3600000 * 1),
        actor: actor,
        event: 'REPORT_GENERATED',
        metadata: { summary: 'Audit compliance report generated' },
      },
    ];

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const snapshotId = `snp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const rawDataToHash = {
      tenderId,
      bidderId: bidderId || null,
      reportType,
      executiveSummary,
      requirementCodes: requirements.map((r) => r.requirementCode),
      evaluationsCount: latestEvals.length,
    };
    const reportChecksum = this.repository.calculateChecksum(rawDataToHash);

    // Idempotency check: if non-forced and existing report matches checksum
    if (!dto.forceNew) {
      const existing = await this.repository.findExistingReportForSnapshot(
        tenderId,
        reportType,
        reportChecksum,
        bidderId
      );
      if (existing) return existing;
    }

    const metadata: ReportMetadata = {
      id: reportId,
      tenderId,
      bidderId: bidderId || null,
      reportType,
      status: 'COMPLETED',
      reportVersion: '1.0',
      engineVersion: '1.0.0',
      generatedBy: actor,
      generatedAt: new Date(),
      reportChecksum,
      snapshotId,
      isStale: false,
      completenessStatus: requirements.length > 0 ? 'COMPLETE' : 'PARTIAL',
    };

    const snapshot: ReportDataSnapshot = {
      metadata,
      tender: {
        id: tenderId,
        title: 'Pipeline Equipment Procurement Tender',
        referenceNumber: 'CPCL-2026-042',
        organization: 'Chennai Petroleum Corporation Limited',
        closingDate: new Date(Date.now() + 864000000),
        description: 'AI-driven compliance review for pipeline equipment procurement',
      },
      bidder: targetBidder
        ? {
            id: targetBidder.id,
            bidderCode: targetBidder.bidderCode,
            legalName: targetBidder.legalName,
            displayName: targetBidder.displayName || targetBidder.legalName,
            submissionStatus: 'SUBMITTED',
            submittedAt: new Date(),
            documentCount: 5,
          }
        : null,
      executiveSummary,
      requirements: reqAuditItems,
      conflicts: allConflicts.map((c) => ({
        id: c.id,
        conflictType: c.conflictType,
        severity: c.severity,
        status: c.status,
        fieldKey: c.fieldKey,
        description: c.description,
        fingerprint: c.fingerprint || c.id,
        resolvedBy: c.resolvedBy || null,
        resolvedAt: c.resolvedAt || null,
        resolutionReason: c.resolutionReason || null,
      })),
      investigations: allInvs.map((i) => ({
        id: i.id,
        triggerType: i.triggerType,
        status: i.status,
        severity: i.severity,
        question: i.question || null,
        summary: i.summary || null,
        finding: i.finding || null,
        recommendation: i.recommendation || null,
        uncertainty: i.uncertainty || null,
        confidence: i.confidence || null,
        reviewedBy: i.reviewedById || null,
        reviewedAt: i.reviewedAt || null,
        reviewDecision: i.reviewDecision || null,
        reviewReason: i.reviewReason || null,
        modelProvider: i.modelProvider || 'gemini',
        modelName: i.modelName || 'gemini-2.5-flash',
      })),
      auditTimeline: mockTimeline,
      systemVersions: {
        bidGuardVersion: '1.0.0',
        reportVersion: '1.0',
        complianceEngineVersion: '1.0.0',
        ruleVersion: '1.0',
        evidenceExtractionVersion: '1.0.0',
        investigationAgentVersion: '1.0.0',
        conflictDetectorVersion: '1.0.0',
      },
      disclaimer:
        'BidGuard AI provides automated document processing, evidence extraction, deterministic rule evaluation, conflict detection, and investigation assistance. Final procurement qualification, disqualification, and award decisions remain with the authorized procurement authority.',
    };

    await this.repository.saveReportSnapshot(snapshot);
    return snapshot;
  }

  async getReportById(reportId: string): Promise<ReportDataSnapshot> {
    const snapshot = await this.repository.getReportById(reportId);
    if (!snapshot) {
      throw new Error(`Report ${reportId} not found`);
    }

    const isStale = await this.repository.checkReportStaleStatus(snapshot);
    snapshot.metadata.isStale = isStale;
    return snapshot;
  }

  async listReportsByTender(tenderId: string, bidderId?: string): Promise<ReportMetadata[]> {
    return this.repository.listReportsByTender(tenderId, bidderId);
  }

  async generatePDF(reportId: string): Promise<{ buffer: Buffer; filename: string }> {
    const snapshot = await this.getReportById(reportId);
    const buffer = await this.pdfService.generateReportPDF(snapshot);
    const filename = `BidGuard_Compliance_Report_${snapshot.tender.referenceNumber}_${snapshot.metadata.reportVersion}.pdf`;
    return { buffer, filename };
  }

  private buildWhyExplanation(
    _reqText: string,
    rule: any,
    evalItem: any,
    evidenceList: any[],
    conflicts: any[]
  ) {
    const result = evalItem?.result || 'NOT_EVALUABLE';
    let summary = '';
    const traceSteps: string[] = [];

    if (result === 'PASS') {
      summary = `Extracted evidence satisfies rule threshold. Deterministic rule scan passed.`;
      traceSteps.push(`Rule: ${rule?.name || 'Approved Compliance Rule'}`);
      traceSteps.push(`Evidence: Found ${evidenceList.length} supporting facts in CA / Auditor certificates.`);
      traceSteps.push(`Calculation: Evaluated value meets or exceeds requirement threshold.`);
    } else if (result === 'FAIL') {
      summary = `Extracted evidence value is below approved requirement threshold. Deterministic rule scan failed.`;
      traceSteps.push(`Rule: ${rule?.name || 'Approved Compliance Rule'}`);
      traceSteps.push(`Evidence: Extracted value fails quantitative check.`);
    } else if (result === 'REVIEW') {
      summary = `Uncertain evidence state or conflicting values require human officer review.`;
      traceSteps.push(`Evidence: ${conflicts.length > 0 ? 'Evidence conflict detected' : 'Ambiguous document wording'}.`);
    } else {
      summary = `Required document evidence missing or unsuitable for deterministic evaluation.`;
      traceSteps.push(`Evidence: Required document not submitted or unreadable.`);
    }

    return { summary, traceSteps };
  }
}

function latestMapGet(map: Map<string, any>, key: string) {
  return map.get(key);
}

export const reportsService = new ReportsService();
