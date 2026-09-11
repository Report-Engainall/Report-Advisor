import type { ReportExecutionCheckpoint, ReportExecutionStage } from './checkpoint';
import { advanceCheckpoint, assertValidTransition } from './checkpoint';
import type { ReportExecutionRequest } from './report-execution-contract';
import { SupabaseReportExecutionStore } from './durable-worker-adapter';
import { runProductionLifecycle, assertProductionCheckpoint, type ProductionLifecycleInput, type ProductionLifecycleResult } from './production-coordinator-bridge';

const ORDER: ReportExecutionStage[] = ['queued', 'fingerprinted', 'extracted', 'canonicalized', 'validated', 'analyzed', 'decisioned', 'committed', 'rendered'];
const next = (s: ReportExecutionStage): ReportExecutionStage | null => {
  const i = ORDER.indexOf(s);
  return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : null;
};

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
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined;

  try {
    if (job.tenantId !== input.request.tenantId) throw new Error('Tenant mismatch for durable production execution');
    if (job.checkpoint.sourceHash && job.checkpoint.sourceHash !== input.sourceHash) throw new Error('Source hash changed during resumable execution');
    assertProductionCheckpoint(job.checkpoint);

    let heartbeatFailure: unknown = null;
    heartbeatTimer = setInterval(() => {
      void store.heartbeat(input.jobId, input.workerId, leaseSeconds).catch((error) => { heartbeatFailure ??= error; });
    }, heartbeatIntervalMs);

    let checkpoint = job.checkpoint;
    let lifecycle: ProductionLifecycleResult<T> | undefined;
    const observedCheckpointHistory: ReportExecutionCheckpoint[] = [checkpoint];

    while (checkpoint.stage !== 'rendered') {
      if (heartbeatFailure) throw heartbeatFailure;
      const following = next(checkpoint.stage);
      if (!following) throw new Error(`Cannot advance production lifecycle from ${checkpoint.stage}`);
      assertValidTransition(checkpoint.stage, following);

      if (input.executeStage) {
        await input.executeStage(following, { request: input.request, rows: input.rows });
      }

      if (following === 'decisioned') {
        lifecycle = runProductionLifecycle({
          ...input.lifecycle,
          jobId: input.jobId,
          companyId: input.request.tenantId,
          sourceHash: input.sourceHash,
          currentRows: input.lifecycle.currentRows,
        });
      }

      const evidenceKeys = following === 'decisioned' && lifecycle
        ? [
            `decision.scenario:${lifecycle.scenario?.key ?? 'none'}`,
            `decision.portfolio:${lifecycle.portfolio.length}`,
            `decision.autonomy:${lifecycle.autonomy.eligible ? 'eligible' : 'blocked'}`,
          ]
        : [];
      checkpoint = advanceCheckpoint(checkpoint, {
        stage: following,
        sourceHash: input.sourceHash,
        rowCount: input.rows.length,
        evidenceKeys,
      });
      observedCheckpointHistory.push(checkpoint);
      if (heartbeatFailure) throw heartbeatFailure;
      await store.saveCheckpoint(input.jobId, checkpoint, input.workerId);
    }

    if (!lifecycle) {
      lifecycle = runProductionLifecycle({
        ...input.lifecycle,
        jobId: input.jobId,
        companyId: input.request.tenantId,
        sourceHash: input.sourceHash,
        currentRows: input.lifecycle.currentRows,
      });
    }

    await store.complete(input.jobId, input.workerId, {
      sourceHash: input.sourceHash,
      lineageCount: lifecycle.lineage.length,
      scenario: lifecycle.scenario,
      portfolio: lifecycle.portfolio,
      autonomy: lifecycle.autonomy,
      observedCheckpointHistory,
      executedStages: observedCheckpointHistory.map((entry) => entry.stage),
    });
    return lifecycle;
  } catch (error) {
    try {
      await store.fail(input.jobId, input.workerId, { message: error instanceof Error ? error.message : String(error) });
      if (job.attempt < job.maxAttempts) await store.retry(input.jobId);
    } catch (failureError) {
      throw new AggregateError([error, failureError], 'Durable execution failed and failure/recovery state could not be persisted');
    }
    throw error;
  } finally {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  }
}
