import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EvidenceSummaryHeader } from '../features/evidence/components/EvidenceSummaryHeader';
import { EvidenceTable } from '../features/evidence/components/EvidenceTable';
import { EvidenceInspectorDrawer } from '../features/evidence/components/EvidenceInspectorDrawer';
import { AddManualEvidenceModal } from '../features/evidence/components/AddManualEvidenceModal';
import { ExtractedEvidence, EvidenceSummary } from '../features/evidence/types';

describe('Feature 1E — Frontend Evidence Extraction & Inspector UI', () => {
  const mockDocument = {
    id: 'bdoc_101',
    originalFilename: 'Turnover_Certificate_2023.pdf',
    documentType: 'TURNOVER_CERTIFICATE',
  };

  const mockSummary: EvidenceSummary = {
    totalExtracted: 3,
    highConfidence: 2,
    reviewRequired: 1,
    humanVerified: 1,
    conflicts: 1,
  };

  const mockEvidenceList: ExtractedEvidence[] = [
    {
      id: 'ev_001',
      bidDocumentId: 'bdoc_101',
      fieldKey: 'ANNUAL_TURNOVER',
      fieldLabel: 'Annual Turnover',
      rawValue: 'Rs. 45.5 Crores',
      normalizedValue: 455000000,
      valueType: 'CURRENCY',
      unit: 'INR',
      sourceText: 'The turnover for FY 2022-23 was Rs. 45.5 Crores.',
      pageNumber: 1,
      confidence: 0.95,
      extractionMethod: 'TEXT_EXTRACTION',
      status: 'EXTRACTED',
      conflictFlag: false,
      humanReviewed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ev_002',
      bidDocumentId: 'bdoc_101',
      fieldKey: 'GSTIN',
      fieldLabel: 'GST Identification Number',
      rawValue: '07AAAAA0000A1Z5',
      normalizedValue: '07AAAAA0000A1Z5',
      valueType: 'IDENTIFIER',
      sourceText: 'GSTIN Registration: 07AAAAA0000A1Z5',
      pageNumber: 1,
      confidence: 0.98,
      extractionMethod: 'OCR',
      status: 'VERIFIED_BY_HUMAN',
      conflictFlag: false,
      humanReviewed: true,
      reviewedBy: 'Procurement Officer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ev_003',
      bidDocumentId: 'bdoc_101',
      fieldKey: 'EXPERIENCE_YEARS',
      fieldLabel: 'Experience Years',
      rawValue: '2 Years',
      normalizedValue: 2,
      valueType: 'INTEGER',
      sourceText: 'Incorporated in 2022 giving 2 Years experience.',
      pageNumber: 2,
      confidence: 0.45,
      extractionMethod: 'TEXT_EXTRACTION',
      status: 'REVIEW_REQUIRED',
      conflictFlag: true,
      conflictReason: 'Conflicting values found: 2 Years vs 5 Years',
      humanReviewed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  describe('EvidenceSummaryHeader Component', () => {
    it('renders document metadata and summary metric numbers', () => {
      render(
        <EvidenceSummaryHeader
          document={mockDocument}
          latestRun={null}
          summary={mockSummary}
          onTriggerExtraction={vi.fn()}
          onOpenAddManual={vi.fn()}
          onRefresh={vi.fn()}
        />
      );

      expect(screen.getByText('Turnover_Certificate_2023.pdf')).toBeDefined();
      expect(screen.getByText('TURNOVER_CERTIFICATE')).toBeDefined();
      expect(screen.getByText('3')).toBeDefined(); // totalExtracted
      expect(screen.getByText('2')).toBeDefined(); // highConfidence
      expect(screen.getAllByText('1').length).toBe(3); // reviewRequired, humanVerified, conflicts
    });

    it('triggers AI extraction when button clicked', () => {
      const onTrigger = vi.fn();
      render(
        <EvidenceSummaryHeader
          document={mockDocument}
          latestRun={null}
          summary={mockSummary}
          onTriggerExtraction={onTrigger}
          onOpenAddManual={vi.fn()}
          onRefresh={vi.fn()}
        />
      );

      const button = screen.getByText('Re-Run AI Extraction');
      fireEvent.click(button);
      expect(onTrigger).toHaveBeenCalled();
    });
  });

  describe('EvidenceTable Component', () => {
    it('renders evidence rows, raw values, confidence badges and conflict flags', () => {
      const onInspect = vi.fn();
      const onVerify = vi.fn();
      const onReject = vi.fn();

      render(
        <EvidenceTable
          evidence={mockEvidenceList}
          onInspect={onInspect}
          onVerify={onVerify}
          onReject={onReject}
        />
      );

      expect(screen.getByText('Annual Turnover')).toBeDefined();
      expect(screen.getByText('ANNUAL_TURNOVER')).toBeDefined();
      expect(screen.getByText('Rs. 45.5 Crores')).toBeDefined();
      expect(screen.getByText('455000000')).toBeDefined();
      expect(screen.getByText('95%')).toBeDefined();

      expect(screen.getByText('Conflict')).toBeDefined();
      expect(screen.getByText('Conflicting values found: 2 Years vs 5 Years')).toBeDefined();

      const inspectButtons = screen.getAllByText('Inspect');
      expect(inspectButtons.length).toBe(3);
      fireEvent.click(inspectButtons[0]);
      expect(onInspect).toHaveBeenCalledWith(mockEvidenceList[0]);
    });
  });

  describe('AddManualEvidenceModal Component', () => {
    it('renders input fields when open', () => {
      render(
        <AddManualEvidenceModal
          documentId="bdoc_101"
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      expect(screen.getByText('Add Manual Evidence Fact')).toBeDefined();
      expect(screen.getByText(/Raw Extracted Value/)).toBeDefined();
      expect(screen.getByText(/Source Text Snippet/)).toBeDefined();
    });
  });
});
