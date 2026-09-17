import { EvidenceValueType, BidDocumentType } from '@prisma/client';

export interface FieldDefinition {
  fieldKey: string;
  fieldLabel: string;
  valueType: EvidenceValueType;
  unit?: string;
  allowedDocumentTypes: BidDocumentType[];
  description: string;
}

export const FIELD_REGISTRY: Record<string, FieldDefinition> = {
  gstin: {
    fieldKey: 'gstin',
    fieldLabel: 'GST Identification Number (GSTIN)',
    valueType: EvidenceValueType.IDENTIFIER,
    allowedDocumentTypes: [BidDocumentType.GST_CERTIFICATE, BidDocumentType.OTHER],
    description: '15-character Goods and Services Tax Identification Number',
  },
  pan: {
    fieldKey: 'pan',
    fieldLabel: 'Permanent Account Number (PAN)',
    valueType: EvidenceValueType.IDENTIFIER,
    allowedDocumentTypes: [BidDocumentType.PAN_DOCUMENT, BidDocumentType.GST_CERTIFICATE, BidDocumentType.OTHER],
    description: '10-character Income Tax Permanent Account Number',
  },
  udyam_number: {
    fieldKey: 'udyam_number',
    fieldLabel: 'Udyam Registration Number',
    valueType: EvidenceValueType.IDENTIFIER,
    allowedDocumentTypes: [BidDocumentType.UDYAM_MSME_CERTIFICATE, BidDocumentType.OTHER],
    description: 'MSME Udyam Registration Number',
  },
  legal_name: {
    fieldKey: 'legal_name',
    fieldLabel: 'Legal Entity Name',
    valueType: EvidenceValueType.ENTITY,
    allowedDocumentTypes: [
      BidDocumentType.GST_CERTIFICATE,
      BidDocumentType.PAN_DOCUMENT,
      BidDocumentType.COMPANY_REGISTRATION,
      BidDocumentType.UDYAM_MSME_CERTIFICATE,
      BidDocumentType.CA_CERTIFICATE,
      BidDocumentType.OTHER,
    ],
    description: 'Officially registered corporate or business entity legal name',
  },
  trade_name: {
    fieldKey: 'trade_name',
    fieldLabel: 'Trade / Brand Name',
    valueType: EvidenceValueType.STRING,
    allowedDocumentTypes: [BidDocumentType.GST_CERTIFICATE, BidDocumentType.OTHER],
    description: 'Operating trade or brand name',
  },
  registration_date: {
    fieldKey: 'registration_date',
    fieldLabel: 'Registration Issue Date',
    valueType: EvidenceValueType.DATE,
    allowedDocumentTypes: [
      BidDocumentType.GST_CERTIFICATE,
      BidDocumentType.COMPANY_REGISTRATION,
      BidDocumentType.UDYAM_MSME_CERTIFICATE,
      BidDocumentType.STARTUP_CERTIFICATE,
      BidDocumentType.OTHER,
    ],
    description: 'Official registration date',
  },
  certificate_number: {
    fieldKey: 'certificate_number',
    fieldLabel: 'Certificate Number / UDIN',
    valueType: EvidenceValueType.IDENTIFIER,
    allowedDocumentTypes: [
      BidDocumentType.CA_CERTIFICATE,
      BidDocumentType.STARTUP_CERTIFICATE,
      BidDocumentType.NSIC_CERTIFICATE,
      BidDocumentType.OTHER,
    ],
    description: 'Unique certificate identification or UDIN reference number',
  },
  turnover: {
    fieldKey: 'turnover',
    fieldLabel: 'Annual Financial Turnover',
    valueType: EvidenceValueType.CURRENCY,
    unit: 'INR',
    allowedDocumentTypes: [BidDocumentType.CA_CERTIFICATE, BidDocumentType.FINANCIAL_STATEMENT, BidDocumentType.OTHER],
    description: 'Annual audited sales / turnover amount',
  },
  average_turnover: {
    fieldKey: 'average_turnover',
    fieldLabel: 'Average Annual Turnover',
    valueType: EvidenceValueType.CURRENCY,
    unit: 'INR',
    allowedDocumentTypes: [BidDocumentType.CA_CERTIFICATE, BidDocumentType.FINANCIAL_STATEMENT, BidDocumentType.OTHER],
    description: 'Computed or certified average annual turnover over multiple financial years',
  },
  net_worth: {
    fieldKey: 'net_worth',
    fieldLabel: 'Net Worth',
    valueType: EvidenceValueType.CURRENCY,
    unit: 'INR',
    allowedDocumentTypes: [BidDocumentType.CA_CERTIFICATE, BidDocumentType.FINANCIAL_STATEMENT, BidDocumentType.OTHER],
    description: 'Certified financial net worth of the bidder',
  },
  financial_year: {
    fieldKey: 'financial_year',
    fieldLabel: 'Financial Year',
    valueType: EvidenceValueType.STRING,
    allowedDocumentTypes: [BidDocumentType.CA_CERTIFICATE, BidDocumentType.FINANCIAL_STATEMENT, BidDocumentType.OTHER],
    description: 'Financial year (e.g. FY 2023-24)',
  },
  contract_value: {
    fieldKey: 'contract_value',
    fieldLabel: 'Executed Contract Value',
    valueType: EvidenceValueType.CURRENCY,
    unit: 'INR',
    allowedDocumentTypes: [BidDocumentType.EXPERIENCE_CERTIFICATE, BidDocumentType.OTHER],
    description: 'Value of past executed contract or work order',
  },
  project_name: {
    fieldKey: 'project_name',
    fieldLabel: 'Project Name / Scope',
    valueType: EvidenceValueType.STRING,
    allowedDocumentTypes: [BidDocumentType.EXPERIENCE_CERTIFICATE, BidDocumentType.OTHER],
    description: 'Name or description of executed project',
  },
  client_name: {
    fieldKey: 'client_name',
    fieldLabel: 'Client / Procuring Authority Name',
    valueType: EvidenceValueType.ENTITY,
    allowedDocumentTypes: [BidDocumentType.EXPERIENCE_CERTIFICATE, BidDocumentType.OTHER],
    description: 'Name of procuring organization or client',
  },
  completion_date: {
    fieldKey: 'completion_date',
    fieldLabel: 'Project Completion Date',
    valueType: EvidenceValueType.DATE,
    allowedDocumentTypes: [BidDocumentType.EXPERIENCE_CERTIFICATE, BidDocumentType.OTHER],
    description: 'Date of successful work completion',
  },
  local_content_percentage: {
    fieldKey: 'local_content_percentage',
    fieldLabel: 'Local Content Percentage',
    valueType: EvidenceValueType.PERCENTAGE,
    unit: 'PERCENT',
    allowedDocumentTypes: [BidDocumentType.MAKE_IN_INDIA_LOCAL_CONTENT, BidDocumentType.OTHER],
    description: 'Percentage of domestic local content for Make In India compliance',
  },
  oem_name: {
    fieldKey: 'oem_name',
    fieldLabel: 'OEM / Manufacturer Name',
    valueType: EvidenceValueType.ENTITY,
    allowedDocumentTypes: [BidDocumentType.OEM_AUTHORIZATION, BidDocumentType.OTHER],
    description: 'Name of Original Equipment Manufacturer',
  },
  authorized_bidder: {
    fieldKey: 'authorized_bidder',
    fieldLabel: 'Authorized Partner / Bidder Name',
    valueType: EvidenceValueType.ENTITY,
    allowedDocumentTypes: [BidDocumentType.OEM_AUTHORIZATION, BidDocumentType.OTHER],
    description: 'Name of bidder entity authorized by OEM',
  },
  bid_security_amount: {
    fieldKey: 'bid_security_amount',
    fieldLabel: 'Bid Security / EMD Amount',
    valueType: EvidenceValueType.CURRENCY,
    unit: 'INR',
    allowedDocumentTypes: [BidDocumentType.BID_SECURITY, BidDocumentType.OTHER],
    description: 'Amount of EMD / Bid Security submitted',
  },
  epfo_number: {
    fieldKey: 'epfo_number',
    fieldLabel: 'EPFO Registration Code',
    valueType: EvidenceValueType.IDENTIFIER,
    allowedDocumentTypes: [BidDocumentType.EPFO_ESIC_DOCUMENT, BidDocumentType.OTHER],
    description: 'Employees Provident Fund Organization registration code',
  },
  esic_number: {
    fieldKey: 'esic_number',
    fieldLabel: 'ESIC Registration Code',
    valueType: EvidenceValueType.IDENTIFIER,
    allowedDocumentTypes: [BidDocumentType.EPFO_ESIC_DOCUMENT, BidDocumentType.OTHER],
    description: 'Employees State Insurance Corporation registration code',
  },
  valid_until: {
    fieldKey: 'valid_until',
    fieldLabel: 'Validity Expiry Date',
    valueType: EvidenceValueType.DATE,
    allowedDocumentTypes: [
      BidDocumentType.OEM_AUTHORIZATION,
      BidDocumentType.NSIC_CERTIFICATE,
      BidDocumentType.BID_SECURITY,
      BidDocumentType.OTHER,
    ],
    description: 'Expiry or validity end date',
  },
};
