import {
  ComplianceEvaluation,
  EvaluationStatus,
  EvaluationRunStatus,
  AuditEventType,
} from '@prisma/client';
import { evaluationRepository } from './evaluation.repository.js';
import { evaluationEngine, ENGINE_VERSION } from './evaluation-engine.service.js';
import { requirementRepository } from '../requirements/requirement.repository.js';
import { ruleRepository } from '../rules/rule.repository.js';
import { bidderRepository } from '../bidders/bidder.repository.js';
import { mappingRepository } from '../mappings/mapping.repository.js';
import { evidenceRepository } from '../evidence/evidence.repository.js';
import { auditService } from '../../services/audit/audit.service.js';

export interface EvaluationRunSummary {
  runId: string;
  tenderId: string;
  bidderId: string;
  status: EvaluationRunStatus;
  totalRequirements: number;
  passCount: number;
  failCount: number;
  reviewCount: number;
  notEvaluableCount: number;
  notApplicableCount: number;
  evaluations: ComplianceEvaluation[];
}

export class EvaluationService {
  /**
   * Evaluates all approved rules for a bidder's submission
   */
  async evaluateBidderSubmission(
    bidderId: string,
    actor = 'procurement_officer'
  ): Promise<EvaluationRunSummary> {
    const bidder = await bidderRepository.findBidderById(bidderId);
    if (!bidder) throw new Error(`Bidder ${bidderId} not found`);

    const submission = await bidderRepository.findActiveSubmissionByBidder(bidderId);
    if (!submission) throw new Error(`Active submission for bidder ${bidderId} not found`);

    const blueprint = await requirementRepository.getLatestBlueprint(bidder.tenderId);
    if (!blueprint || blueprint.requirements.length === 0) {
      throw new Error(`No compliance blueprint requirements found for tender ${bidder.tenderId}`);
    }

    // Create Evaluation Run Record
    const run = await evaluationRepository.createEvaluationRun({
      tenderId: bidder.tenderId,
      bidderId,
      bidSubmissionId: submission.id,
      engineVersion: ENGINE_VERSION,
      createdBy: actor,
    });

    await auditService.log(AuditEventType.EVALUATION_STARTED, {
      tenderId: bidder.tenderId,
      bidderId,
      submissionId: submission.id,
      actor,
      metadata: { runId: run.id, totalRequirements: blueprint.requirements.length },
    });

    await evaluationRepository.updateEvaluationRun(run.id, {
      status: EvaluationRunStatus.RUNNING,
      totalRequirements: blueprint.requirements.length,
    });

    const evaluations: ComplianceEvaluation[] = [];
    let passCount = 0;
    let failCount = 0;
    let reviewCount = 0;
    let notEvaluableCount = 0;
    let notApplicableCount = 0;

    for (const req of blueprint.requirements) {
      try {
        const evalRecord = await this.evaluateSingleRequirement(
          bidder.tenderId,
          bidderId,
          submission.id,
          req.id,
          actor
        );

        evaluations.push(evalRecord);

        if (evalRecord.applicability === 'NOT_APPLICABLE') {
          notApplicableCount++;
        } else {
          switch (evalRecord.result) {
            case EvaluationStatus.PASS:
              passCount++;
              break;
            case EvaluationStatus.FAIL:
              failCount++;
              break;
            case EvaluationStatus.REVIEW:
              reviewCount++;
              break;
            case EvaluationStatus.NOT_EVALUABLE:
              notEvaluableCount++;
              break;
          }
        }
      } catch (err: any) {
        // Individual requirement failure does not abort full run
        notEvaluableCount++;
      }
    }

    await evaluationRepository.updateEvaluationRun(run.id, {
      status: EvaluationRunStatus.COMPLETED,
      passCount,
      failCount,
      reviewCount,
      notEvaluableCount,
      notApplicableCount,
      completed: true,
    });

    await auditService.log(AuditEventType.EVALUATION_COMPLETED, {
      tenderId: bidder.tenderId,
      bidderId,
      submissionId: submission.id,
      actor,
      metadata: {
        runId: run.id,
        passCount,
        failCount,
        reviewCount,
        notEvaluableCount,
      },
    });

    return {
      runId: run.id,
      tenderId: bidder.tenderId,
      bidderId,
      status: EvaluationRunStatus.COMPLETED,
      totalRequirements: blueprint.requirements.length,
      passCount,
      failCount,
      reviewCount,
      notEvaluableCount,
      notApplicableCount,
      evaluations,
    };
  }

  /**
   * Evaluates a single requirement for a bidder
   */
  async evaluateSingleRequirement(
    tenderId: string,
    bidderId: string,
    submissionId: string,
    requirementId: string,
    actor = 'procurement_officer'
  ): Promise<ComplianceEvaluation> {
    const req = await requirementRepository.findRequirementById(requirementId);
    if (!req) throw new Error(`Requirement ${requirementId} not found`);

    // Fetch approved rules for requirement
    const rules = await ruleRepository.listRulesByRequirement(requirementId);
    const approvedRule = rules.find((r) => r.status === 'APPROVED');

    if (!approvedRule) {
      // Unapproved rule gate
      const dummyEval = await evaluationRepository.createEvaluation({
        tenderId,
        bidderId,
        bidSubmissionId: submissionId,
        requirementId,
        ruleId: rules[0]?.id || `unapproved_${requirementId}`,
        ruleVersion: rules[0]?.version || 1,
        result: EvaluationStatus.NOT_EVALUABLE,
        reasonCode: 'UNAPPROVED_RULE',
        summary: `Requirement ${req.requirementCode} has no approved compliance rule.`,
        explanation: `Only APPROVED rules may be executed for compliance evaluation. Rule is not in APPROVED status.`,
        evaluatedBy: actor,
      });
      return dummyEval;
    }

    // Fetch active mappings for requirement & bidder
    const mappings = await mappingRepository.listMappingsByRequirement(requirementId, bidderId, true);

    // Hydrate mapped evidence items with document details
    const richMappings: any[] = [];
    for (const m of mappings) {
      const ev = await evidenceRepository.findEvidenceById(m.evidenceId);
      if (ev) {
        const doc = await bidderRepository.findBidDocumentById(ev.bidDocumentId);
        richMappings.push({
          ...m,
          evidence: {
            ...ev,
            documentName: doc ? doc.originalFilename : 'Bid Document',
          },
        });
      }
    }

    // Execute Deterministic Evaluation Engine
    const evalResult = evaluationEngine.evaluateRule(
      {
        id: req.id,
        requirementCode: req.requirementCode,
        requirementText: req.requirementText,
        category: req.category,
      },
      {
        id: approvedRule.id,
        ruleCode: approvedRule.ruleCode,
        status: approvedRule.status,
        version: approvedRule.version,
        definition: approvedRule.definition,
      },
      richMappings
    );

    // Save Evaluation Record with Versioning
    const evaluation = await evaluationRepository.createEvaluation({
      tenderId,
      bidderId,
      bidSubmissionId: submissionId,
      requirementId,
      ruleId: approvedRule.id,
      ruleVersion: approvedRule.version,
      result: evalResult.result,
      applicability: evalResult.applicability,
      reasonCode: evalResult.reasonCode,
      summary: evalResult.summary,
      explanation: evalResult.explanation,
      calculationTrace: evalResult.calculationTrace,
      inputSnapshot: evalResult.inputSnapshot,
      outputSnapshot: evalResult.outputSnapshot,
      evidenceSnapshot: evalResult.evidenceSnapshot,
      engineVersion: evalResult.engineVersion,
      evaluatedBy: actor,
    });

    return evaluation;
  }

  /**
   * Retrieves latest compliance evaluations for a bidder
   */
  async getBidderEvaluations(bidderId: string): Promise<ComplianceEvaluation[]> {
    return evaluationRepository.getLatestEvaluationsByBidder(bidderId);
  }

  /**
   * Retrieves calculation trace for an evaluation
   */
  async getEvaluationTrace(evaluationId: string): Promise<ComplianceEvaluation | null> {
    return evaluationRepository.findEvaluationById(evaluationId);
  }
}

export const evaluationService = new EvaluationService();
