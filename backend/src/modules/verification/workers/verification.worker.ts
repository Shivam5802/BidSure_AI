import { VerificationService } from '../services/verification.service.js';

export interface VerificationJobData {
  requestId: string;
}

export class VerificationWorker {
  constructor(private verificationService: VerificationService) {}

  /**
   * Process a single verification job asynchronously
   */
  async processJob(jobData: VerificationJobData): Promise<void> {
    const { requestId } = jobData;
    if (!requestId) {
      throw new Error('VerificationJobData missing requestId');
    }

    await this.verificationService.executeVerificationRequest(requestId);
  }
}
