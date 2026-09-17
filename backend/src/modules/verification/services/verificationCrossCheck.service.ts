import {
  VerificationComparisonType,
  VerificationComparisonStatus,
  NormalizedVerificationResult,
  CrossCheckResultItem,
} from '../types/verification.types.js';

export interface EvidenceFieldInput {
  evidenceId?: string;
  fieldKey: string;
  rawValue?: string | null;
  normalizedValue?: any;
}

export class VerificationCrossCheckService {
  /**
   * Run deterministic cross-check comparison between extracted document evidence and external verification result
   */
  public runCrossCheck(
    evidenceItems: EvidenceFieldInput[],
    verifiedResult: NormalizedVerificationResult
  ): CrossCheckResultItem[] {
    const results: CrossCheckResultItem[] = [];

    // 1. Identifier Check
    const identifierEvidence = evidenceItems.find((e) =>
      ['gstin', 'pan', 'udyam_number', 'identifier', 'registration_number', 'tax_id'].includes(e.fieldKey.toLowerCase())
    );

    if (identifierEvidence && identifierEvidence.rawValue) {
      const match = this.compareIdentifiers(identifierEvidence.rawValue, verifiedResult.identifier);
      results.push({
        fieldKey: identifierEvidence.fieldKey,
        evidenceValue: identifierEvidence.rawValue,
        verifiedValue: verifiedResult.identifier,
        comparisonType: VerificationComparisonType.IDENTIFIER_MATCH,
        comparisonStatus: match.status,
        differenceSummary: match.summary,
        comparisonMethod: 'DETERMINISTIC_EXACT',
      });
    }

    // 2. Legal Entity Name Check
    const nameEvidence = evidenceItems.find((e) =>
      ['legal_name', 'entity_name', 'company_name', 'firm_name', 'bidder_name', 'taxpayer_name'].includes(
        e.fieldKey.toLowerCase()
      )
    );

    if (nameEvidence && nameEvidence.rawValue && verifiedResult.legalName) {
      const match = this.compareEntityNames(nameEvidence.rawValue, verifiedResult.legalName);
      results.push({
        fieldKey: nameEvidence.fieldKey,
        evidenceValue: nameEvidence.rawValue,
        verifiedValue: verifiedResult.legalName,
        comparisonType: VerificationComparisonType.ENTITY_NAME_MATCH,
        comparisonStatus: match.status,
        differenceSummary: match.summary,
        comparisonMethod: 'NORMALIZED_STRING_COMPARISON',
      });
    } else if (nameEvidence && nameEvidence.rawValue && !verifiedResult.legalName) {
      results.push({
        fieldKey: nameEvidence.fieldKey,
        evidenceValue: nameEvidence.rawValue,
        verifiedValue: null,
        comparisonType: VerificationComparisonType.ENTITY_NAME_MATCH,
        comparisonStatus: VerificationComparisonStatus.MISSING_VERIFICATION_FIELD,
        differenceSummary: 'External verification response did not include legal entity name.',
        comparisonMethod: 'FIELD_PRESENCE_CHECK',
      });
    }

    // 3. Registration Status Check
    const statusEvidence = evidenceItems.find((e) =>
      ['registration_status', 'gst_status', 'status', 'active_status'].includes(e.fieldKey.toLowerCase())
    );

    if (verifiedResult.registrationStatus) {
      const evVal = statusEvidence?.rawValue || 'ACTIVE';
      const match = this.compareStatuses(evVal, verifiedResult.registrationStatus);
      results.push({
        fieldKey: statusEvidence?.fieldKey || 'registrationStatus',
        evidenceValue: evVal,
        verifiedValue: verifiedResult.registrationStatus,
        comparisonType: VerificationComparisonType.STATUS_MATCH,
        comparisonStatus: match.status,
        differenceSummary: match.summary,
        comparisonMethod: 'STATUS_LOOKUP',
      });
    }

    // 4. Registration / Issue Date Check
    const dateEvidence = evidenceItems.find((e) =>
      ['registration_date', 'issue_date', 'incorporation_date', 'valid_from'].includes(e.fieldKey.toLowerCase())
    );

    if (dateEvidence && dateEvidence.rawValue && verifiedResult.registrationDate) {
      const match = this.compareDates(dateEvidence.rawValue, verifiedResult.registrationDate);
      results.push({
        fieldKey: dateEvidence.fieldKey,
        evidenceValue: dateEvidence.rawValue,
        verifiedValue: verifiedResult.registrationDate,
        comparisonType: VerificationComparisonType.DATE_MATCH,
        comparisonStatus: match.status,
        differenceSummary: match.summary,
        comparisonMethod: 'DATE_NORMALIZATION',
      });
    }

    // 5. Address Check (if present in both)
    const addressEvidence = evidenceItems.find((e) =>
      ['address', 'principal_place_of_business', 'registered_address'].includes(e.fieldKey.toLowerCase())
    );

    if (addressEvidence && addressEvidence.rawValue && verifiedResult.address) {
      const match = this.compareAddresses(addressEvidence.rawValue, verifiedResult.address);
      results.push({
        fieldKey: addressEvidence.fieldKey,
        evidenceValue: addressEvidence.rawValue,
        verifiedValue: verifiedResult.address,
        comparisonType: VerificationComparisonType.ADDRESS_MATCH,
        comparisonStatus: match.status,
        differenceSummary: match.summary,
        comparisonMethod: 'SUBSTRING_TOKEN_MATCH',
      });
    }

    return results;
  }

  public compareIdentifiers(evidenceId: string, verifiedId: string): { status: VerificationComparisonStatus; summary?: string } {
    const cleanEv = evidenceId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const cleanVer = verifiedId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (cleanEv === cleanVer) {
      return { status: VerificationComparisonStatus.MATCH };
    }

    return {
      status: VerificationComparisonStatus.MISMATCH,
      summary: `Submitted identifier (${evidenceId}) does not match external record (${verifiedId}).`,
    };
  }

  public compareEntityNames(
    evidenceName: string,
    verifiedName: string
  ): { status: VerificationComparisonStatus; summary?: string } {
    const normEv = this.normalizeEntityName(evidenceName);
    const normVer = this.normalizeEntityName(verifiedName);

    if (normEv === normVer) {
      return { status: VerificationComparisonStatus.MATCH };
    }

    const wordsEv = this.cleanEntityTokens(evidenceName);
    const wordsVer = this.cleanEntityTokens(verifiedName);

    let overlap = 0;
    for (const w of wordsEv) {
      if (wordsVer.has(w)) overlap++;
    }

    const maxLen = Math.max(wordsEv.size, wordsVer.size, 1);
    const overlapRatio = overlap / maxLen;

    // High token overlap (>= 50%) or substring inclusion indicates partial match requiring review
    if (normEv.includes(normVer) || normVer.includes(normEv) || overlapRatio >= 0.5) {
      return {
        status: VerificationComparisonStatus.REVIEW_REQUIRED,
        summary: `Partial name match detected ("${evidenceName}" vs "${verifiedName}"). Procurement officer review required to confirm legal entity identity.`,
      };
    }

    return {
      status: VerificationComparisonStatus.MISMATCH,
      summary: `Legal entity name mismatch: Submitted document states "${evidenceName}", but external provider reports "${verifiedName}".`,
    };
  }

  private cleanEntityTokens(name: string): Set<string> {
    const cleaned = name
      .toUpperCase()
      .replace(/PRIVATE\s+LIMITED/g, 'PVT LTD')
      .replace(/LIMITED/g, 'LTD')
      .replace(/INCORPORATED/g, 'INC')
      .replace(/CORPORATION/g, 'CORP')
      .replace(/COMPANY/g, 'CO')
      .replace(/[^A-Z0-9\s]/g, ' ');

    const tokens = cleaned.split(/\s+/).filter((t) => t.length > 0);
    return new Set(tokens);
  }

  public compareStatuses(
    evidenceStatus: string,
    verifiedStatus: string
  ): { status: VerificationComparisonStatus; summary?: string } {
    const cleanEv = evidenceStatus.trim().toUpperCase();
    const cleanVer = verifiedStatus.trim().toUpperCase();

    const isEvActive = ['ACTIVE', 'VALID', 'CLEAR', 'OPERATIONAL'].includes(cleanEv);
    const isVerActive = ['ACTIVE', 'VALID', 'CLEAR', 'OPERATIONAL'].includes(cleanVer);

    if (cleanEv === cleanVer || (isEvActive && isVerActive)) {
      return { status: VerificationComparisonStatus.MATCH };
    }

    if (['SUSPENDED', 'CANCELLED', 'FLAGGED_FOR_REVIEW', 'BLACK-LISTED'].includes(cleanVer)) {
      return {
        status: VerificationComparisonStatus.REVIEW_REQUIRED,
        summary: `External provider status is "${verifiedStatus}". Officer review required.`,
      };
    }

    return {
      status: VerificationComparisonStatus.MISMATCH,
      summary: `Status mismatch: Submitted "${evidenceStatus}" vs Provider "${verifiedStatus}".`,
    };
  }

  public compareDates(
    evidenceDate: string,
    verifiedDate: string
  ): { status: VerificationComparisonStatus; summary?: string } {
    const d1 = new Date(evidenceDate).getTime();
    const d2 = new Date(verifiedDate).getTime();

    if (!isNaN(d1) && !isNaN(d2)) {
      if (Math.abs(d1 - d2) < 24 * 60 * 60 * 1000) {
        return { status: VerificationComparisonStatus.MATCH };
      }
    }

    return {
      status: VerificationComparisonStatus.MISMATCH,
      summary: `Date mismatch: Submitted "${evidenceDate}" vs Provider "${verifiedDate}".`,
    };
  }

  public compareAddresses(
    evidenceAddress: string,
    verifiedAddress: string
  ): { status: VerificationComparisonStatus; summary?: string } {
    const cleanEv = evidenceAddress.toLowerCase().replace(/[^a-z0-9]/g, ' ');
    const cleanVer = verifiedAddress.toLowerCase().replace(/[^a-z0-9]/g, ' ');

    const evTokens = new Set(cleanEv.split(/\s+/).filter((t) => t.length > 2));
    const verTokens = new Set(cleanVer.split(/\s+/).filter((t) => t.length > 2));

    let overlap = 0;
    for (const tok of evTokens) {
      if (verTokens.has(tok)) overlap++;
    }

    const score = overlap / Math.max(evTokens.size, 1);

    if (score > 0.6) {
      return { status: VerificationComparisonStatus.MATCH };
    } else if (score > 0.3) {
      return {
        status: VerificationComparisonStatus.REVIEW_REQUIRED,
        summary: `Address similarity moderate (${Math.round(score * 100)}%). Verification review required.`,
      };
    }

    return {
      status: VerificationComparisonStatus.MISMATCH,
      summary: `Address mismatch between document evidence and provider record.`,
    };
  }

  public normalizeEntityName(name: string): string {
    return name
      .toUpperCase()
      .replace(/PRIVATE\s+LIMITED/g, 'PVT LTD')
      .replace(/LIMITED/g, 'LTD')
      .replace(/INCORPORATED/g, 'INC')
      .replace(/CORPORATION/g, 'CORP')
      .replace(/COMPANY/g, 'CO')
      .replace(/[^A-Z0-9]/g, '')
      .trim();
  }
}
