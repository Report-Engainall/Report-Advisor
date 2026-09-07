import type { SupabaseClient } from '@supabase/supabase-js';
import { assertReportExecutionReady, type ExecutionGateInput } from './execution-gate';
import type { ReportExecutionRequest } from './report-execution-contract';
import { SupabaseReportExecutionStore, type DurableExecutionJob } from './durable-worker-adapter';

export interface DurableExecutionEnqueueInput {
  request: ReportExecutionRequest;
  routePlan: ExecutionGateInput['routePlan'];
  sourceSnapshotId: string;
  sourcePath: string;
  sourceHash: string;
  evidenceKeys?: string[];
  maxAttempts?: number;
}

/**
 * Single guarded entrypoint for moving a report request from the business
 * execution gate into the durable queue. No queue side effect occurs before
 * identity/source/quarantine checks pass.
 */
export async function enqueueDurableReportExecution(
  input: DurableExecutionEnqueueInput,
  client: SupabaseClient,
): Promise<DurableExecutionJob> {
  assertReportExecutionReady({ request: input.request, routePlan: input.routePlan, sourceSnapshotId: input.sourceSnapshotId });
  if (input.request.sourceSnapshotId && input.request.sourceSnapshotId !== input.sourceSnapshotId) {
    throw new Error('Report execution source snapshot does not match the requested snapshot');
  }
  const sourcePath = input.sourcePath?.trim();
  const sourceHash = input.sourceHash?.trim();
  if (!sourcePath || !sourceHash) throw new Error('Durable report execution requires source path and source hash');

  const jobKey = `${input.request.tenantId}:${input.request.idempotencyKey}:${input.sourceSnapshotId}`;
  return new SupabaseReportExecutionStore(client).enqueue({
    tenantId: input.request.tenantId,
    jobKey,
    sourcePath,
    sourceHash,
    evidenceKeys: input.evidenceKeys,
    maxAttempts: input.maxAttempts,
  });
}
