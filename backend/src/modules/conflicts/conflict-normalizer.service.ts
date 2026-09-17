import {
  NormalizedComparableFact,
  ComparabilityCheckResult,
  ComparabilityResultType,
} from './conflict.types.js';

export class ConflictNormalizerService {
  /**
   * Normalize financial year string to a standardized period key (e.g. "2025", "FY2024-2025")
   */
  normalizeFinancialPeriod(periodStr?: string | null): string | null {
    if (!periodStr) return null;
    const clean = periodStr.trim().toUpperCase();

    // Match FY2024-25, FY 2024-2025, 2024-2025, FY25
    const fyRangeMatch = clean.match(/(?:FY\s*)?(\d{4})\s*[-–/]\s*(\d{2,4})/i);
    if (fyRangeMatch) {
      let startYear = fyRangeMatch[1] || '';
      let endYear = fyRangeMatch[2] || '';
      if (endYear.length === 2 && startYear.length >= 2) {
        endYear = startYear.substring(0, 2) + endYear;
      }
      return `FY${startYear}-${endYear}`;
    }

    // Match single FY e.g. FY2025, FY 2025
    const fySingleMatch = clean.match(/(?:FY\s*)?(\d{4})/i);
    if (fySingleMatch) {
      return `FY${fySingleMatch[1]}`;
    }

    return clean;
  }

  /**
   * Normalize legal entity name for fuzzy matching (strips suffixes like Pvt Ltd, Private Limited, Inc, LLC)
   */
  normalizeEntityName(name?: string | null): string {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/private\s+limited|pvt\.?\s*ltd\.?|limited|ltd\.?|inc\.?|corp\.?|corporation|llp/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  /**
   * Parse and normalize numeric values with unit scaling (Crore, Lakh, Million, etc.)
   */
  normalizeNumericValue(valueStr: any, unitStr?: string | null): { value: number | null; unit: string } {
    if (valueStr === null || valueStr === undefined) return { value: null, unit: '' };

    if (typeof valueStr === 'number') {
      return { value: valueStr, unit: unitStr || '' };
    }

    const str = String(valueStr).trim();
    if (!str) return { value: null, unit: '' };

    // Clean monetary signs and commas
    const cleanedStr = str.replace(/[₹$,]/g, '').trim();

    let multiplier = 1;
    let unit = unitStr ? unitStr.trim().toLowerCase() : '';

    const lowerStr = cleanedStr.toLowerCase();
    if (lowerStr.includes('cr') || lowerStr.includes('crore')) {
      multiplier = 10000000;
      unit = 'INR';
    } else if (lowerStr.includes('lakh') || lowerStr.includes('lac')) {
      multiplier = 100000;
      unit = 'INR';
    } else if (lowerStr.includes('million') || lowerStr.includes('mn')) {
      multiplier = 1000000;
    } else if (lowerStr.includes('billion') || lowerStr.includes('bn')) {
      multiplier = 1000000000;
    } else if (lowerStr.includes('%') || unit.includes('%') || unit.includes('percent')) {
      unit = '%';
    }

    // Extract bare float
    const match = cleanedStr.match(/[-+]?\d*\.?\d+/);
    if (!match) return { value: null, unit };

    const parsedNum = parseFloat(match[0]);
    if (isNaN(parsedNum)) return { value: null, unit };

    return {
      value: parsedNum * multiplier,
      unit: unit || 'RAW',
    };
  }

  /**
   * Deterministically test if two facts are comparable candidates for contradiction
   */
  evaluateComparability(
    fact1: NormalizedComparableFact,
    fact2: NormalizedComparableFact
  ): ComparabilityCheckResult {
    // Rule 1: Must refer to the same field key (or equivalent)
    if (fact1.fieldKey.toLowerCase() !== fact2.fieldKey.toLowerCase()) {
      return {
        type: ComparabilityResultType.INSUFFICIENT_CONTEXT,
        reason: `Different fields (${fact1.fieldKey} vs ${fact2.fieldKey})`,
        fieldKey: fact1.fieldKey,
      };
    }

    // Rule 2: Check Period Comparability (CRITICAL FALSE POSITIVE RULE)
    const period1 = this.normalizeFinancialPeriod(fact1.financialYear || fact1.periodStart);
    const period2 = this.normalizeFinancialPeriod(fact2.financialYear || fact2.periodStart);

    if (period1 && period2 && period1 !== period2) {
      return {
        type: ComparabilityResultType.DIFFERENT_PERIOD,
        reason: `Facts refer to different financial periods (${period1} vs ${period2}). This is not a contradiction.`,
        fieldKey: fact1.fieldKey,
        period1,
        period2,
      };
    }

    // Rule 3: Check Entity Comparability
    const entity1Norm = this.normalizeEntityName(fact1.entityReference);
    const entity2Norm = this.normalizeEntityName(fact2.entityReference);

    if (
      entity1Norm &&
      entity2Norm &&
      entity1Norm !== entity2Norm &&
      (fact1.entityReference?.toLowerCase().includes('parent') ||
        fact2.entityReference?.toLowerCase().includes('parent') ||
        fact1.entityReference?.toLowerCase().includes('holding') ||
        fact2.entityReference?.toLowerCase().includes('holding'))
    ) {
      return {
        type: ComparabilityResultType.DIFFERENT_ENTITY,
        reason: `One fact refers to bidder entity (${fact1.entityReference}) and another to parent/holding company (${fact2.entityReference}).`,
        fieldKey: fact1.fieldKey,
        entity1: fact1.entityReference,
        entity2: fact2.entityReference,
      };
    }

    // Rule 4: Check Unit & Numeric Equivalence (e.g. ₹1 Cr vs ₹100 Lakh)
    if (fact1.valueType === 'CURRENCY' || fact1.valueType === 'DECIMAL' || fact1.valueType === 'INTEGER') {
      const norm1 = this.normalizeNumericValue(fact1.rawValue, fact1.unit);
      const norm2 = this.normalizeNumericValue(fact2.rawValue, fact2.unit);

      if (
        norm1.value !== null &&
        norm2.value !== null &&
        Math.abs(norm1.value - norm2.value) < 0.001
      ) {
        return {
          type: ComparabilityResultType.EQUAL_VALUE,
          reason: `Values are numerically equivalent (${fact1.rawValue} == ${fact2.rawValue}).`,
          fieldKey: fact1.fieldKey,
        };
      }
    }

    // Rule 5: Check Entity Name Normalization Equivalence
    if (fact1.valueType === 'ENTITY') {
      const name1 = this.normalizeEntityName(fact1.rawValue);
      const name2 = this.normalizeEntityName(fact2.rawValue);
      if (name1 && name2 && name1 === name2) {
        return {
          type: ComparabilityResultType.EQUAL_VALUE,
          reason: `Entity names are equivalent after standard suffix normalization ("${fact1.rawValue}" == "${fact2.rawValue}").`,
          fieldKey: fact1.fieldKey,
        };
      }
    }

    return {
      type: ComparabilityResultType.CANDIDATE_COMPARISON,
      reason: 'Facts refer to the same context, field, and period, and require contradiction evaluation.',
      fieldKey: fact1.fieldKey,
      period1,
      period2,
    };
  }
}

export const conflictNormalizerService = new ConflictNormalizerService();
