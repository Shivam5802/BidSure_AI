import { FastifyRequest, FastifyReply } from 'fastify';
import { evaluationService } from './evaluation.service.js';
import { evaluationRepository } from './evaluation.repository.js';
import { bidderRepository } from '../bidders/bidder.repository.js';
import { RunEvaluationBodySchema, RunSingleEvaluationBodySchema } from './evaluation.schema.js';

export class EvaluationController {
  async runBidderEvaluation(request: FastifyRequest<{ Params: { bidderId: string } }>, reply: FastifyReply) {
    const { bidderId } = request.params;
    const body = RunEvaluationBodySchema.parse(request.body || {});
    const summary = await evaluationService.evaluateBidderSubmission(bidderId, body.actor);
    return reply.status(200).send({
      success: true,
      data: summary,
    });
  }

  async runSingleEvaluation(request: FastifyRequest, reply: FastifyReply) {
    const body = RunSingleEvaluationBodySchema.parse(request.body);
    const evaluation = await evaluationService.evaluateSingleRequirement(
      body.tenderId,
      body.bidderId,
      body.submissionId,
      body.requirementId,
      body.actor
    );
    return reply.status(200).send({
      success: true,
      data: evaluation,
    });
  }

  async runTenderAllBiddersEvaluation(request: FastifyRequest<{ Params: { tenderId: string } }>, reply: FastifyReply) {
    const { tenderId } = request.params;
    const body = RunEvaluationBodySchema.parse(request.body || {});
    const bidders = await bidderRepository.listBiddersByTender(tenderId);
    const runs = [];
    for (const b of bidders) {
      try {
        const summary = await evaluationService.evaluateBidderSubmission(b.id, body.actor);
        runs.push(summary);
      } catch {
        // Continue for other bidders
      }
    }
    return reply.status(200).send({
      success: true,
      data: { tenderId, totalBidders: bidders.length, runs },
    });
  }

  async getBidderEvaluations(request: FastifyRequest<{ Params: { bidderId: string } }>, reply: FastifyReply) {
    const { bidderId } = request.params;
    const evaluations = await evaluationService.getBidderEvaluations(bidderId);
    const summary = {
      totalEvaluations: evaluations.length,
      passed: evaluations.filter((e) => e.result === 'PASS').length,
      failed: evaluations.filter((e) => e.result === 'FAIL').length,
      reviewRequired: evaluations.filter((e) => e.result === 'REVIEW').length,
      notEvaluable: evaluations.filter((e) => e.result === 'NOT_EVALUABLE').length,
      completionRate: evaluations.length > 0 ? 100 : 0,
    };
    return reply.status(200).send({
      success: true,
      data: { bidderId, count: evaluations.length, evaluations, summary },
    });
  }

  async getEvaluationHistory(request: FastifyRequest<{ Params: { evaluationId: string } }>, reply: FastifyReply) {
    const { evaluationId } = request.params;
    const evaluation = await evaluationRepository.findEvaluationById(evaluationId);
    if (!evaluation) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: `Evaluation ${evaluationId} not found` },
      });
    }
    const history = await evaluationRepository.getEvaluationHistory(evaluation.requirementId, evaluation.bidderId);
    return reply.status(200).send({
      success: true,
      data: { evaluationId, history: history.length > 0 ? history : [evaluation] },
    });
  }

  async getEvaluationById(request: FastifyRequest<{ Params: { evaluationId: string } }>, reply: FastifyReply) {
    const { evaluationId } = request.params;
    const evaluation = await evaluationRepository.findEvaluationById(evaluationId);
    if (!evaluation) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: `Evaluation ${evaluationId} not found` },
      });
    }
    return reply.status(200).send({
      success: true,
      data: evaluation,
    });
  }

  async getRequirementEvaluations(
    request: FastifyRequest<{ Params: { requirementId: string }; Querystring: { bidderId?: string } }>,
    reply: FastifyReply
  ) {
    const { requirementId } = request.params;
    const { bidderId } = request.query;
    const evaluations = await evaluationRepository.listEvaluationsByRequirement(requirementId, bidderId);
    return reply.status(200).send({
      success: true,
      data: { requirementId, count: evaluations.length, evaluations },
    });
  }

  async getEvaluationTrace(request: FastifyRequest<{ Params: { evaluationId: string } }>, reply: FastifyReply) {
    const { evaluationId } = request.params;
    const evaluation = await evaluationService.getEvaluationTrace(evaluationId);
    if (!evaluation) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: `Evaluation ${evaluationId} not found` },
      });
    }
    return reply.status(200).send({
      success: true,
      data: {
        evaluationId,
        requirementId: evaluation.requirementId,
        ruleId: evaluation.ruleId,
        result: evaluation.result,
        reasonCode: evaluation.reasonCode,
        summary: evaluation.summary,
        explanation: evaluation.explanation,
        calculationTrace: evaluation.calculationTrace,
        evidenceSnapshot: evaluation.evidenceSnapshot,
        engineVersion: evaluation.engineVersion,
        evaluatedAt: evaluation.evaluatedAt,
      },
    });
  }
}

export const evaluationController = new EvaluationController();
