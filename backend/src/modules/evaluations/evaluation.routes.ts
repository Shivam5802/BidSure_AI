import { FastifyInstance } from 'fastify';
import { evaluationController } from './evaluation.controller.js';

export async function evaluationRoutes(app: FastifyInstance) {
  // Bidder Evaluations & Batch Evaluation Run
  app.post('/bidders/:bidderId/evaluations/run', (req, reply) => evaluationController.runBidderEvaluation(req as any, reply));
  app.get('/bidders/:bidderId/evaluations', (req, reply) => evaluationController.getBidderEvaluations(req as any, reply));
  app.get('/bidders/:bidderId/evaluations/:evaluationId', (req, reply) => evaluationController.getEvaluationById(req as any, reply));

  // Route aliases matching frontend evaluation.api.ts
  app.get('/evaluations/bidder/:bidderId', (req, reply) => evaluationController.getBidderEvaluations(req as any, reply));
  app.post('/evaluations/bidder/:bidderId/run', (req, reply) => evaluationController.runBidderEvaluation(req as any, reply));
  app.get('/evaluations/:evaluationId', (req, reply) => evaluationController.getEvaluationById(req as any, reply));
  app.get('/evaluations/:evaluationId/history', (req, reply) => evaluationController.getEvaluationHistory(req as any, reply));
  app.post('/evaluations/tenders/:tenderId/run-all', (req, reply) => evaluationController.runTenderAllBiddersEvaluation(req as any, reply));

  // Single Evaluation & Traces
  app.post('/evaluations/run', (req, reply) => evaluationController.runSingleEvaluation(req, reply));
  app.get('/evaluations/:evaluationId/trace', (req, reply) => evaluationController.getEvaluationTrace(req as any, reply));
  app.get('/requirements/:requirementId/evaluations', (req, reply) => evaluationController.getRequirementEvaluations(req as any, reply));
}
