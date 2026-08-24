import type { ReportExecutionRequest, ReportJobStatus } from './report-execution-contract';

export interface ReportQueueJob {
  runId: string;
  request: ReportExecutionRequest;
  status: ReportJobStatus;
  attempts: number;
  maxAttempts: number;
  leaseOwner?: string;
  leaseExpiresAt?: number;
  createdAt: number;
  updatedAt: number;
  lastError?: string;
}

export class InMemoryReportQueue {
  private readonly jobs = new Map<string, ReportQueueJob>();

  enqueue(request: ReportExecutionRequest, runId: string, maxAttempts = 3): ReportQueueJob {
    const now = Date.now();
    const job: ReportQueueJob = { runId, request, status: 'queued', attempts: 0, maxAttempts, createdAt: now, updatedAt: now };
    this.jobs.set(runId, job);
    return job;
  }

  claim(workerId: string, leaseMs = 60_000): ReportQueueJob | undefined {
    const now = Date.now();
    for (const job of this.jobs.values()) {
      const leaseExpired = !job.leaseExpiresAt || job.leaseExpiresAt <= now;
      if ((job.status === 'queued' || (job.status === 'running' && leaseExpired)) && job.attempts < job.maxAttempts) {
        job.status = 'running';
        job.attempts += 1;
        job.leaseOwner = workerId;
        job.leaseExpiresAt = now + leaseMs;
        job.updatedAt = now;
        return { ...job };
      }
    }
    return undefined;
  }

  heartbeat(runId: string, workerId: string, leaseMs = 60_000): void {
    const job = this.require(runId);
    if (job.status !== 'running' || job.leaseOwner !== workerId) throw new Error('Report job lease is not owned by worker');
    job.leaseExpiresAt = Date.now() + leaseMs;
    job.updatedAt = Date.now();
  }

  complete(runId: string, workerId: string): void { this.transition(runId, workerId, 'succeeded'); }
  cancel(runId: string, workerId: string): void { this.transition(runId, workerId, 'cancelled'); }

  fail(runId: string, workerId: string, error: string): ReportQueueJob {
    const job = this.require(runId);
    if (job.status !== 'running' || job.leaseOwner !== workerId) throw new Error('Report job lease is not owned by worker');
    job.lastError = error;
    job.leaseOwner = undefined;
    job.leaseExpiresAt = undefined;
    job.status = job.attempts < job.maxAttempts ? 'queued' : 'failed';
    job.updatedAt = Date.now();
    return { ...job };
  }

  get(runId: string): ReportQueueJob | undefined { const job = this.jobs.get(runId); return job ? { ...job } : undefined; }
  private require(runId: string): ReportQueueJob { const job = this.jobs.get(runId); if (!job) throw new Error(`Report job not found: ${runId}`); return job; }
  private transition(runId: string, workerId: string, status: ReportJobStatus): void {
    const job = this.require(runId);
    if (job.status !== 'running' || job.leaseOwner !== workerId) throw new Error('Report job lease is not owned by worker');
    job.status = status; job.leaseOwner = undefined; job.leaseExpiresAt = undefined; job.updatedAt = Date.now();
  }
}
