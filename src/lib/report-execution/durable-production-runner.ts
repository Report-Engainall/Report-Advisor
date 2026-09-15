import type { ReportExecutionCheckpoint, ReportExecutionStage } from './checkpoint';
import type { ReportExecutionRequest } from './report-execution-contract';
import type { RowVersion } from '../production-intelligence';
import { SupabaseReportExecutionStore } from './durable-worker-adapter';
import { runProductionLifecycle, assertProductionCheckpoint, type ProductionLifecycleInput } from './production-coordinator-bridge';

const ORDER: ReportExecutionStage[] = ['queued', 'fingerprinted', 'extracted', 'canonicalized', 'validated', 'analyzed', 'decisioned', 'committed', 'rendered'];
const next = (s: ReportExecutionStage): ReportExecutionStage | null => { const i = ORDER.indexOf(s); return i >= 0 && i < ORDER.length - 1 ? ORDER[i + 1] : null; };

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const candidate = error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };
    if (typeof candidate.message === 'string' && candidate.message.trim()) return candidate.message;
    try { return JSON.stringify(error); } catch { return Object.prototype.toString.call(error); }
  }
  return String(error);
}

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

    const checkpoint = (stage: ReportExecutionStage): ReportExecutionCheckpoint => ({ ...job.checkpoint, sourceHash: input.sourceHash, stage, updatedAt: Date.now() });
    let stage = job.checkpoint.stage;
    while (stage !== 'rendered') {
      if (heartbeatFailure) throw heartbeatFailure;
      const following = next(stage);
      if (!following) throw new Error(`Cannot advance production lifecycle from ${stage}`);
      if (input.executeStage) {
        try {
          await input.executeStage(following, { request: input.request, rows: sourceRows });
        } catch (error) {
          throw new Error(`PRODUCTION_STAGE_FAILED:${following}:${errorMessage(error)}`);
        }
      }
      if (heartbeatFailure) throw heartbeatFailure;
      await store.saveCheckpoint(input.jobId, checkpoint(following), input.workerId, tenantId);
      stage = following;
    }

    const lifecycle = runProductionLifecycle({
      ...input.lifecycle,
      jobId: input.jobId,
      companyId: tenantId,
      sourceHash: input.sourceHash,
      currentRows: source.currentRows,
    });
    const primaryEvidence = input.lifecycle.evidence[0];
    const evidenceDetails = primaryEvidence?.details ?? {};
    await store.complete(input.jobId, input.workerId, {
      source: primaryEvidence?.source ?? null,
      formula: evidenceDetails.formula ?? 'canonical_import_identity_preservation',
      period: evidenceDetails.period ?? 'as_of_observation',
      tenant: tenantId,
      asOf: evidenceDetails.asOf ?? primaryEvidence?.observedAt ?? null,
      freshness: evidenceDetails.freshness ?? primaryEvidence?.observedAt ?? null,
      sourceHash: input.sourceHash,
      evidenceKeys: input.lifecycle.evidence.map(item => item.key),
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
    try {
      await store.fail(input.jobId, input.workerId, { message: errorMessage(error) }, tenantId);
      if (job.attempt < job.maxAttempts) await store.retry(input.jobId, tenantId);
    } catch (failureError) {
      throw new AggregateError([error, failureError], 'Durable execution failed and failure/recovery state could not be persisted');
    }
    throw error;
  } finally {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  }
}
