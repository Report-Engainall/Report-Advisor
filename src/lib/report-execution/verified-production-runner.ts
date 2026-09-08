import type { ReportExecutionRequest } from './report-execution-contract';
import { SupabaseReportExecutionStore } from './durable-worker-adapter';
import { runDurableProductionLifecycle, type DurableProductionRunInput, type DurableSourceSnapshot } from './durable-production-runner';

export interface VerifiedProductionRunInput<T = unknown> extends Omit<DurableProductionRunInput<T>, 'request' | 'loadSourceSnapshot'> {
  request: ReportExecutionRequest & { sourceSnapshotId: string };
  loadSourceSnapshot: (input: { request: ReportExecutionRequest & { sourceSnapshotId: string }; expectedSourceHash: string; sourceSnapshotId: string }) => Promise<DurableSourceSnapshot<T>>;
}

/**
 * Production-only entry point: execution cannot begin without an explicit,
 * tenant-bound source snapshot identity and a loader that returns its hash and rows.
 */
export async function runVerifiedDurableProductionLifecycle<T>(input: VerifiedProductionRunInput<T>, store: SupabaseReportExecutionStore) {
  if (!input.request.sourceSnapshotId.trim()) throw new Error('Verified production execution requires sourceSnapshotId');
  if (input.request.tenantId.trim() === '') throw new Error('Verified production execution requires tenantId');
  return runDurableProductionLifecycle({
    ...input,
    loadSourceSnapshot: input.loadSourceSnapshot,
  }, store);
}
