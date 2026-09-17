import {
  ComplianceEvaluation,
  ComplianceEvaluationRun,
  EvaluationStatus,
  ApplicabilityStatus,
  EvaluationRunStatus,
} from '@prisma/client';

export interface CreateEvaluationInput {
  tenderId: string;
  bidderId: string;
  bidSubmissionId: string;
  requirementId: string;
  ruleId: string;
  ruleVersion?: number;
  result: EvaluationStatus;
  applicability?: ApplicabilityStatus;
  reasonCode: string;
  summary: string;
  explanation: string;
  calculationTrace?: any;
  inputSnapshot?: any;
  outputSnapshot?: any;
  evidenceSnapshot?: any;
  engineVersion?: string;
  schemaVersion?: string;
  evaluatedBy?: string;
  version?: number;
}

export interface CreateEvaluationRunInput {
  tenderId: string;
  bidderId: string;
  bidSubmissionId: string;
  engineVersion?: string;
  createdBy?: string;
}

export class EvaluationRepository {
  private evaluations = new Map<string, ComplianceEvaluation>();
  private runs = new Map<string, ComplianceEvaluationRun>();
  private history = new Map<string, ComplianceEvaluation[]>();

  // --- EVALUATIONS ---
  async createEvaluation(input: CreateEvaluationInput): Promise<ComplianceEvaluation> {
    const id = `evl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const existing = Array.from(this.evaluations.values()).find(
      (e) =>
        e.requirementId === input.requirementId &&
        e.bidderId === input.bidderId &&
        e.bidSubmissionId === input.bidSubmissionId &&
        e.version === (input.version || 1)
    );

    const version = input.version || (existing ? existing.version + 1 : 1);

    const evalRecord: ComplianceEvaluation = {
      id,
      tenderId: input.tenderId,
      bidderId: input.bidderId,
      bidSubmissionId: input.bidSubmissionId,
      requirementId: input.requirementId,
      ruleId: input.ruleId,
      ruleVersion: input.ruleVersion || 1,
      result: input.result,
      applicability: input.applicability || ApplicabilityStatus.APPLICABLE,
      reasonCode: input.reasonCode,
      summary: input.summary,
      explanation: input.explanation,
      calculationTrace: input.calculationTrace || null,
      inputSnapshot: input.inputSnapshot || null,
      outputSnapshot: input.outputSnapshot || null,
      evidenceSnapshot: input.evidenceSnapshot || null,
      engineVersion: input.engineVersion || '1.0.0',
      schemaVersion: input.schemaVersion || '1.0',
      evaluatedAt: new Date(),
      evaluatedBy: input.evaluatedBy || 'SYSTEM',
      version,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.evaluations.set(id, evalRecord);

    const histKey = `${input.requirementId}:${input.bidderId}:${input.bidSubmissionId}`;
    const hist = this.history.get(histKey) || [];
    hist.push({ ...evalRecord });
    this.history.set(histKey, hist);

    return evalRecord;
  }

  async findEvaluationById(id: string): Promise<ComplianceEvaluation | null> {
    return this.evaluations.get(id) || null;
  }

  async listEvaluationsByTender(tenderId: string): Promise<ComplianceEvaluation[]> {
    const list: ComplianceEvaluation[] = [];
    for (const e of this.evaluations.values()) {
      if (e.tenderId === tenderId) {
        list.push(e);
      }
    }
    return list;
  }

  async listEvaluationsByBidder(bidderId: string): Promise<ComplianceEvaluation[]> {
    const list: ComplianceEvaluation[] = [];
    for (const e of this.evaluations.values()) {
      if (e.bidderId === bidderId) {
        list.push(e);
      }
    }
    // Sort by latest version per requirement
    return list.sort((a, b) => b.evaluatedAt.getTime() - a.evaluatedAt.getTime());
  }

  async getLatestEvaluationsByBidder(bidderId: string): Promise<ComplianceEvaluation[]> {
    const map = new Map<string, ComplianceEvaluation>();
    for (const e of this.evaluations.values()) {
      if (e.bidderId === bidderId) {
        const existing = map.get(e.requirementId);
        if (!existing || e.version > existing.version) {
          map.set(e.requirementId, e);
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.requirementId.localeCompare(b.requirementId));
  }

  async listEvaluationsByRequirement(requirementId: string, bidderId?: string): Promise<ComplianceEvaluation[]> {
    const list: ComplianceEvaluation[] = [];
    for (const e of this.evaluations.values()) {
      if (e.requirementId === requirementId) {
        if (!bidderId || e.bidderId === bidderId) {
          list.push(e);
        }
      }
    }
    return list.sort((a, b) => b.version - a.version);
  }

  async getEvaluationHistory(requirementId: string, bidderId: string): Promise<ComplianceEvaluation[]> {
    const list = Array.from(this.evaluations.values()).filter(
      (e) => e.requirementId === requirementId && e.bidderId === bidderId
    );
    return list.sort((a, b) => a.version - b.version);
  }

  // --- EVALUATION RUNS ---
  async createEvaluationRun(input: CreateEvaluationRunInput): Promise<ComplianceEvaluationRun> {
    const id = `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const run: ComplianceEvaluationRun = {
      id,
      tenderId: input.tenderId,
      bidderId: input.bidderId,
      bidSubmissionId: input.bidSubmissionId,
      status: EvaluationRunStatus.QUEUED,
      totalRequirements: 0,
      passCount: 0,
      failCount: 0,
      reviewCount: 0,
      notEvaluableCount: 0,
      notApplicableCount: 0,
      engineVersion: input.engineVersion || '1.0.0',
      error: null,
      startedAt: new Date(),
      completedAt: null,
      createdBy: input.createdBy || 'procurement_officer',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.runs.set(id, run);
    return run;
  }

  async findEvaluationRunById(id: string): Promise<ComplianceEvaluationRun | null> {
    return this.runs.get(id) || null;
  }

  async updateEvaluationRun(
    id: string,
    update: {
      status?: EvaluationRunStatus;
      totalRequirements?: number;
      passCount?: number;
      failCount?: number;
      reviewCount?: number;
      notEvaluableCount?: number;
      notApplicableCount?: number;
      error?: string | null;
      completed?: boolean;
    }
  ): Promise<ComplianceEvaluationRun> {
    const run = await this.findEvaluationRunById(id);
    if (!run) throw new Error(`Evaluation run ${id} not found`);

    const updated: ComplianceEvaluationRun = {
      ...run,
      ...(update.status !== undefined && { status: update.status }),
      ...(update.totalRequirements !== undefined && { totalRequirements: update.totalRequirements }),
      ...(update.passCount !== undefined && { passCount: update.passCount }),
      ...(update.failCount !== undefined && { failCount: update.failCount }),
      ...(update.reviewCount !== undefined && { reviewCount: update.reviewCount }),
      ...(update.notEvaluableCount !== undefined && { notEvaluableCount: update.notEvaluableCount }),
      ...(update.notApplicableCount !== undefined && { notApplicableCount: update.notApplicableCount }),
      ...(update.error !== undefined && { error: update.error }),
      ...(update.completed && { completedAt: new Date() }),
      updatedAt: new Date(),
    };

    this.runs.set(id, updated);
    return updated;
  }

  async clear(): Promise<void> {
    this.evaluations.clear();
    this.runs.clear();
    this.history.clear();
  }
}

const globalForEvaluationRepo = globalThis as unknown as { evaluationRepository: EvaluationRepository };
export const evaluationRepository = globalForEvaluationRepo.evaluationRepository || new EvaluationRepository();
if (process.env.NODE_ENV !== 'production') globalForEvaluationRepo.evaluationRepository = evaluationRepository;
