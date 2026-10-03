import fs from 'node:fs';
import path from 'node:path';
import { ClarificationRequestItem, OfficerNotificationItem } from './officer.types.js';

const PERSISTED_CLARIFICATIONS_FILE = path.resolve(process.cwd(), '.persisted_clarifications.json');

export class OfficerRepository {
  private clarifications = new Map<string, ClarificationRequestItem>();
  private notifications = new Map<string, OfficerNotificationItem>();

  constructor() {
    this.loadClarifications();
    this.seedInitialOfficerData();
  }

  private loadClarifications(): void {
    try {
      if (fs.existsSync(PERSISTED_CLARIFICATIONS_FILE)) {
        const raw = fs.readFileSync(PERSISTED_CLARIFICATIONS_FILE, 'utf8');
        const list: ClarificationRequestItem[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const item of list) {
            this.clarifications.set(item.id, item);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load persisted clarifications, using in-memory state:', err);
    }
  }

  private saveClarifications(): void {
    try {
      const list = Array.from(this.clarifications.values());
      fs.writeFileSync(PERSISTED_CLARIFICATIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save persisted clarifications:', err);
    }
  }

  private seedInitialOfficerData(): void {
    // Seed initial demo notifications
    const initialNotifs: OfficerNotificationItem[] = [
      {
        id: 'notif_off_01',
        title: 'New Bid Submission Received',
        message: 'Larsen & Toubro Heavy Engineering submitted bid for CPCL Infrastructure Procurement.',
        type: 'BID_SUBMITTED',
        tenderId: 'tnd_1789567202603_77g22a',
        bidderName: 'Larsen & Toubro Heavy Engineering Ltd.',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'notif_off_02',
        title: 'Compliance Evaluation Completed',
        message: 'AI compliance engine completed automated check for Tata Projects Ltd. 1 warning flagged.',
        type: 'EVALUATION_DONE',
        tenderId: 'tnd_1789567202603_77g22a',
        bidderName: 'Tata Projects Limited',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'notif_off_03',
        title: 'Upcoming Tender Deadline Warning',
        message: 'CPCL-INFRA-DEMO-2026 submission window closes in 14 days.',
        type: 'DEADLINE_ALERT',
        tenderId: 'tnd_1789567202603_77g22a',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    for (const n of initialNotifs) {
      this.notifications.set(n.id, n);
    }

    // Seed canonical clarification only if not already persisted
    if (this.clarifications.size === 0) {
      const demoClarification: ClarificationRequestItem = {
        id: 'clr_cpcl_001',
        tenderId: 'tnd_1789567202603_77g22a',
        tenderReference: 'CPCL-INFRA-DEMO-2026',
        bidderId: 'bdr_001',
        bidderName: 'Larsen & Toubro Heavy Engineering Ltd.',
        requirementTitle: 'Audited Financial Statements for FY 2023-24',
        subject: 'Clarification regarding CA Attestation Stamp on Schedule 3',
        question: 'Please submit a clarified legible copy of Schedule 3 with CA UDIN verification number visible.',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'RESPONDED',
        bidderResponse: 'Uploaded revised signed document with active UDIN verification (Ref: UDIN2418049281).',
        responseSubmittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        officerId: 'usr_officer_demo_01',
        officerName: 'Senior Procurement Officer (GeM)',
      };
      this.clarifications.set(demoClarification.id, demoClarification);
      this.saveClarifications();
    }
  }

  async listClarifications(filters?: { tenderId?: string; bidderId?: string; status?: string }): Promise<ClarificationRequestItem[]> {
    let items = Array.from(this.clarifications.values());
    if (filters?.tenderId) {
      items = items.filter((c) => c.tenderId === filters.tenderId);
    }
    if (filters?.bidderId) {
      items = items.filter((c) => c.bidderId === filters.bidderId);
    }
    if (filters?.status) {
      items = items.filter((c) => c.status === filters.status);
    }
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listClarificationsForBidder(bidderIds: string[], applicationIds?: string[]): Promise<ClarificationRequestItem[]> {
    const bSet = new Set(bidderIds);
    const aSet = new Set(applicationIds || []);

    return Array.from(this.clarifications.values())
      .filter((c) => bSet.has(c.bidderId) || (c.applicationId && aSet.has(c.applicationId)))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findClarificationById(id: string): Promise<ClarificationRequestItem | null> {
    return this.clarifications.get(id) || null;
  }

  async createClarification(item: ClarificationRequestItem): Promise<ClarificationRequestItem> {
    this.clarifications.set(item.id, item);
    this.saveClarifications();
    return item;
  }

  async updateClarification(id: string, patch: Partial<ClarificationRequestItem>): Promise<ClarificationRequestItem | null> {
    const existing = this.clarifications.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    this.clarifications.set(id, updated);
    this.saveClarifications();
    return updated;
  }

  async listNotifications(): Promise<OfficerNotificationItem[]> {
    return Array.from(this.notifications.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async markNotificationRead(id: string): Promise<boolean> {
    const notif = this.notifications.get(id);
    if (!notif) return false;
    notif.read = true;
    this.notifications.set(id, notif);
    return true;
  }

  async markAllNotificationsRead(): Promise<void> {
    for (const notif of this.notifications.values()) {
      notif.read = true;
      this.notifications.set(notif.id, notif);
    }
  }

  async addNotification(notif: OfficerNotificationItem): Promise<OfficerNotificationItem> {
    this.notifications.set(notif.id, notif);
    return notif;
  }
}

export const officerRepository = new OfficerRepository();
