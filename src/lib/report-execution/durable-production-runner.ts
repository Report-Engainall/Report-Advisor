import type { ReportExecutionCheckpoint, ReportExecutionStage } from './checkpoint';
import type { ReportExecutionRequest } from './report-execution-contract';
import { SupabaseReportExecutionStore } from './durable-worker-adapter';
import { runProductionLifecycle, assertProductionCheckpoint } from './production-coordinator-bridge';

const ORDER: ReportExecutionStage[] = ['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'];
const next = (s: ReportExecutionStage): ReportExecutionStage | null => { const i=ORDER.indexOf(s); return i>=0 && i<ORDER.length-1 ? ORDER[i+1] : null; };

export interface DurableProductionRunInput {
  request: ReportExecutionRequest;
  workerId: string;
  sourceHash: string;
  rows: Array<Record<string, unknown>>;
  executeStage?: (stage: ReportExecutionStage, input: {request: ReportExecutionRequest; rows: Array<Record<string, unknown>>}) => Promise<void>;
}

export async function runDurableProductionLifecycle(input: DurableProductionRunInput, store: SupabaseReportExecutionStore) {
  const job = await store.claim(input.request.jobId, input.workerId);
  if (job.tenantId !== input.request.tenantId) throw new Error('Tenant mismatch for durable production execution');
  if (job.checkpoint.sourceHash && job.checkpoint.sourceHash !== input.sourceHash) throw new Error('Source hash changed during resumable execution');
  assertProductionCheckpoint(job.checkpoint);
  const checkpoint = (stage: ReportExecutionStage): ReportExecutionCheckpoint => ({ ...job.checkpoint, jobId: input.request.jobId, sourceHash: input.sourceHash, stage, updatedAt: new Date().toISOString() });

  let stage = job.checkpoint.stage;
  while (stage !== 'rendered') {
    const following = next(stage);
    if (!following) throw new Error(`Cannot advance production lifecycle from ${stage}`);
    if (input.executeStage) await input.executeStage(following, { request: input.request, rows: input.rows });
    await store.saveCheckpoint(input.request.jobId, checkpoint(following), input.workerId);
    stage = following;
  }

  const lifecycle = runProductionLifecycle({ jobId: input.request.jobId, companyId: input.request.tenantId, sourceSnapshotId: input.request.sourceSnapshotId, sourceHash: input.sourceHash, rows: input.rows });
  await store.complete(input.request.jobId, input.workerId, { sourceHash: input.sourceHash, lineageCount: lifecycle.lineage.length, scenario: lifecycle.scenario, portfolio: lifecycle.portfolio, autonomy: lifecycle.autonomy });
  return lifecycle;
}
