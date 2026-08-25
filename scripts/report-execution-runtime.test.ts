import { strict as assert } from 'node:assert';
import { advanceCheckpoint, canAdvanceCheckpoint, type ReportExecutionCheckpoint } from '../src/lib/report-execution/checkpoint';
import { SupabaseReportExecutionStore } from '../src/lib/report-execution/durable-worker-adapter';
import type { ReportExecutionRequest } from '../src/lib/report-execution/report-execution-contract';

assert.equal(canAdvanceCheckpoint('queued','fingerprinted'), true);
assert.equal(canAdvanceCheckpoint('queued','analyzed'), false);
const initial: ReportExecutionCheckpoint = { stage:'queued', sourceHash:'sha-a', evidenceKeys:[], updatedAt:0 };
const next = advanceCheckpoint(initial, { stage:'fingerprinted', sourceHash:'sha-a', evidenceKeys:['source:sha-a'] });
assert.deepEqual(next.evidenceKeys, ['source:sha-a']);
assert.throws(() => advanceCheckpoint(next, { stage:'analyzed', sourceHash:'sha-a', evidenceKeys:[] }), /Invalid checkpoint transition/);
assert.throws(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-b', evidenceKeys:[] }), /source hash/);
const request: ReportExecutionRequest = { reportId:'r', tenantId:'t', requestedBy:'u', parameters:{}, formats:['web'], idempotencyKey:'k' };
assert.equal(SupabaseReportExecutionStore.requestIdentity(request), 't:k:latest');

const rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
const fakeClient = {
  rpc: async (name: string, args: Record<string, unknown>) => {
    rpcCalls.push({ name, args });
    return { data: true, error: null };
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({
          data: { id:'job-1', company_id:'tenant-1', status:'leased', checkpoint: initial, attempt:1, max_attempts:5, lease_owner:'worker-1', lease_expires_at:'2099-01-01T00:00:00Z' },
          error: null,
        }),
      }),
    }),
  }),
};

const store = new SupabaseReportExecutionStore(fakeClient as never);
const refreshed = await store.heartbeat('job-1', 'worker-1', 120);
assert.equal(refreshed.leaseOwner, 'worker-1');
assert.deepEqual(rpcCalls, [{
  name: 'heartbeat_report_execution_job',
  args: { p_job_id:'job-1', p_worker_id:'worker-1', p_lease_seconds:120 },
}]);

console.log('Report execution runtime: PASS');
