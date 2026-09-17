import { EvidenceValueType } from '@prisma/client';

export interface NormalizedResult {
  normalizedValue: any;
  valueType: EvidenceValueType;
  unit?: string;
  isValidFormat: boolean;
  ambiguous?: boolean;
}

export class EvidenceNormalizerService {
  /**
   * Normalize raw extracted text based on target field value type
   */
  normalize(rawValue: string, targetType: EvidenceValueType, defaultUnit?: string): NormalizedResult {
    if (!rawValue || typeof rawValue !== 'string') {
      return { normalizedValue: null, valueType: targetType, unit: defaultUnit, isValidFormat: false };
    }

    const cleanRaw = rawValue.trim();

    switch (targetType) {
      case EvidenceValueType.CURRENCY:
      case EvidenceValueType.DECIMAL:
      case EvidenceValueType.INTEGER:
        return this.normalizeCurrencyOrNumber(cleanRaw, defaultUnit || 'INR');

      case EvidenceValueType.PERCENTAGE:
        return this.normalizePercentage(cleanRaw);

      case EvidenceValueType.DATE:
        return this.normalizeDate(cleanRaw);

      case EvidenceValueType.IDENTIFIER:
        return this.normalizeIdentifier(cleanRaw);

      case EvidenceValueType.BOOLEAN:
        return this.normalizeBoolean(cleanRaw);

      case EvidenceValueType.ENTITY:
      case EvidenceValueType.STRING:
      case EvidenceValueType.ADDRESS:
      default:
        return {
          normalizedValue: cleanRaw.replace(/[\r\n\t]+/g, ' ').trim(),
          valueType: targetType,
          unit: defaultUnit,
          isValidFormat: cleanRaw.length > 0,
        };
    }
  }

  /**
   * Parses Indian numbering formats (Crores, Lakhs) and standard formatted numbers into raw numeric value
   */
  normalizeCurrencyOrNumber(text: string, unit = 'INR'): NormalizedResult {
    const lower = text.toLowerCase();
    
    // Pattern for Indian Crore / Lakh expressions e.g. "₹ 10.5 Crore", "10 Cr", "50 Lakhs"
    const croreMatch = lower.match(/(?:inr|₹|rs\.?)?\s*([\d,]+(?:\.\d+)?)\s*(?:crore|crores|cr\.?)/i);
    if (croreMatch && croreMatch[1]) {
      const val = parseFloat(croreMatch[1].replace(/,/g, ''));
      return {
        normalizedValue: Math.round(val * 10000000),
        valueType: EvidenceValueType.CURRENCY,
        unit,
        isValidFormat: !isNaN(val),
      };
    }

    const lakhMatch = lower.match(/(?:inr|₹|rs\.?)?\s*([\d,]+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)/i);
    if (lakhMatch && lakhMatch[1]) {
      const val = parseFloat(lakhMatch[1].replace(/,/g, ''));
      return {
        normalizedValue: Math.round(val * 100000),
        valueType: EvidenceValueType.CURRENCY,
        unit,
        isValidFormat: !isNaN(val),
      };
    }

    // Standard formatted number e.g. "1,25,00,000" or "1000000"
    const numMatch = text.match(/([\d,]+(?:\.\d+)?)/);
    if (numMatch && numMatch[1]) {
      const val = parseFloat(numMatch[1].replace(/,/g, ''));
      return {
        normalizedValue: val,
        valueType: Number.isInteger(val) ? EvidenceValueType.INTEGER : EvidenceValueType.DECIMAL,
        unit,
        isValidFormat: !isNaN(val),
      };
    }

    return {
      normalizedValue: cleanNumericFallback(text),
      valueType: EvidenceValueType.STRING,
      unit,
      isValidFormat: false,
    };
  }

  /**
   * Normalizes percentage strings e.g. "65%" -> 65
   */
  normalizePercentage(text: string): NormalizedResult {
    const match = text.match(/([\d\.]+)/);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      return {
        normalizedValue: val,
        valueType: EvidenceValueType.PERCENTAGE,
        unit: 'PERCENT',
        isValidFormat: !isNaN(val) && val >= 0 && val <= 100,
      };
    }
    return { normalizedValue: text, valueType: EvidenceValueType.PERCENTAGE, unit: 'PERCENT', isValidFormat: false };
  }

  /**
   * Normalizes common Indian & standard date formats to YYYY-MM-DD
   */
  normalizeDate(text: string): NormalizedResult {
    const clean = text.trim();

    // ISO format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      return { normalizedValue: clean, valueType: EvidenceValueType.DATE, isValidFormat: true };
    }

    // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const dmyMatch = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch && dmyMatch[1] && dmyMatch[2] && dmyMatch[3]) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return {
        normalizedValue: `${year}-${month}-${day}`,
        valueType: EvidenceValueType.DATE,
        isValidFormat: true,
      };
    }

    // Attempt Native Date Parse for named month strings e.g. "12 March 2021"
    const parsed = new Date(clean);
    if (!isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return {
        normalizedValue: `${yyyy}-${mm}-${dd}`,
        valueType: EvidenceValueType.DATE,
        isValidFormat: true,
      };
    }

    return {
      normalizedValue: clean,
      valueType: EvidenceValueType.DATE,
      isValidFormat: false,
      ambiguous: true,
    };
  }

  /**
   * Normalizes structural identifiers and verifies structural regex (GSTIN, PAN)
   */
  normalizeIdentifier(text: string): NormalizedResult {
    const clean = text.replace(/[\s\r\n\t]+/g, '').toUpperCase();

    // GSTIN format: 15 alphanumeric characters
    const isGstin = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(clean);

    // PAN format: 10 alphanumeric characters
    const isPan = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean);

    const isValidFormat = isGstin || isPan || clean.length >= 3;

    return {
      normalizedValue: clean,
      valueType: EvidenceValueType.IDENTIFIER,
      isValidFormat,
    };
  }

  /**
   * Normalizes boolean flags
   */
  normalizeBoolean(text: string): NormalizedResult {
    const lower = text.toLowerCase().trim();
    if (['yes', 'true', 'valid', 'compliant', 'active', 'certified', '1'].includes(lower)) {
      return { normalizedValue: true, valueType: EvidenceValueType.BOOLEAN, isValidFormat: true };
    }
    if (['no', 'false', 'invalid', 'non-compliant', 'inactive', '0'].includes(lower)) {
      return { normalizedValue: false, valueType: EvidenceValueType.BOOLEAN, isValidFormat: true };
    }
    return { normalizedValue: text, valueType: EvidenceValueType.BOOLEAN, isValidFormat: false };
  }
}

function cleanNumericFallback(text: string): number | null {
  const nums = text.replace(/[^\d\.]/g, '');
  const val = parseFloat(nums);
  return isNaN(val) ? null : val;
}

export const evidenceNormalizerService = new EvidenceNormalizerService();
