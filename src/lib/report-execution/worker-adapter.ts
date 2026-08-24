import type { ReportExecutionRequest } from './report-execution-contract';
import { InMemoryReportQueue, type ReportQueueJob } from './queue';

export interface ReportWorkerAdapter { claim(workerId: string): ReportQueueJob | undefined; heartbeat(runId: string, workerId: string): void; complete(runId: string, workerId: string): void; fail(runId: string, workerId: string, error: string): ReportQueueJob; }

export class TrustedReportWorkerAdapter implements ReportWorkerAdapter {
  constructor(private readonly queue: InMemoryReportQueue) {}
  claim(workerId: string): ReportQueueJob | undefined { return this.queue.claim(workerId); }
  heartbeat(runId: string, workerId: string): void { this.queue.heartbeat(runId, workerId); }
  complete(runId: string, workerId: string): void { this.queue.complete(runId, workerId); }
  fail(runId: string, workerId: string, error: string): ReportQueueJob { return this.queue.fail(runId, workerId, error); }
  static validateRequest(request: ReportExecutionRequest): void {
    if (!request.tenantId || !request.idempotencyKey || !request.sourceSnapshotId) throw new Error('Worker adapter requires tenant, idempotency and source snapshot context');
  }
}
