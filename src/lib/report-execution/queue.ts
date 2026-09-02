import type { ReportExecutionRequest, ReportJobStatus } from './report-execution-contract.ts';
import { assertExecutionRequest } from './report-execution-contract.ts';

export interface ReportQueueJob {
  runId: string;
  request: ReportExecutionRequest;
  status: ReportJobStatus;
  attempts: number;
  maxAttempts: number;
  leaseOwner?: string;
  leaseToken?: string;
  leaseExpiresAt?: number;
  createdAt: number;
  updatedAt: number;
  lastError?: string;
}

export class InMemoryReportQueue {
  private readonly jobs = new Map<string, ReportQueueJob>();
  private readonly idempotency = new Map<string, string>();

  enqueue(request: ReportExecutionRequest, runId: string, maxAttempts = 3): ReportQueueJob {
    assertExecutionRequest(request);
    if (maxAttempts < 1) throw new Error('maxAttempts must be positive');
    const key = `${request.tenantId}:${request.idempotencyKey}`;
    const existingRunId = this.idempotency.get(key);
    if (existingRunId) {
      const existing = this.jobs.get(existingRunId);
      if (existing) return cloneJob(existing);
      throw new Error('Idempotency registry points to a missing report job');
    }
    if (this.jobs.has(runId)) throw new Error(`Report run already exists: ${runId}`);
    const now = Date.now();
    const job: ReportQueueJob = { runId, request: cloneRequest(request), status: 'queued', attempts: 0, maxAttempts, createdAt: now, updatedAt: now };
    this.jobs.set(runId, job);
    this.idempotency.set(key, runId);
    return cloneJob(job);
  }

  claim(workerId: string, leaseMs = 60_000): ReportQueueJob | undefined {
    if (!workerId) throw new Error('workerId is required');
    if (leaseMs <= 0) throw new Error('leaseMs must be positive');
    const now = Date.now();
    for (const job of this.jobs.values()) {
      const leaseExpired = !job.leaseExpiresAt || job.leaseExpiresAt <= now;
      if ((job.status === 'queued' || (job.status === 'running' && leaseExpired)) && job.attempts < job.maxAttempts) {
        job.status = 'running';
        job.attempts += 1;
        job.leaseOwner = workerId;
        job.leaseToken = `${runIdToken(job.runId)}:${job.attempts}:${now}`;
        job.leaseExpiresAt = now + leaseMs;
        job.updatedAt = now;
        return cloneJob(job);
      }
    }
    return undefined;
  }

  heartbeat(runId: string, workerId: string, leaseToken: string, leaseMs = 60_000): void {
    const job = this.require(runId);
    this.assertLease(job, workerId, leaseToken);
    if (leaseMs <= 0) throw new Error('leaseMs must be positive');
    const now = Date.now();
    job.leaseExpiresAt = now + leaseMs;
    job.updatedAt = now;
  }

  complete(runId: string, workerId: string, leaseToken: string): void { this.transition(runId, workerId, leaseToken, 'succeeded'); }
  cancel(runId: string, workerId: string, leaseToken: string): void { this.transition(runId, workerId, leaseToken, 'cancelled'); }

  fail(runId: string, workerId: string, leaseToken: string, error: string): ReportQueueJob {
    const job = this.require(runId);
    this.assertLease(job, workerId, leaseToken);
    job.lastError = error;
    job.leaseOwner = undefined;
    job.leaseToken = undefined;
    job.leaseExpiresAt = undefined;
    job.status = job.attempts < job.maxAttempts ? 'queued' : 'failed';
    job.updatedAt = Date.now();
    return cloneJob(job);
  }

  get(runId: string): ReportQueueJob | undefined { const job = this.jobs.get(runId); return job ? cloneJob(job) : undefined; }
  listDeadLetters(): ReportQueueJob[] { return [...this.jobs.values()].filter(job => job.status === 'failed' && job.attempts >= job.maxAttempts).map(cloneJob); }
  private require(runId: string): ReportQueueJob { const job = this.jobs.get(runId); if (!job) throw new Error(`Report job not found: ${runId}`); return job; }
  private assertLease(job: ReportQueueJob, workerId: string, leaseToken: string): void {
    if (job.status !== 'running' || job.leaseOwner !== workerId || !leaseToken || job.leaseToken !== leaseToken) throw new Error('Report job lease is not owned by worker or fencing token is stale');
    if (!job.leaseExpiresAt || job.leaseExpiresAt <= Date.now()) throw new Error('Report job lease has expired');
  }
  private transition(runId: string, workerId: string, leaseToken: string, status: ReportJobStatus): void {
    const job = this.require(runId);
    this.assertLease(job, workerId, leaseToken);
    job.status = status;
    job.leaseOwner = undefined;
    job.leaseToken = undefined;
    job.leaseExpiresAt = undefined;
    job.updatedAt = Date.now();
  }
}

function cloneRequest(request: ReportExecutionRequest): ReportExecutionRequest {
  return { ...request, parameters: structuredClone(request.parameters), formats: [...request.formats] };
}
function cloneJob(job: ReportQueueJob): ReportQueueJob { return { ...job, request: cloneRequest(job.request) }; }

function runIdToken(runId: string): string {
  let hash = 2166136261;
  for (let i = 0; i < runId.length; i += 1) hash = Math.imul(hash ^ runId.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}