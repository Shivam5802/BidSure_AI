export interface CanonicalDemoTender {
  id: string;
  title: string;
  referenceNumber: string;
  organization: string;
  description: string;
  status: 'READY';
  requirements: Array<{
    id: string;
    code: string;
    title: string;
    category: 'FINANCIAL' | 'TECHNICAL' | 'LEGAL' | 'EXPERIENCE' | 'ADMINISTRATIVE';
    isMandatory: boolean;
    description: string;
  }>;
  bidders: Array<{
    id: string;
    bidderCode: string;
    legalName: string;
    displayName: string;
    submissionRef: string;
    documents: Array<{
      id: string;
      fileName: string;
      category: string;
      pages: number;
    }>;
  }>;
  evaluations: Array<{
    requirementId: string;
    bidderId: string;
    status: 'PASS' | 'FAIL' | 'REVIEW' | 'NOT_EVALUABLE';
    ruleCode: string;
    summary: string;
    evidenceFactIds: string[];
    sourceDocument: string;
    sourcePage: number;
  }>;
  conflicts: Array<{
    id: string;
    bidderId: string;
    requirementId: string;
    title: string;
    description: string;
    severity: 'HIGH' | 'CRITICAL';
    sourceFacts: string[];
  }>;
  verifications: Array<{
    id: string;
    bidderId: string;
    identifierType: 'GSTIN' | 'PAN' | 'MSME' | 'ISO_9001';
    claimedValue: string;
    verifiedValue: string;
    matchStatus: 'MATCH' | 'MISMATCH';
    providerMode: 'MOCK / SYNTHETIC';
    providerName: string;
  }>;
  investigations: Array<{
    id: string;
    bidderId: string;
    requirementId: string;
    title: string;
    hypothesis: string;
    status: 'RESOLVED' | 'UNDER_REVIEW';
    officerDecision?: string;
  }>;
}

export const CANONICAL_DEMO_DATA: CanonicalDemoTender = {
  id: 'tnd_1789567202603_77g22a',
  title: 'CPCL Infrastructure Procurement — Demo Tender',
  referenceNumber: 'CPCL-INFRA-DEMO-2026',
  organization: 'Chennai Petroleum Corporation Limited (CPCL) - GeM Demo',
  description: 'Turnkey EPC Contract for Refinery Modernization & High-Pressure Piping Infrastructure at Manali Refinery, Chennai.',
  status: 'READY',
  requirements: [
    {
      id: 'req_01_turnover',
      code: 'FIN-01',
      title: 'Average Annual Financial Turnover >= 50 Cr',
      category: 'FINANCIAL',
      isMandatory: true,
      description: 'Average annual financial turnover during the last 3 financial years must be at least INR 50.00 Crores.',
    },
    {
      id: 'req_02_working_capital',
      code: 'FIN-02',
      title: 'Working Capital Facility / Fund Limit >= 15 Cr',
      category: 'FINANCIAL',
      isMandatory: true,
      description: 'Proof of fund-based working capital facility or line of credit of minimum INR 15.00 Crores from a Scheduled Commercial Bank.',
    },
    {
      id: 'req_03_audited_balance_sheet',
      code: 'FIN-03',
      title: 'Audited Financial Statements for Last 3 FYs',
      category: 'FINANCIAL',
      isMandatory: true,
      description: 'Audited balance sheets and profit & loss statements certified by Chartered Accountant with valid UDIN.',
    },
    {
      id: 'req_04_gst_registration',
      code: 'LEG-01',
      title: 'Valid GSTIN Registration in Tamil Nadu',
      category: 'LEGAL',
      isMandatory: true,
      description: 'Active GST registration with state code 33 (Tamil Nadu) as of bid submission date.',
    },
    {
      id: 'req_05_pan_registration',
      code: 'LEG-02',
      title: 'Active Permanent Account Number (PAN)',
      category: 'LEGAL',
      isMandatory: true,
      description: 'Valid Permanent Account Number in the legal name of the entity.',
    },
    {
      id: 'req_06_local_content',
      code: 'LEG-03',
      title: 'Class I Local Supplier (Local Content >= 50%)',
      category: 'LEGAL',
      isMandatory: true,
      description: 'Self-declaration or statutory auditor certificate confirming minimum 50% domestic value addition as per Make in India policy.',
    },
    {
      id: 'req_07_non_blacklisting',
      code: 'LEG-04',
      title: 'Non-Blacklisting Undertaking on Stamp Paper',
      category: 'LEGAL',
      isMandatory: true,
      description: 'Notarized non-blacklisting undertaking on INR 100 non-judicial stamp paper dated within 30 days.',
    },
    {
      id: 'req_08_iso_9001',
      code: 'TECH-01',
      title: 'ISO 9001:2015 Quality Management System',
      category: 'TECHNICAL',
      isMandatory: false,
      description: 'Valid ISO 9001:2015 accreditation covering fabrication and erection of industrial piping.',
    },
    {
      id: 'req_09_iso_14001',
      code: 'TECH-02',
      title: 'ISO 14001:2015 Environmental Management',
      category: 'TECHNICAL',
      isMandatory: false,
      description: 'Valid ISO 14001:2015 environmental certification.',
    },
    {
      id: 'req_10_iso_45001',
      code: 'TECH-03',
      title: 'ISO 45001:2018 Occupational Health & Safety',
      category: 'TECHNICAL',
      isMandatory: false,
      description: 'Valid ISO 45001:2018 occupational safety certification.',
    },
    {
      id: 'req_11_epc_experience',
      code: 'EXP-01',
      title: 'Refinery EPC Piping Experience >= 5 Years',
      category: 'EXPERIENCE',
      isMandatory: true,
      description: 'Demonstrated operational experience executing EPC piping in hydrocarbon refineries for at least 5 years.',
    },
    {
      id: 'req_12_single_project_40cr',
      code: 'EXP-02',
      title: 'Single Similar Completed Project >= 40 Cr',
      category: 'EXPERIENCE',
      isMandatory: true,
      description: 'Completion certificate of at least one similar EPC contract of value >= INR 40.00 Crores in the last 7 years.',
    },
    {
      id: 'req_13_two_projects_25cr',
      code: 'EXP-03',
      title: 'Two Similar Completed Projects >= 25 Cr each',
      category: 'EXPERIENCE',
      isMandatory: false,
      description: 'Two completed contracts of value >= INR 25.00 Crores each.',
    },
    {
      id: 'req_14_three_projects_20cr',
      code: 'EXP-04',
      title: 'Three Similar Completed Projects >= 20 Cr each',
      category: 'EXPERIENCE',
      isMandatory: false,
      description: 'Three completed contracts of value >= INR 20.00 Crores each.',
    },
    {
      id: 'req_15_oem_auth',
      code: 'TECH-04',
      title: 'OEM Authorization for High-Pressure Actuators',
      category: 'TECHNICAL',
      isMandatory: true,
      description: 'Direct manufacturer authorization certificate for heavy-duty high-pressure valve actuators.',
    },
    {
      id: 'req_16_lead_engineer',
      code: 'TECH-05',
      title: 'Lead Structural Engineer PE Licensed',
      category: 'TECHNICAL',
      isMandatory: true,
      description: 'Professional Engineer (PE) license with at least 8 years post-qualification refinery experience.',
    },
    {
      id: 'req_17_project_manager',
      code: 'TECH-06',
      title: 'Dedicated Project Manager Experience >= 10 Years',
      category: 'TECHNICAL',
      isMandatory: true,
      description: 'Designated resident Project Manager with degree in Mechanical Engineering and 10+ years experience.',
    },
    {
      id: 'req_18_safety_officer',
      code: 'TECH-07',
      title: 'Site Safety Officer NEBOSH / OSHA Certified',
      category: 'TECHNICAL',
      isMandatory: true,
      description: 'Full-time resident safety engineer holding NEBOSH International Diploma or OSHA 30-Hour Construction.',
    },
    {
      id: 'req_19_bank_solvency',
      code: 'FIN-04',
      title: 'Bank Solvency Certificate from Scheduled Bank',
      category: 'FINANCIAL',
      isMandatory: true,
      description: 'Solvency certificate of minimum INR 20.00 Crores issued not earlier than 6 months prior to tender closing.',
    },
    {
      id: 'req_20_emd_bg',
      code: 'ADM-01',
      title: 'Earnest Money Deposit (EMD) Bank Guarantee',
      category: 'ADMINISTRATIVE',
      isMandatory: true,
      description: 'EMD of INR 50,00,000 in form of Bank Guarantee or verified MSME exemption certificate.',
    },
    {
      id: 'req_21_integrity_pact',
      code: 'LEG-05',
      title: 'Integrity Pact Undertaking Signed',
      category: 'LEGAL',
      isMandatory: true,
      description: 'Pre-contract Integrity Pact duly signed by authorized signatory and two witnesses.',
    },
    {
      id: 'req_22_cybersecurity',
      code: 'TECH-08',
      title: 'Cybersecurity & SCADA Interface Undertaking',
      category: 'TECHNICAL',
      isMandatory: false,
      description: 'Compliance undertaking adhering to MoPNG Cyber Security Guidelines for Critical Infrastructure.',
    },
  ],
  bidders: [
    {
      id: 'bidder_lt_heavy',
      bidderCode: 'BID-CPCL-001',
      legalName: 'L&T Heavy Engineering Limited',
      displayName: 'L&T Heavy Engineering',
      submissionRef: 'SUB-CPCL-001-ALPHA',
      documents: [
        { id: 'doc_lt_01', fileName: 'LT_Audited_Financials_FY23_25.pdf', category: 'FINANCIAL', pages: 42 },
        { id: 'doc_lt_02', fileName: 'LT_Technical_Experience_Certificates.pdf', category: 'TECHNICAL', pages: 18 },
        { id: 'doc_lt_03', fileName: 'LT_Statutory_GST_PAN_ISO.pdf', category: 'LEGAL', pages: 8 },
      ],
    },
    {
      id: 'bidder_bhel_consortium',
      bidderCode: 'BID-CPCL-002',
      legalName: 'Bharat Heavy Electricals EPC Consortium',
      displayName: 'BHEL EPC Consortium',
      submissionRef: 'SUB-CPCL-002-BETA',
      documents: [
        { id: 'doc_bhel_01', fileName: 'BHEL_Financial_Statements_Signed.pdf', category: 'FINANCIAL', pages: 35 },
        { id: 'doc_bhel_02', fileName: 'BHEL_Self_Declaration_Turnover.pdf', category: 'FINANCIAL', pages: 4 },
        { id: 'doc_bhel_03', fileName: 'BHEL_Technical_Past_Projects.pdf', category: 'TECHNICAL', pages: 22 },
      ],
    },
    {
      id: 'bidder_reliance_infra',
      bidderCode: 'BID-CPCL-003',
      legalName: 'Reliance Infrastructure & Projects Division',
      displayName: 'Reliance Infrastructure',
      submissionRef: 'SUB-CPCL-003-GAMMA',
      documents: [
        { id: 'doc_ril_01', fileName: 'RIL_Audited_Accounts_2025.pdf', category: 'FINANCIAL', pages: 55 },
        { id: 'doc_ril_02', fileName: 'RIL_Statutory_Credentials.pdf', category: 'LEGAL', pages: 12 },
      ],
    },
  ],
  evaluations: [
    // L&T evaluations (Clean PASS on core requirements)
    {
      requirementId: 'req_01_turnover',
      bidderId: 'bidder_lt_heavy',
      status: 'PASS',
      ruleCode: 'RULE_FIN_01',
      summary: 'Average turnover of INR 184.20 Cr exceeds mandatory threshold of INR 50.00 Cr.',
      evidenceFactIds: ['fact_lt_turnover'],
      sourceDocument: 'LT_Audited_Financials_FY23_25.pdf',
      sourcePage: 6,
    },
    {
      requirementId: 'req_04_gst_registration',
      bidderId: 'bidder_lt_heavy',
      status: 'PASS',
      ruleCode: 'RULE_LEG_01',
      summary: 'GSTIN 33AAACL1234F1Z5 verified active with state code 33 (Tamil Nadu).',
      evidenceFactIds: ['fact_lt_gstin'],
      sourceDocument: 'LT_Statutory_GST_PAN_ISO.pdf',
      sourcePage: 2,
    },
    {
      requirementId: 'req_08_iso_9001',
      bidderId: 'bidder_lt_heavy',
      status: 'PASS',
      ruleCode: 'RULE_TECH_01',
      summary: 'ISO 9001:2015 Certificate valid until 15-Nov-2027 issued by TUV NORD.',
      evidenceFactIds: ['fact_lt_iso'],
      sourceDocument: 'LT_Statutory_GST_PAN_ISO.pdf',
      sourcePage: 5,
    },

    // BHEL evaluations (CONTRADICTION / FAIL on turnover)
    {
      requirementId: 'req_01_turnover',
      bidderId: 'bidder_bhel_consortium',
      status: 'FAIL',
      ruleCode: 'RULE_FIN_01',
      summary: 'Audited financial balance sheet proves 3-year average turnover is INR 44.10 Cr, which fails the mandatory requirement of INR 50.00 Cr.',
      evidenceFactIds: ['fact_bhel_audited_turnover', 'fact_bhel_declared_turnover'],
      sourceDocument: 'BHEL_Financial_Statements_Signed.pdf',
      sourcePage: 12,
    },
    {
      requirementId: 'req_04_gst_registration',
      bidderId: 'bidder_bhel_consortium',
      status: 'PASS',
      ruleCode: 'RULE_LEG_01',
      summary: 'GSTIN 33AAACB2233G1Z1 verified active.',
      evidenceFactIds: ['fact_bhel_gstin'],
      sourceDocument: 'BHEL_Financial_Statements_Signed.pdf',
      sourcePage: 3,
    },

    // Reliance evaluations (Borderline REVIEW & Missing evidence NOT_EVALUABLE)
    {
      requirementId: 'req_02_working_capital',
      bidderId: 'bidder_reliance_infra',
      status: 'REVIEW',
      ruleCode: 'RULE_FIN_02',
      summary: 'Bank sanction letter specifies sanctioned credit limit of INR 15.00 Cr with conditional drawdown clauses pending final CPCL contract execution.',
      evidenceFactIds: ['fact_ril_wc'],
      sourceDocument: 'RIL_Audited_Accounts_2025.pdf',
      sourcePage: 24,
    },
    {
      requirementId: 'req_06_local_content',
      bidderId: 'bidder_reliance_infra',
      status: 'NOT_EVALUABLE',
      ruleCode: 'RULE_LEG_03',
      summary: 'No Make in India Local Content Declaration detected in submitted bid packet.',
      evidenceFactIds: [],
      sourceDocument: 'RIL_Statutory_Credentials.pdf',
      sourcePage: 0,
    },
  ],
  conflicts: [
    {
      id: 'conflict_bhel_turnover',
      bidderId: 'bidder_bhel_consortium',
      requirementId: 'req_01_turnover',
      title: 'Turnover Discrepancy between Self-Declaration and Audited P&L',
      description: 'Self-declaration document claims 3-year average turnover of INR 62.50 Cr, but audited financial statements on page 12 reflect audited average of INR 44.10 Cr.',
      severity: 'CRITICAL',
      sourceFacts: ['fact_bhel_audited_turnover', 'fact_bhel_declared_turnover'],
    },
  ],
  verifications: [
    {
      id: 'ver_lt_gstin',
      bidderId: 'bidder_lt_heavy',
      identifierType: 'GSTIN',
      claimedValue: '33AAACL1234F1Z5',
      verifiedValue: '33AAACL1234F1Z5',
      matchStatus: 'MATCH',
      providerMode: 'MOCK / SYNTHETIC',
      providerName: 'GSTN Sandbox Verification Gateway',
    },
    {
      id: 'ver_bhel_pan',
      bidderId: 'bidder_bhel_consortium',
      identifierType: 'PAN',
      claimedValue: 'AAACB2233G',
      verifiedValue: 'AAACB2233G',
      matchStatus: 'MATCH',
      providerMode: 'MOCK / SYNTHETIC',
      providerName: 'NSDL Income Tax PAN Verification Gateway',
    },
    {
      id: 'ver_ril_iso',
      bidderId: 'bidder_reliance_infra',
      identifierType: 'ISO_9001',
      claimedValue: 'ISO-9001-2025-VALID',
      verifiedValue: 'EXPIRED-31-DEC-2024',
      matchStatus: 'MISMATCH',
      providerMode: 'MOCK / SYNTHETIC',
      providerName: 'IAF CertSearch Global Registry Mock',
    },
  ],
  investigations: [
    {
      id: 'inv_bhel_turnover_anomaly',
      bidderId: 'bidder_bhel_consortium',
      requirementId: 'req_01_turnover',
      title: 'Investigation into Financial Turnover Contradiction',
      hypothesis: 'Bidder included provisional JV pipeline figures in self-declaration without statutory auditor endorsement, leading to contradiction with official balance sheet.',
      status: 'RESOLVED',
      officerDecision: 'Audited P&L takes legal precedence over self-declaration. Non-compliance confirmed on mandatory financial criteria.',
    },
  ],
};
