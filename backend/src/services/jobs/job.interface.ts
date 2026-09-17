/**
 * Background Job Queue Abstraction for BidGuard AI
 * Prepares the architecture for Redis + BullMQ asynchronous processing.
 */

export interface JobOptions {
  priority?: number;
  delayMs?: number;
  attempts?: number;
}

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

export interface JobState<TData = unknown, TResult = unknown> {
  id: string;
  queueName: string;
  name: string;
  data: TData;
  status: JobStatus;
  progress?: number;
  result?: TResult;
  error?: string;
  createdAt: Date;
}

export interface JobQueueService {
  /**
   * Enqueue a job for background processing
   */
  enqueue<TData>(
    queueName: string,
    jobName: string,
    data: TData,
    options?: JobOptions
  ): Promise<string>;

  /**
   * Retrieve current status of a job
   */
  getJobStatus(queueName: string, jobId: string): Promise<JobState | null>;

  /**
   * Healthcheck for job queue connection
   */
  isHealthy(): Promise<boolean>;
}

/**
 * Stub implementation for Phase 0 (in-memory simulation)
 */
export class StubJobQueueService implements JobQueueService {
  private jobs = new Map<string, JobState>();

  async enqueue<TData>(
    queueName: string,
    jobName: string,
    data: TData
  ): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const jobState: JobState<TData> = {
      id,
      queueName,
      name: jobName,
      data,
      status: 'waiting',
      progress: 0,
      createdAt: new Date(),
    };
    this.jobs.set(`${queueName}:${id}`, jobState as JobState);
    return id;
  }

  async getJobStatus(queueName: string, jobId: string): Promise<JobState | null> {
    return this.jobs.get(`${queueName}:${jobId}`) || null;
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }
}
