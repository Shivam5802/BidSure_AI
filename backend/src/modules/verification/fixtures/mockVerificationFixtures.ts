import { VerificationType, VerificationResultStatus } from '../types/verification.types.js';

export interface MockFixture {
  identifier: string;
  verificationType: VerificationType;
  status: VerificationResultStatus;
  responseSnapshot: Record<string, unknown>;
  normalizedResult: {
    identifier: string;
    legalName?: string | null;
    registrationStatus?: string | null;
    registrationDate?: string | null;
    validityDate?: string | null;
    entityType?: string | null;
    address?: string | null;
    category?: string | null;
    percentage?: number | null;
    sourceTimestamp: string;
    additionalAttributes?: Record<string, unknown>;
  };
  matchSummary: string;
  confidence: number;
}

export const MOCK_FIXTURES: Record<string, MockFixture> = {
  // Scenario A: GST MATCH
  'DEMO-GST-MATCH': {
    identifier: 'DEMO-GST-MATCH',
    verificationType: VerificationType.GST,
    status: VerificationResultStatus.MATCH,
    responseSnapshot: {
      gstin: 'DEMO-GST-MATCH',
      legalName: 'ABC Engineering Pvt Ltd',
      tradeName: 'ABC Engineering',
      status: 'ACTIVE',
      taxpayerType: 'Regular',
      stateJurisdiction: 'Karnataka',
      registrationDate: '2018-04-12',
      principalPlaceOfBusiness: '123 Industrial Area, Phase 2, Bengaluru, Karnataka - 560058',
      lastUpdated: '2026-08-15T10:00:00Z',
      disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
    },
    normalizedResult: {
      identifier: 'DEMO-GST-MATCH',
      legalName: 'ABC Engineering Pvt Ltd',
      registrationStatus: 'ACTIVE',
      registrationDate: '2018-04-12',
      entityType: 'Regular',
      address: '123 Industrial Area, Phase 2, Bengaluru, Karnataka - 560058',
      category: 'GSTIN',
      sourceTimestamp: '2026-08-15T10:00:00Z',
      additionalAttributes: { taxpayerType: 'Regular', state: 'Karnataka' },
    },
    matchSummary: 'GSTIN verified active and legal entity matches bidder records.',
    confidence: 1.0,
  },

  // Scenario B: GST MISMATCH
  'DEMO-GST-MISMATCH': {
    identifier: 'DEMO-GST-MISMATCH',
    verificationType: VerificationType.GST,
    status: VerificationResultStatus.MISMATCH,
    responseSnapshot: {
      gstin: 'DEMO-GST-MISMATCH',
      legalName: 'ABC Infrastructure Pvt Ltd',
      tradeName: 'ABC Infra',
      status: 'ACTIVE',
      taxpayerType: 'Regular',
      stateJurisdiction: 'Maharashtra',
      registrationDate: '2015-09-20',
      principalPlaceOfBusiness: '456 Commercial Hub, Mumbai, Maharashtra - 400001',
      lastUpdated: '2026-08-10T14:30:00Z',
      disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
    },
    normalizedResult: {
      identifier: 'DEMO-GST-MISMATCH',
      legalName: 'ABC Infrastructure Pvt Ltd',
      registrationStatus: 'ACTIVE',
      registrationDate: '2015-09-20',
      entityType: 'Regular',
      address: '456 Commercial Hub, Mumbai, Maharashtra - 400001',
      category: 'GSTIN',
      sourceTimestamp: '2026-08-10T14:30:00Z',
      additionalAttributes: { taxpayerType: 'Regular', state: 'Maharashtra' },
    },
    matchSummary: 'GSTIN registered legal name differs from submitted bidder evidence name.',
    confidence: 0.95,
  },

  // PAN Match
  'DEMO-PAN-MATCH': {
    identifier: 'DEMO-PAN-MATCH',
    verificationType: VerificationType.PAN,
    status: VerificationResultStatus.MATCH,
    responseSnapshot: {
      pan: 'DEMO-PAN-MATCH',
      fullName: 'ABC Engineering Pvt Ltd',
      category: 'Company',
      status: 'VALID',
      aadhaarSeedingStatus: 'NOT_APPLICABLE',
      issueDate: '2018-03-01',
      disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
    },
    normalizedResult: {
      identifier: 'DEMO-PAN-MATCH',
      legalName: 'ABC Engineering Pvt Ltd',
      registrationStatus: 'VALID',
      registrationDate: '2018-03-01',
      entityType: 'Company',
      category: 'PAN',
      sourceTimestamp: '2026-08-01T09:00:00Z',
    },
    matchSummary: 'PAN card verified valid and legal name matches.',
    confidence: 1.0,
  },

  // PAN Mismatch
  'DEMO-PAN-MISMATCH': {
    identifier: 'DEMO-PAN-MISMATCH',
    verificationType: VerificationType.PAN,
    status: VerificationResultStatus.MISMATCH,
    responseSnapshot: {
      pan: 'DEMO-PAN-MISMATCH',
      fullName: 'XYZ Global Tech Private Limited',
      category: 'Company',
      status: 'VALID',
      issueDate: '2019-11-14',
      disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
    },
    normalizedResult: {
      identifier: 'DEMO-PAN-MISMATCH',
      legalName: 'XYZ Global Tech Private Limited',
      registrationStatus: 'VALID',
      registrationDate: '2019-11-14',
      entityType: 'Company',
      category: 'PAN',
      sourceTimestamp: '2026-08-01T09:00:00Z',
    },
    matchSummary: 'PAN identifier is registered to a different legal entity name.',
    confidence: 0.95,
  },

  // Udyam Match
  'DEMO-UDYAM-MATCH': {
    identifier: 'DEMO-UDYAM-MATCH',
    verificationType: VerificationType.UDYAM,
    status: VerificationResultStatus.MATCH,
    responseSnapshot: {
      udyamRegistrationNumber: 'DEMO-UDYAM-MATCH',
      enterpriseName: 'ABC Engineering Pvt Ltd',
      enterpriseType: 'Micro',
      majorActivity: 'Manufacturing',
      socialCategory: 'General',
      dateOfIncorporation: '2018-04-12',
      status: 'ACTIVE',
      disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
    },
    normalizedResult: {
      identifier: 'DEMO-UDYAM-MATCH',
      legalName: 'ABC Engineering Pvt Ltd',
      registrationStatus: 'ACTIVE',
      registrationDate: '2018-04-12',
      entityType: 'Micro Enterprise',
      category: 'Manufacturing',
      sourceTimestamp: '2026-07-20T11:15:00Z',
    },
    matchSummary: 'Udyam MSME certificate verified active under Micro Manufacturing category.',
    confidence: 1.0,
  },

  // Scenario C: Udyam Unavailable
  'DEMO-UDYAM-UNAVAILABLE': {
    identifier: 'DEMO-UDYAM-UNAVAILABLE',
    verificationType: VerificationType.UDYAM,
    status: VerificationResultStatus.UNAVAILABLE,
    responseSnapshot: {
      udyamRegistrationNumber: 'DEMO-UDYAM-UNAVAILABLE',
      status: 'SERVICE_UNAVAILABLE',
      error: 'Udyam portal verification service temporarily unreachable',
      disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
    },
    normalizedResult: {
      identifier: 'DEMO-UDYAM-UNAVAILABLE',
      registrationStatus: 'UNAVAILABLE',
      sourceTimestamp: '2026-09-16T11:00:00Z',
    },
    matchSummary: 'External verification service temporarily unavailable.',
    confidence: 0.0,
  },

  // Scenario D: Not Found
  'DEMO-GST-NOTFOUND': {
    identifier: 'DEMO-GST-NOTFOUND',
    verificationType: VerificationType.GST,
    status: VerificationResultStatus.NOT_FOUND,
    responseSnapshot: {
      requestedIdentifier: 'DEMO-GST-NOTFOUND',
      status: 'NOT_FOUND',
      message: 'No record found in national registry for the specified identifier.',
      disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
    },
    normalizedResult: {
      identifier: 'DEMO-GST-NOTFOUND',
      registrationStatus: 'NOT_FOUND',
      sourceTimestamp: '2026-09-16T11:00:00Z',
    },
    matchSummary: 'Identifier not found in government database registry.',
    confidence: 1.0,
  },

  // Scenario E: Blacklist Clear
  'DEMO-BLACKLIST-CLEAR': {
    identifier: 'DEMO-BLACKLIST-CLEAR',
    verificationType: VerificationType.BLACKLISTING,
    status: VerificationResultStatus.MATCH,
    responseSnapshot: {
      identifier: 'DEMO-BLACKLIST-CLEAR',
      debarmentStatus: 'CLEAR',
      blacklisted: false,
      registrySource: 'Central Public Procurement Portal Debarment List',
      checkedAt: '2026-09-16T10:00:00Z',
      disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
    },
    normalizedResult: {
      identifier: 'DEMO-BLACKLIST-CLEAR',
      registrationStatus: 'CLEAR',
      sourceTimestamp: '2026-09-16T10:00:00Z',
      additionalAttributes: { blacklisted: false, debarmentStatus: 'CLEAR' },
    },
    matchSummary: 'Bidder is clear. No active debarment or blacklisting records found.',
    confidence: 1.0,
  },

  // Scenario E: Blacklist Review Required
  'DEMO-BLACKLIST-REVIEW': {
    identifier: 'DEMO-BLACKLIST-REVIEW',
    verificationType: VerificationType.BLACKLISTING,
    status: VerificationResultStatus.REVIEW_REQUIRED,
    responseSnapshot: {
      identifier: 'DEMO-BLACKLIST-REVIEW',
      debarmentStatus: 'FLAGGED_FOR_REVIEW',
      blacklisted: true,
      reason: 'Show cause notice pending under state procurement circular',
      effectiveDate: '2025-11-01',
      registrySource: 'State Public Works Department Warning Matrix',
      disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
    },
    normalizedResult: {
      identifier: 'DEMO-BLACKLIST-REVIEW',
      registrationStatus: 'FLAGGED_FOR_REVIEW',
      registrationDate: '2025-11-01',
      sourceTimestamp: '2026-09-16T10:00:00Z',
      additionalAttributes: { blacklisted: true, reason: 'Show cause notice pending' },
    },
    matchSummary: 'Advisory: Verification record flagged for officer review (active warning notice).',
    confidence: 0.9,
  },
};

/**
 * Get or dynamically generate a synthetic mock fixture for any identifier
 */
export function getMockFixture(identifier: string, verificationType: VerificationType): MockFixture {
  const cleanId = identifier.trim().toUpperCase();

  if (MOCK_FIXTURES[cleanId]) {
    return MOCK_FIXTURES[cleanId];
  }

  // Dynamic fallback for any identifier
  const isMismatch = cleanId.includes('MISMATCH') || cleanId.endsWith('X') || cleanId.endsWith('9');
  const isUnavailable = cleanId.includes('UNAVAILABLE') || cleanId.includes('FAIL');
  const isNotFound = cleanId.includes('NOTFOUND') || cleanId.includes('404');
  const isReview = cleanId.includes('REVIEW') || cleanId.includes('WARN');

  if (isUnavailable) {
    return {
      identifier,
      verificationType,
      status: VerificationResultStatus.UNAVAILABLE,
      responseSnapshot: {
        identifier,
        status: 'UNAVAILABLE',
        message: `Provider for ${verificationType} is temporarily offline.`,
        disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
      },
      normalizedResult: {
        identifier,
        registrationStatus: 'UNAVAILABLE',
        sourceTimestamp: new Date().toISOString(),
      },
      matchSummary: `Verification service for ${verificationType} unavailable.`,
      confidence: 0.0,
    };
  }

  if (isNotFound) {
    return {
      identifier,
      verificationType,
      status: VerificationResultStatus.NOT_FOUND,
      responseSnapshot: {
        identifier,
        status: 'NOT_FOUND',
        message: `No record matching ${identifier} in ${verificationType} mock registry.`,
        disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
      },
      normalizedResult: {
        identifier,
        registrationStatus: 'NOT_FOUND',
        sourceTimestamp: new Date().toISOString(),
      },
      matchSummary: `Identifier ${identifier} not found in provider database.`,
      confidence: 1.0,
    };
  }

  if (isReview) {
    return {
      identifier,
      verificationType,
      status: VerificationResultStatus.REVIEW_REQUIRED,
      responseSnapshot: {
        identifier,
        status: 'REVIEW_REQUIRED',
        remarks: 'Conditional record requiring procurement officer scrutiny.',
        disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
      },
      normalizedResult: {
        identifier,
        registrationStatus: 'REVIEW_REQUIRED',
        sourceTimestamp: new Date().toISOString(),
      },
      matchSummary: `Verification record returned conditionally. Manual review recommended.`,
      confidence: 0.85,
    };
  }

  if (isMismatch) {
    return {
      identifier,
      verificationType,
      status: VerificationResultStatus.MISMATCH,
      responseSnapshot: {
        identifier,
        legalName: 'Differing Registered Legal Entity Name Services Pvt Ltd',
        status: 'ACTIVE',
        registrationDate: '2020-01-15',
        disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
      },
      normalizedResult: {
        identifier,
        legalName: 'Differing Registered Legal Entity Name Services Pvt Ltd',
        registrationStatus: 'ACTIVE',
        registrationDate: '2020-01-15',
        category: verificationType,
        sourceTimestamp: new Date().toISOString(),
      },
      matchSummary: `External verification record data differs from submitted document evidence.`,
      confidence: 0.9,
    };
  }

  // Default clean MATCH fixture
  return {
    identifier,
    verificationType,
    status: VerificationResultStatus.MATCH,
    responseSnapshot: {
      identifier,
      legalName: 'ABC Engineering Pvt Ltd',
      status: 'ACTIVE',
      registrationDate: '2018-04-12',
      address: '123 Industrial Area, Phase 2, Bengaluru, Karnataka - 560058',
      disclaimer: 'DEMO / MOCK DATA - Synthetic verification for demonstration only.',
    },
    normalizedResult: {
      identifier,
      legalName: 'ABC Engineering Pvt Ltd',
      registrationStatus: 'ACTIVE',
      registrationDate: '2018-04-12',
      address: '123 Industrial Area, Phase 2, Bengaluru, Karnataka - 560058',
      category: verificationType,
      sourceTimestamp: new Date().toISOString(),
    },
    matchSummary: `External verification succeeded and matches submitted bidder information.`,
    confidence: 1.0,
  };
}
