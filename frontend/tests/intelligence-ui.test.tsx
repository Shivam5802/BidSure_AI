import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  TenderIntelligenceHeader,
  PriorityActionQueueSection,
  ComplianceDistributionChart,
  EvidenceCoverageSection,
  AuditabilityMetricsCard,
  VerificationAndInvestigationGrid,
  AiContributionCard,
  BeforeAfterWorkflow,
  DemoImpactCalculator,
} from '../features/intelligence';
import {
  TenderHealthSnapshot,
  PriorityActionItem,
  ComplianceDistribution,
  EvidenceCoverageAnalytics,
  AuditabilityMetrics,
  VerificationAnalyticsSummary,
  InvestigationAnalyticsSummary,
  PRIORITY_ORDERING_DISCLAIMER,
} from '../types/intelligence';

describe('Feature 1N — Intelligence & Impact Analytics UI Components', () => {
  const mockSnapshot: TenderHealthSnapshot = {
    tenderId: 't-101',
    tenderTitle: 'Supply of Heavy Turbine Generators',
    referenceNumber: 'GEM-2026-TURB-01',
    totalRequirements: 35,
    executableRulesCount: 29,
    evidenceCoveragePercentage: 88,
    passCount: 24,
    failCount: 4,
    reviewCount: 5,
    notEvaluableCount: 2,
    unresolvedConflictCount: 3,
    externalMismatchCount: 1,
    openInvestigationCount: 4,
    dataTimestamp: new Date().toISOString(),
  };

  it('1. renders TenderIntelligenceHeader with title, reference and KPI metrics', () => {
    render(
      <TenderIntelligenceHeader
        snapshot={mockSnapshot}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText('Supply of Heavy Turbine Generators')).toBeDefined();
    expect(screen.getByText(/GEM-2026-TURB-01/)).toBeDefined();
    expect(screen.getByText('35')).toBeDefined();
    expect(screen.getByText('88%')).toBeDefined();
    expect(screen.getByText('24')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
  });

  it('2. renders PriorityActionQueueSection with severity badges and mandatory disclaimer', () => {
    const mockActions: PriorityActionItem[] = [
      {
        id: 'act-1',
        priority: 'CRITICAL',
        category: 'EXTERNAL_VERIFICATION',
        title: 'GST Legal Name Mismatch',
        reason: 'External GSTIN portal record differs from bidder submission.',
        bidderCode: 'BID-01',
        bidderName: 'Apex Heavy Industries',
        entityType: 'VerificationRequest',
        entityId: 'ver-1',
        recommendedRoute: '/tenders/t-101/verifications',
        actionLabel: 'Investigate Mismatch',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'act-2',
        priority: 'HIGH',
        category: 'COMPLIANCE_FAILURE',
        title: 'Mandatory Requirement Deterministic Failure',
        reason: 'Failed minimum net worth criteria.',
        bidderCode: 'BID-02',
        bidderName: 'Beta Power Solutions',
        entityType: 'TenderRequirement',
        entityId: 'req-1',
        recommendedRoute: '/tenders/t-101/workspace',
        actionLabel: 'Review Failure',
        createdAt: new Date().toISOString(),
      },
    ];

    render(<PriorityActionQueueSection actions={mockActions} tenderId="t-101" />);

    expect(screen.getByText('Priority Action Queue')).toBeDefined();
    expect(screen.getByText('GST Legal Name Mismatch')).toBeDefined();
    expect(screen.getAllByText('CRITICAL').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('HIGH').length).toBeGreaterThanOrEqual(1);

    // Critical mandated disclaimer must be visible
    expect(screen.getByText(PRIORITY_ORDERING_DISCLAIMER)).toBeDefined();
  });

  it('3. renders ComplianceDistributionChart with factual count breakdown and source label', () => {
    const mockCompliance: ComplianceDistribution = {
      passCount: 42,
      failCount: 7,
      reviewCount: 5,
      notEvaluableCount: 4,
      notApplicableCount: 2,
      totalEvaluated: 60,
      byCategory: {},
    };

    render(<ComplianceDistributionChart tenderId="t-101" initialDistribution={mockCompliance} />);

    expect(screen.getByText('Compliance Distribution')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('7')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
    expect(screen.getByText(/Compliance Evaluation Engine/)).toBeDefined();
  });

  it('4. renders EvidenceCoverageSection with 5-state percentages and source label', () => {
    const mockCoverage: EvidenceCoverageAnalytics = {
      coveredCount: 25,
      coveredPercentage: 72,
      partialCount: 4,
      partialPercentage: 12,
      missingCount: 3,
      missingPercentage: 8,
      conflictingCount: 2,
      conflictingPercentage: 5,
      ambiguousCount: 1,
      ambiguousPercentage: 3,
      totalMappedRequirements: 35,
    };

    render(<EvidenceCoverageSection coverage={mockCoverage} />);

    expect(screen.getByText('Tender Requirement Evidence Coverage')).toBeDefined();
    expect(screen.getByText('72%')).toBeDefined();
    expect(screen.getByText('12%')).toBeDefined();
    expect(screen.getByText('8%')).toBeDefined();
    expect(screen.getByText('5%')).toBeDefined();
    expect(screen.getByText('3%')).toBeDefined();
    expect(screen.getByText(/Requirement Evidence Mapping Engine/)).toBeDefined();
  });

  it('5. renders AuditabilityMetricsCard with Evidence Traceability and Automation Coverage', () => {
    const mockMetrics: AuditabilityMetrics = {
      requirementProvenancePercentage: 100,
      evidencePageProvenancePercentage: 98,
      evaluationVersionTracePercentage: 100,
      auditEventsRecordedCount: 48,
      evidenceTraceabilityPercentage: 94,
      automationCoveragePercentage: 82,
      humanReviewRatePercentage: 18,
      verificationCoveragePercentage: 75,
    };

    render(<AuditabilityMetricsCard metrics={mockMetrics} />);

    expect(screen.getByText('Traceability & Auditability Metrics')).toBeDefined();
    expect(screen.getByText('94%')).toBeDefined();
    expect(screen.getByText('82%')).toBeDefined();
    expect(screen.getByText('18%')).toBeDefined();
    expect(screen.getByText('75%')).toBeDefined();
    expect(screen.getByText(/Audit Events Recorded/)).toBeDefined();
  });

  it('6. renders VerificationAndInvestigationGrid displaying prominent MOCK provider badge', () => {
    const mockVerifications: VerificationAnalyticsSummary = {
      totalRequests: 18,
      matchCount: 11,
      mismatchCount: 3,
      reviewRequiredCount: 2,
      unavailableCount: 1,
      errorCount: 1,
      notFoundCount: 0,
      providerMode: 'MOCK',
      byType: {
        GST: { total: 6, match: 4, mismatch: 1, review: 1 },
        PAN: { total: 6, match: 5, mismatch: 1, review: 0 },
      },
    };

    const mockInvestigations: InvestigationAnalyticsSummary = {
      totalCount: 12,
      completedCount: 7,
      requiresHumanCount: 4,
      runningCount: 1,
      failedCount: 0,
      byTriggerType: {
        CONFLICT: 4,
        MISSING_EVIDENCE: 3,
      },
    };

    render(
      <VerificationAndInvestigationGrid
        verifications={mockVerifications}
        investigations={mockInvestigations}
        tenderId="t-101"
      />
    );

    expect(screen.getByText('External Verification Analytics')).toBeDefined();
    // Verify MOCK / SYNTHETIC badge is rendered prominently
    expect(screen.getByText('MOCK / SYNTHETIC')).toBeDefined();
    expect(screen.getByText('AI Investigation Analytics')).toBeDefined();
    expect(screen.getByText('18')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
  });

  it('7. renders DemoImpactCalculator with interactive sliders, estimate label and SIH target', () => {
    render(<DemoImpactCalculator defaultRequirementsCount={35} defaultBidderCount={4} />);

    expect(screen.getByText('Demo Impact & Efficiency Calculator')).toBeDefined();
    expect(screen.getByText('DEMO ESTIMATE')).toBeDefined();
    expect(screen.getByText(/Illustrative estimate based on user-entered assumptions/)).toBeDefined();
    expect(screen.getByText(/60%–80% reduction in verification effort/)).toBeDefined();
  });

  it('8. renders BeforeAfterWorkflow comparing traditional and BidGuard workflows', () => {
    render(<BeforeAfterWorkflow />);

    expect(screen.getByText('Workflow Transformation Comparison')).toBeDefined();
    expect(screen.getByText('Traditional Procurement Process')).toBeDefined();
    expect(screen.getByText('BidGuard AI Assisted Workflow')).toBeDefined();
  });
});
