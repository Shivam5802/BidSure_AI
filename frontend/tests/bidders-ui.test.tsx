import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BidderDashboardHeader } from '../features/bidders/components/BidderDashboardHeader';
import { BidderList } from '../features/bidders/components/BidderList';
import { BidDocumentTable } from '../features/bidders/components/BidDocumentTable';
import { Bidder, BidDocument } from '../features/bidders/types';

describe('Feature 1D — Frontend Bidder & Document UI Components', () => {
  const mockBidders: Bidder[] = [
    {
      id: 'bdr_001',
      tenderId: 'tnd_100',
      bidderCode: 'BID-001',
      legalName: 'ABC Infrastructure Pvt Ltd',
      displayName: 'ABC Infra',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentCount: 6,
      classifiedCount: 5,
      reviewRequiredCount: 1,
      failedCount: 0,
      submissions: [
        {
          id: 'sub_001',
          tenderId: 'tnd_100',
          bidderId: 'bdr_001',
          submissionReference: 'SUB-BID-001-XYZ',
          status: 'DRAFT',
          submittedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  ];

  const mockDocuments: BidDocument[] = [
    {
      id: 'bdoc_001',
      bidSubmissionId: 'sub_001',
      originalFilename: 'GST Certificate.pdf',
      storageKey: 'tenders/tnd_100/bidders/bdr_001/gst.pdf',
      mimeType: 'application/pdf',
      fileSize: 102400,
      fileHash: 'abc123sha256hash',
      pageCount: 1,
      documentType: 'GST_CERTIFICATE',
      classificationStatus: 'CLASSIFIED',
      classificationConfidence: 0.96,
      classificationReason: 'Detected GST registration certificate indicators.',
      possibleRequirementCategories: ['STATUTORY', 'ELIGIBILITY'],
      possibleRequirementIds: [],
      reviewRequired: false,
      humanReviewed: false,
      reviewedBy: null,
      reviewedAt: null,
      processingStatus: 'COMPLETED',
      processingProgress: 100,
      currentStage: 'Classified as GST_CERTIFICATE',
      ocrUsed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bdoc_002',
      bidSubmissionId: 'sub_001',
      originalFilename: 'Unknown Attachment.pdf',
      storageKey: 'tenders/tnd_100/bidders/bdr_001/unknown.pdf',
      mimeType: 'application/pdf',
      fileSize: 51200,
      fileHash: 'def456sha256hash',
      pageCount: 1,
      documentType: 'UNKNOWN',
      classificationStatus: 'REVIEW_REQUIRED',
      classificationConfidence: 0.35,
      classificationReason: 'Low confidence in document classification.',
      possibleRequirementCategories: ['ELIGIBILITY'],
      possibleRequirementIds: [],
      reviewRequired: true,
      humanReviewed: false,
      reviewedBy: null,
      reviewedAt: null,
      processingStatus: 'COMPLETED',
      processingProgress: 100,
      currentStage: 'Review Required',
      ocrUsed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  describe('BidderDashboardHeader Component', () => {
    it('renders dashboard metrics accurately', () => {
      render(<BidderDashboardHeader bidders={mockBidders} />);

      expect(screen.getByText('Bidder & Document Ingestion')).toBeDefined();
      expect(screen.getByText('Total Bidders')).toBeDefined();
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
      expect(screen.getByText('6')).toBeDefined(); // Total docs count
    });
  });

  describe('BidderList Component', () => {
    it('renders bidder table rows when bidders are present', () => {
      const onSelectBidder = vi.fn();
      const onAddBidderClick = vi.fn();

      render(
        <BidderList
          bidders={mockBidders}
          onSelectBidder={onSelectBidder}
          onAddBidderClick={onAddBidderClick}
        />
      );

      expect(screen.getByText('BID-001')).toBeDefined();
      expect(screen.getByText('ABC Infrastructure Pvt Ltd')).toBeDefined();
      expect(screen.getByText('SUB-BID-001-XYZ')).toBeDefined();

      fireEvent.click(screen.getByText('Workspace'));
      expect(onSelectBidder).toHaveBeenCalledWith('bdr_001');
    });

    it('renders empty state when bidder list is empty', () => {
      render(
        <BidderList bidders={[]} onSelectBidder={vi.fn()} onAddBidderClick={vi.fn()} />
      );

      expect(screen.getByText('No bidders registered yet')).toBeDefined();
    });
  });

  describe('BidDocumentTable Component', () => {
    it('displays classified document type, confidence badge, and review button for low confidence doc', () => {
      const onReviewClick = vi.fn();
      const onViewClick = vi.fn();

      render(
        <BidDocumentTable
          documents={mockDocuments}
          onReviewClick={onReviewClick}
          onViewClick={onViewClick}
        />
      );

      expect(screen.getByText('GST Certificate.pdf')).toBeDefined();
      expect(screen.getByText('GST Registration Certificate')).toBeDefined();
      expect(screen.getByText('96% — High Confidence')).toBeDefined();

      expect(screen.getByText('Unknown Attachment.pdf')).toBeDefined();
      expect(screen.getByText('35% — Low (Review Req)')).toBeDefined();

      const reviewButton = screen.getByText('Review');
      fireEvent.click(reviewButton);
      expect(onReviewClick).toHaveBeenCalledWith(mockDocuments[1]);
    });
  });
});
