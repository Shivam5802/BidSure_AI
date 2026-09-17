import {
  RuleStatus,
  RuleType,
  AuditEventType,
} from '@prisma/client';
import { ruleRepository, RuleFilterOptions } from './rule.repository.js';
import { requirementRepository } from '../requirements/requirement.repository.js';
import { ruleConverterService } from '../../services/rules/rule-converter.service.js';
import { ruleEngineService } from '../../services/rules/rule-engine.service.js';
import { EvidenceContext, RuleEvaluationResult } from '../../services/rules/rule-schema.interface.js';
import { auditService } from '../../services/audit/audit.service.js';

export interface RuleCoverageStatistics {
  totalRequirements: number;
  totalRules: number;
  approvedRules: number;
  reviewRules: number;
  draftRules: number;
  disabledRules: number;
  byType: Record<string, number>;
}

export class RuleService {
  async generateRulesFromBlueprint(tenderId: string) {
    const blueprint = await requirementRepository.getLatestBlueprint(tenderId);
    if (!blueprint) {
      throw new Error(`No compliance blueprint found for tender ${tenderId}`);
    }

    const requirements = blueprint.requirements;
    const createdRules = [];

    for (const req of requirements) {
      const existingRules = await ruleRepository.getRuleVersions(req.id);
      if (existingRules.length > 0) {
        continue; // Already has rules
      }

      const conversion = ruleConverterService.convertCandidateToDefinition({
        requirementCode: req.requirementCode,
        category: req.category,
        ruleType: req.ruleType,
        ruleParameters: req.ruleParameters,
        requirementText: req.requirementText,
      });

      const initialStatus = conversion.isValid ? RuleStatus.DRAFT : RuleStatus.REVIEW;

      const rule = await ruleRepository.createRule({
        blueprintId: blueprint.id,
        requirementId: req.id,
        ruleCode: `RULE-${req.requirementCode}`,
        name: `Compliance Rule for Clause ${req.clauseReference || req.requirementCode}`,
        description: conversion.reason,
        ruleType: (conversion.definition.type as RuleType) || RuleType.INFORMATIONAL,
        definition: conversion.definition as any,
        status: initialStatus,
        version: 1,
      });

      createdRules.push(rule);

      await auditService.log(AuditEventType.RULE_CREATED, {
        tenderId,
        metadata: {
          ruleId: rule.id,
          ruleCode: rule.ruleCode,
          ruleType: rule.ruleType,
          status: rule.status,
        },
      });
    }

    return createdRules;
  }

  async getRules(tenderId: string, filters?: RuleFilterOptions) {
    const blueprint = await requirementRepository.getLatestBlueprint(tenderId);
    if (!blueprint) {
      return [];
    }

    // Generate rules automatically if not generated yet
    await this.generateRulesFromBlueprint(tenderId);

    return ruleRepository.listRulesByBlueprint(blueprint.id, filters);
  }

  async getRule(ruleId: string) {
    const rule = await ruleRepository.findRuleById(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }
    return rule;
  }

  async updateRule(ruleId: string, data: any, officerId: string = 'procurement_officer') {
    const rule = await ruleRepository.findRuleById(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const updated = await ruleRepository.updateRuleDefinition(ruleId, data);

    await auditService.log(AuditEventType.RULE_EDITED, {
      metadata: {
        ruleId,
        ruleCode: rule.ruleCode,
        modifiedBy: officerId,
      },
    });

    return updated;
  }

  async approveRule(ruleId: string, officerId: string = 'procurement_officer') {
    const rule = await ruleRepository.findRuleById(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const updated = await ruleRepository.updateRuleStatus(ruleId, RuleStatus.APPROVED, officerId);

    await auditService.log(AuditEventType.RULE_APPROVED, {
      metadata: {
        ruleId,
        ruleCode: rule.ruleCode,
        approvedBy: officerId,
      },
    });

    return updated;
  }

  async rejectRule(ruleId: string, officerId: string = 'procurement_officer') {
    const rule = await ruleRepository.findRuleById(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const updated = await ruleRepository.updateRuleStatus(ruleId, RuleStatus.REJECTED, officerId);

    await auditService.log(AuditEventType.RULE_REJECTED, {
      metadata: {
        ruleId,
        ruleCode: rule.ruleCode,
        rejectedBy: officerId,
      },
    });

    return updated;
  }

  async simulateRule(ruleId: string, evidence: EvidenceContext): Promise<RuleEvaluationResult> {
    const rule = await ruleRepository.findRuleById(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const result = ruleEngineService.evaluate(rule.definition as any, evidence);

    await auditService.log(AuditEventType.RULE_SIMULATED, {
      metadata: {
        ruleId,
        ruleCode: rule.ruleCode,
        resultStatus: result.status,
        inputs: evidence,
      },
    });

    return {
      ...result,
      ruleId: rule.id,
      ruleVersion: rule.version,
      requirementId: rule.requirementId,
    };
  }

  async getCoverageStatistics(tenderId: string): Promise<RuleCoverageStatistics> {
    const blueprint = await requirementRepository.getLatestBlueprint(tenderId);
    if (!blueprint) {
      return {
        totalRequirements: 0,
        totalRules: 0,
        approvedRules: 0,
        reviewRules: 0,
        draftRules: 0,
        disabledRules: 0,
        byType: {},
      };
    }

    const rules = await this.getRules(tenderId);
    const byType: Record<string, number> = {};

    for (const r of rules) {
      byType[r.ruleType] = (byType[r.ruleType] || 0) + 1;
    }

    return {
      totalRequirements: blueprint.requirements.length,
      totalRules: rules.length,
      approvedRules: rules.filter((r) => r.status === RuleStatus.APPROVED).length,
      reviewRules: rules.filter((r) => r.status === RuleStatus.REVIEW).length,
      draftRules: rules.filter((r) => r.status === RuleStatus.DRAFT).length,
      disabledRules: rules.filter((r) => r.status === RuleStatus.DISABLED).length,
      byType,
    };
  }
}

export const ruleService = new RuleService();
