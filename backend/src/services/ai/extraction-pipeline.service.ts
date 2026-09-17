import {
  BlueprintStatus,
  MandatoryStatus,
  RequirementCategory,
  RequirementStatus,
  RuleType,
  AuditEventType,
} from '@prisma/client';
import { tenderRepository } from '../../modules/tenders/tender.repository.js';
import { requirementRepository } from '../../modules/requirements/requirement.repository.js';
import { chunkerService } from './chunker.service.js';
import { LLMFactory } from './llm.factory.js';
import { ambiguityEngineService } from './ambiguity-engine.service.js';
import { conflictEngineService } from './conflict-engine.service.js';
import { duplicateEngineService } from './duplicate-engine.service.js';
import { auditService } from '../audit/audit.service.js';

export interface ExtractionJobResult {
  jobId: string;
  blueprintId: string;
  blueprintVersion: number;
  totalExtracted: number;
  draftCount: number;
  reviewCount: number;
  conflictCount: number;
  duplicateCount: number;
  warnings: string[];
}

export class ExtractionPipelineService {
  /**
   * Runs asynchronous requirement extraction for a tender.
   */
  async runExtraction(tenderId: string): Promise<ExtractionJobResult> {
    const tender = await tenderRepository.findTenderById(tenderId);
    if (!tender) {
      throw new Error(`Tender with ID ${tenderId} not found`);
    }

    await auditService.log(AuditEventType.REQUIREMENT_EXTRACTION_STARTED, {
      tenderId,
      metadata: { title: tender.title },
    });

    // 1. Fetch documents with pages and evidence blocks
    const documents = await tenderRepository.listDocumentsByTender(tenderId);
    if (documents.length === 0) {
      throw new Error(`Tender ${tenderId} has no uploaded documents for extraction`);
    }

    const fullDocs = [];
    for (const doc of documents) {
      const fullDoc = await tenderRepository.getDocumentWithPages(doc.id);
      if (fullDoc) {
        fullDocs.push(fullDoc);
      }
    }

    // 2. Intelligent Chunking
    const chunks = chunkerService.prepareChunks(fullDocs);
    if (chunks.length === 0) {
      throw new Error(`No extractable text content found in tender ${tenderId}`);
    }

    // 3. LLM Provider Execution
    const llmProvider = LLMFactory.getProvider();
    const rawResult = await llmProvider.extractRequirements({
      tenderId: tender.id,
      tenderTitle: tender.title,
      referenceNumber: tender.referenceNumber,
      chunks,
    });

    const rawRequirements = rawResult.requirements;

    // 4. Run Analysis Engines: Ambiguity, Conflicts, Duplicates
    const conflicts = conflictEngineService.detectConflicts(rawRequirements);
    const duplicates = duplicateEngineService.detectDuplicates(rawRequirements);

    // 5. Version & Create ComplianceBlueprint
    const existingVersions = await requirementRepository.getBlueprintVersions(tenderId);
    const nextVersion = existingVersions.length > 0 ? Math.max(...existingVersions.map((v) => v.version)) + 1 : 1;

    const blueprint = await requirementRepository.createBlueprint({
      tenderId,
      version: nextVersion,
      status: BlueprintStatus.DRAFT,
    });

    // 6. Map and Persist Requirements
    let draftCount = 0;
    let reviewCount = 0;
    let conflictCount = 0;
    let duplicateCount = 0;

    const reqIdMap: Record<number, string> = {};

    for (let i = 0; i < rawRequirements.length; i++) {
      const req = rawRequirements[i]!;

      // Ambiguity check
      const ambEval = ambiguityEngineService.evaluate(req);
      const conflictEval = conflicts[i]!;
      const dupEval = duplicates[i]!;

      const isAmbiguous = ambEval.ambiguityFlag;
      const isConflict = conflictEval.conflictFlag;
      const isDuplicate = dupEval.duplicateFlag;

      let initialStatus: RequirementStatus = RequirementStatus.DRAFT;
      if (isConflict) {
        initialStatus = RequirementStatus.CONFLICT;
        conflictCount++;
      } else if (isAmbiguous || isDuplicate || req.confidence < 0.85) {
        initialStatus = RequirementStatus.REVIEW;
        reviewCount++;
      } else {
        draftCount++;
      }

      if (isDuplicate) duplicateCount++;

      const reqCode = `R-${String(i + 1).padStart(3, '0')}`;

      const savedReq = await requirementRepository.createRequirement({
        blueprintId: blueprint.id,
        requirementCode: reqCode,
        clauseReference: req.clauseReference,
        requirementText: req.requirementText,
        normalizedRequirementText: req.normalizedRequirementText,
        category: req.category as RequirementCategory,
        mandatory: req.mandatory as MandatoryStatus,
        condition: req.condition,
        evidenceRequired: req.evidenceRequired,
        verificationSource: req.verificationSource,
        ruleType: req.ruleCandidate ? (req.ruleCandidate.type as RuleType) : null,
        ruleParameters: req.ruleCandidate ? req.ruleCandidate.parameters : undefined,
        extractionConfidence: req.confidence,
        status: initialStatus,
        ambiguityFlag: isAmbiguous,
        ambiguityReason: ambEval.ambiguityReason,
        conflictFlag: isConflict,
        conflictReason: conflictEval.conflictReason,
        duplicateFlag: isDuplicate,
        aiExplanation: req.explanation,
        sourcePageIds: req.sourceReferences.map((sr) => `page_${sr.pageNumber}`),
        sourceEvidenceBlockIds: req.sourceReferences.map((sr) => sr.evidenceBlockId).filter(Boolean) as string[],
      });

      reqIdMap[i] = savedReq.id;

      // Persist source references
      for (const sr of req.sourceReferences) {
        await requirementRepository.createSourceReference({
          requirementId: savedReq.id,
          documentId: sr.documentId,
          pageNumber: sr.pageNumber,
          evidenceBlockId: sr.evidenceBlockId,
        });
      }
    }

    // Second pass to resolve duplicateOfRequirementId
    for (let i = 0; i < rawRequirements.length; i++) {
      const dupEval = duplicates[i]!;
      if (dupEval.duplicateFlag && dupEval.duplicateOfIndex !== undefined && reqIdMap[i]) {
        const primaryReqId = reqIdMap[dupEval.duplicateOfIndex];
        if (primaryReqId) {
          await requirementRepository.updateRequirement(reqIdMap[i]!, {
            duplicateOfRequirementId: primaryReqId,
          });
        }
      }
    }

    // Update Blueprint Status
    const finalBlueprintStatus =
      conflictCount > 0 || reviewCount > 0 ? BlueprintStatus.UNDER_REVIEW : BlueprintStatus.DRAFT;
    await requirementRepository.updateBlueprintStatus(blueprint.id, finalBlueprintStatus);

    // Audit Log
    await auditService.log(AuditEventType.REQUIREMENT_EXTRACTED, {
      tenderId,
      metadata: {
        blueprintId: blueprint.id,
        version: nextVersion,
        totalExtracted: rawRequirements.length,
        draftCount,
        reviewCount,
        conflictCount,
        duplicateCount,
      },
    });

    await auditService.log(AuditEventType.BLUEPRINT_CREATED, {
      tenderId,
      metadata: {
        blueprintId: blueprint.id,
        version: nextVersion,
      },
    });

    return {
      jobId: `job_req_${Date.now()}`,
      blueprintId: blueprint.id,
      blueprintVersion: nextVersion,
      totalExtracted: rawRequirements.length,
      draftCount,
      reviewCount,
      conflictCount,
      duplicateCount,
      warnings: rawResult.warnings,
    };
  }
}

export const extractionPipelineService = new ExtractionPipelineService();
