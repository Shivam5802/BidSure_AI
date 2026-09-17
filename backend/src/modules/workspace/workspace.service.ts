import { workspaceRepository, WorkspaceRepository } from './workspace.repository.js';
import { MatrixQueryDTO } from './workspace.types.js';

export class WorkspaceService {
  private repository: WorkspaceRepository;

  constructor() {
    this.repository = workspaceRepository;
  }

  async getWorkspaceSummary(tenderId: string) {
    return this.repository.getTenderWorkspaceSummary(tenderId);
  }

  async getComplianceMatrix(tenderId: string, query: MatrixQueryDTO) {
    return this.repository.getTenderComplianceMatrix(tenderId, query);
  }

  async getPriorityActions(tenderId: string, query: any) {
    const summary = await this.repository.getTenderWorkspaceSummary(tenderId);
    let actions = summary.actions;

    if (query.priority && query.priority !== 'ALL') {
      actions = actions.filter((a) => a.priority === query.priority);
    }
    if (query.bidderId) {
      actions = actions.filter((a) => a.bidderId === query.bidderId);
    }
    if (query.type) {
      actions = actions.filter((a) => a.type === query.type);
    }

    return actions;
  }

  async getWhyExplanation(tenderId: string, requirementId: string, bidderId: string) {
    return this.repository.getRequirementWhyExplanation(tenderId, requirementId, bidderId);
  }

  async searchWorkspace(tenderId: string, searchQuery: string) {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return { requirements: [], bidders: [], conflicts: [], evidence: [] };
    }

    const summary = await this.repository.getTenderWorkspaceSummary(tenderId);

    const bidders = summary.bidderSummary.filter(
      (b) => b.legalName.toLowerCase().includes(q) || b.bidderCode.toLowerCase().includes(q)
    );

    const matrix = await this.repository.getTenderComplianceMatrix(tenderId, { search: q });

    return {
      query: searchQuery,
      bidders,
      requirements: matrix.items,
      recentActivity: summary.recentActivity.filter(
        (a) => a.event.toLowerCase().includes(q) || a.actor.toLowerCase().includes(q)
      ),
    };
  }
}

export const workspaceService = new WorkspaceService();
