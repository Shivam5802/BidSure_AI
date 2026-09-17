import { DocumentPage, EvidenceBlock, TenderDocument } from '@prisma/client';
import { RequirementChunk } from './llm-provider.interface.js';

export type DocumentWithPagesAndBlocks = TenderDocument & {
  pages: (DocumentPage & {
    evidenceBlocks: EvidenceBlock[];
  })[];
};

export class ChunkerService {
  /**
   * Prepares intelligent chunks based on clause boundaries, headings, tables, and page structures.
   * Avoids arbitrary character slicing to preserve tender clause context.
   */
  prepareChunks(documents: DocumentWithPagesAndBlocks[]): RequirementChunk[] {
    const chunks: RequirementChunk[] = [];

    for (const doc of documents) {
      for (const page of doc.pages) {
        if (!page.textContent || page.textContent.trim().length === 0) {
          continue;
        }

        // If evidence blocks exist, group content logically by block or heading-paragraph pairs
        if (page.evidenceBlocks && page.evidenceBlocks.length > 0) {
          const sortedBlocks = [...page.evidenceBlocks].sort((a, b) => a.sequence - b.sequence);

          let currentChunkText = '';
          let firstBlockId: string | undefined = undefined;

          for (const block of sortedBlocks) {
            if (!firstBlockId) {
              firstBlockId = block.id;
            }

            // Headings, tables, or major clause breaks trigger chunk boundaries
            const isBoundary =
              block.blockType === 'HEADING' ||
              block.blockType === 'TABLE' ||
              /^(?:clause|section|para|[\d\.]+)\s/i.test(block.content.trim());

            if (isBoundary && currentChunkText.length > 100) {
              chunks.push({
                documentId: doc.id,
                documentName: doc.originalFilename,
                pageNumber: page.pageNumber,
                evidenceBlockId: firstBlockId,
                text: currentChunkText.trim(),
              });
              currentChunkText = block.content;
              firstBlockId = block.id;
            } else {
              currentChunkText += (currentChunkText ? '\n\n' : '') + block.content;
            }
          }

          if (currentChunkText.trim().length > 0) {
            chunks.push({
              documentId: doc.id,
              documentName: doc.originalFilename,
              pageNumber: page.pageNumber,
              evidenceBlockId: firstBlockId,
              text: currentChunkText.trim(),
            });
          }
        } else {
          // Fallback: Split page text into clause/paragraph sections
          const paragraphs = page.textContent.split(/\n\s*\n/);
          let currentChunk = '';

          for (const p of paragraphs) {
            if (currentChunk.length + p.length > 1200) {
              chunks.push({
                documentId: doc.id,
                documentName: doc.originalFilename,
                pageNumber: page.pageNumber,
                text: currentChunk.trim(),
              });
              currentChunk = p;
            } else {
              currentChunk += (currentChunk ? '\n\n' : '') + p;
            }
          }

          if (currentChunk.trim().length > 0) {
            chunks.push({
              documentId: doc.id,
              documentName: doc.originalFilename,
              pageNumber: page.pageNumber,
              text: currentChunk.trim(),
            });
          }
        }
      }
    }

    return chunks;
  }
}

export const chunkerService = new ChunkerService();
