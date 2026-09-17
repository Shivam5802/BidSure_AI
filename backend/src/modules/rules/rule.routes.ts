import { FastifyInstance } from 'fastify';
import {
  listRulesHandler,
  getRuleHandler,
  updateRuleHandler,
  approveRuleHandler,
  rejectRuleHandler,
  simulateRuleHandler,
  getRuleCoverageHandler,
} from './rule.controller.js';

export async function ruleRoutes(app: FastifyInstance): Promise<void> {
  app.get('/tenders/:tenderId/rules', listRulesHandler);
  app.get('/tenders/:tenderId/rules/coverage', getRuleCoverageHandler);
  app.get('/tenders/:tenderId/rules/:ruleId', getRuleHandler);
  app.patch('/tenders/:tenderId/rules/:ruleId', updateRuleHandler);
  app.post('/tenders/:tenderId/rules/:ruleId/approve', approveRuleHandler);
  app.post('/tenders/:tenderId/rules/:ruleId/reject', rejectRuleHandler);
  app.post('/tenders/:tenderId/rules/:ruleId/simulate', simulateRuleHandler);
}
