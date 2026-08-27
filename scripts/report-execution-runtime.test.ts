import { strict as assert } from 'node:assert';
import { advanceCheckpoint, canAdvanceCheckpoint, type ReportExecutionCheckpoint } from '../src/lib/report-execution/checkpoint.ts';
import { SupabaseReportExecutionStore } from '../src/lib/report-execution/durable-worker-adapter.ts';
import type { ReportExecutionRequest } from '../src/lib/report-execution/report-execution-contract.ts';
import { InMemoryReportQueue } from '../src/lib/report-execution/queue.ts';

assert.equal(canAdvanceCheckpoint('queued','fingerprinted'), true);
assert.equal(canAdvanceCheckpoint('queued','analyzed'), false);
const initial: ReportExecutionCheckpoint = { stage:'queued', sourceHash:'sha-a', evidenceKeys:[], updatedAt:0 };
const next = advanceCheckpoint(initial, { stage:'fingerprinted', sourceHash:'sha-a', evidenceKeys:['source:sha-a'] });
assert.deepEqual(next.evidenceKeys, ['source:sha-a']);
assert.throws(() => advanceCheckpoint(next, { stage:'analyzed', sourceHash:'sha-a', evidenceKeys:[] }), /Invalid checkpoint transition/);
assert.throws(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-b', evidenceKeys:[] }), /source hash/);

const request: ReportExecutionRequest = { reportId:'r', tenantId:'t', requestedBy:'u', parameters:{}, formats:['web'], idempotencyKey:'k' };
assert.equal(SupabaseReportExecutionStore.requestIdentity(request), 't:k:latest');
assert.equal(SupabaseReportExecutionStore.requestIdentity({ ...request, sourceSnapshotId:'snapshot-1' }), 't:k:snapshot-1');
assert.throws(() => SupabaseReportExecutionStore.requestIdentity({ ...request, tenantId:'' }), /tenant and idempotency context/);
assert.throws(() => SupabaseReportExecutionStore.requestIdentity({ ...request, idempotencyKey:'' }), /tenant and idempotency context/);

// A recovered job must continue from its durable source snapshot identity; it
// must not silently create a new idempotency scope when a snapshot exists.
assert.notEqual(
  SupabaseReportExecutionStore.requestIdentity({ ...request, sourceSnapshotId:'snapshot-1' }),
  SupabaseReportExecutionStore.requestIdentity(request),
);

console.log('Report execution runtime: PASS (checkpoint monotonicity + tenant/idempotency recovery invariants)');

const queue = new InMemoryReportQueue();
const qRequest: ReportExecutionRequest = { ...request, idempotencyKey:'queue-k' };
const first = queue.enqueue(qRequest, 'run-queue-1', 2);
assert.equal(queue.enqueue(qRequest, 'run-queue-2', 2).runId, 'run-queue-1');
const claimed = queue.claim('worker-a', 1);
assert.equal(claimed?.runId, 'run-queue-1');
assert.throws(() => queue.complete('run-queue-1', 'worker-b'), /lease is not owned/);
await new Promise(resolve => setTimeout(resolve, 5));
const recovered = queue.claim('worker-b', 60_000);
assert.equal(recovered?.runId, 'run-queue-1');
assert.equal(recovered?.attempts, 2);
assert.throws(() => queue.heartbeat('run-queue-1', 'worker-a'), /lease is not owned/);
queue.fail('run-queue-1', 'worker-b', 'boom');
assert.equal(queue.get('run-queue-1')?.status, 'failed');
assert.equal(queue.listDeadLetters().length, 1);

console.log('Report execution queue: PASS (idempotency + lease expiry/recovery + worker ownership + dead-letter state)');
