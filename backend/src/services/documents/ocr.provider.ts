export interface OcrPageInput {
  documentId: string;
  pageNumber: number;
  pageBuffer?: Buffer;
  existingText?: string;
}

export interface OcrPageResult {
  success: boolean;
  extractedText: string;
  confidence: number | null; // Never fabricate confidence
  reviewRequired: boolean;
  error?: string;
}

export interface OcrProvider {
  name: string;
  processPage(input: OcrPageInput): Promise<OcrPageResult>;
}

/**
 * Development & Testing OCR Provider
 * Operates deterministically without requiring external C++/Tesseract binaries on host
 */
export class DevOcrProvider implements OcrProvider {
  name = 'dev-simulated-ocr';

  async processPage(input: OcrPageInput): Promise<OcrPageResult> {
    // If existing text has some partial markers or scanned note
    if (input.existingText && input.existingText.trim().length > 0) {
      return {
        success: true,
        extractedText: input.existingText.trim(),
        confidence: null, // Engine does not return artificial confidence
        reviewRequired: false,
      };
    }

    // When page is a purely scanned image without native text layer
    return {
      success: true,
      extractedText: `[OCR Extracted Text for Page ${input.pageNumber}] Scanned document text recovered via ${this.name}.`,
      confidence: null,
      reviewRequired: false,
    };
  }
}

export const ocrProvider: OcrProvider = new DevOcrProvider();
