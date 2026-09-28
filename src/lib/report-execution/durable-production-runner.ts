import type { ReportExecutionCheckpoint, ReportExecutionStage } from './checkpoint';
import type { ReportExecutionRequest } from './report-execution-contract';
import type { RowVersion } from '../production-intelligence';
import { SupabaseReportExecutionStore } from './durable-worker-adapter';
import { runProductionLifecycle, assertProductionCheckpoint, type ProductionLifecycleInput } from './production-coordinator-bridge';

const ORDER: ReportExecutionStage[] = ['queued', 'fingerprinted', 'extracted', 'canonicalized', 'validated', 'analyzed', 'decisioned', 'committed', 'rendered'];
const next = (s: ReportExecutionStage): ReportExecutionStage | null => { const i = ORDER.indexOf(s); return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : null; };

export interface DurableSourceSnapshot<T = unknown> {
  sourceHash: string;
  rows: Array<Record<string, unknown>>;
  currentRows: RowVersion<T>[];
}

export interface DurableProductionRunInput<T = unknown> {
  jobId: string;
  request: ReportExecutionRequest;
  workerId: string;
  sourceHash: string;
  rows: Array<Record<string, unknown>>;
  lifecycle: Omit<ProductionLifecycleInput<T>, 'jobId' | 'companyId' | 'sourceHash' | 'currentRows'> & { currentRows: ProductionLifecycleInput<T>['currentRows'] };
  executeStage?: (stage: ReportExecutionStage, input: { request: ReportExecutionRequest; rows: Array<Record<string, unknown>> }) => Promise<void>;
  loadSourceSnapshot?: (input: { request: ReportExecutionRequest; expectedSourceHash: string; sourceSnapshotId: string }) => Promise<DurableSourceSnapshot<T>>;
  leaseSeconds?: number;
  heartbeatIntervalMs?: number;
}

export async function runDurableProductionLifecycle<T>(input: DurableProductionRunInput<T>, store: SupabaseReportExecutionStore) {
  const leaseSeconds = input.leaseSeconds ?? 300;
  const heartbeatIntervalMs = input.heartbeatIntervalMs ?? Math.max(30_000, Math.floor((leaseSeconds * 1000) / 3));
  const tenantId = input.request.tenantId;
  if (!tenantId) throw new Error('Durable production execution requires a tenant context');
  const job = await store.claim(input.jobId, input.workerId, leaseSeconds, tenantId);
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
  let activeTask: ReportExecutionStage | null = null;

  try {
    if (job.tenantId !== tenantId) throw new Error('Tenant mismatch for durable production execution');
    if (!input.sourceHash.trim()) throw new Error('Durable production execution requires a non-empty source hash');
    if (job.checkpoint.sourceHash && job.checkpoint.sourceHash !== input.sourceHash) throw new Error('Source hash changed during resumable execution');
    assertProductionCheckpoint(job.checkpoint);

    if (input.loadSourceSnapshot && !input.request.sourceSnapshotId?.trim()) throw new Error('Source snapshot loader requires sourceSnapshotId');
    const source = input.loadSourceSnapshot
      ? await input.loadSourceSnapshot({ request: input.request, expectedSourceHash: input.sourceHash, sourceSnapshotId: input.request.sourceSnapshotId! })
      : { sourceHash: input.sourceHash, rows: input.rows, currentRows: input.lifecycle.currentRows };
    if (!source.sourceHash.trim()) throw new Error('Source snapshot loader returned an empty source hash');
    if (source.sourceHash !== input.sourceHash) throw new Error('Loaded source snapshot hash does not match the durable job');
    if (!source.currentRows.length) throw new Error('Loaded source snapshot contains no authoritative current rows');
    const sourceRows = source.rows;

    let heartbeatFailure: unknown = null;
    heartbeatTimer = setInterval(() => {
      void store.heartbeat(input.jobId, input.workerId, leaseSeconds, tenantId).catch((error) => { heartbeatFailure ??= error; });
    }, heartbeatIntervalMs);

    const buildCheckpoint = (nextStage: ReportExecutionStage): ReportExecutionCheckpoint => ({ ...job.checkpoint, sourceHash: input.sourceHash, stage: nextStage, updatedAt: Date.now() });
    let stage = job.checkpoint.stage;
    while (stage !== 'rendered') {
      if (heartbeatFailure) throw heartbeatFailure;
      const following = next(stage);
      if (!following) throw new Error(`Cannot advance production lifecycle from ${stage}`);
      activeTask = following;
      await store.startTask(input.jobId, input.workerId, job.leaseToken!, following, tenantId);
      if (input.executeStage) await input.executeStage(following, { request: input.request, rows: sourceRows });
      if (heartbeatFailure) throw heartbeatFailure;
      const checkpoint = buildCheckpoint(following);
      await store.saveCheckpoint(input.jobId, checkpoint, input.workerId, tenantId);
      await store.completeTask(input.jobId, input.workerId, job.leaseToken!, following, {
        stage: following, checkpoint, rowCount: sourceRows.length, observedAt: new Date().toISOString(),
      }, tenantId);
      activeTask = null;
      stage = following;
    }

    const lifecycle = runProductionLifecycle({
      ...input.lifecycle,
      jobId: input.jobId,
      companyId: tenantId,
      sourceHash: input.sourceHash,
      currentRows: source.currentRows,
    });
    await store.complete(input.jobId, input.workerId, {
      sourceHash: input.sourceHash,
      sourceSnapshotId: input.request.sourceSnapshotId ?? null,
      sourceRowCount: sourceRows.length,
      authoritativeCurrentRowCount: source.currentRows.length,
      lineageCount: lifecycle.lineage.length,
      scenario: lifecycle.scenario,
      portfolio: lifecycle.portfolio,
      autonomy: lifecycle.autonomy,
    }, tenantId);
    return lifecycle;
  } catch (error) {
    const failure = { message: error instanceof Error ? error.message : String(error), stage: activeTask };
    try {
      if (activeTask && job.leaseToken) {
        await store.failTask(input.jobId, input.workerId, job.leaseToken, activeTask, failure, tenantId);
      }
      await store.fail(input.jobId, input.workerId, failure, tenantId);
      if (job.attempt < job.maxAttempts) await store.retry(input.jobId, tenantId);
    } catch (failureError) {
      throw new AggregateError([error, failureError], 'Durable execution failed and failure/recovery state could not be persisted');
    }
    throw error;
  } finally {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  }
}
