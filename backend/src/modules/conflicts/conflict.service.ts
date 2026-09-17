import { PrismaClient, AuditEventType, ConflictStatus } from '@prisma/client';
import { conflictRepository, ConflictRepository } from './conflict.repository.js';
import { conflictDetectorService } from './conflict-detector.service.js';
import { evidenceRepository } from '../evidence/evidence.repository.js';
import { evaluationRepository } from '../evaluations/evaluation.repository.js';
import { investigationService } from '../investigation/investigation.service.js';
import { auditService } from '../../services/audit/audit.service.js';
import {
  UpdateConflictStatusDTO,
  ConflictGraphData,
  ConflictGraphNode,
  ConflictGraphEdge,
} from './conflict.types.js';

export class ConflictService {
  private repository: ConflictRepository;
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
    this.repository = conflictRepository;
  }

  /**
   * Run contradiction detection on all active evidence for a bidder.
   */
  async detectConflictsForBidder(bidderId: string, tenderId?: string) {
    // 1. Log detection started
    await auditService.log(AuditEventType.CONFLICT_DETECTION_STARTED, {
      bidderId,
      tenderId,
      actor: 'system',
      metadata: { bidderId, tenderId },
    });

    try {
      // 2. Fetch bidder evidence
      let evidenceList: any[] = [];
      try {
        evidenceList = await this.prisma.extractedEvidence.findMany({
          where: {
            bidDocument: {
              bidSubmission: { bidderId },
            },
          },
          include: {
            bidDocument: {
              include: {
                bidSubmission: true,
              },
            },
          },
        });
      } catch {
        evidenceList = await evidenceRepository.listEvidenceByBidder(bidderId);
      }

      if (!evidenceList || evidenceList.length === 0) {
        return { bidderId, detectedCount: 0, conflicts: [] };
      }

      const sampleDoc = evidenceList[0].bidDocument || {};
      const sampleSub = sampleDoc.bidSubmission || {};
      const resolvedTenderId = tenderId || sampleSub.tenderId || sampleDoc.tenderId || 'tender_default';
      const resolvedSubmissionId = sampleSub.id || sampleDoc.bidSubmissionId || 'submission_default';

      // 3. Detect conflicts
      const drafts = conflictDetectorService.detectConflicts(
        resolvedTenderId,
        bidderId,
        resolvedSubmissionId,
        evidenceList
      );

      // 4. Save conflicts idempotently
      const savedConflicts: any[] = [];
      for (const draft of drafts) {
        const saved = await this.repository.saveConflict(draft);
        savedConflicts.push(saved);

        await auditService.log(AuditEventType.CONFLICT_DETECTED, {
          tenderId: draft.tenderId,
          bidderId: draft.bidderId,
          submissionId: draft.bidSubmissionId,
          actor: 'system_contradiction_engine',
          metadata: {
            conflictId: saved.id,
            conflictType: draft.conflictType,
            severity: draft.severity,
            fieldKey: draft.fieldKey,
            fingerprint: draft.fingerprint,
          },
        });
      }

      // 5. Log detection completed
      await auditService.log(AuditEventType.CONFLICT_DETECTION_COMPLETED, {
        bidderId,
        tenderId: resolvedTenderId,
        actor: 'system',
        metadata: { bidderId, detectedCount: savedConflicts.length },
      });

      return {
        bidderId,
        tenderId: resolvedTenderId,
        detectedCount: savedConflicts.length,
        conflicts: savedConflicts,
      };
    } catch (err: any) {
      await auditService.log(AuditEventType.CONFLICT_DETECTION_FAILED, {
        bidderId,
        tenderId,
        actor: 'system',
        metadata: { bidderId, error: err.message },
      });
      throw err;
    }
  }

  async getConflictsForBidder(bidderId: string) {
    return this.repository.listConflictsByBidder(bidderId);
  }

  async getConflictById(id: string) {
    const conflict = await this.repository.getConflictById(id);
    if (!conflict) {
      throw new Error(`EvidenceConflict with ID ${id} not found.`);
    }
    return conflict;
  }

  /**
   * Build auditable Visual Evidence Conflict Graph
   */
  async getConflictGraph(conflictId: string): Promise<ConflictGraphData> {
    const conflict = await this.getConflictById(conflictId);

    const nodes: ConflictGraphNode[] = [];
    const edges: ConflictGraphEdge[] = [];

    // 1. Conflict Node
    const conflictNodeId = `node_conflict_${conflict.id}`;
    nodes.push({
      id: conflictNodeId,
      type: 'CONFLICT',
      label: `${conflict.fieldKey.toUpperCase()} Conflict`,
      sublabel: conflict.conflictType,
      severity: conflict.severity,
      status: conflict.status,
      metadata: {
        description: conflict.description,
        fieldKey: conflict.fieldKey,
        confidence: conflict.confidence,
      },
    });

    // 2. Tender / Requirement Node (if available)
    let requirementNodeId: string | null = null;
    try {
      const evalItem = (
        await evaluationRepository.listEvaluationsByBidder(conflict.bidderId)
      ).find((e) => e.summary.toLowerCase().includes(conflict.fieldKey.toLowerCase()));

      if (evalItem) {
        requirementNodeId = `node_req_${evalItem.requirementId}`;
        nodes.push({
          id: requirementNodeId,
          type: 'REQUIREMENT',
          label: `Requirement ${evalItem.requirementId}`,
          sublabel: evalItem.summary,
        });

        const evalNodeId = `node_eval_${evalItem.id}`;
        nodes.push({
          id: evalNodeId,
          type: 'EVALUATION',
          label: `Evaluation (${evalItem.result})`,
          status: evalItem.result,
        });

        edges.push({
          id: `edge_req_eval_${evalItem.id}`,
          source: requirementNodeId,
          target: evalNodeId,
          label: 'TESTED_BY',
        });

        edges.push({
          id: `edge_eval_cnf_${conflict.id}`,
          source: evalNodeId,
          target: conflictNodeId,
          label: 'CONFLICTS_WITH',
        });
      }
    } catch {}

    // Fallback requirement node if no evaluation matched
    if (!requirementNodeId) {
      requirementNodeId = `node_req_general_${conflict.fieldKey}`;
      nodes.push({
        id: requirementNodeId,
        type: 'REQUIREMENT',
        label: `Requirement: ${conflict.fieldKey}`,
      });
      edges.push({
        id: `edge_req_cnf_${conflict.id}`,
        source: requirementNodeId,
        target: conflictNodeId,
        label: 'CONFLICTS_WITH',
      });
    }

    // 3. Evidence, Document, and Page Nodes
    const items = conflict.items || [];
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const ev = item.evidence || item.sourceSnapshot || {};
      const evId = item.evidenceId || `ev_${index}`;
      const evNodeId = `node_ev_${evId}`;

      const rawVal = item.sourceSnapshot?.rawValue || ev.rawValue || 'N/A';
      const docName = item.sourceSnapshot?.documentName || ev.bidDocument?.originalFilename || 'Bid Document';
      const pageNum = item.sourceSnapshot?.pageNumber || ev.pageNumber || 1;
      const docId = ev.bidDocumentId || `doc_${index}`;

      nodes.push({
        id: evNodeId,
        type: 'EVIDENCE',
        label: `Value: ${rawVal}`,
        sublabel: item.role,
        metadata: {
          rawValue: rawVal,
          sourceText: item.sourceSnapshot?.sourceText || ev.sourceText,
        },
      });

      edges.push({
        id: `edge_cnf_ev_${evId}`,
        source: conflictNodeId,
        target: evNodeId,
        label: 'SUPPORTED_BY',
      });

      const docNodeId = `node_doc_${docId}`;
      if (!nodes.some((n) => n.id === docNodeId)) {
        nodes.push({
          id: docNodeId,
          type: 'DOCUMENT',
          label: docName,
          sublabel: ev.bidDocument?.documentType || 'DOCUMENT',
        });
      }

      const pageNodeId = `node_page_${docId}_${pageNum}`;
      if (!nodes.some((n) => n.id === pageNodeId)) {
        nodes.push({
          id: pageNodeId,
          type: 'PAGE',
          label: `Page ${pageNum}`,
        });

        edges.push({
          id: `edge_doc_page_${docId}_${pageNum}`,
          source: docNodeId,
          target: pageNodeId,
          label: 'LOCATED_ON',
        });
      }

      edges.push({
        id: `edge_ev_page_${evId}`,
        source: evNodeId,
        target: pageNodeId,
        label: 'EXTRACTED_FROM',
      });
    }

    // 4. Feature 1H Investigation Node (if linked)
    if (conflict.investigationId || conflict.investigation) {
      const inv = conflict.investigation || {};
      const invNodeId = `node_inv_${conflict.investigationId || 'active'}`;
      nodes.push({
        id: invNodeId,
        type: 'INVESTIGATION',
        label: 'AI Investigation',
        status: inv.status || 'RUNNING',
        sublabel: inv.recommendation || 'Case Under Investigation',
      });

      edges.push({
        id: `edge_cnf_inv_${conflict.id}`,
        source: conflictNodeId,
        target: invNodeId,
        label: 'INVESTIGATED_BY',
      });
    }

    return { nodes, edges };
  }

  async updateConflictStatus(id: string, dto: UpdateConflictStatusDTO) {
    const conflict = await this.getConflictById(id);

    const updated = await this.repository.updateConflictStatus(id, dto);

    const eventType =
      dto.status === ConflictStatus.RESOLVED
        ? AuditEventType.CONFLICT_RESOLVED
        : dto.status === ConflictStatus.DISMISSED
        ? AuditEventType.CONFLICT_DISMISSED
        : AuditEventType.CONFLICT_REVIEW_STARTED;

    await auditService.log(eventType, {
      tenderId: conflict.tenderId,
      bidderId: conflict.bidderId,
      submissionId: conflict.bidSubmissionId,
      actor: dto.reviewerId || 'procurement_officer',
      metadata: {
        conflictId: id,
        status: dto.status,
        resolution: dto.resolution,
        resolutionReason: dto.resolutionReason,
      },
    });

    return updated;
  }

  /**
   * Connect conflict to Feature 1H AI Investigation Agent
   */
  async startInvestigationForConflict(conflictId: string, requesterId?: string) {
    const conflict = await this.getConflictById(conflictId);

    // Find linked evaluation if present, or create placeholder
    let evalItem = (
      await evaluationRepository.listEvaluationsByBidder(conflict.bidderId)
    ).find((e) => e.summary.toLowerCase().includes(conflict.fieldKey.toLowerCase()));

    if (!evalItem) {
      // Create lightweight evaluation anchor if needed
      evalItem = await evaluationRepository.createEvaluation({
        tenderId: conflict.tenderId,
        bidderId: conflict.bidderId,
        bidSubmissionId: conflict.bidSubmissionId,
        requirementId: `req_${conflict.fieldKey}`,
        ruleId: `rule_${conflict.fieldKey}`,
        result: 'REVIEW' as any,
        reasonCode: 'CONFLICTING_EVIDENCE',
        summary: `Conflicting evidence for ${conflict.fieldKey}`,
        explanation: conflict.description,
      });
    }

    // Trigger Feature 1H Investigation
    const investigation = await investigationService.startInvestigation({
      evaluationId: evalItem.id,
      triggerType: 'MULTI_DOCUMENT_CONFLICT' as any,
      severity: conflict.severity as any,
      question: `Investigate evidence contradiction for ${conflict.fieldKey}: ${conflict.description}`,
      requesterId,
    });

    // Link investigation to conflict
    await this.repository.linkInvestigation(conflict.id, investigation.id);

    await auditService.log(AuditEventType.CONFLICT_INVESTIGATION_STARTED, {
      tenderId: conflict.tenderId,
      bidderId: conflict.bidderId,
      submissionId: conflict.bidSubmissionId,
      actor: requesterId || 'procurement_officer',
      metadata: {
        conflictId: conflict.id,
        investigationId: investigation.id,
      },
    });

    return {
      conflictId: conflict.id,
      investigation,
    };
  }
}

export const conflictService = new ConflictService();
