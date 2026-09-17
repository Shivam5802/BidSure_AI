import { BidDocumentType } from '@prisma/client';
import { FIELD_REGISTRY, FieldDefinition } from './field-registry.js';

export interface DocumentExtractionSchema {
  documentType: BidDocumentType;
  schemaTitle: string;
  expectedFields: FieldDefinition[];
}

export const EXTRACTION_SCHEMAS: Record<BidDocumentType, DocumentExtractionSchema> = {
  GST_CERTIFICATE: {
    documentType: BidDocumentType.GST_CERTIFICATE,
    schemaTitle: 'GST Registration Certificate Extraction Schema',
    expectedFields: [
      FIELD_REGISTRY.gstin!,
      FIELD_REGISTRY.legal_name!,
      FIELD_REGISTRY.trade_name!,
      FIELD_REGISTRY.registration_date!,
      FIELD_REGISTRY.pan!,
    ],
  },

  PAN_DOCUMENT: {
    documentType: BidDocumentType.PAN_DOCUMENT,
    schemaTitle: 'PAN Card Identification Extraction Schema',
    expectedFields: [
      FIELD_REGISTRY.pan!,
      FIELD_REGISTRY.legal_name!,
    ],
  },

  UDYAM_MSME_CERTIFICATE: {
    documentType: BidDocumentType.UDYAM_MSME_CERTIFICATE,
    schemaTitle: 'Udyam MSME Registration Certificate Extraction Schema',
    expectedFields: [
      FIELD_REGISTRY.udyam_number!,
      FIELD_REGISTRY.legal_name!,
      FIELD_REGISTRY.registration_date!,
    ],
  },

  FINANCIAL_STATEMENT: {
    documentType: BidDocumentType.FINANCIAL_STATEMENT,
    schemaTitle: 'Audited Financial Statement Extraction Schema',
    expectedFields: [
      FIELD_REGISTRY.financial_year!,
      FIELD_REGISTRY.turnover!,
      FIELD_REGISTRY.average_turnover!,
      FIELD_REGISTRY.net_worth!,
      FIELD_REGISTRY.legal_name!,
    ],
  },

  CA_CERTIFICATE: {
    documentType: BidDocumentType.CA_CERTIFICATE,
    schemaTitle: 'Chartered Accountant Turnover Certificate Extraction Schema',
    expectedFields: [
      FIELD_REGISTRY.certificate_number!,
      FIELD_REGISTRY.legal_name!,
      FIELD_REGISTRY.financial_year!,
      FIELD_REGISTRY.turnover!,
      FIELD_REGISTRY.average_turnover!,
      FIELD_REGISTRY.net_worth!,
    ],
  },

  EXPERIENCE_CERTIFICATE: {
    documentType: BidDocumentType.EXPERIENCE_CERTIFICATE,
    schemaTitle: 'Past Experience & Work Order Extraction Schema',
    expectedFields: [
      FIELD_REGISTRY.project_name!,
      FIELD_REGISTRY.client_name!,
      FIELD_REGISTRY.contract_value!,
      FIELD_REGISTRY.completion_date!,
      FIELD_REGISTRY.legal_name!,
    ],
  },

  OEM_AUTHORIZATION: {
    documentType: BidDocumentType.OEM_AUTHORIZATION,
    schemaTitle: 'OEM Manufacturer Authorization Form Extraction Schema',
    expectedFields: [
      FIELD_REGISTRY.oem_name!,
      FIELD_REGISTRY.authorized_bidder!,
      FIELD_REGISTRY.certificate_number!,
      FIELD_REGISTRY.valid_until!,
    ],
  },

  MAKE_IN_INDIA_LOCAL_CONTENT: {
    documentType: BidDocumentType.MAKE_IN_INDIA_LOCAL_CONTENT,
    schemaTitle: 'Make In India Local Content Declaration Schema',
    expectedFields: [
      FIELD_REGISTRY.legal_name!,
      FIELD_REGISTRY.local_content_percentage!,
      FIELD_REGISTRY.registration_date!,
    ],
  },

  BID_SECURITY: {
    documentType: BidDocumentType.BID_SECURITY,
    schemaTitle: 'Bid Security / EMD / Bank Guarantee Schema',
    expectedFields: [
      FIELD_REGISTRY.bid_security_amount!,
      FIELD_REGISTRY.certificate_number!,
      FIELD_REGISTRY.valid_until!,
      FIELD_REGISTRY.legal_name!,
    ],
  },

  EPFO_ESIC_DOCUMENT: {
    documentType: BidDocumentType.EPFO_ESIC_DOCUMENT,
    schemaTitle: 'EPFO & ESIC Registration Schema',
    expectedFields: [
      FIELD_REGISTRY.epfo_number!,
      FIELD_REGISTRY.esic_number!,
      FIELD_REGISTRY.legal_name!,
    ],
  },

  COMPANY_REGISTRATION: {
    documentType: BidDocumentType.COMPANY_REGISTRATION,
    schemaTitle: 'Certificate of Incorporation / Registration Schema',
    expectedFields: [
      FIELD_REGISTRY.certificate_number!,
      FIELD_REGISTRY.legal_name!,
      FIELD_REGISTRY.registration_date!,
    ],
  },

  STARTUP_CERTIFICATE: {
    documentType: BidDocumentType.STARTUP_CERTIFICATE,
    schemaTitle: 'DPIIT Startup Recognition Schema',
    expectedFields: [
      FIELD_REGISTRY.certificate_number!,
      FIELD_REGISTRY.legal_name!,
      FIELD_REGISTRY.registration_date!,
    ],
  },

  TECHNICAL_COMPLIANCE_DOCUMENT: {
    documentType: BidDocumentType.TECHNICAL_COMPLIANCE_DOCUMENT,
    schemaTitle: 'Technical Specification Compliance Matrix Schema',
    expectedFields: [
      FIELD_REGISTRY.legal_name!,
      FIELD_REGISTRY.project_name!,
    ],
  },

  BLACKLISTING_DECLARATION: {
    documentType: BidDocumentType.BLACKLISTING_DECLARATION,
    schemaTitle: 'Non-Blacklisting Declaration Schema',
    expectedFields: [
      FIELD_REGISTRY.legal_name!,
      FIELD_REGISTRY.registration_date!,
    ],
  },

  DECLARATION_AFFIDAVIT: {
    documentType: BidDocumentType.DECLARATION_AFFIDAVIT,
    schemaTitle: 'Statutory Declaration / Affidavit Schema',
    expectedFields: [
      FIELD_REGISTRY.legal_name!,
      FIELD_REGISTRY.registration_date!,
    ],
  },

  NSIC_CERTIFICATE: {
    documentType: BidDocumentType.NSIC_CERTIFICATE,
    schemaTitle: 'NSIC Registration Certificate Schema',
    expectedFields: [
      FIELD_REGISTRY.certificate_number!,
      FIELD_REGISTRY.legal_name!,
      FIELD_REGISTRY.valid_until!,
    ],
  },

  OTHER: {
    documentType: BidDocumentType.OTHER,
    schemaTitle: 'General Supporting Document Extraction Schema',
    expectedFields: [
      FIELD_REGISTRY.legal_name!,
      FIELD_REGISTRY.certificate_number!,
    ],
  },

  UNKNOWN: {
    documentType: BidDocumentType.UNKNOWN,
    schemaTitle: 'Unclassified Document Extraction Schema',
    expectedFields: [
      FIELD_REGISTRY.legal_name!,
    ],
  },
};

export class DocumentExtractionSchemaRegistry {
  static getSchema(documentType: BidDocumentType): DocumentExtractionSchema {
    return EXTRACTION_SCHEMAS[documentType] || EXTRACTION_SCHEMAS.UNKNOWN;
  }
}
