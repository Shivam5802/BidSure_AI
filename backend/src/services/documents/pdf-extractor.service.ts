import pdfParse from 'pdf-parse';
import { EvidenceBlockType } from '@prisma/client';
import { tableExtractorService } from './table-extractor.service.js';

export interface ExtractedPageRaw {
  pageNumber: number; // 1-based
  text: string;
  hasMeaningfulText: boolean;
}

export interface PreparedEvidenceBlock {
  blockType: EvidenceBlockType;
  content: string;
  sequence: number;
  confidence: number | null;
  boundingBox?: Record<string, unknown> | null;
}

export interface PreparedPageData {
  pageNumber: number; // 1-based
  textContent: string;
  hasTextLayer: boolean;
  ocrUsed: boolean;
  textConfidence: number | null;
  reviewRequired: boolean;
  evidenceBlocks: PreparedEvidenceBlock[];
}

export class PdfExtractorService {
  /**
   * Evaluates whether extracted text constitutes meaningful content
   */
  hasMeaningfulText(text: string): boolean {
    if (!text) return false;
    const clean = text.replace(/[\s\r\n\t]+/g, ' ').trim();
    // Check alphanumeric density
    const alphanumericCount = (clean.match(/[a-zA-Z0-9]/g) || []).length;
    // Less than 20 alphanumeric characters on a whole page typically indicates a scanned page or stamp/page artifact
    return alphanumericCount >= 20;
  }

  /**
   * Extracts text from PDF page by page
   */
  async extractPages(buffer: Buffer): Promise<ExtractedPageRaw[]> {
    const pageTexts: string[] = [];

    // Custom pagerender to capture per-page text
    const renderPage = (pageData: { getTextContent: () => Promise<{ items: Array<{ str: string }> }> }) => {
      return pageData.getTextContent().then((textContent) => {
        let pageText = '';
        for (const item of textContent.items) {
          if (item.str) {
            pageText += item.str + ' ';
          }
        }
        return pageText.trim();
      });
    };

    try {
      const data = await pdfParse(buffer, {
        pagerender: async (pageData: any) => {
          const text = await renderPage(pageData);
          pageTexts.push(text);
          return text;
        },
      });

      // If pageTexts is populated, map to 1-based pages
      if (pageTexts.length > 0) {
        return pageTexts.map((text, idx) => ({
          pageNumber: idx + 1,
          text: text.trim(),
          hasMeaningfulText: this.hasMeaningfulText(text),
        }));
      }

      // Fallback if pagerender wasn't called per page
      const fullText = data.text || '';
      return [
        {
          pageNumber: 1,
          text: fullText.trim(),
          hasMeaningfulText: this.hasMeaningfulText(fullText),
        },
      ];
    } catch {
      // Return a 1-page fallback without crashing
      return [
        {
          pageNumber: 1,
          text: '',
          hasMeaningfulText: false,
        },
      ];
    }
  }

  /**
   * Builds structured evidence blocks from page text while preserving reading sequence
   */
  buildEvidenceBlocks(pageText: string): PreparedEvidenceBlock[] {
    const blocks: PreparedEvidenceBlock[] = [];
    let sequence = 1;

    // First extract tables
    const { tables, nonTableText } = tableExtractorService.extractTables(pageText);

    // Process non-table text by paragraphs and headings
    const paragraphs = nonTableText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    for (const para of paragraphs) {
      // Check if paragraph is a heading (short, all caps, or starts with section number e.g. "1.1", "SECTION")
      const isHeading =
        para.length < 100 &&
        (/^[0-9]+(\.[0-9]+)*\s+/.test(para) ||
          /^(SECTION|CLAUSE|ANNEXURE|APPENDIX|PART|SCHEDULE|CHAPTER)\b/i.test(para) ||
          (para === para.toUpperCase() && para.split(' ').length <= 8));

      // Check if bullet/list item
      const isList = /^([•\-\*]|(\([a-z0-9]+\))|[0-9]+\.)\s+/i.test(para);

      let blockType: EvidenceBlockType = EvidenceBlockType.PARAGRAPH;
      if (isHeading) {
        blockType = EvidenceBlockType.HEADING;
      } else if (isList) {
        blockType = EvidenceBlockType.LIST;
      }

      blocks.push({
        blockType,
        content: para,
        sequence: sequence++,
        confidence: null,
      });
    }

    // Append table evidence blocks
    for (const tbl of tables) {
      blocks.push({
        blockType: EvidenceBlockType.TABLE,
        content: tbl.rawText,
        sequence: sequence++,
        confidence: null,
      });
    }

    return blocks;
  }
}

export const pdfExtractorService = new PdfExtractorService();
