import { z } from 'zod';

export const EvaluationStatusSchema = z.enum([
  'PASS',
  'FAIL',
  'NOT_EVALUABLE',
  'REVIEW',
]);

export type EvaluationStatus = z.infer<typeof EvaluationStatusSchema>;

export const RuleTypeSchema = z.enum([
  'NUMERIC',
  'DATE',
  'BOOLEAN',
  'TEXT_MATCH',
  'ENTITY_MATCH',
  'PERCENTAGE',
  'COUNT',
  'COMPOUND',
  'CONDITIONAL',
  'INFORMATIONAL',
]);

export type RuleType = z.infer<typeof RuleTypeSchema>;

// Operators
export const NumericOperatorSchema = z.enum(['>', '>=', '<', '<=', '==', '!=']);
export type NumericOperator = z.infer<typeof NumericOperatorSchema>;

export const DateOperatorSchema = z.enum([
  'BEFORE',
  'AFTER',
  'ON_OR_BEFORE',
  'ON_OR_AFTER',
  'EQUALS',
]);
export type DateOperator = z.infer<typeof DateOperatorSchema>;

export const BooleanOperatorSchema = z.enum(['IS_TRUE', 'IS_FALSE']);
export type BooleanOperator = z.infer<typeof BooleanOperatorSchema>;

export const TextOperatorSchema = z.enum(['EQUALS', 'CONTAINS', 'NORMALIZED_EQUALS']);
export type TextOperator = z.infer<typeof TextOperatorSchema>;

export const EntityOperatorSchema = z.enum(['SAME_ENTITY', 'DIFFERENT_ENTITY']);
export type EntityOperator = z.infer<typeof EntityOperatorSchema>;

export const CompoundOperatorSchema = z.enum(['AND', 'OR']);
export type CompoundOperator = z.infer<typeof CompoundOperatorSchema>;

// Declarative Rule Schemas
export const NumericRuleSchema = z.object({
  type: z.literal('NUMERIC'),
  metric: z.string(),
  operator: NumericOperatorSchema,
  value: z.number(),
  unit: z.string().default('INR'),
  period: z
    .object({
      type: z.string(),
      count: z.number(),
    })
    .optional(),
});
export type NumericRuleDefinition = z.infer<typeof NumericRuleSchema>;

export const DateRuleSchema = z.object({
  type: z.literal('DATE'),
  field: z.string(),
  operator: DateOperatorSchema,
  reference: z.object({
    type: z.enum(['BID_SUBMISSION_DATE', 'TENDER_CLOSING_DATE', 'TENDER_OPENING_DATE', 'FIXED_DATE']),
    fixedDate: z.string().optional(),
  }),
});
export type DateRuleDefinition = z.infer<typeof DateRuleSchema>;

export const BooleanRuleSchema = z.object({
  type: z.literal('BOOLEAN'),
  field: z.string(),
  operator: BooleanOperatorSchema,
});
export type BooleanRuleDefinition = z.infer<typeof BooleanRuleSchema>;

export const PercentageRuleSchema = z.object({
  type: z.literal('PERCENTAGE'),
  metric: z.string(),
  operator: NumericOperatorSchema,
  value: z.number().min(0).max(100),
});
export type PercentageRuleDefinition = z.infer<typeof PercentageRuleSchema>;

export const CountRuleSchema = z.object({
  type: z.literal('COUNT'),
  collection: z.string(),
  operator: NumericOperatorSchema,
  value: z.number().min(0),
});
export type CountRuleDefinition = z.infer<typeof CountRuleSchema>;

export const TextMatchRuleSchema = z.object({
  type: z.literal('TEXT_MATCH'),
  field: z.string(),
  operator: TextOperatorSchema,
  value: z.string(),
});
export type TextMatchRuleDefinition = z.infer<typeof TextMatchRuleSchema>;

export const EntityMatchRuleSchema = z.object({
  type: z.literal('ENTITY_MATCH'),
  left: z.string(),
  right: z.string(),
  operator: EntityOperatorSchema,
});
export type EntityMatchRuleDefinition = z.infer<typeof EntityMatchRuleSchema>;

export const InformationalRuleSchema = z.object({
  type: z.literal('INFORMATIONAL'),
  requirementText: z.string(),
  note: z.string().optional(),
});
export type InformationalRuleDefinition = z.infer<typeof InformationalRuleSchema>;

// Recursive definition type helpers
export type RuleDefinition =
  | NumericRuleDefinition
  | DateRuleDefinition
  | BooleanRuleDefinition
  | PercentageRuleDefinition
  | CountRuleDefinition
  | TextMatchRuleDefinition
  | EntityMatchRuleDefinition
  | InformationalRuleDefinition
  | CompoundRuleDefinition
  | ConditionalRuleDefinition;

export interface CompoundRuleDefinition {
  type: 'COMPOUND';
  operator: CompoundOperator;
  rules: RuleDefinition[];
}

export interface ConditionalRuleDefinition {
  type: 'CONDITIONAL';
  if: {
    field: string;
    operator: BooleanOperator | NumericOperator | TextOperator;
    value?: unknown;
  };
  then: RuleDefinition;
  else?: RuleDefinition;
}

export const CompoundRuleSchema: z.ZodType<CompoundRuleDefinition> = z.object({
  type: z.literal('COMPOUND'),
  operator: CompoundOperatorSchema,
  rules: z.array(z.lazy(() => ComplianceRuleDefinitionSchema as any)),
}) as any;

export const ConditionalRuleSchema: z.ZodType<ConditionalRuleDefinition> = z.object({
  type: z.literal('CONDITIONAL'),
  if: z.object({
    field: z.string(),
    operator: z.string(),
    value: z.unknown().optional(),
  }),
  then: z.lazy(() => ComplianceRuleDefinitionSchema as any),
  else: z.lazy(() => ComplianceRuleDefinitionSchema as any).optional(),
}) as any;

export const ComplianceRuleDefinitionSchema: z.ZodType<RuleDefinition> = z.union([
  NumericRuleSchema,
  DateRuleSchema,
  BooleanRuleSchema,
  PercentageRuleSchema,
  CountRuleSchema,
  TextMatchRuleSchema,
  EntityMatchRuleSchema,
  InformationalRuleSchema,
  CompoundRuleSchema,
  ConditionalRuleSchema,
]) as any;

// Evidence Input Context
export type EvidenceContext = Record<string, unknown>;

// Rule Evaluation Output Result
export interface RuleEvaluationResult {
  status: EvaluationStatus;
  reason: string;
  ruleId?: string;
  ruleVersion?: number;
  requirementId?: string;
  engineVersion: string;
  evaluatedAt: string;
  inputs?: {
    actual: unknown;
    required: unknown;
    metricOrField?: string;
  };
  nestedResults?: RuleEvaluationResult[];
}
