import type { ReportExecutionCheckpoint, ReportExecutionStage } from './checkpoint';
import type { ReportExecutionRequest } from './report-execution-contract';
import { SupabaseReportExecutionStore } from './durable-worker-adapter';
import { runProductionLifecycle, assertProductionCheckpoint, type ProductionLifecycleInput } from './production-coordinator-bridge';

const ORDER: ReportExecutionStage[] = ['queued', 'fingerprinted', 'extracted', 'canonicalized', 'validated', 'analyzed', 'decisioned', 'committed', 'rendered'];
const next = (s: ReportExecutionStage): ReportExecutionStage | null => { const i = ORDER.indexOf(s); return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : null; };

export interface DurableProductionRunInput<T = unknown> {
  jobId: string;
  request: ReportExecutionRequest;
  workerId: string;
  sourceHash: string;
  rows: Array<Record<string, unknown>>;
  lifecycle: Omit<ProductionLifecycleInput<T>, 'jobId' | 'companyId' | 'sourceHash' | 'currentRows'> & { currentRows: ProductionLifecycleInput<T>['currentRows'] };
  executeStage?: (stage: ReportExecutionStage, input: { request: ReportExecutionRequest; rows: Array<Record<string, unknown>> }) => Promise<void>;
  leaseSeconds?: number;
  heartbeatIntervalMs?: number;
}

export async function runDurableProductionLifecycle<T>(input: DurableProductionRunInput<T>, store: SupabaseReportExecutionStore) {
  const leaseSeconds = input.leaseSeconds ?? 300;
  const heartbeatIntervalMs = input.heartbeatIntervalMs ?? Math.max(30_000, Math.floor((leaseSeconds * 1000) / 3));
  const job = await store.claim(input.jobId, input.workerId, leaseSeconds);
  if (job.tenantId !== input.request.tenantId) throw new Error('Tenant mismatch for durable production execution');
  if (job.checkpoint.sourceHash && job.checkpoint.sourceHash !== input.sourceHash) throw new Error('Source hash changed during resumable execution');
  assertProductionCheckpoint(job.checkpoint);

  let heartbeatFailure: unknown = null;
  const heartbeatTimer = setInterval(() => {
    void store.heartbeat(input.jobId, input.workerId, leaseSeconds).catch((error) => { heartbeatFailure ??= error; });
  }, heartbeatIntervalMs);

  try {
    const checkpoint = (stage: ReportExecutionStage): ReportExecutionCheckpoint => ({ ...job.checkpoint, sourceHash: input.sourceHash, stage, updatedAt: Date.now() });
    let stage = job.checkpoint.stage;
    while (stage !== 'rendered') {
      if (heartbeatFailure) throw heartbeatFailure;
      const following = next(stage);
      if (!following) throw new Error(`Cannot advance production lifecycle from ${stage}`);
      if (input.executeStage) await input.executeStage(following, { request: input.request, rows: input.rows });
      if (heartbeatFailure) throw heartbeatFailure;
      await store.saveCheckpoint(input.jobId, checkpoint(following), input.workerId);
      stage = following;
    }

    const lifecycle = runProductionLifecycle({
      ...input.lifecycle,
      jobId: input.jobId,
      companyId: input.request.tenantId,
      sourceHash: input.sourceHash,
      currentRows: input.lifecycle.currentRows,
    });
    await store.complete(input.jobId, input.workerId, {
      sourceHash: input.sourceHash,
      lineageCount: lifecycle.lineage.length,
      scenario: lifecycle.scenario,
      portfolio: lifecycle.portfolio,
      autonomy: lifecycle.autonomy,
    });
    return lifecycle;
  } catch (error) {
    await store.fail(input.jobId, input.workerId, { message: error instanceof Error ? error.message : String(error) });
    throw error;
  } finally {
    clearInterval(heartbeatTimer);
  }
}