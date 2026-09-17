import {
  EvaluationStatus,
  ApplicabilityStatus,
  MappingStatus,
  EvidenceStatus,
  RuleStatus,
} from '@prisma/client';
import { FinancialNormalizer, DateNormalizer } from '../../services/rules/normalizer.js';

export const ENGINE_VERSION = '1.0.0';

export interface CalculationTrace {
  operation?: string;
  inputs?: Array<{
    evidenceId?: string;
    fieldKey?: string;
    rawValue?: any;
    normalizedValue?: any;
    unit?: string;
  }>;
  calculatedValue?: any;
  operator?: string;
  threshold?: any;
  unit?: string;
  formula?: string;
  comparisonResult?: boolean;
}

export interface EngineEvaluationResult {
  result: EvaluationStatus;
  applicability: ApplicabilityStatus;
  reasonCode: string;
  summary: string;
  explanation: string;
  calculationTrace: CalculationTrace | null;
  inputSnapshot: any;
  outputSnapshot: any;
  evidenceSnapshot: any;
  engineVersion: string;
}

export class EvaluationEngine {
  /**
   * Deterministically evaluates an approved rule against mapped bidder evidence items.
   * 100% Declarative & Explainable — Zero dynamic code execution.
   */
  evaluateRule(
    requirement: { id: string; requirementCode: string; requirementText: string; category: string },
    rule: { id: string; ruleCode: string; status: RuleStatus; version: number; definition: any },
    mappings: Array<{
      id: string;
      status: MappingStatus;
      mappingType: string;
      evidence: {
        id: string;
        fieldKey: string;
        fieldLabel: string;
        rawValue: string;
        normalizedValue: any;
        unit?: string | null;
        status: EvidenceStatus;
        conflictFlag?: boolean;
        bidDocumentId: string;
        pageNumber: number;
        sourceText: string;
        documentName?: string;
      };
    }>
  ): EngineEvaluationResult {
    const evidenceSnapshot = mappings.map((m) => ({
      mappingId: m.id,
      evidenceId: m.evidence.id,
      fieldKey: m.evidence.fieldKey,
      rawValue: m.evidence.rawValue,
      normalizedValue: m.evidence.normalizedValue,
      unit: m.evidence.unit,
      status: m.evidence.status,
      pageNumber: m.evidence.pageNumber,
      documentName: m.evidence.documentName,
    }));

    // GATE 1: Approved Rule Gate
    if (rule.status !== RuleStatus.APPROVED) {
      return {
        result: EvaluationStatus.NOT_EVALUABLE,
        applicability: ApplicabilityStatus.UNKNOWN,
        reasonCode: 'UNAPPROVED_RULE',
        summary: `Rule ${rule.ruleCode} is in ${rule.status} status and cannot be executed.`,
        explanation: `Only APPROVED rules may be executed for compliance evaluation. Current rule status is ${rule.status}.`,
        calculationTrace: null,
        inputSnapshot: { ruleId: rule.id, status: rule.status },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    // GATE 2: Evidence & Mapping Gate
    if (mappings.length === 0) {
      return {
        result: EvaluationStatus.NOT_EVALUABLE,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'MISSING_EVIDENCE',
        summary: `No evidence mapped to requirement ${requirement.requirementCode}.`,
        explanation: `Required evidence is missing from the bidder submission. No compliance evaluation could be performed.`,
        calculationTrace: null,
        inputSnapshot: { requirementCode: requirement.requirementCode },
        outputSnapshot: null,
        evidenceSnapshot: [],
        engineVersion: ENGINE_VERSION,
      };
    }

    // Reject unverified or conflicting mappings
    if (mappings.some((m) => m.mappingType === 'CONFLICTING' || m.evidence.conflictFlag)) {
      return {
        result: EvaluationStatus.REVIEW,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'CONFLICTING_EVIDENCE',
        summary: `Conflicting evidence mapped to requirement ${requirement.requirementCode}.`,
        explanation: `Multiple evidence sources contain conflicting extracted values. Manual procurement officer review is required.`,
        calculationTrace: null,
        inputSnapshot: { requirementCode: requirement.requirementCode },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    if (mappings.some((m) => m.status === MappingStatus.REVIEW_REQUIRED || m.evidence.status === EvidenceStatus.REVIEW_REQUIRED)) {
      return {
        result: EvaluationStatus.REVIEW,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'REVIEW_REQUIRED_EVIDENCE',
        summary: `Evidence for requirement ${requirement.requirementCode} requires human verification.`,
        explanation: `Mapped evidence is flagged for human officer verification before compliance evaluation can be finalized.`,
        calculationTrace: null,
        inputSnapshot: { requirementCode: requirement.requirementCode },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    if (mappings.some((m) => m.evidence.status === EvidenceStatus.REJECTED || m.status === MappingStatus.REJECTED)) {
      return {
        result: EvaluationStatus.NOT_EVALUABLE,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'REJECTED_EVIDENCE',
        summary: `Mapped evidence was rejected by procurement officer.`,
        explanation: `Mapped evidence item was rejected during review and cannot be used for compliance calculation.`,
        calculationTrace: null,
        inputSnapshot: { requirementCode: requirement.requirementCode },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    const def = rule.definition;
    if (!def || !def.type) {
      return {
        result: EvaluationStatus.NOT_EVALUABLE,
        applicability: ApplicabilityStatus.UNKNOWN,
        reasonCode: 'UNSUPPORTED_RULE',
        summary: `Unsupported or invalid rule definition schema for ${rule.ruleCode}.`,
        explanation: `Rule definition format is missing or invalid.`,
        calculationTrace: null,
        inputSnapshot: def,
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    // Security Check: Block prototype pollution or malicious operators
    if (def.field === '__proto__' || def.operator === 'eval' || def.operator === 'Function') {
      return {
        result: EvaluationStatus.NOT_EVALUABLE,
        applicability: ApplicabilityStatus.UNKNOWN,
        reasonCode: 'SECURITY_VIOLATION',
        summary: `Malicious rule operator or field key rejected.`,
        explanation: `Security Check Failure: Invalid field or operator injection attempt.`,
        calculationTrace: null,
        inputSnapshot: def,
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    // Route rule evaluation based on type
    switch (def.type) {
      case 'NUMERIC':
        return this.evaluateNumericRule(requirement, rule, def, mappings, evidenceSnapshot);
      case 'DATE':
        return this.evaluateDateRule(requirement, rule, def, mappings, evidenceSnapshot);
      case 'BOOLEAN':
        return this.evaluateBooleanRule(requirement, rule, def, mappings, evidenceSnapshot);
      case 'PERCENTAGE':
        return this.evaluatePercentageRule(requirement, rule, def, mappings, evidenceSnapshot);
      case 'COUNT':
        return this.evaluateCountRule(requirement, rule, def, mappings, evidenceSnapshot);
      case 'TEXT_MATCH':
        return this.evaluateTextMatchRule(requirement, rule, def, mappings, evidenceSnapshot);
      case 'ENTITY_MATCH':
        return this.evaluateEntityMatchRule(requirement, rule, def, mappings, evidenceSnapshot);
      case 'COMPOUND':
        return this.evaluateCompoundRule(requirement, rule, def, mappings, evidenceSnapshot);
      case 'CONDITIONAL':
        return this.evaluateConditionalRule(requirement, rule, def, mappings, evidenceSnapshot);
      default:
        return {
          result: EvaluationStatus.REVIEW,
          applicability: ApplicabilityStatus.APPLICABLE,
          reasonCode: 'INFORMATIONAL_RULE',
          summary: `Informational rule requirement for ${requirement.requirementCode}.`,
          explanation: `Requirement ${requirement.requirementCode} is informational and requires manual officer inspection.`,
          calculationTrace: null,
          inputSnapshot: def,
          outputSnapshot: null,
          evidenceSnapshot,
          engineVersion: ENGINE_VERSION,
        };
    }
  }

  // --- NUMERIC & FINANCIAL AGGREGATION EVALUATION ---
  private evaluateNumericRule(
    req: any,
    _rule: any,
    def: any,
    mappings: any[],
    evidenceSnapshot: any
  ): EngineEvaluationResult {
    const metric = def.metric || def.field;
    const threshold = def.value;
    const operator = def.operator || '>=';
    const unit = def.unit || 'INR';
    const aggregation = def.aggregation || (mappings.length > 1 ? 'AVERAGE' : undefined);

    const relevantItems = mappings.filter(
      (m) => m.evidence.fieldKey === metric || m.evidence.fieldKey.includes(metric) || metric.includes(m.evidence.fieldKey)
    );

    if (relevantItems.length === 0) {
      return {
        result: EvaluationStatus.NOT_EVALUABLE,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'MISSING_FIELD',
        summary: `Evidence metric "${metric}" is missing for requirement ${req.requirementCode}.`,
        explanation: `No extracted evidence item matches the rule's expected metric "${metric}".`,
        calculationTrace: null,
        inputSnapshot: { metric, threshold, operator },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    // Extract numeric values cleanly
    const inputs: Array<{ evidenceId: string; fieldKey: string; rawValue: string; normalizedValue: number; unit: string }> = [];
    for (const item of relevantItems) {
      const parsedVal = FinancialNormalizer.parseINR(item.evidence.rawValue);
      if (parsedVal === null || isNaN(parsedVal)) {
        return {
          result: EvaluationStatus.REVIEW,
          applicability: ApplicabilityStatus.APPLICABLE,
          reasonCode: 'INVALID_VALUE',
          summary: `Could not parse numeric value "${item.evidence.rawValue}" for metric "${metric}".`,
          explanation: `Extracted raw evidence value "${item.evidence.rawValue}" is not a valid numeric amount.`,
          calculationTrace: null,
          inputSnapshot: { metric, rawValue: item.evidence.rawValue },
          outputSnapshot: null,
          evidenceSnapshot,
          engineVersion: ENGINE_VERSION,
        };
      }
      inputs.push({
        evidenceId: item.evidence.id,
        fieldKey: item.evidence.fieldKey,
        rawValue: item.evidence.rawValue,
        normalizedValue: parsedVal,
        unit,
      });
    }

    let calculatedValue = inputs[0]!.normalizedValue;
    let formula = `Direct value ${calculatedValue}`;

    if (inputs.length > 1 || aggregation) {
      const op = (aggregation || 'AVERAGE').toUpperCase();
      const vals = inputs.map((i) => i.normalizedValue);
      if (op === 'AVERAGE' || op === 'AVG') {
        const sum = vals.reduce((a, b) => a + b, 0);
        calculatedValue = Math.round(sum / vals.length);
        formula = `AVERAGE(${vals.join(', ')}) = ${calculatedValue}`;
      } else if (op === 'SUM') {
        calculatedValue = vals.reduce((a, b) => a + b, 0);
        formula = `SUM(${vals.join(', ')}) = ${calculatedValue}`;
      } else if (op === 'MIN') {
        calculatedValue = Math.min(...vals);
        formula = `MIN(${vals.join(', ')}) = ${calculatedValue}`;
      } else if (op === 'MAX') {
        calculatedValue = Math.max(...vals);
        formula = `MAX(${vals.join(', ')}) = ${calculatedValue}`;
      }
    }

    let isPass = false;
    switch (operator) {
      case '>=':
        isPass = calculatedValue >= threshold;
        break;
      case '>':
        isPass = calculatedValue > threshold;
        break;
      case '<=':
        isPass = calculatedValue <= threshold;
        break;
      case '<':
        isPass = calculatedValue < threshold;
        break;
      case '==':
      case '=':
        isPass = calculatedValue === threshold;
        break;
      case '!=':
        isPass = calculatedValue !== threshold;
        break;
    }

    const fmtCalculated = calculatedValue.toLocaleString('en-IN');
    const fmtThreshold = threshold.toLocaleString('en-IN');

    const trace: CalculationTrace = {
      operation: aggregation || 'DIRECT',
      inputs,
      calculatedValue,
      operator,
      threshold,
      unit,
      formula,
      comparisonResult: isPass,
    };

    return {
      result: isPass ? EvaluationStatus.PASS : EvaluationStatus.FAIL,
      applicability: ApplicabilityStatus.APPLICABLE,
      reasonCode: isPass ? 'RULE_PASSED' : 'RULE_FAILED',
      summary: isPass
        ? `Calculated value of ${fmtCalculated} ${unit} satisfies threshold (${operator} ${fmtThreshold} ${unit}).`
        : `Calculated value of ${fmtCalculated} ${unit} fails threshold requirement (${operator} ${fmtThreshold} ${unit}).`,
      explanation: isPass
        ? `The requirement passed because the calculated ${metric} was ${fmtCalculated} ${unit}, satisfying the rule condition (${formula} ${operator} ${fmtThreshold} ${unit}).`
        : `The requirement failed because the calculated ${metric} was ${fmtCalculated} ${unit}, which does not satisfy the rule condition (${formula} ${operator} ${fmtThreshold} ${unit}).`,
      calculationTrace: trace,
      inputSnapshot: { metric, threshold, operator, unit },
      outputSnapshot: { calculatedValue, isPass },
      evidenceSnapshot,
      engineVersion: ENGINE_VERSION,
    };
  }

  // --- DATE EVALUATION ---
  private evaluateDateRule(
    _req: any,
    _rule: any,
    def: any,
    mappings: any[],
    evidenceSnapshot: any
  ): EngineEvaluationResult {
    const field = def.field || 'expiry_date';
    const item = mappings.find((m) => m.evidence.fieldKey === field || m.evidence.fieldKey.includes('date'));

    if (!item) {
      return {
        result: EvaluationStatus.NOT_EVALUABLE,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'MISSING_FIELD',
        summary: `Required date evidence field "${field}" is missing.`,
        explanation: `No evidence item matches the expected date field "${field}".`,
        calculationTrace: null,
        inputSnapshot: { field, operator: def.operator },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    const { date: actualDate, isAmbiguous } = DateNormalizer.parseDate(item.evidence.rawValue);
    if (isAmbiguous || !actualDate) {
      return {
        result: EvaluationStatus.REVIEW,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'AMBIGUOUS_DATE',
        summary: `Date value "${item.evidence.rawValue}" is ambiguous or invalid.`,
        explanation: `Extracted date format "${item.evidence.rawValue}" could not be resolved unambiguously. Officer review required.`,
        calculationTrace: null,
        inputSnapshot: { field, rawValue: item.evidence.rawValue },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    const refDate = DateNormalizer.resolveReferenceDate(
      def.reference?.type || 'FIXED_DATE',
      def.reference?.fixedDate || new Date().toISOString(),
      {}
    ) || new Date();

    let isPass = false;
    const tActual = actualDate.getTime();
    const tRef = refDate.getTime();

    switch (def.operator) {
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

    const fmtActual = actualDate.toISOString().substring(0, 10);
    const fmtRef = refDate.toISOString().substring(0, 10);

    const trace: CalculationTrace = {
      inputs: [{ evidenceId: item.evidence.id, fieldKey: field, rawValue: item.evidence.rawValue, normalizedValue: fmtActual }],
      calculatedValue: fmtActual,
      operator: def.operator,
      threshold: fmtRef,
      formula: `Date ${fmtActual} ${def.operator} ${fmtRef}`,
      comparisonResult: isPass,
    };

    return {
      result: isPass ? EvaluationStatus.PASS : EvaluationStatus.FAIL,
      applicability: ApplicabilityStatus.APPLICABLE,
      reasonCode: isPass ? 'RULE_PASSED' : (isPass ? 'RULE_PASSED' : 'EXPIRED_EVIDENCE'),
      summary: isPass
        ? `Date ${fmtActual} satisfies ${def.operator} ${fmtRef}.`
        : `Date ${fmtActual} fails requirement (${def.operator} ${fmtRef}).`,
      explanation: isPass
        ? `The requirement passed because date ${fmtActual} satisfies ${def.operator} reference date ${fmtRef}.`
        : `The requirement failed because date ${fmtActual} does not satisfy ${def.operator} reference date ${fmtRef}.`,
      calculationTrace: trace,
      inputSnapshot: { field, operator: def.operator, reference: fmtRef },
      outputSnapshot: { actualDate: fmtActual, isPass },
      evidenceSnapshot,
      engineVersion: ENGINE_VERSION,
    };
  }

  // --- BOOLEAN EVALUATION ---
  private evaluateBooleanRule(
    _req: any,
    _rule: any,
    def: any,
    mappings: any[],
    evidenceSnapshot: any
  ): EngineEvaluationResult {
    const field = def.field;
    const item = mappings.find((m) => m.evidence.fieldKey === field);

    if (!item) {
      return {
        result: EvaluationStatus.NOT_EVALUABLE,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'MISSING_FIELD',
        summary: `Required boolean field "${field}" missing from evidence.`,
        explanation: `No evidence item found for required boolean field "${field}".`,
        calculationTrace: null,
        inputSnapshot: { field },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    const rawStr = item.evidence.rawValue.toLowerCase().trim();
    const actualBool = rawStr === 'true' || rawStr === 'yes' || rawStr === 'valid' || rawStr === '1';
    const expectedBool = def.operator === 'IS_TRUE';
    const isPass = actualBool === expectedBool;

    return {
      result: isPass ? EvaluationStatus.PASS : EvaluationStatus.FAIL,
      applicability: ApplicabilityStatus.APPLICABLE,
      reasonCode: isPass ? 'RULE_PASSED' : 'RULE_FAILED',
      summary: isPass
        ? `Boolean field "${field}" is ${actualBool} as required.`
        : `Boolean field "${field}" is ${actualBool}, expected ${expectedBool}.`,
      explanation: isPass
        ? `The requirement passed because boolean field "${field}" is ${actualBool}.`
        : `The requirement failed because boolean field "${field}" is ${actualBool}, but expected ${expectedBool}.`,
      calculationTrace: {
        inputs: [{ evidenceId: item.evidence.id, fieldKey: field, rawValue: item.evidence.rawValue, normalizedValue: actualBool }],
        calculatedValue: actualBool,
        operator: def.operator,
        threshold: expectedBool,
        comparisonResult: isPass,
      },
      inputSnapshot: { field, expectedBool },
      outputSnapshot: { actualBool, isPass },
      evidenceSnapshot,
      engineVersion: ENGINE_VERSION,
    };
  }

  // --- PERCENTAGE EVALUATION ---
  private evaluatePercentageRule(
    _req: any,
    _rule: any,
    def: any,
    mappings: any[],
    evidenceSnapshot: any
  ): EngineEvaluationResult {
    const metric = def.metric || 'local_content_percentage';
    const item = mappings.find((m) => m.evidence.fieldKey === metric || m.evidence.fieldKey.includes('percentage'));

    if (!item) {
      return {
        result: EvaluationStatus.NOT_EVALUABLE,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'MISSING_FIELD',
        summary: `Required percentage metric "${metric}" is missing.`,
        explanation: `No evidence item found for percentage metric "${metric}".`,
        calculationTrace: null,
        inputSnapshot: { metric, threshold: def.value },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    const val = parseFloat(item.evidence.rawValue.replace(/[^0-9.]/g, ''));
    if (isNaN(val) || val < 0 || val > 100) {
      return {
        result: EvaluationStatus.REVIEW,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'INVALID_VALUE',
        summary: `Percentage value "${item.evidence.rawValue}" is invalid (0-100%).`,
        explanation: `Percentage value is out of valid numeric range.`,
        calculationTrace: null,
        inputSnapshot: { metric, rawValue: item.evidence.rawValue },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    const isPass = val >= def.value;

    return {
      result: isPass ? EvaluationStatus.PASS : EvaluationStatus.FAIL,
      applicability: ApplicabilityStatus.APPLICABLE,
      reasonCode: isPass ? 'RULE_PASSED' : 'RULE_FAILED',
      summary: isPass
        ? `Percentage ${val}% satisfies requirement (>= ${def.value}%).`
        : `Percentage ${val}% fails requirement (>= ${def.value}%).`,
      explanation: isPass
        ? `Requirement passed because extracted percentage ${val}% satisfies threshold >= ${def.value}%.`
        : `Requirement failed because extracted percentage ${val}% is below required threshold ${def.value}%.`,
      calculationTrace: {
        inputs: [{ evidenceId: item.evidence.id, fieldKey: metric, rawValue: item.evidence.rawValue, normalizedValue: val }],
        calculatedValue: val,
        operator: def.operator || '>=',
        threshold: def.value,
        unit: '%',
        comparisonResult: isPass,
      },
      inputSnapshot: { metric, threshold: def.value },
      outputSnapshot: { val, isPass },
      evidenceSnapshot,
      engineVersion: ENGINE_VERSION,
    };
  }

  // --- COUNT EVALUATION ---
  private evaluateCountRule(
    _req: any,
    _rule: any,
    def: any,
    mappings: any[],
    evidenceSnapshot: any
  ): EngineEvaluationResult {
    const collection = def.collection || 'similar_projects';
    const countVal = mappings.length;
    const threshold = def.value || 1;
    const isPass = countVal >= threshold;

    return {
      result: isPass ? EvaluationStatus.PASS : EvaluationStatus.FAIL,
      applicability: ApplicabilityStatus.APPLICABLE,
      reasonCode: isPass ? 'RULE_PASSED' : 'RULE_FAILED',
      summary: isPass
        ? `Collection count of ${countVal} satisfies threshold (>= ${threshold}).`
        : `Collection count of ${countVal} fails threshold (>= ${threshold}).`,
      explanation: isPass
        ? `Requirement passed because ${countVal} mapped items satisfy threshold >= ${threshold}.`
        : `Requirement failed because ${countVal} mapped items is less than required ${threshold}.`,
      calculationTrace: {
        inputs: mappings.map((m) => ({ evidenceId: m.evidence.id, fieldKey: m.evidence.fieldKey, rawValue: m.evidence.rawValue })),
        calculatedValue: countVal,
        operator: def.operator || '>=',
        threshold,
        comparisonResult: isPass,
      },
      inputSnapshot: { collection, threshold },
      outputSnapshot: { countVal, isPass },
      evidenceSnapshot,
      engineVersion: ENGINE_VERSION,
    };
  }

  // --- TEXT MATCH EVALUATION ---
  private evaluateTextMatchRule(
    _req: any,
    _rule: any,
    def: any,
    mappings: any[],
    evidenceSnapshot: any
  ): EngineEvaluationResult {
    const field = def.field;
    const item = mappings.find((m) => m.evidence.fieldKey === field);

    if (!item) {
      return {
        result: EvaluationStatus.NOT_EVALUABLE,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'MISSING_FIELD',
        summary: `Required text field "${field}" is missing.`,
        explanation: `No evidence item found for required text field "${field}".`,
        calculationTrace: null,
        inputSnapshot: { field, target: def.value },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    const actualStr = item.evidence.rawValue.trim();
    const targetStr = String(def.value).trim();
    let isPass = false;

    if (def.operator === 'EQUALS') {
      isPass = actualStr === targetStr;
    } else if (def.operator === 'CONTAINS') {
      isPass = actualStr.toLowerCase().includes(targetStr.toLowerCase());
    } else if (def.operator === 'NORMALIZED_EQUALS') {
      isPass = actualStr.toLowerCase().replace(/[^a-z0-9]/g, '') === targetStr.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    return {
      result: isPass ? EvaluationStatus.PASS : EvaluationStatus.FAIL,
      applicability: ApplicabilityStatus.APPLICABLE,
      reasonCode: isPass ? 'RULE_PASSED' : 'RULE_FAILED',
      summary: isPass
        ? `Text value "${actualStr}" matches requirement "${targetStr}".`
        : `Text value "${actualStr}" fails requirement match "${targetStr}".`,
      explanation: isPass
        ? `Requirement passed because text "${actualStr}" matches target "${targetStr}".`
        : `Requirement failed because text "${actualStr}" does not match target "${targetStr}".`,
      calculationTrace: {
        inputs: [{ evidenceId: item.evidence.id, fieldKey: field, rawValue: actualStr }],
        calculatedValue: actualStr,
        operator: def.operator,
        threshold: targetStr,
        comparisonResult: isPass,
      },
      inputSnapshot: { field, targetStr },
      outputSnapshot: { actualStr, isPass },
      evidenceSnapshot,
      engineVersion: ENGINE_VERSION,
    };
  }

  // --- ENTITY MATCH EVALUATION ---
  private evaluateEntityMatchRule(
    _req: any,
    _rule: any,
    def: any,
    mappings: any[],
    evidenceSnapshot: any
  ): EngineEvaluationResult {
    const leftItem = mappings.find((m) => m.evidence.fieldKey === def.left || m.evidence.fieldKey === 'legal_name');
    const rightItem = mappings.find((m) => m.evidence.fieldKey === def.right || m.evidence.fieldKey === 'client_name');

    if (!leftItem || !rightItem) {
      return {
        result: EvaluationStatus.NOT_EVALUABLE,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'MISSING_FIELD',
        summary: `Entity reference fields missing from evidence.`,
        explanation: `Entity fields "${def.left}" or "${def.right}" missing from evidence.`,
        calculationTrace: null,
        inputSnapshot: { left: def.left, right: def.right },
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    const normLeft = leftItem.evidence.rawValue.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normRight = rightItem.evidence.rawValue.toLowerCase().replace(/[^a-z0-9]/g, '');

    const isSame = normLeft === normRight || normLeft.includes(normRight) || normRight.includes(normLeft);
    const isPass = def.operator === 'SAME_ENTITY' ? isSame : !isSame;

    return {
      result: isPass ? EvaluationStatus.PASS : EvaluationStatus.FAIL,
      applicability: ApplicabilityStatus.APPLICABLE,
      reasonCode: isPass ? 'RULE_PASSED' : 'RULE_FAILED',
      summary: isPass
        ? `Entity matching passed for ${leftItem.evidence.rawValue} vs ${rightItem.evidence.rawValue}.`
        : `Entity mismatch between ${leftItem.evidence.rawValue} and ${rightItem.evidence.rawValue}.`,
      explanation: isPass
        ? `Requirement passed because entity matching condition was satisfied.`
        : `Requirement failed because entity names do not match.`,
      calculationTrace: {
        inputs: [
          { evidenceId: leftItem.evidence.id, fieldKey: def.left, rawValue: leftItem.evidence.rawValue },
          { evidenceId: rightItem.evidence.id, fieldKey: def.right, rawValue: rightItem.evidence.rawValue },
        ],
        calculatedValue: `${leftItem.evidence.rawValue} vs ${rightItem.evidence.rawValue}`,
        operator: def.operator,
        comparisonResult: isPass,
      },
      inputSnapshot: { left: def.left, right: def.right },
      outputSnapshot: { isSame, isPass },
      evidenceSnapshot,
      engineVersion: ENGINE_VERSION,
    };
  }

  // --- COMPOUND EVALUATION ---
  private evaluateCompoundRule(
    req: any,
    rule: any,
    def: any,
    mappings: any[],
    evidenceSnapshot: any
  ): EngineEvaluationResult {
    const subRules = def.rules || [];
    if (subRules.length === 0) {
      return {
        result: EvaluationStatus.REVIEW,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'UNSUPPORTED_RULE',
        summary: `Compound rule has no sub-rules defined.`,
        explanation: `Compound rule contains no sub-rule definitions.`,
        calculationTrace: null,
        inputSnapshot: def,
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    const subResults = subRules.map((sr: any) =>
      this.evaluateRule(req, { ...rule, definition: sr }, mappings)
    );

    const isAnd = (def.operator || 'AND') === 'AND';

    if (isAnd) {
      if (subResults.some((r: any) => r.result === EvaluationStatus.FAIL)) {
        return {
          result: EvaluationStatus.FAIL,
          applicability: ApplicabilityStatus.APPLICABLE,
          reasonCode: 'RULE_FAILED',
          summary: `Compound AND rule failed because one or more sub-conditions failed.`,
          explanation: `One or more mandatory sub-conditions failed deterministic evaluation.`,
          calculationTrace: { operation: 'AND', inputs: subResults.map((r: any) => r.calculationTrace) },
          inputSnapshot: def,
          outputSnapshot: { subResults },
          evidenceSnapshot,
          engineVersion: ENGINE_VERSION,
        };
      }
      if (subResults.some((r: any) => r.result === EvaluationStatus.NOT_EVALUABLE)) {
        return {
          result: EvaluationStatus.NOT_EVALUABLE,
          applicability: ApplicabilityStatus.APPLICABLE,
          reasonCode: 'MISSING_EVIDENCE',
          summary: `Compound AND rule cannot be evaluated due to missing evidence for sub-rules.`,
          explanation: `Evidence missing for sub-conditions of compound AND rule.`,
          calculationTrace: null,
          inputSnapshot: def,
          outputSnapshot: null,
          evidenceSnapshot,
          engineVersion: ENGINE_VERSION,
        };
      }
      if (subResults.some((r: any) => r.result === EvaluationStatus.REVIEW)) {
        return {
          result: EvaluationStatus.REVIEW,
          applicability: ApplicabilityStatus.APPLICABLE,
          reasonCode: 'REVIEW_REQUIRED',
          summary: `Compound AND rule requires officer review for sub-rule conditions.`,
          explanation: `One or more sub-rules require human review.`,
          calculationTrace: null,
          inputSnapshot: def,
          outputSnapshot: null,
          evidenceSnapshot,
          engineVersion: ENGINE_VERSION,
        };
      }
      return {
        result: EvaluationStatus.PASS,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'RULE_PASSED',
        summary: `All sub-conditions of compound AND rule satisfied.`,
        explanation: `All sub-rule conditions passed successfully.`,
        calculationTrace: { operation: 'AND', inputs: subResults.map((r: any) => r.calculationTrace) },
        inputSnapshot: def,
        outputSnapshot: { subResults },
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    } else {
      // OR Operator
      if (subResults.some((r: any) => r.result === EvaluationStatus.PASS)) {
        return {
          result: EvaluationStatus.PASS,
          applicability: ApplicabilityStatus.APPLICABLE,
          reasonCode: 'RULE_PASSED',
          summary: `Compound OR rule passed because at least one alternative passed.`,
          explanation: `At least one alternative sub-condition was satisfied.`,
          calculationTrace: { operation: 'OR', inputs: subResults.map((r: any) => r.calculationTrace) },
          inputSnapshot: def,
          outputSnapshot: { subResults },
          evidenceSnapshot,
          engineVersion: ENGINE_VERSION,
        };
      }
      return {
        result: EvaluationStatus.FAIL,
        applicability: ApplicabilityStatus.APPLICABLE,
        reasonCode: 'RULE_FAILED',
        summary: `Compound OR rule failed because no alternative condition passed.`,
        explanation: `None of the alternative sub-rule conditions were satisfied.`,
        calculationTrace: { operation: 'OR', inputs: subResults.map((r: any) => r.calculationTrace) },
        inputSnapshot: def,
        outputSnapshot: { subResults },
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }
  }

  // --- CONDITIONAL EVALUATION ---
  private evaluateConditionalRule(
    req: any,
    rule: any,
    def: any,
    mappings: any[],
    evidenceSnapshot: any
  ): EngineEvaluationResult {
    const ifCond = def.if;
    const ifItem = mappings.find((m) => m.evidence.fieldKey === ifCond.field);

    if (!ifItem) {
      return {
        result: EvaluationStatus.REVIEW,
        applicability: ApplicabilityStatus.UNKNOWN,
        reasonCode: 'MISSING_FIELD',
        summary: `Conditional IF field "${ifCond.field}" is missing.`,
        explanation: `Cannot determine applicability because conditional field "${ifCond.field}" is missing.`,
        calculationTrace: null,
        inputSnapshot: def,
        outputSnapshot: null,
        evidenceSnapshot,
        engineVersion: ENGINE_VERSION,
      };
    }

    const ifVal = ifItem.evidence.rawValue.toLowerCase().trim();
    const isCondTrue = ifVal === 'true' || ifVal === 'msme' || ifVal === 'startup' || ifVal === String(ifCond.value).toLowerCase();

    if (isCondTrue) {
      return this.evaluateRule(req, { ...rule, definition: def.then }, mappings);
    }

    if (def.else) {
      return this.evaluateRule(req, { ...rule, definition: def.else }, mappings);
    }

    return {
      result: EvaluationStatus.PASS,
      applicability: ApplicabilityStatus.NOT_APPLICABLE,
      reasonCode: 'NOT_APPLICABLE',
      summary: `Conditional requirement is NOT APPLICABLE for this bidder category.`,
      explanation: `Conditional IF branch "${ifCond.field}" did not apply to bidder category. Requirement is NOT APPLICABLE.`,
      calculationTrace: null,
      inputSnapshot: def,
      outputSnapshot: { isCondTrue, applicability: 'NOT_APPLICABLE' },
      evidenceSnapshot,
      engineVersion: ENGINE_VERSION,
    };
  }
}

export const evaluationEngine = new EvaluationEngine();
