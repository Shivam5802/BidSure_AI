export interface RegisteredField {
  name: string;
  label: string;
  category: 'FINANCIAL' | 'TECHNICAL' | 'STATUTORY' | 'POLICY' | 'TENDER_SPECIFIC';
  type: 'NUMERIC' | 'DATE' | 'BOOLEAN' | 'PERCENTAGE' | 'COUNT' | 'TEXT' | 'ENTITY';
  unit?: string;
  description: string;
}

export class FieldRegistry {
  private static fields = new Map<string, RegisteredField>([
    [
      'average_annual_turnover',
      {
        name: 'average_annual_turnover',
        label: 'Average Annual Turnover',
        category: 'FINANCIAL',
        type: 'NUMERIC',
        unit: 'INR',
        description: 'Average annual turnover over last 3 financial years.',
      },
    ],
    [
      'net_worth',
      {
        name: 'net_worth',
        label: 'Net Worth',
        category: 'FINANCIAL',
        type: 'NUMERIC',
        unit: 'INR',
        description: 'Net worth of the bidding entity.',
      },
    ],
    [
      'relevant_experience_years',
      {
        name: 'relevant_experience_years',
        label: 'Relevant Experience (Years)',
        category: 'TECHNICAL',
        type: 'NUMERIC',
        unit: 'YEARS',
        description: 'Years of operational experience in similar domain.',
      },
    ],
    [
      'similar_completed_projects',
      {
        name: 'similar_completed_projects',
        label: 'Similar Completed Projects Count',
        category: 'TECHNICAL',
        type: 'COUNT',
        unit: 'COUNT',
        description: 'Number of similar completed projects executed.',
      },
    ],
    [
      'gst_registration_valid',
      {
        name: 'gst_registration_valid',
        label: 'GST Registration Validity',
        category: 'STATUTORY',
        type: 'BOOLEAN',
        description: 'Whether bidder has active, valid GSTIN registration.',
      },
    ],
    [
      'gst_registration_expiry',
      {
        name: 'gst_registration_expiry',
        label: 'GST Registration Expiry Date',
        category: 'STATUTORY',
        type: 'DATE',
        description: 'Expiry date of GST registration certificate.',
      },
    ],
    [
      'pan_valid',
      {
        name: 'pan_valid',
        label: 'PAN Card Validity',
        category: 'STATUTORY',
        type: 'BOOLEAN',
        description: 'Whether bidder possesses valid PAN card.',
      },
    ],
    [
      'local_content',
      {
        name: 'local_content',
        label: 'Local Content Percentage',
        category: 'POLICY',
        type: 'PERCENTAGE',
        unit: 'PERCENT',
        description: 'Local content percentage under Make in India policy.',
      },
    ],
    [
      'supplier_category',
      {
        name: 'supplier_category',
        label: 'Supplier Classification Category',
        category: 'POLICY',
        type: 'TEXT',
        description: 'Supplier category e.g., Class I Local Supplier, Class II, Non-Local.',
      },
    ],
    [
      'is_startup',
      {
        name: 'is_startup',
        label: 'DPIIT Registered Startup Status',
        category: 'POLICY',
        type: 'BOOLEAN',
        description: 'Whether bidder is recognized by DPIIT as a Startup.',
      },
    ],
    [
      'is_msme',
      {
        name: 'is_msme',
        label: 'Udyam Registered MSME Status',
        category: 'POLICY',
        type: 'BOOLEAN',
        description: 'Whether bidder is registered under MSME Udyam.',
      },
    ],
    [
      'oem_name',
      {
        name: 'oem_name',
        label: 'OEM Manufacturer Name',
        category: 'TENDER_SPECIFIC',
        type: 'ENTITY',
        description: 'Original Equipment Manufacturer name.',
      },
    ],
    [
      'bid_submission_date',
      {
        name: 'bid_submission_date',
        label: 'Bid Submission Reference Date',
        category: 'TENDER_SPECIFIC',
        type: 'DATE',
        description: 'Date of bid submission.',
      },
    ],
  ]);

  static isRegistered(fieldName: string): boolean {
    return this.fields.has(fieldName.toLowerCase());
  }

  static getField(fieldName: string): RegisteredField | undefined {
    return this.fields.get(fieldName.toLowerCase());
  }

  static listFields(): RegisteredField[] {
    return Array.from(this.fields.values());
  }
}
