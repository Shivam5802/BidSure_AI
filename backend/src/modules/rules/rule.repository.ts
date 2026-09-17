import {
  ComplianceRule,
  RuleStatus,
  RuleType,
} from '@prisma/client';

export interface CreateRuleInput {
  blueprintId: string;
  requirementId: string;
  ruleCode: string;
  name: string;
  description?: string | null;
  ruleType: RuleType;
  definition: Record<string, any>;
  status?: RuleStatus;
  version?: number;
  createdBy?: string | null;
}

export interface RuleFilterOptions {
  status?: RuleStatus;
  ruleType?: RuleType;
  search?: string;
}

export class RuleRepository {
  private rules = new Map<string, ComplianceRule>();

  async createRule(input: CreateRuleInput): Promise<ComplianceRule> {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const rule: ComplianceRule = {
      id,
      blueprintId: input.blueprintId,
      requirementId: input.requirementId,
      ruleCode: input.ruleCode,
      name: input.name,
      description: input.description ?? null,
      ruleType: input.ruleType,
      definition: input.definition,
      status: input.status || RuleStatus.DRAFT,
      version: input.version || 1,
      createdBy: input.createdBy ?? null,
      approvedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: null,
    };

    this.rules.set(id, rule);
    return rule;
  }

  async findRuleById(id: string): Promise<ComplianceRule | null> {
    return this.rules.get(id) || null;
  }

  async listRulesByBlueprint(
    blueprintId: string,
    filters?: RuleFilterOptions
  ): Promise<ComplianceRule[]> {
    let list = Array.from(this.rules.values()).filter((r) => r.blueprintId === blueprintId);

    if (filters?.status) list = list.filter((r) => r.status === filters.status);
    if (filters?.ruleType) list = list.filter((r) => r.ruleType === filters.ruleType);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.ruleCode.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => a.ruleCode.localeCompare(b.ruleCode));
  }

  async getRuleVersions(requirementId: string): Promise<ComplianceRule[]> {
    return Array.from(this.rules.values())
      .filter((r) => r.requirementId === requirementId)
      .sort((a, b) => b.version - a.version);
  }

  async listRulesByRequirement(requirementId: string): Promise<ComplianceRule[]> {
    return this.getRuleVersions(requirementId);
  }

  async updateRuleStatus(
    ruleId: string,
    status: RuleStatus,
    approvedBy?: string
  ): Promise<ComplianceRule> {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error(`Rule ${ruleId} not found`);

    rule.status = status;
    if (approvedBy) rule.approvedBy = approvedBy;
    if (status === RuleStatus.APPROVED) rule.approvedAt = new Date();
    rule.updatedAt = new Date();

    this.rules.set(ruleId, rule);
    return rule;
  }

  async updateRuleDefinition(
    ruleId: string,
    data: {
      name?: string;
      description?: string;
      definition?: Record<string, any>;
      ruleType?: RuleType;
    }
  ): Promise<ComplianceRule> {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error(`Rule ${ruleId} not found`);

    if (data.name) rule.name = data.name;
    if (data.description !== undefined) rule.description = data.description;
    if (data.definition) rule.definition = data.definition;
    if (data.ruleType) rule.ruleType = data.ruleType;

    rule.updatedAt = new Date();
    this.rules.set(ruleId, rule);
    return rule;
  }

  async clear(): Promise<void> {
    this.rules.clear();
  }
}

export const ruleRepository = new RuleRepository();
