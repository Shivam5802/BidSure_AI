import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BlueprintHeader } from '../features/requirements/components/BlueprintHeader';
import { RequirementCard } from '../features/requirements/components/RequirementCard';
import { RequirementDetail } from '../features/requirements/components/RequirementDetail';
import { TenderRequirement } from '../features/requirements/types';

const mockReq: TenderRequirement = {
  id: 'req_1',
  blueprintId: 'bp_1',
  requirementCode: 'R-001',
  clauseReference: '4.2',
  requirementText: 'Average annual turnover shall not be less than INR 10 crore.',
  normalizedRequirementText: 'Average annual turnover >= 10 crore INR',
  category: 'FINANCIAL',
  mandatory: 'YES',
  condition: null,
  evidenceRequired: ['Audited Balance Sheet', 'CA Certificate'],
  verificationSource: 'MCA',
  ruleType: 'NUMERIC',
  ruleParameters: { metric: 'average_annual_turnover', operator: '>=', value: 100000000 },
  extractionConfidence: 0.96,
  status: 'DRAFT',
  ambiguityFlag: false,
  ambiguityReason: null,
  conflictFlag: false,
  conflictReason: null,
  duplicateFlag: false,
  duplicateOfRequirementId: null,
  aiExplanation: 'Identified mandatory financial requirement.',
  sourcePageIds: ['page_17'],
  sourceEvidenceBlockIds: ['eb_17_4'],
  sourceReferences: [{ documentId: 'doc_1', pageNumber: 17, evidenceBlockId: 'eb_17_4' }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Feature 1B — Requirements UI Components', () => {
  it('renders BlueprintHeader with summary statistics and actions', () => {
    render(
      <BlueprintHeader
        tenderTitle="CPCL Procurement Tender"
        referenceNumber="GEM-2026-001"
        blueprintData={{
          blueprint: {
            id: 'bp_1',
            tenderId: 't_1',
            version: 1,
            status: 'DRAFT',
            createdAt: new Date().toISOString(),
          },
          summary: {
            total: 10,
            financial: 3,
            technical: 4,
            statutory: 2,
            eligibility: 1,
            policy: 0,
            tenderSpecific: 0,
            reviewRequired: 2,
            conflicts: 1,
            duplicates: 1,
            approved: 2,
          },
          requirements: [mockReq],
        }}
        versions={[]}
        isExtracting={false}
        onExtract={vi.fn()}
        onLock={vi.fn()}
        onSelectVersion={vi.fn()}
      />
    );

    expect(screen.getByText('CPCL Procurement Tender')).toBeDefined();
    expect(screen.getByText('GEM-2026-001')).toBeDefined();
    expect(screen.getByText('Extract Requirements')).toBeDefined();
  });

  it('renders RequirementCard with code, clause, confidence %, and category', () => {
    render(
      <RequirementCard requirement={mockReq} isSelected={false} onSelect={vi.fn()} />
    );

    expect(screen.getByText('R-001')).toBeDefined();
    expect(screen.getByText('Clause 4.2')).toBeDefined();
    expect(screen.getByText('FINANCIAL')).toBeDefined();
    expect(screen.getByText('96% Conf')).toBeDefined();
  });

  it('renders RequirementDetail with rule candidate parameters and evidence list', () => {
    render(
      <RequirementDetail
        requirement={mockReq}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText('Tender Requirement Detail')).toBeDefined();
    expect(screen.getByText('Audited Balance Sheet')).toBeDefined();
    expect(screen.getByText('Approve Requirement')).toBeDefined();
  });
});
