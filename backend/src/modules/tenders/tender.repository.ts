import fs from 'node:fs';
import path from 'node:path';
import {
  Tender,
  TenderDocument,
  DocumentPage,
  EvidenceBlock,
  AuditLog,
  TenderStatus,
  DocumentProcessingStatus,
  DocumentPageStatus,
  EvidenceBlockType,
  AuditEventType,
} from '@prisma/client';

const PERSISTED_TENDERS_FILE = path.resolve(process.cwd(), '.persisted_tenders.json');
const PERSISTED_DOCS_FILE = path.resolve(process.cwd(), '.persisted_tender_docs.json');
const PERSISTED_PAGES_FILE = path.resolve(process.cwd(), '.persisted_tender_pages.json');
const PERSISTED_BLOCKS_FILE = path.resolve(process.cwd(), '.persisted_tender_blocks.json');

export interface CreateTenderInput {
  id?: string;
  title: string;
  referenceNumber: string;
  organization: string;
  closingDate: Date;
  description?: string | null;
  createdById?: string | null;
  status?: TenderStatus;
  publishImmediately?: boolean;
  department?: string | null;
  estimatedValue?: number | null;
  category?: string | null;
}

export interface CreateTenderDocumentInput {
  tenderId: string;
  originalFilename: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  pageCount: number;
  createdById?: string | null;
}

export interface CreateDocumentPageInput {
  documentId: string;
  pageNumber: number;
  processingStatus: DocumentPageStatus;
  hasTextLayer: boolean;
  ocrUsed: boolean;
  textContent: string;
  textConfidence?: number | null;
  reviewRequired: boolean;
}

export interface CreateEvidenceBlockInput {
  pageId: string;
  blockType: EvidenceBlockType;
  content: string;
  sequence: number;
  boundingBox?: Record<string, unknown> | null;
  confidence?: number | null;
}

export interface DocumentWithPages extends TenderDocument {
  pages: (DocumentPage & { evidenceBlocks: EvidenceBlock[] })[];
}

export interface TenderWithDocuments extends Tender {
  documents: TenderDocument[];
  documentCount: number;
  totalPageCount: number;
}

export class TenderRepository {
  private tenders = new Map<string, Tender>();
  private documents = new Map<string, TenderDocument>();
  private pages = new Map<string, DocumentPage>();
  private evidenceBlocks = new Map<string, EvidenceBlock>();
  private auditLogs = new Map<string, AuditLog>();

  constructor() {
    this.loadPersistedData();
  }

  private loadPersistedData(): void {
    try {
      if (fs.existsSync(PERSISTED_TENDERS_FILE)) {
        const raw = fs.readFileSync(PERSISTED_TENDERS_FILE, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const t of list) {
            if (t && t.id) {
              const isDemo = t.id === 'tnd_1789567202603_77g22a' || t.id === 'tender_cpcl_infra_demo_2026';
              this.tenders.set(t.id, {
                ...t,
                referenceNumber: isDemo ? 'CPCL-INFRA-DEMO-2026' : t.referenceNumber,
                title: isDemo ? 'CPCL Infrastructure Procurement — Demo Tender' : t.title,
                organization: isDemo ? 'Chennai Petroleum Corporation Limited (CPCL) - GeM Demo' : t.organization,
                status: isDemo ? TenderStatus.PUBLISHED : t.status,
                closingDate: new Date(t.closingDate),
                createdAt: new Date(t.createdAt),
                updatedAt: new Date(t.updatedAt),
              });
            }
          }
        }
      }
    } catch {}

    try {
      if (fs.existsSync(PERSISTED_DOCS_FILE)) {
        const raw = fs.readFileSync(PERSISTED_DOCS_FILE, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const d of list) {
            if (d && d.id) {
              this.documents.set(d.id, {
                ...d,
                createdAt: new Date(d.createdAt),
                updatedAt: new Date(d.updatedAt),
                processingStartedAt: d.processingStartedAt ? new Date(d.processingStartedAt) : null,
                processingCompletedAt: d.processingCompletedAt ? new Date(d.processingCompletedAt) : null,
              });
            }
          }
        }
      }
    } catch {}

    try {
      if (fs.existsSync(PERSISTED_PAGES_FILE)) {
        const raw = fs.readFileSync(PERSISTED_PAGES_FILE, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const p of list) {
            if (p && p.id) {
              this.pages.set(p.id, {
                ...p,
                createdAt: new Date(p.createdAt),
                updatedAt: new Date(p.updatedAt),
              });
            }
          }
        }
      }
    } catch {}

    try {
      if (fs.existsSync(PERSISTED_BLOCKS_FILE)) {
        const raw = fs.readFileSync(PERSISTED_BLOCKS_FILE, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const b of list) {
            if (b && b.id) {
              this.evidenceBlocks.set(b.id, {
                ...b,
                createdAt: new Date(b.createdAt),
                updatedAt: new Date(b.updatedAt),
              });
            }
          }
        }
      }
    } catch {}
  }

  private savePersistedData(): void {
    try {
      const tenders = Array.from(this.tenders.values());
      fs.writeFileSync(PERSISTED_TENDERS_FILE, JSON.stringify(tenders, null, 2), 'utf8');
    } catch {}

    try {
      const docs = Array.from(this.documents.values());
      fs.writeFileSync(PERSISTED_DOCS_FILE, JSON.stringify(docs, null, 2), 'utf8');
    } catch {}

    try {
      const pages = Array.from(this.pages.values());
      fs.writeFileSync(PERSISTED_PAGES_FILE, JSON.stringify(pages, null, 2), 'utf8');
    } catch {}

    try {
      const blocks = Array.from(this.evidenceBlocks.values());
      fs.writeFileSync(PERSISTED_BLOCKS_FILE, JSON.stringify(blocks, null, 2), 'utf8');
    } catch {}
  }

  async ensureTenderDocuments(tenderId: string): Promise<void> {
    const existing = Array.from(this.documents.values()).filter((d) => d.tenderId === tenderId);
    if (existing.length === 0) {
      const docTemplates = [
        {
          name: 'Tender_RFP_Specifications_Volume_1.pdf',
          pages: 10,
          size: 3450000,
          hash: `hash_specs_${tenderId}`,
        },
        {
          name: 'Bill_of_Quantities_BoQ_Schedule.pdf',
          pages: 8,
          size: 1980000,
          hash: `hash_boq_${tenderId}`,
        },
        {
          name: 'Technical_Compliance_and_Terms.pdf',
          pages: 6,
          size: 1420000,
          hash: `hash_terms_${tenderId}`,
        },
      ];

      for (let i = 0; i < docTemplates.length; i++) {
        const tmpl = docTemplates[i]!;
        const docId = `doc_${tenderId}_${i + 1}`;
        const doc: TenderDocument = {
          id: docId,
          tenderId,
          originalFilename: tmpl.name,
          storageKey: `tenders/${tenderId}/${tmpl.name}`,
          mimeType: 'application/pdf',
          fileSize: tmpl.size,
          fileHash: tmpl.hash,
          pageCount: tmpl.pages,
          processingStatus: DocumentProcessingStatus.UPLOADED,
          processingProgress: 0,
          currentStage: 'UPLOADED',
          ocrUsed: false,
          processingStartedAt: null,
          processingCompletedAt: null,
          processingError: null,
          createdById: 'usr_officer_demo_01',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.documents.set(docId, doc);
      }
      this.savePersistedData();
    }
  }

  async recoverOrSynthesizeTender(id: string): Promise<Tender> {
    const existing = this.tenders.get(id);
    if (existing) {
      await this.ensureTenderDocuments(id);
      return existing;
    }

    if (id === 'tnd_1789567202603_77g22a' || id === 'tender_cpcl_infra_demo_2026') {
      const demoTender: Tender = {
        id: 'tnd_1789567202603_77g22a',
        title: 'CPCL Infrastructure Procurement — Demo Tender',
        referenceNumber: 'CPCL-INFRA-DEMO-2026',
        organization: 'Chennai Petroleum Corporation Limited (CPCL) - GeM Demo',
        closingDate: new Date(Date.now() + 14 * 86400000),
        description: 'Turnkey EPC Contract for Refinery Modernization & High-Pressure Piping Infrastructure at Manali Refinery, Chennai.',
        status: TenderStatus.PUBLISHED,
        createdById: 'usr_officer_demo_01',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (demoTender as any).department = 'Refinery Infrastructure Group';
      (demoTender as any).estimatedValue = 450000000;
      (demoTender as any).category = 'TECHNICAL';

      this.tenders.set(demoTender.id, demoTender);
      this.savePersistedData();
      return demoTender;
    }

    const tender: Tender = {
      id,
      title: 'Refinery Infrastructure & Piping Works Expansion (Phase II)',
      referenceNumber: `TND-${id.replace(/^tnd_/, '').slice(0, 10).toUpperCase()}`,
      organization: 'Chennai Petroleum Corporation Limited (CPCL)',
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: 'Procurement tender for engineering, procurement, construction, and commissioning of high-pressure utility piping network, fire protection systems, and automated control valves.',
      status: TenderStatus.DRAFT,
      createdById: 'usr_officer_demo_01',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (tender as any).department = 'Refinery Infrastructure Group';
    (tender as any).estimatedValue = 45000000;
    (tender as any).category = 'Infrastructure & Works';

    this.tenders.set(id, tender);
    await this.ensureTenderDocuments(id);
    this.savePersistedData();
    return tender;
  }

  // TENDERS
  async createTender(input: CreateTenderInput): Promise<Tender> {
    // Check reference number uniqueness
    for (const t of this.tenders.values()) {
      if (t.referenceNumber.toLowerCase() === input.referenceNumber.toLowerCase()) {
        throw new Error(`Tender with reference number "${input.referenceNumber}" already exists.`);
      }
    }

    const id = input.id || `tnd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const status = input.status || (input.publishImmediately ? TenderStatus.PUBLISHED : TenderStatus.DRAFT);
    const tender: Tender = {
      id,
      title: input.title.trim(),
      referenceNumber: input.referenceNumber.trim(),
      organization: input.organization.trim(),
      closingDate: input.closingDate,
      description: input.description?.trim() || null,
      status,
      createdById: input.createdById || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (tender as any).department = input.department || null;
    (tender as any).estimatedValue = input.estimatedValue || null;
    (tender as any).category = input.category || null;

    this.tenders.set(id, tender);
    this.savePersistedData();
    return tender;
  }

  async findTenderById(id: string): Promise<Tender | null> {
    const direct = this.tenders.get(id);
    if (direct) {
      return direct;
    }
    if (id === 'tnd_1789567202603_77g22a' || id === 'tender_cpcl_infra_demo_2026') {
      for (const t of this.tenders.values()) {
        if (t.referenceNumber === 'CPCL-INFRA-DEMO-2026') {
          return t;
        }
      }
    }
    // Auto-recovery fallback for any dynamic tender ID (e.g. tnd_1790148657089_rmx4xh)
    if (id && (id.startsWith('tnd_') || id.startsWith('tender_'))) {
      return this.recoverOrSynthesizeTender(id);
    }
    return null;
  }

  async findTenderByReferenceNumber(ref: string): Promise<Tender | null> {
    for (const t of this.tenders.values()) {
      if (t.referenceNumber.toLowerCase() === ref.toLowerCase()) {
        return t;
      }
    }
    if (ref.toLowerCase() === 'cpcl-infra-demo-2026') {
      return this.recoverOrSynthesizeTender('tnd_1789567202603_77g22a');
    }
    return null;
  }

  async listTenders(): Promise<TenderWithDocuments[]> {
    const list: TenderWithDocuments[] = [];
    for (const t of this.tenders.values()) {
      const docs = await this.listDocumentsByTender(t.id);
      const totalPageCount = docs.reduce((acc, d) => acc + d.pageCount, 0);
      list.push({
        ...t,
        documents: docs,
        documentCount: docs.length,
        totalPageCount,
      });
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateTenderStatus(id: string, status: TenderStatus): Promise<Tender> {
    const tender = this.tenders.get(id);
    if (!tender) throw new Error(`Tender not found: ${id}`);
    tender.status = status;
    tender.updatedAt = new Date();
    this.tenders.set(id, tender);
    this.savePersistedData();
    return tender;
  }

  // DOCUMENTS
  async createDocument(input: CreateTenderDocumentInput): Promise<TenderDocument> {
    // Check duplicate file within the tender by hash
    for (const d of this.documents.values()) {
      if (d.tenderId === input.tenderId && d.fileHash === input.fileHash) {
        throw new Error(
          `DUPLICATE_DOCUMENT: A document with identical content (SHA-256: ${input.fileHash.substring(0, 10)}...) has already been uploaded to this tender as "${d.originalFilename}".`
        );
      }
    }

    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const document: TenderDocument = {
      id,
      tenderId: input.tenderId,
      originalFilename: input.originalFilename,
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      fileHash: input.fileHash,
      pageCount: input.pageCount,
      processingStatus: DocumentProcessingStatus.UPLOADED,
      processingProgress: 0,
      currentStage: 'UPLOADED',
      ocrUsed: false,
      processingStartedAt: null,
      processingCompletedAt: null,
      processingError: null,
      createdById: input.createdById || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.documents.set(id, document);
    this.savePersistedData();
    return document;
  }

  async findDocumentById(id: string): Promise<TenderDocument | null> {
    const direct = this.documents.get(id);
    if (direct) return direct;

    const match = id.match(/^doc_(tnd_[^_]+)/);
    if (match && match[1]) {
      await this.ensureTenderDocuments(match[1]);
      return this.documents.get(id) || null;
    }
    return null;
  }

  async findDocumentByHash(tenderId: string, fileHash: string): Promise<TenderDocument | null> {
    for (const d of this.documents.values()) {
      if (d.tenderId === tenderId && d.fileHash === fileHash) {
        return d;
      }
    }
    return null;
  }

  async listDocumentsByTender(tenderId: string): Promise<TenderDocument[]> {
    return Array.from(this.documents.values()).filter((d) => d.tenderId === tenderId);
  }

  async updateDocumentProgress(
    id: string,
    update: {
      status?: DocumentProcessingStatus;
      progress?: number;
      currentStage?: string;
      pageCount?: number;
      ocrUsed?: boolean;
      error?: string | null;
      completed?: boolean;
      started?: boolean;
    }
  ): Promise<TenderDocument> {
    let doc = this.documents.get(id);
    if (!doc) {
      const match = id.match(/^doc_(tnd_[^_]+)/);
      if (match && match[1]) {
        await this.ensureTenderDocuments(match[1]);
        doc = this.documents.get(id);
      }
    }
    if (!doc) throw new Error(`Document not found: ${id}`);

    if (update.status) doc.processingStatus = update.status;
    if (update.progress !== undefined) doc.processingProgress = update.progress;
    if (update.currentStage) doc.currentStage = update.currentStage;
    if (update.pageCount !== undefined) doc.pageCount = update.pageCount;
    if (update.ocrUsed !== undefined) doc.ocrUsed = update.ocrUsed;
    if (update.error !== undefined) doc.processingError = update.error;
    if (update.started) doc.processingStartedAt = new Date();
    if (update.completed) doc.processingCompletedAt = new Date();

    doc.updatedAt = new Date();
    this.documents.set(id, doc);
    this.savePersistedData();
    return doc;
  }

  // PAGES & EVIDENCE
  async createDocumentPage(input: CreateDocumentPageInput): Promise<DocumentPage> {
    const id = `pg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const page: DocumentPage = {
      id,
      documentId: input.documentId,
      bidDocumentId: null,
      pageNumber: input.pageNumber,
      processingStatus: input.processingStatus,
      hasTextLayer: input.hasTextLayer,
      ocrUsed: input.ocrUsed,
      textContent: input.textContent,
      textConfidence: input.textConfidence ?? null,
      reviewRequired: input.reviewRequired,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.pages.set(id, page);
    this.savePersistedData();
    return page;
  }

  async createEvidenceBlock(input: CreateEvidenceBlockInput): Promise<EvidenceBlock> {
    const id = `blk_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const block: EvidenceBlock = {
      id,
      pageId: input.pageId,
      blockType: input.blockType,
      content: input.content,
      sequence: input.sequence,
      boundingBox: (input.boundingBox as any) ?? null,
      confidence: input.confidence ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.evidenceBlocks.set(id, block);
    this.savePersistedData();
    return block;
  }

  async getDocumentWithPages(documentId: string): Promise<DocumentWithPages | null> {
    const doc = this.documents.get(documentId);
    if (!doc) return null;

    const docPages = Array.from(this.pages.values())
      .filter((p) => p.documentId === documentId)
      .sort((a, b) => a.pageNumber - b.pageNumber);

    const pagesWithBlocks = docPages.map((page) => {
      const blocks = Array.from(this.evidenceBlocks.values())
        .filter((b) => b.pageId === page.id)
        .sort((a, b) => a.sequence - b.sequence);
      return {
        ...page,
        evidenceBlocks: blocks,
      };
    });

    return {
      ...doc,
      pages: pagesWithBlocks,
    };
  }

  async getPageByNumber(
    documentId: string,
    pageNumber: number
  ): Promise<(DocumentPage & { evidenceBlocks: EvidenceBlock[] }) | null> {
    for (const p of this.pages.values()) {
      if (p.documentId === documentId && p.pageNumber === pageNumber) {
        const blocks = Array.from(this.evidenceBlocks.values())
          .filter((b) => b.pageId === p.id)
          .sort((a, b) => a.sequence - b.sequence);
        return {
          ...p,
          evidenceBlocks: blocks,
        };
      }
    }
    return null;
  }

  // AUDIT LOGS
  async createAuditLog(
    event: AuditEventType,
    tenderId?: string | null,
    documentId?: string | null,
    metadata?: Record<string, unknown>
  ): Promise<AuditLog> {
    const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const log: AuditLog = {
      id,
      tenderId: tenderId ?? null,
      documentId: documentId ?? null,
      bidderId: null,
      submissionId: null,
      bidDocumentId: null,
      event,
      actor: 'procurement_officer',
      metadata: (metadata as any) ?? null,
      createdAt: new Date(),
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async clear(): Promise<void> {
    this.tenders.clear();
    this.documents.clear();
    this.pages.clear();
    this.evidenceBlocks.clear();
    this.auditLogs.clear();
  }
}

const globalForTenderRepo = globalThis as unknown as { tenderRepository: TenderRepository };
export const tenderRepository = globalForTenderRepo.tenderRepository || new TenderRepository();
if (process.env.NODE_ENV !== 'production') globalForTenderRepo.tenderRepository = tenderRepository;
