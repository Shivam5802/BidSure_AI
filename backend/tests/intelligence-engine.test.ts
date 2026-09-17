import { describe, it, expect, beforeEach } from 'vitest';
import { IntelligenceIndicatorService } from '../src/modules/intelligence/services/intelligenceIndicator.service.js';
import { PRIORITY_ORDERING_DISCLAIMER } from '../src/modules/intelligence/types/intelligence.types.js';

describe('Feature 1N — Intelligence Indicator Engine & Deterministic Rules', () => {
  let indicatorService: IntelligenceIndicatorService;

  beforeEach(() => {
    indicatorService = new IntelligenceIndicatorService();
  });

  it('1. should generate deterministic indicators across all controlled categories', () => {
    const mockData = {
      requirements: [
        {
          id: 'req-1',
          requirementCode: 'REQ-MAND-01',
          mandatory: 'YES',
          blueprint: { tenderId: 'tender-123' },
        },
        {
          id: 'req-2',
          requirementCode: 'REQ-TECH-02',
          mandatory: 'NO',
          blueprint: { tenderId: 'tender-123' },
        },
        {
          id: 'req-3',
          requirementCode: 'REQ-STAT-03',
          mandatory: 'NO',
          blueprint: { tenderId: 'tender-123' },
        },
      ],
      evaluations: [
        {
          id: 'eval-1',
          requirementId: 'req-1',
          result: 'FAIL',
          requirement: { mandatory: 'YES', requirementCode: 'REQ-MAND-01' },
          evidenceSnapshot: [{ id: 'snap-1' }],
          ruleId: 'rule-1',
        },
        {
          id: 'eval-2',
          requirementId: 'req-2',
          result: 'REVIEW',
          requirement: { mandatory: 'NO', requirementCode: 'REQ-TECH-02' },
          evidenceSnapshot: [],
          ruleId: 'rule-2',
        },
      ],
      conflicts: [
        {
          id: 'conf-1',
          fieldKey: 'turnover',
          severity: 'HIGH',
          conflictType: 'NUMERIC_CONFLICT',
          status: 'DETECTED',
          description: 'Turnover value mismatch across ITR and Balance Sheet',
          createdAt: new Date(),
          bidder: { bidderCode: 'BID-01', legalName: 'Apex Infra' },
        },
      ],
      verifications: [
        {
          id: 'ver-1',
          verificationType: 'GSTIN',
          status: 'MISMATCH',
          requestedIdentifier: '29ABCDE1234F1Z5',
          createdAt: new Date(),
          bidder: { bidderCode: 'BID-01', legalName: 'Apex Infra' },
          results: [{ matchSummary: 'Legal name in GST portal differs' }],
        },
      ],
      investigations: [
        {
          id: 'inv-1',
          status: 'REQUIRES_HUMAN',
          triggerType: 'CONFLICT_DETECTED',
          createdAt: new Date(),
        },
      ],
      mappings: [
        {
          id: 'map-1',
          tenderRequirementId: 'req-1',
          mappingType: 'DIRECT',
          confidence: 0.95,
        },
      ],
      tenderDocuments: [{ id: 'tdoc-1', processingStatus: 'COMPLETED', ocrUsed: true }],
      bidDocuments: [{ id: 'bdoc-1', processingStatus: 'FAILED', filename: 'financials.pdf' }],
    };

    const indicators = indicatorService.generateIndicators(mockData);

    // Verify indicators exist
    expect(indicators.length).toBeGreaterThanOrEqual(6);

    const categories = indicators.map((i) => i.category);
    expect(categories).toContain('COMPLIANCE_FAILURE');
    expect(categories).toContain('COMPLIANCE_REVIEW');
    expect(categories).toContain('CONFLICT');
    expect(categories).toContain('EXTERNAL_VERIFICATION');
    expect(categories).toContain('INVESTIGATION');
    expect(categories).toContain('EVIDENCE_GAP');
    expect(categories).toContain('DOCUMENT_PROCESSING');

    // Verify every indicator is grounded in underlying records
    for (const ind of indicators) {
      expect(ind.id).toBeDefined();
      expect(ind.sourceReferences).toBeInstanceOf(Array);
      expect(ind.sourceReferences.length).toBeGreaterThan(0);
      expect(ind.recommendedAction).toBeDefined();
      expect(ind.recommendedRoute).toBeDefined();
    }
  });

  it('2. should assign deterministic CRITICAL severity only to specified high-impact conditions', () => {
    const mockData = {
      requirements: [
        { id: 'req-mand-1', mandatory: 'YES', requirementCode: 'REQ-01', blueprint: { tenderId: 't-1' } },
      ],
      evaluations: [],
      conflicts: [
        {
          id: 'conf-critical',
          fieldKey: 'entityName',
          conflictType: 'ENTITY_NAME_CONFLICT',
          severity: 'CRITICAL',
          status: 'DETECTED',
          createdAt: new Date(),
          description: 'Bidder name on PAN conflicts with MCA record',
        },
      ],
      verifications: [
        {
          id: 'ver-debar',
          verificationType: 'BLACKLISTING',
          status: 'MISMATCH',
          requestedIdentifier: 'PAN12345',
          createdAt: new Date(),
          results: [{ matchSummary: 'Entity found in debarred list' }],
        },
      ],
      investigations: [],
      mappings: [],
    };

    const indicators = indicatorService.generateIndicators(mockData);
    const criticalIndicators = indicators.filter((i) => i.severity === 'CRITICAL');

    expect(criticalIndicators.length).toBe(2);
    expect(criticalIndicators.map((i) => i.category)).toContain('CONFLICT');
    expect(criticalIndicators.map((i) => i.category)).toContain('EXTERNAL_VERIFICATION');
  });

  it('3. should generate prioritized action queue with deterministic ordering and official disclaimer', () => {
    const mockData = {
      requirements: [
        { id: 'req-m', mandatory: 'YES', requirementCode: 'REQ-MAND-1', blueprint: { tenderId: 't-1' } },
        { id: 'req-opt', mandatory: 'NO', requirementCode: 'REQ-OPT-1', blueprint: { tenderId: 't-1' } },
      ],
      evaluations: [
        {
          id: 'e-1',
          requirementId: 'req-m',
          result: 'FAIL',
          requirement: { mandatory: 'YES', requirementCode: 'REQ-MAND-1' },
          evidenceSnapshot: [{ id: 's1' }],
          ruleId: 'r1',
        },
      ],
      conflicts: [
        {
          id: 'c-1',
          fieldKey: 'entityName',
          conflictType: 'ENTITY_NAME_CONFLICT',
          severity: 'CRITICAL',
          status: 'DETECTED',
          createdAt: new Date(),
          description: 'Name conflict',
        },
      ],
      verifications: [
        {
          id: 'v-1',
          verificationType: 'GSTIN',
          status: 'MISMATCH',
          requestedIdentifier: 'GST123',
          createdAt: new Date(),
          results: [{ matchSummary: 'Mismatch' }],
        },
      ],
      investigations: [
        {
          id: 'i-1',
          status: 'REQUIRES_HUMAN',
          triggerType: 'MANUAL',
          createdAt: new Date(),
        },
      ],
      mappings: [],
    };

    const indicators = indicatorService.generateIndicators(mockData);
    const actions = indicatorService.generatePriorityActions(indicators);

    expect(actions.length).toBeGreaterThan(0);

    // Attention ordering check: CRITICAL must precede HIGH, HIGH must precede MEDIUM/LOW
    const priorities = actions.map((a) => a.priority);
    const firstCriticalIdx = priorities.indexOf('CRITICAL');
    const firstHighIdx = priorities.indexOf('HIGH');
    const firstMediumIdx = priorities.indexOf('MEDIUM');

    expect(firstCriticalIdx).toBeLessThan(firstHighIdx);
    if (firstMediumIdx !== -1) {
      expect(firstHighIdx).toBeLessThan(firstMediumIdx);
    }

    // Disclaimer statement check
    expect(PRIORITY_ORDERING_DISCLAIMER).toContain('does not indicate bidder preference or procurement outcome');
  });

  it('4. should NOT generate arbitrary bidder scores or winner rankings', () => {
    const mockData = {
      requirements: [{ id: 'r1', blueprint: { tenderId: 't1' } }],
      evaluations: [],
      conflicts: [],
      verifications: [],
      investigations: [],
      mappings: [],
    };

    const indicators = indicatorService.generateIndicators(mockData);
    const actions = indicatorService.generatePriorityActions(indicators);

    for (const ind of indicators) {
      expect((ind as any).score).toBeUndefined();
      expect((ind as any).winner).toBeUndefined();
      expect((ind as any).bidderRank).toBeUndefined();
    }

    for (const act of actions) {
      expect((act as any).score).toBeUndefined();
      expect((act as any).rank).toBeUndefined();
      expect((act as any).winnerProbability).toBeUndefined();
    }
  });
});
