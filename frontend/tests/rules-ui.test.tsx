import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RuleCoverageCard } from '../features/rules/components/RuleCoverageCard';
import { RuleCard } from '../features/rules/components/RuleList';
import { RuleDetail } from '../features/rules/components/RuleDetail';
import { ComplianceRule } from '../features/rules/types';

const mockRule: ComplianceRule = {
  id: 'rule_1',
  blueprintId: 'bp_1',
  requirementId: 'req_1',
  ruleCode: 'RULE-R-001',
  name: 'Average Annual Turnover >= ₹10 Crore',
  description: 'Valid numeric turnover rule',
  ruleType: 'NUMERIC',
  definition: {
    type: 'NUMERIC',
    metric: 'average_annual_turnover',
    operator: '>=',
    value: 100000000,
    unit: 'INR',
  },
  status: 'APPROVED',
  version: 1,
  createdBy: 'officer_1',
  approvedBy: 'officer_1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Feature 1C — Rules UI Components', () => {
  it('renders RuleCoverageCard with coverage stats', () => {
    render(
      <RuleCoverageCard
        coverage={{
          totalRequirements: 10,
          totalRules: 8,
          approvedRules: 6,
          reviewRules: 2,
          draftRules: 0,
          disabledRules: 0,
          byType: { NUMERIC: 4, BOOLEAN: 2, DATE: 2 },
        }}
      />
    );

    expect(screen.getByText('Tender Compliance Rule Engine Hub')).toBeDefined();
    expect(screen.getByText('Approved Rules')).toBeDefined();
  });

  it('renders RuleDetail with declarative JSON definition and action buttons', () => {
    render(
      <RuleDetail
        rule={mockRule}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onOpenSimulator={vi.fn()}
      />
    );

    expect(screen.getByText('Average Annual Turnover >= ₹10 Crore')).toBeDefined();
    expect(screen.getByText('RULE-R-001')).toBeDefined();
    expect(screen.getByText('Open Rule Simulator')).toBeDefined();
  });
});
