import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { ruleEngineService } from '../src/services/rules/rule-engine.service.js';
import { FinancialNormalizer, DateNormalizer } from '../src/services/rules/normalizer.js';
import { RuleDefinition } from '../src/services/rules/rule-schema.interface.js';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';
import { requirementRepository } from '../src/modules/requirements/requirement.repository.js';
import { ruleRepository } from '../src/modules/rules/rule.repository.js';

describe('Feature 1C — Tender Compliance Rule Engine & Normalizers', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await tenderRepository.clear();
    await requirementRepository.clear();
    await ruleRepository.clear();
  });

  describe('Financial Normalizer', () => {
    it('should correctly parse Indian currency representations into standard minor integer units', () => {
      expect(FinancialNormalizer.parseINR('₹10 crore')).toBe(100000000);
      expect(FinancialNormalizer.parseINR('10 Crores')).toBe(100000000);
      expect(FinancialNormalizer.parseINR('INR 10 crore')).toBe(100000000);
      expect(FinancialNormalizer.parseINR('Rs. 10 Cr.')).toBe(100000000);
      expect(FinancialNormalizer.parseINR('₹ 5,00,00,000')).toBe(50000000);
      expect(FinancialNormalizer.parseINR('12.5 lakh')).toBe(1250000);
      expect(FinancialNormalizer.parseINR(100000000)).toBe(100000000);
    });
  });

  describe('Deterministic Rule Engine Evaluators (Quad-State Logic)', () => {
    it('Test 1: Numeric turnover >= ₹10 crore with Evidence ₹12 crore -> PASS', () => {
      const rule: RuleDefinition = {
        type: 'NUMERIC',
        metric: 'average_annual_turnover',
        operator: '>=',
        value: 100000000,
        unit: 'INR',
      };
      const result = ruleEngineService.evaluate(rule, { average_annual_turnover: 120000000 });
      expect(result.status).toBe('PASS');
      expect(result.reason).toContain('12,00,00,000');
    });

    it('Test 2: Numeric turnover >= ₹10 crore with Evidence ₹8 crore -> FAIL', () => {
      const rule: RuleDefinition = {
        type: 'NUMERIC',
        metric: 'average_annual_turnover',
        operator: '>=',
        value: 100000000,
        unit: 'INR',
      };
      const result = ruleEngineService.evaluate(rule, { average_annual_turnover: 80000000 });
      expect(result.status).toBe('FAIL');
      expect(result.reason).toContain('8,00,00,000');
    });

    it('Test 3: Numeric turnover >= ₹10 crore with missing evidence -> NOT_EVALUABLE', () => {
      const rule: RuleDefinition = {
        type: 'NUMERIC',
        metric: 'average_annual_turnover',
        operator: '>=',
        value: 100000000,
        unit: 'INR',
      };
      const result = ruleEngineService.evaluate(rule, {});
      expect(result.status).toBe('NOT_EVALUABLE');
      expect(result.reason).toContain('missing');
    });

    it('Test 4: Local content >= 50% with Evidence 63% -> PASS', () => {
      const rule: RuleDefinition = {
        type: 'PERCENTAGE',
        metric: 'local_content',
        operator: '>=',
        value: 50,
      };
      const result = ruleEngineService.evaluate(rule, { local_content: 63.5 });
      expect(result.status).toBe('PASS');
    });

    it('Test 5: Experience >= 5 years with Evidence 3 years -> FAIL', () => {
      const rule: RuleDefinition = {
        type: 'NUMERIC',
        metric: 'relevant_experience_years',
        operator: '>=',
        value: 5,
        unit: 'YEARS',
      };
      const result = ruleEngineService.evaluate(rule, { relevant_experience_years: 3 });
      expect(result.status).toBe('FAIL');
    });

    it('Test 6: GST valid = true -> PASS', () => {
      const rule: RuleDefinition = {
        type: 'BOOLEAN',
        field: 'gst_registration_valid',
        operator: 'IS_TRUE',
      };
      const result = ruleEngineService.evaluate(rule, { gst_registration_valid: true });
      expect(result.status).toBe('PASS');
    });

    it('Test 7: GST valid = false -> FAIL', () => {
      const rule: RuleDefinition = {
        type: 'BOOLEAN',
        field: 'gst_registration_valid',
        operator: 'IS_TRUE',
      };
      const result = ruleEngineService.evaluate(rule, { gst_registration_valid: false });
      expect(result.status).toBe('FAIL');
    });

    it('Test 8: GST valid = null -> NOT_EVALUABLE', () => {
      const rule: RuleDefinition = {
        type: 'BOOLEAN',
        field: 'gst_registration_valid',
        operator: 'IS_TRUE',
      };
      const result = ruleEngineService.evaluate(rule, { gst_registration_valid: null });
      expect(result.status).toBe('NOT_EVALUABLE');
    });

    it('Test 9: Compound (Turnover >= 10 Cr AND Experience >= 5 yrs) with (12 Cr, 7 yrs) -> PASS', () => {
      const compoundRule: RuleDefinition = {
        type: 'COMPOUND',
        operator: 'AND',
        rules: [
          {
            type: 'NUMERIC',
            metric: 'average_annual_turnover',
            operator: '>=',
            value: 100000000,
            unit: 'INR',
          },
          {
            type: 'NUMERIC',
            metric: 'relevant_experience_years',
            operator: '>=',
            value: 5,
            unit: 'YEARS',
          },
        ],
      };

      const result = ruleEngineService.evaluate(compoundRule, {
        average_annual_turnover: 120000000,
        relevant_experience_years: 7,
      });

      expect(result.status).toBe('PASS');
      expect(result.nestedResults).toHaveLength(2);
    });

    it('Test 10: Compound (Turnover >= 10 Cr AND Experience >= 5 yrs) with (12 Cr, 3 yrs) -> FAIL', () => {
      const compoundRule: RuleDefinition = {
        type: 'COMPOUND',
        operator: 'AND',
        rules: [
          {
            type: 'NUMERIC',
            metric: 'average_annual_turnover',
            operator: '>=',
            value: 100000000,
            unit: 'INR',
          },
          {
            type: 'NUMERIC',
            metric: 'relevant_experience_years',
            operator: '>=',
            value: 5,
            unit: 'YEARS',
          },
        ],
      };

      const result = ruleEngineService.evaluate(compoundRule, {
        average_annual_turnover: 120000000,
        relevant_experience_years: 3,
      });

      expect(result.status).toBe('FAIL');
    });
  });

  describe('Rule Management & Simulation APIs', () => {
    let tenderId: string;
    let ruleId: string;

    it('should set up tender, blueprint, and rules', async () => {
      const tender = await tenderRepository.createTender({
        title: 'Rule Engine Simulation Tender 2026',
        referenceNumber: 'REF-RULE-2026-001',
        organization: 'Ministry of Heavy Industries',
        closingDate: new Date(Date.now() + 86400000 * 15),
      });
      tenderId = tender.id;

      const bp = await requirementRepository.createBlueprint({
        tenderId,
        version: 1,
      });

      const req = await requirementRepository.createRequirement({
        blueprintId: bp.id,
        requirementCode: 'R-001',
        clauseReference: '4.2',
        requirementText: 'Average annual turnover shall be at least INR 10 crore.',
        normalizedRequirementText: 'Average annual turnover >= 10 Cr INR',
        category: 'FINANCIAL',
        mandatory: 'YES',
        ruleType: 'NUMERIC',
        ruleParameters: { metric: 'average_annual_turnover', operator: '>=', value: 100000000 },
        aiExplanation: 'Financial turnover requirement.',
      });

      const rule = await ruleRepository.createRule({
        blueprintId: bp.id,
        requirementId: req.id,
        ruleCode: 'RULE-R-001',
        name: 'Average Turnover >= 10 Crore',
        ruleType: 'NUMERIC',
        definition: {
          type: 'NUMERIC',
          metric: 'average_annual_turnover',
          operator: '>=',
          value: 100000000,
          unit: 'INR',
        },
        status: 'DRAFT',
      });
      ruleId = rule.id;
    });

    it('should list rules for tender via GET /api/tenders/:tenderId/rules', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/tenders/${tenderId}/rules`,
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('should simulate rule execution via POST /api/tenders/:tenderId/rules/:ruleId/simulate', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/tenders/${tenderId}/rules/${ruleId}/simulate`,
        payload: {
          evidence: {
            average_annual_turnover: 124000000,
          },
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('PASS');
      expect(json.data.engineVersion).toBe('1.0.0');
    });

    it('should approve rule via POST /api/tenders/:tenderId/rules/:ruleId/approve', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/tenders/${tenderId}/rules/${ruleId}/approve`,
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('APPROVED');
    });
  });
});
