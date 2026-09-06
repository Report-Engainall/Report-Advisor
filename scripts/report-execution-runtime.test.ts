import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import { advanceCheckpoint, canAdvanceCheckpoint, createInitialCheckpoint, resumeFromCheckpoint, type ReportExecutionCheckpoint } from '../src/lib/report-execution/checkpoint.ts';
import { SupabaseReportExecutionStore } from '../src/lib/report-execution/durable-worker-adapter.ts';
import type { ReportExecutionRequest } from '../src/lib/report-execution/report-execution-contract.ts';

// Ordered checkpoint state machine: forward-only, no skipping, no regression.
const stages = ['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'] as const;
for (let i = 0; i < stages.length - 1; i += 1) {
  assert.equal(canAdvanceCheckpoint(stages[i], stages[i + 1]), true, `expected forward transition ${stages[i]} -> ${stages[i + 1]}`);
  if (i > 0) assert.equal(canAdvanceCheckpoint(stages[i], stages[i - 1]), false, `regression must be rejected ${stages[i]} -> ${stages[i - 1]}`);
}
assert.equal(canAdvanceCheckpoint('queued','analyzed'), false);
assert.equal(canAdvanceCheckpoint('rendered','queued'), false);

// Initial checkpoint admission and evidence normalization.
const initial = createInitialCheckpoint('sha-a', ['z:evidence', 'a:evidence', 'z:evidence']);
assert.equal(initial.stage, 'queued');
assert.deepEqual(initial.evidenceKeys, ['a:evidence', 'z:evidence']);
assert.throws(() => createInitialCheckpoint('   '), /source hash/);
assert.equal(resumeFromCheckpoint(initial), 'queued');

// Monotonic checkpoint advancement preserves source identity and deduplicates evidence.
const next = advanceCheckpoint(initial, { stage:'fingerprinted', sourceHash:'sha-a', evidenceKeys:['source:sha-a', 'a:evidence'] });
assert.deepEqual(next.evidenceKeys, ['a:evidence', 'source:sha-a', 'z:evidence']);
assert.equal(next.sourceHash, 'sha-a');
assert.throws(() => advanceCheckpoint(next, { stage:'analyzed', sourceHash:'sha-a', evidenceKeys:[] }), /Invalid checkpoint transition/);
assert.throws(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-b', evidenceKeys:[] }), /source hash/);
assert.throws(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-a', rowCount:-1, evidenceKeys:[] }), /rowCount/);
assert.throws(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-a', rowCount:1.5, evidenceKeys:[] }), /rowCount/);
assert.doesNotThrow(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-a', rowCount:0, evidenceKeys:[] }));

// Resume admission rejects malformed persisted checkpoints.
const validCheckpoint: ReportExecutionCheckpoint = { stage:'validated', sourceHash:'sha-a', evidenceKeys:['e:1'], updatedAt:Date.now() };
assert.equal(resumeFromCheckpoint(validCheckpoint), 'validated');
assert.throws(() => resumeFromCheckpoint({ ...validCheckpoint, sourceHash:'' }), /source hash/);
assert.throws(() => resumeFromCheckpoint({ ...validCheckpoint, evidenceKeys: null as unknown as string[] }), /evidence keys/);
assert.throws(() => resumeFromCheckpoint({ ...validCheckpoint, updatedAt:Number.NaN }), /timestamp/);
assert.throws(() => resumeFromCheckpoint({ ...validCheckpoint, stage:'unknown' as never }), /unknown checkpoint stage/);

// Tenant + idempotency identity must remain part of the durable execution key.
const request: ReportExecutionRequest = { reportId:'r', tenantId:'t', requestedBy:'u', parameters:{}, formats:['web'], idempotencyKey:'k' };
assert.equal(SupabaseReportExecutionStore.requestIdentity(request), 't:k:latest');
assert.equal(SupabaseReportExecutionStore.requestIdentity({ ...request, sourceSnapshotId:'snapshot-1' }), 't:k:snapshot-1');
assert.throws(() => SupabaseReportExecutionStore.requestIdentity({ ...request, tenantId:'' }), /tenant and idempotency context/);
assert.throws(() => SupabaseReportExecutionStore.requestIdentity({ ...request, idempotencyKey:'' }), /tenant and idempotency context/);
assert.notEqual(
  SupabaseReportExecutionStore.requestIdentity({ ...request, sourceSnapshotId:'snapshot-1' }),
  SupabaseReportExecutionStore.requestIdentity(request),
);

// Source-level failure/recovery invariants remain explicit and lease-fenced.
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

// Canonical migration must retain the explicit tenant + lease-token admission contract.
const workerMigration = fs.readFileSync('supabase/migrations/20260906190100_canonicalize_report_execution_worker_contract.sql', 'utf8');
for (const token of ['p_company_id uuid', 'p_lease_token text', "status = 'queued'", "status = 'dead_letter'", 'lease_token']) {
  assert.ok(workerMigration.includes(token), `missing worker contract invariant: ${token}`);
}

console.log('Report execution runtime: PASS (forward-only checkpoints + malformed-resume rejection + tenant/idempotency identity + lease/dead-letter + explicit tenant/lease-token contract)');
