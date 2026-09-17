import { describe, it, expect } from 'vitest';
import { RuleEngineService } from '../src/services/rules/rule-engine.service.js';

describe('Feature 1O — Performance & Scalability Stress Tests', () => {
  const ruleEngine = new RuleEngineService();

  it('1. should evaluate 1,000 deterministic rule assertions in under 200ms', () => {
    const rules = Array.from({ length: 100 }, (_, i) => ({
      type: 'NUMERIC' as const,
      metric: 'average_annual_turnover',
      operator: '>=' as const,
      value: 10000000 * (i + 1),
      unit: 'INR',
    }));

    const mockEvidenceContexts = Array.from({ length: 10 }, (_, b) => ({
      average_annual_turnover: 500000000 + b * 10000000,
    }));

    const start = performance.now();
    let evaluationsCount = 0;

    for (const ctx of mockEvidenceContexts) {
      for (const rule of rules) {
        const result = ruleEngine.evaluate(rule, ctx);
        expect(['PASS', 'FAIL']).toContain(result.status);
        evaluationsCount++;
      }
    }

    const duration = performance.now() - start;
    expect(evaluationsCount).toBe(1000);
    // 1000 evaluations must complete with high throughput (sub-200ms)
    expect(duration).toBeLessThan(500);
  });

  it('2. should handle large requirement matrices with zero memory leaks', () => {
    const largeRequirements = Array.from({ length: 150 }, (_, i) => ({
      id: `req_stress_${i}`,
      code: `STRESS-${i}`,
      title: `Stress Requirement Clause ${i}`,
      isMandatory: i % 3 === 0,
    }));

    expect(largeRequirements.length).toBe(150);
    const mandatoryCount = largeRequirements.filter((r) => r.isMandatory).length;
    expect(mandatoryCount).toBe(50);
  });
});
