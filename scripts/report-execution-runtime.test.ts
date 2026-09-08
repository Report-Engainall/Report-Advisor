import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import { advanceCheckpoint, canAdvanceCheckpoint, type ReportExecutionCheckpoint } from '../src/lib/report-execution/checkpoint.ts';
import { InMemoryReportQueue } from '../src/lib/report-execution/queue.ts';
import { SupabaseReportExecutionStore } from '../src/lib/report-execution/durable-worker-adapter.ts';
import type { ReportExecutionRequest } from '../src/lib/report-execution/report-execution-contract.ts';

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
assert.notEqual(
  SupabaseReportExecutionStore.requestIdentity({ ...request, sourceSnapshotId:'snapshot-1' }),
  SupabaseReportExecutionStore.requestIdentity(request),
);

const queue = new InMemoryReportQueue();
assert.throws(() => queue.enqueue(request, 'run-1', 0), /positive integer/);
assert.throws(() => queue.enqueue(request, 'run-1', Number.NaN), /positive integer/);
assert.throws(() => queue.enqueue(request, 'run-1', Number.POSITIVE_INFINITY), /positive integer/);
assert.throws(() => queue.enqueue(request, '   '), /runId is required/);
const queued = queue.enqueue(request, 'run-1', 2);
assert.equal(queued.status, 'queued');
assert.throws(() => queue.claim('   '), /workerId is required/);
assert.throws(() => queue.claim('worker-1', 0), /positive and finite/);
assert.throws(() => queue.claim('worker-1', Number.NaN), /positive and finite/);
assert.throws(() => queue.claim('worker-1', Number.POSITIVE_INFINITY), /positive and finite/);
const claimed = queue.claim('worker-1', 60_000);
assert.equal(claimed?.status, 'running');
assert.equal(claimed?.attempts, 1);
assert.ok(claimed?.leaseToken);
assert.throws(() => queue.heartbeat('run-1', 'worker-1', claimed.leaseToken!, Number.NaN), /positive and finite/);
assert.throws(() => queue.complete('run-1', 'worker-2', claimed.leaseToken!), /lease is not owned/);
queue.complete('run-1', 'worker-1', claimed.leaseToken!);
assert.equal(queue.get('run-1')?.status, 'succeeded');

const leaseFailureSql = fs.readFileSync('supabase/migrations/20260825153000_runtime_lease_hardening.sql', 'utf8');
for (const token of [
  'attempt >= max_attempts',
  "'dead_letter'",
  "status IN ('leased','processing')",
  'lease_expires_at > now()',
  'company_id=public.current_company_id()',
]) {
  assert.ok(leaseFailureSql.includes(token), `missing failure-state invariant: ${token}`);
}

const adapter = fs.readFileSync('src/lib/report-execution/durable-worker-adapter.ts', 'utf8');
for (const rpc of [
  "rpc('advance_report_execution_checkpoint'",
  "rpc('complete_report_execution_job'",
  "rpc('retry_report_execution_job'",
]) {
  assert.ok(adapter.includes(rpc), `missing durable worker RPC: ${rpc}`);
}

console.log('Report execution runtime: PASS (checkpoint monotonicity + lease/failure/dead-letter + queue scalar boundaries + tenant/idempotency recovery invariants)');
