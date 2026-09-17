import { FastifyReply, FastifyRequest } from 'fastify';
import { ruleService } from './rule.service.js';
import {
  TenderIdParamSchema,
  RuleIdParamSchema,
  RuleFilterQuerySchema,
  UpdateRuleBodySchema,
  SimulateRuleBodySchema,
} from './rule.schema.js';

export async function listRulesHandler(request: FastifyRequest, reply: FastifyReply) {
  const { tenderId } = TenderIdParamSchema.parse(request.params);
  const query = RuleFilterQuerySchema.parse(request.query);

  const rules = await ruleService.getRules(tenderId, {
    status: query.status as any,
    ruleType: query.ruleType as any,
    search: query.search,
  });

  return reply.status(200).send({
    success: true,
    count: rules.length,
    data: rules,
  });
}

export async function getRuleHandler(request: FastifyRequest, reply: FastifyReply) {
  const { ruleId } = RuleIdParamSchema.parse(request.params);
  const rule = await ruleService.getRule(ruleId);

  return reply.status(200).send({
    success: true,
    data: rule,
  });
}

export async function updateRuleHandler(request: FastifyRequest, reply: FastifyReply) {
  const { ruleId } = RuleIdParamSchema.parse(request.params);
  const body = UpdateRuleBodySchema.parse(request.body);

  const updated = await ruleService.updateRule(ruleId, body);

  return reply.status(200).send({
    success: true,
    message: 'Rule updated successfully',
    data: updated,
  });
}

export async function approveRuleHandler(request: FastifyRequest, reply: FastifyReply) {
  const { ruleId } = RuleIdParamSchema.parse(request.params);
  const updated = await ruleService.approveRule(ruleId);

  return reply.status(200).send({
    success: true,
    message: 'Rule approved',
    data: updated,
  });
}

export async function rejectRuleHandler(request: FastifyRequest, reply: FastifyReply) {
  const { ruleId } = RuleIdParamSchema.parse(request.params);
  const updated = await ruleService.rejectRule(ruleId);

  return reply.status(200).send({
    success: true,
    message: 'Rule rejected',
    data: updated,
  });
}

export async function simulateRuleHandler(request: FastifyRequest, reply: FastifyReply) {
  const { ruleId } = RuleIdParamSchema.parse(request.params);
  const { evidence } = SimulateRuleBodySchema.parse(request.body);

  const result = await ruleService.simulateRule(ruleId, evidence);

  return reply.status(200).send({
    success: true,
    message: 'Deterministic rule simulation complete',
    data: result,
  });
}

export async function getRuleCoverageHandler(request: FastifyRequest, reply: FastifyReply) {
  const { tenderId } = TenderIdParamSchema.parse(request.params);
  const coverage = await ruleService.getCoverageStatistics(tenderId);

  return reply.status(200).send({
    success: true,
    data: coverage,
  });
}
