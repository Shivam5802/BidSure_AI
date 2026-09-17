export class FinancialNormalizer {
  /**
   * Safely parses Indian currency and numeric strings into standard integer INR minor/base units.
   * Prevents floating point errors by using safe integer rounding.
   *
   * Example inputs:
   * "₹10 crore" -> 100000000
   * "10 Crores" -> 100000000
   * "INR 10 crore" -> 100000000
   * "Rs. 10 Cr." -> 100000000
   * "₹ 5,00,00,000" -> 50000000
   * "12.5 lakh" -> 1250000
   */
  static parseINR(input: string | number): number | null {
    if (typeof input === 'number') {
      return Number.isFinite(input) ? Math.round(input) : null;
    }

    if (!input || typeof input !== 'string') return null;

    const cleaned = input.trim();
    if (!cleaned) return null;

    // Check Indian formatted numbers like 5,00,00,000
    const rawNumberMatch = cleaned.match(/(?:inr|rs|₹)?\s*([\d,]+(?:\.\d+)?)/i);
    const unitMatch = cleaned.match(/(crore|crores|cr|lakh|lakhs|lac|lacs|thousand|k)\b/i);

    if (!rawNumberMatch || !rawNumberMatch[1]) return null;

    // Remove Indian format commas
    const numStr = rawNumberMatch[1].replace(/,/g, '');
    const numVal = parseFloat(numStr);
    if (isNaN(numVal)) return null;

    if (unitMatch && unitMatch[1]) {
      const unit = unitMatch[1].toLowerCase();
      if (unit === 'crore' || unit === 'crores' || unit === 'cr') {
        return Math.round(numVal * 10000000);
      }
      if (unit === 'lakh' || unit === 'lakhs' || unit === 'lac' || unit === 'lacs') {
        return Math.round(numVal * 100000);
      }
      if (unit === 'thousand' || unit === 'k') {
        return Math.round(numVal * 1000);
      }
    }

    return Math.round(numVal);
  }
}

export class DateNormalizer {
  /**
   * Parses common Indian and ISO date representations into Date objects.
   * If format is ambiguous (e.g. 03/04/2026), returns ambiguous flag so caller can set status = REVIEW.
   */
  static parseDate(input: string | Date | number): { date: Date | null; isAmbiguous: boolean } {
    if (input instanceof Date) {
      return { date: isNaN(input.getTime()) ? null : input, isAmbiguous: false };
    }

    if (typeof input === 'number') {
      const d = new Date(input);
      return { date: isNaN(d.getTime()) ? null : d, isAmbiguous: false };
    }

    if (!input || typeof input !== 'string') {
      return { date: null, isAmbiguous: false };
    }

    const str = input.trim();

    // Check ISO format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const d = new Date(str);
      return { date: isNaN(d.getTime()) ? null : d, isAmbiguous: false };
    }

    // Check ambiguous numerical formats like 03/04/2026 (could be March 4 or April 3)
    const slashMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (slashMatch) {
      const p1 = parseInt(slashMatch[1]!, 10);
      const p2 = parseInt(slashMatch[2]!, 10);
      const year = parseInt(slashMatch[3]!, 10);

      // If both p1 and p2 <= 12 and not equal, it's ambiguous between DD/MM/YYYY and MM/DD/YYYY
      const isAmbiguous = p1 <= 12 && p2 <= 12 && p1 !== p2;

      // Default Indian locale convention: DD/MM/YYYY (p1 = day, p2 = month)
      const day = p1;
      const month = p2 - 1;
      const d = new Date(Date.UTC(year, month, day));

      return {
        date: isNaN(d.getTime()) ? null : d,
        isAmbiguous,
      };
    }

    // Parse natural dates like "1 September 2026" or "01 Sep 2026"
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) {
      return { date: new Date(parsed), isAmbiguous: false };
    }

    return { date: null, isAmbiguous: false };
  }

  static resolveReferenceDate(
    refType: 'BID_SUBMISSION_DATE' | 'TENDER_CLOSING_DATE' | 'TENDER_OPENING_DATE' | 'FIXED_DATE',
    fixedDate?: string,
    context?: Record<string, unknown>
  ): Date | null {
    if (refType === 'FIXED_DATE' && fixedDate) {
      return this.parseDate(fixedDate).date;
    }

    if (context) {
      if (refType === 'BID_SUBMISSION_DATE' && context.bid_submission_date) {
        return this.parseDate(context.bid_submission_date as string).date;
      }
      if (refType === 'TENDER_CLOSING_DATE' && context.tender_closing_date) {
        return this.parseDate(context.tender_closing_date as string).date;
      }
    }

    // Fallback: Current date or mock submission date
    return new Date();
  }
}

export class UnitNormalizer {
  static normalizeUnit(unit: string): string {
    const u = (unit || '').toUpperCase().trim();
    if (u.includes('CRORE') || u === 'CR') return 'INR_CRORE';
    if (u.includes('LAKH') || u === 'LAC') return 'INR_LAKH';
    if (u.includes('%') || u.includes('PERCENT')) return 'PERCENT';
    if (u.includes('YEAR') || u === 'YR') return 'YEARS';
    if (u.includes('MONTH') || u === 'MO') return 'MONTHS';
    if (u.includes('DAY')) return 'DAYS';
    if (u === 'COUNT' || u === 'NO' || u === 'NOS') return 'COUNT';
    return 'INR';
  }
}
