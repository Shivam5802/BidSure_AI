import {
  ComplianceRuleDefinitionSchema,
  EvidenceContext,
  RuleDefinition,
  RuleEvaluationResult,
} from './rule-schema.interface.js';
import { FieldRegistry } from './field-registry.js';
import { FinancialNormalizer, DateNormalizer } from './normalizer.js';

export const RULE_ENGINE_VERSION = '1.0.0';

export class RuleEngineService {
  /**
   * Deterministically evaluates a declarative compliance rule definition against evidence context.
   * Zero dynamic code execution (NO eval(), NO Function(), NO dynamic JS/SQL).
   */
  evaluate(rule: RuleDefinition, evidence: EvidenceContext): RuleEvaluationResult {
    const timestamp = new Date().toISOString();

    // Validate schema
    const parseResult = ComplianceRuleDefinitionSchema.safeParse(rule);
    if (!parseResult.success) {
      return {
        status: 'REVIEW',
        reason: `Invalid rule schema definition: ${parseResult.error.message}`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
      };
    }

    switch (rule.type) {
      case 'NUMERIC':
        return this.evaluateNumeric(rule, evidence, timestamp);
      case 'DATE':
        return this.evaluateDate(rule, evidence, timestamp);
      case 'BOOLEAN':
        return this.evaluateBoolean(rule, evidence, timestamp);
      case 'PERCENTAGE':
        return this.evaluatePercentage(rule, evidence, timestamp);
      case 'COUNT':
        return this.evaluateCount(rule, evidence, timestamp);
      case 'TEXT_MATCH':
        return this.evaluateTextMatch(rule, evidence, timestamp);
      case 'ENTITY_MATCH':
        return this.evaluateEntityMatch(rule, evidence, timestamp);
      case 'COMPOUND':
        return this.evaluateCompound(rule, evidence, timestamp);
      case 'CONDITIONAL':
        return this.evaluateConditional(rule, evidence, timestamp);
      case 'INFORMATIONAL':
      default:
        return {
          status: 'REVIEW',
          reason: 'Informational requirement text — requires human officer inspection.',
          engineVersion: RULE_ENGINE_VERSION,
          evaluatedAt: timestamp,
        };
    }
  }

  private evaluateNumeric(
    rule: any,
    evidence: EvidenceContext,
    timestamp: string
  ): RuleEvaluationResult {
    const metric = rule.metric;

    // Check field registry
    if (!FieldRegistry.isRegistered(metric)) {
      return {
        status: 'REVIEW',
        reason: `Metric "${metric}" is not registered in the controlled FieldRegistry.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
      };
    }

    const rawActual = evidence[metric];

    // Missing evidence check (null or undefined)
    if (rawActual === undefined || rawActual === null || rawActual === '') {
      return {
        status: 'NOT_EVALUABLE',
        reason: `Required evidence metric "${metric}" is missing from bidder submission.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
        inputs: { actual: null, required: rule.value, metricOrField: metric },
      };
    }

    const actualVal = FinancialNormalizer.parseINR(rawActual as any);
    if (actualVal === null) {
      return {
        status: 'REVIEW',
        reason: `Could not parse numeric evidence value "${rawActual}" for metric "${metric}".`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
      };
    }

    const reqVal = rule.value;
    let isPass = false;

    switch (rule.operator) {
      case '>=':
        isPass = actualVal >= reqVal;
        break;
      case '>':
        isPass = actualVal > reqVal;
        break;
      case '<=':
        isPass = actualVal <= reqVal;
        break;
      case '<':
        isPass = actualVal < reqVal;
        break;
      case '==':
        isPass = actualVal === reqVal;
        break;
      case '!=':
        isPass = actualVal !== reqVal;
        break;
    }

    const formattedActual = actualVal.toLocaleString('en-IN');
    const formattedReq = reqVal.toLocaleString('en-IN');

    return {
      status: isPass ? 'PASS' : 'FAIL',
      reason: isPass
        ? `Value of ${formattedActual} ${rule.unit || 'INR'} satisfies requirement (${rule.operator} ${formattedReq} ${rule.unit || 'INR'}).`
        : `Value of ${formattedActual} ${rule.unit || 'INR'} does not satisfy requirement (${rule.operator} ${formattedReq} ${rule.unit || 'INR'}).`,
      engineVersion: RULE_ENGINE_VERSION,
      evaluatedAt: timestamp,
      inputs: { actual: actualVal, required: reqVal, metricOrField: metric },
    };
  }

  private evaluateDate(
    rule: any,
    evidence: EvidenceContext,
    timestamp: string
  ): RuleEvaluationResult {
    const field = rule.field;
    const rawActual = evidence[field];

    if (rawActual === undefined || rawActual === null || rawActual === '') {
      return {
        status: 'NOT_EVALUABLE',
        reason: `Required date evidence field "${field}" is missing.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
        inputs: { actual: null, required: rule.operator, metricOrField: field },
      };
    }

    const { date: actualDate, isAmbiguous } = DateNormalizer.parseDate(rawActual as any);
    if (isAmbiguous || !actualDate) {
      return {
        status: 'REVIEW',
        reason: `Date representation "${rawActual}" for field "${field}" is ambiguous or invalid.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
      };
    }

    const refDate = DateNormalizer.resolveReferenceDate(
      rule.reference.type,
      rule.reference.fixedDate,
      evidence
    );

    if (!refDate) {
      return {
        status: 'NOT_EVALUABLE',
        reason: `Reference date for "${rule.reference.type}" could not be resolved.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
      };
    }

    let isPass = false;
    const tActual = actualDate.getTime();
    const tRef = refDate.getTime();

    switch (rule.operator) {
      case 'BEFORE':
        isPass = tActual < tRef;
        break;
      case 'AFTER':
        isPass = tActual > tRef;
        break;
      case 'ON_OR_BEFORE':
        isPass = tActual <= tRef;
        break;
      case 'ON_OR_AFTER':
        isPass = tActual >= tRef;
        break;
      case 'EQUALS':
        isPass = Math.abs(tActual - tRef) < 86400000;
        break;
    }

    return {
      status: isPass ? 'PASS' : 'FAIL',
      reason: isPass
        ? `Date ${actualDate.toISOString().substring(0, 10)} is ${rule.operator.toLowerCase().replace(/_/g, ' ')} reference date ${refDate.toISOString().substring(0, 10)}.`
        : `Date ${actualDate.toISOString().substring(0, 10)} is NOT ${rule.operator.toLowerCase().replace(/_/g, ' ')} reference date ${refDate.toISOString().substring(0, 10)}.`,
      engineVersion: RULE_ENGINE_VERSION,
      evaluatedAt: timestamp,
      inputs: {
        actual: actualDate.toISOString().substring(0, 10),
        required: refDate.toISOString().substring(0, 10),
        metricOrField: field,
      },
    };
  }

  private evaluateBoolean(
    rule: any,
    evidence: EvidenceContext,
    timestamp: string
  ): RuleEvaluationResult {
    const field = rule.field;
    const rawActual = evidence[field];

    if (rawActual === undefined || rawActual === null || rawActual === '') {
      return {
        status: 'NOT_EVALUABLE',
        reason: `Required boolean evidence field "${field}" is missing.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
        inputs: { actual: null, required: rule.operator, metricOrField: field },
      };
    }

    const actualBool = Boolean(rawActual);
    const expectedBool = rule.operator === 'IS_TRUE';
    const isPass = actualBool === expectedBool;

    return {
      status: isPass ? 'PASS' : 'FAIL',
      reason: isPass
        ? `Field "${field}" is ${actualBool} as required.`
        : `Field "${field}" is ${actualBool}, expected ${expectedBool}.`,
      engineVersion: RULE_ENGINE_VERSION,
      evaluatedAt: timestamp,
      inputs: { actual: actualBool, required: expectedBool, metricOrField: field },
    };
  }

  private evaluatePercentage(
    rule: any,
    evidence: EvidenceContext,
    timestamp: string
  ): RuleEvaluationResult {
    const metric = rule.metric;
    const rawActual = evidence[metric];

    if (rawActual === undefined || rawActual === null || rawActual === '') {
      return {
        status: 'NOT_EVALUABLE',
        reason: `Required percentage evidence metric "${metric}" is missing.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
        inputs: { actual: null, required: rule.value, metricOrField: metric },
      };
    }

    const val = parseFloat(String(rawActual));
    if (isNaN(val) || val < 0 || val > 100) {
      return {
        status: 'REVIEW',
        reason: `Percentage value "${rawActual}" for metric "${metric}" is out of valid range (0-100%).`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
      };
    }

    let isPass = false;
    switch (rule.operator) {
      case '>=':
        isPass = val >= rule.value;
        break;
      case '>':
        isPass = val > rule.value;
        break;
      case '<=':
        isPass = val <= rule.value;
        break;
      case '<':
        isPass = val < rule.value;
        break;
      case '==':
        isPass = val === rule.value;
        break;
    }

    return {
      status: isPass ? 'PASS' : 'FAIL',
      reason: isPass
        ? `Local content percentage ${val}% satisfies requirement (${rule.operator} ${rule.value}%).`
        : `Local content percentage ${val}% does not satisfy requirement (${rule.operator} ${rule.value}%).`,
      engineVersion: RULE_ENGINE_VERSION,
      evaluatedAt: timestamp,
      inputs: { actual: val, required: rule.value, metricOrField: metric },
    };
  }

  private evaluateCount(
    rule: any,
    evidence: EvidenceContext,
    timestamp: string
  ): RuleEvaluationResult {
    const collection = rule.collection;
    const rawActual = evidence[collection];

    if (rawActual === undefined || rawActual === null) {
      return {
        status: 'NOT_EVALUABLE',
        reason: `Collection metric "${collection}" is missing from evidence context.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
        inputs: { actual: null, required: rule.value, metricOrField: collection },
      };
    }

    const countVal = Array.isArray(rawActual)
      ? rawActual.length
      : typeof rawActual === 'number'
      ? rawActual
      : parseInt(String(rawActual), 10);

    if (isNaN(countVal)) {
      return {
        status: 'REVIEW',
        reason: `Count collection "${collection}" could not be evaluated to an integer count.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
      };
    }

    let isPass = false;
    switch (rule.operator) {
      case '>=':
        isPass = countVal >= rule.value;
        break;
      case '>':
        isPass = countVal > rule.value;
        break;
      case '<=':
        isPass = countVal <= rule.value;
        break;
      case '<':
        isPass = countVal < rule.value;
        break;
      case '==':
        isPass = countVal === rule.value;
        break;
    }

    return {
      status: isPass ? 'PASS' : 'FAIL',
      reason: isPass
        ? `Count of ${countVal} for ${collection} satisfies requirement (${rule.operator} ${rule.value}).`
        : `Count of ${countVal} for ${collection} does not satisfy requirement (${rule.operator} ${rule.value}).`,
      engineVersion: RULE_ENGINE_VERSION,
      evaluatedAt: timestamp,
      inputs: { actual: countVal, required: rule.value, metricOrField: collection },
    };
  }

  private evaluateTextMatch(
    rule: any,
    evidence: EvidenceContext,
    timestamp: string
  ): RuleEvaluationResult {
    const field = rule.field;
    const rawActual = evidence[field];

    if (rawActual === undefined || rawActual === null || rawActual === '') {
      return {
        status: 'NOT_EVALUABLE',
        reason: `Required text evidence field "${field}" is missing.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
      };
    }

    const actualStr = String(rawActual).trim();
    const targetStr = String(rule.value).trim();

    let isPass = false;

    if (rule.operator === 'EQUALS') {
      isPass = actualStr === targetStr;
    } else if (rule.operator === 'CONTAINS') {
      isPass = actualStr.toLowerCase().includes(targetStr.toLowerCase());
    } else if (rule.operator === 'NORMALIZED_EQUALS') {
      const normA = actualStr.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normB = targetStr.toLowerCase().replace(/[^a-z0-9]/g, '');
      isPass = normA === normB;
    }

    return {
      status: isPass ? 'PASS' : 'FAIL',
      reason: isPass
        ? `Text value "${actualStr}" matches requirement "${targetStr}".`
        : `Text value "${actualStr}" does not match requirement "${targetStr}".`,
      engineVersion: RULE_ENGINE_VERSION,
      evaluatedAt: timestamp,
      inputs: { actual: actualStr, required: targetStr, metricOrField: field },
    };
  }

  private evaluateEntityMatch(
    rule: any,
    evidence: EvidenceContext,
    timestamp: string
  ): RuleEvaluationResult {
    const leftVal = evidence[rule.left];
    const rightVal = evidence[rule.right];

    if (!leftVal || !rightVal) {
      return {
        status: 'NOT_EVALUABLE',
        reason: `Entity reference fields ("${rule.left}" or "${rule.right}") missing from evidence context.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
      };
    }

    const normLeft = String(leftVal).toLowerCase().replace(/[^a-z0-9]/g, '');
    const normRight = String(rightVal).toLowerCase().replace(/[^a-z0-9]/g, '');

    const isSame = normLeft === normRight || normLeft.includes(normRight) || normRight.includes(normLeft);
    const isPass = rule.operator === 'SAME_ENTITY' ? isSame : !isSame;

    return {
      status: isPass ? 'PASS' : 'FAIL',
      reason: isPass
        ? `Entity matching evaluated successfully for ${rule.left} and ${rule.right}.`
        : `Entity mismatch between ${rule.left} ("${leftVal}") and ${rule.right} ("${rightVal}").`,
      engineVersion: RULE_ENGINE_VERSION,
      evaluatedAt: timestamp,
      inputs: { actual: `${leftVal} vs ${rightVal}`, required: rule.operator },
    };
  }

  private evaluateCompound(
    rule: any,
    evidence: EvidenceContext,
    timestamp: string
  ): RuleEvaluationResult {
    const subRules: RuleDefinition[] = rule.rules || [];
    if (subRules.length === 0) {
      return {
        status: 'REVIEW',
        reason: 'Compound rule has no sub-rules defined.',
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
      };
    }

    const nestedResults = subRules.map((sr) => this.evaluate(sr, evidence));

    if (rule.operator === 'AND') {
      if (nestedResults.some((r) => r.status === 'FAIL')) {
        return {
          status: 'FAIL',
          reason: 'Compound AND rule failed because one or more conditions failed.',
          engineVersion: RULE_ENGINE_VERSION,
          evaluatedAt: timestamp,
          nestedResults,
        };
      }
      if (nestedResults.some((r) => r.status === 'NOT_EVALUABLE')) {
        return {
          status: 'NOT_EVALUABLE',
          reason: 'Compound AND rule cannot be evaluated due to missing evidence for one or more sub-rules.',
          engineVersion: RULE_ENGINE_VERSION,
          evaluatedAt: timestamp,
          nestedResults,
        };
      }
      if (nestedResults.some((r) => r.status === 'REVIEW')) {
        return {
          status: 'REVIEW',
          reason: 'Compound AND rule requires manual officer review for sub-rule conditions.',
          engineVersion: RULE_ENGINE_VERSION,
          evaluatedAt: timestamp,
          nestedResults,
        };
      }
      return {
        status: 'PASS',
        reason: 'All sub-conditions of compound AND rule satisfied successfully.',
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
        nestedResults,
      };
    }

    // OR Operator
    if (nestedResults.some((r) => r.status === 'PASS')) {
      return {
        status: 'PASS',
        reason: 'Compound OR rule passed because at least one alternative condition was satisfied.',
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
        nestedResults,
      };
    }
    if (nestedResults.every((r) => r.status === 'FAIL')) {
      return {
        status: 'FAIL',
        reason: 'Compound OR rule failed because all alternative conditions failed.',
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
        nestedResults,
      };
    }

    return {
      status: 'NOT_EVALUABLE',
      reason: 'Compound OR rule cannot be evaluated due to missing evidence for alternatives.',
      engineVersion: RULE_ENGINE_VERSION,
      evaluatedAt: timestamp,
      nestedResults,
    };
  }

  private evaluateConditional(
    rule: any,
    evidence: EvidenceContext,
    timestamp: string
  ): RuleEvaluationResult {
    const ifCond = rule.if;
    const ifVal = evidence[ifCond.field];

    if (ifVal === undefined || ifVal === null) {
      return {
        status: 'NOT_EVALUABLE',
        reason: `Conditional IF field "${ifCond.field}" is missing from evidence context.`,
        engineVersion: RULE_ENGINE_VERSION,
        evaluatedAt: timestamp,
      };
    }

    let isConditionTrue = false;
    if (ifCond.operator === 'IS_TRUE') {
      isConditionTrue = Boolean(ifVal);
    } else if (ifCond.operator === 'IS_FALSE') {
      isConditionTrue = !Boolean(ifVal);
    } else if (ifCond.operator === '==') {
      isConditionTrue = ifVal === ifCond.value;
    }

    if (isConditionTrue) {
      const thenResult = this.evaluate(rule.then, evidence);
      return {
        ...thenResult,
        reason: `[Conditional IF "${ifCond.field}" matched]: ${thenResult.reason}`,
      };
    }

    if (rule.else) {
      const elseResult = this.evaluate(rule.else, evidence);
      return {
        ...elseResult,
        reason: `[Conditional ELSE branch applied]: ${elseResult.reason}`,
      };
    }

    return {
      status: 'PASS',
      reason: `Conditional IF condition "${ifCond.field}" did not apply — standard rule requirement relaxed.`,
      engineVersion: RULE_ENGINE_VERSION,
      evaluatedAt: timestamp,
    };
  }
}

export const ruleEngineService = new RuleEngineService();
