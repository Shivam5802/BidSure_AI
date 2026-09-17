import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { tenderRepository } from '../src/modules/tenders/tender.repository.js';
import { tenderService } from '../src/modules/tenders/tender.service.js';
import { tableExtractorService } from '../src/services/documents/table-extractor.service.js';
import { pdfExtractorService } from '../src/services/documents/pdf-extractor.service.js';

describe('Document Processing & Evidence Provenance', () => {
  it('should detect tables and extract headers and rows cleanly', () => {
    const tableText = `
SECTION 4: TECHNICAL CRITERIA

| Requirement | Minimum Turnover | Mandatory |
|-------------|------------------|-----------|
| Category A  | Rs 10 Crore      | Yes       |
| Category B  | Rs 25 Crore      | Yes       |

All bidders must submit audited financial balance sheets.
    `.trim();

    const { tables, nonTableText } = tableExtractorService.extractTables(tableText);

    expect(tables.length).toBe(1);
    const tbl = tables[0]!;
    expect(tbl.headers).toContain('Requirement');
    expect(tbl.headers).toContain('Minimum Turnover');
    expect(tbl.rows.length).toBe(2);
    expect(tbl.rows[0]).toContain('Category A');
    expect(nonTableText).toContain('All bidders must submit audited financial balance sheets.');
  });

  it('should build structured evidence blocks preserving reading sequence', () => {
    const rawContent = `
SECTION 1.1: ELIGIBILITY CRITERIA

The bidder must have past experience of executing similar government contracts.

- Valid GSTIN Registration
- Active PAN Card
- OEM Authorization Form
    `.trim();

    const blocks = pdfExtractorService.buildEvidenceBlocks(rawContent);

    expect(blocks.length).toBeGreaterThan(0);
    // Sequences must be strictly monotonically increasing from 1
    for (let i = 0; i < blocks.length; i++) {
      expect(blocks[i]!.sequence).toBe(i + 1);
    }

    const headingBlock = blocks.find((b) => b.blockType === 'HEADING');
    expect(headingBlock).toBeDefined();
    expect(headingBlock?.content).toContain('SECTION 1.1: ELIGIBILITY CRITERIA');
  });

  it('should run document processing pipeline and establish complete provenance chain', async () => {
    await tenderRepository.clear();

    const tender = await tenderRepository.createTender({
      title: 'Complete Workflow Tender',
      referenceNumber: 'REF-FLOW-001',
      organization: 'CPCL Energy',
      closingDate: new Date(Date.now() + 86400000),
    });

    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([600, 400]);
    const buffer = Buffer.from(await pdfDoc.save());

    const document = await tenderService.uploadDocument(tender.id, buffer, 'Technical_Specs.pdf');
    expect(document.processingStatus).toBe('UPLOADED');

    // Trigger processing
    const processResult = await tenderService.startProcessing(tender.id, [document.id]);
    expect(processResult.status).toBe('PROCESSING');
    expect(processResult.documentIds).toContain(document.id);

    // Poll for background async processing to complete
    let docWithPages = await tenderService.getDocument(document.id);
    const startTime = Date.now();
    while (docWithPages.pages.length === 0 && Date.now() - startTime < 3000) {
      await new Promise((r) => setTimeout(r, 50));
      docWithPages = await tenderService.getDocument(document.id);
    }

    expect(docWithPages.pages.length).toBeGreaterThan(0);

    // Verify 1-based page numbering
    const firstPage = docWithPages.pages[0]!;
    expect(firstPage.pageNumber).toBe(1);
    expect(firstPage.documentId).toBe(document.id);

    // Verify Evidence Blocks provenance
    expect(firstPage.evidenceBlocks.length).toBeGreaterThan(0);
    const firstBlock = firstPage.evidenceBlocks[0]!;
    expect(firstBlock.pageId).toBe(firstPage.id);
    expect(firstBlock.sequence).toBe(1);
  });
});
