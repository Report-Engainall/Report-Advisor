import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import { advanceCheckpoint, canAdvanceCheckpoint, createInitialCheckpoint, resumeFromCheckpoint, type ReportExecutionCheckpoint } from '../src/lib/report-execution/checkpoint.ts';
import { SupabaseReportExecutionStore } from '../src/lib/report-execution/durable-worker-adapter.ts';
import type { ReportExecutionRequest } from '../src/lib/report-execution/report-execution-contract.ts';

assert.equal(canAdvanceCheckpoint('queued','fingerprinted'), true);
assert.equal(canAdvanceCheckpoint('queued','analyzed'), false);
const initial: ReportExecutionCheckpoint = { stage:'queued', sourceHash:'sha-a', evidenceKeys:[], updatedAt:0 };
const next = advanceCheckpoint(initial, { stage:'fingerprinted', sourceHash:'sha-a', evidenceKeys:['source:sha-a'] });
assert.deepEqual(next.evidenceKeys, ['source:sha-a']);
assert.throws(() => advanceCheckpoint(next, { stage:'analyzed', sourceHash:'sha-a', evidenceKeys:[] }), /Invalid checkpoint transition/);
assert.throws(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-b', evidenceKeys:[] }), /source hash/);

// Initialization rejects unusable source identity and canonicalizes evidence keys.
assert.throws(() => createInitialCheckpoint('   '), /requires a source hash/);
assert.deepEqual(createInitialCheckpoint('sha-init', ['b','a','a']).evidenceKeys, ['a','b']);

// Advancement rejects malformed row counts and preserves/deduplicates evidence.
assert.throws(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-a', rowCount:-1, evidenceKeys:[] }), /rowCount/);
const enriched = advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-a', rowCount:0, evidenceKeys:['source:sha-a','extract:1'] });
assert.deepEqual(enriched.evidenceKeys, ['extract:1','source:sha-a']);

// Resume validation rejects missing identity, malformed evidence, invalid timestamps, and unknown stages.
assert.equal(resumeFromCheckpoint(enriched), 'extracted');
assert.throws(() => resumeFromCheckpoint({ ...enriched, sourceHash:'' }), /source hash/);
assert.throws(() => resumeFromCheckpoint({ ...enriched, evidenceKeys:null as unknown as string[] }), /evidence keys/);
assert.throws(() => resumeFromCheckpoint({ ...enriched, updatedAt:Number.NaN }), /timestamp/);
assert.throws(() => resumeFromCheckpoint({ ...enriched, stage:'unknown' as ReportExecutionCheckpoint['stage'] }), /unknown checkpoint stage/);

const request: ReportExecutionRequest = { reportId:'r', tenantId:'t', requestedBy:'u', parameters:{}, formats:['web'], idempotencyKey:'k' };
assert.equal(SupabaseReportExecutionStore.requestIdentity(request), 't:k:latest');
assert.equal(SupabaseReportExecutionStore.requestIdentity({ ...request, sourceSnapshotId:'snapshot-1' }), 't:k:snapshot-1');
assert.throws(() => SupabaseReportExecutionStore.requestIdentity({ ...request, tenantId:'' }), /tenant and idempotency context/);
assert.throws(() => SupabaseReportExecutionStore.requestIdentity({ ...request, idempotencyKey:'' }), /tenant and idempotency context/);
assert.notEqual(
  SupabaseReportExecutionStore.requestIdentity({ ...request, sourceSnapshotId:'snapshot-1' }),
  SupabaseReportExecutionStore.requestIdentity(request),
);

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

console.log('Report execution runtime: PASS (checkpoint initialization/resume/monotonicity + evidence/row-count + lease/failure/dead-letter + tenant/idempotency invariants)');
