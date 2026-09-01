import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import { advanceCheckpoint, canAdvanceCheckpoint, createInitialCheckpoint, resumeFromCheckpoint, type ReportExecutionCheckpoint } from '../src/lib/report-execution/checkpoint.ts';
import { SupabaseReportExecutionStore } from '../src/lib/report-execution/durable-worker-adapter.ts';
import { assertEvidenceTenant, assertExecutionRequest, type ReportExecutionRequest } from '../src/lib/report-execution/report-execution-contract.ts';

// 1. Checkpoint ordering is strictly monotonic and rejects skips/rewinds.
assert.equal(canAdvanceCheckpoint('queued','fingerprinted'), true);
assert.equal(canAdvanceCheckpoint('queued','analyzed'), false);
const initial: ReportExecutionCheckpoint = { stage:'queued', sourceHash:'sha-a', evidenceKeys:[], updatedAt:0 };
const next = advanceCheckpoint(initial, { stage:'fingerprinted', sourceHash:'sha-a', evidenceKeys:['source:sha-a'] });
assert.deepEqual(next.evidenceKeys, ['source:sha-a']);
assert.throws(() => advanceCheckpoint(next, { stage:'analyzed', sourceHash:'sha-a', evidenceKeys:[] }), /Invalid checkpoint transition/);
assert.throws(() => advanceCheckpoint(next, { stage:'queued', sourceHash:'sha-a', evidenceKeys:[] }), /Invalid checkpoint transition/);
assert.throws(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-b', evidenceKeys:[] }), /source hash/);

// 2. Initialization rejects unusable source identity and canonicalizes evidence keys.
assert.throws(() => createInitialCheckpoint('   '), /requires a source hash/);
assert.deepEqual(createInitialCheckpoint('sha-init', ['b','a','a']).evidenceKeys, ['a','b']);
assert.throws(() => createInitialCheckpoint('sha-init', ['ok',' ']), /evidence keys/);
assert.throws(() => createInitialCheckpoint('sha-init', ['ok', 1 as unknown as string]), /evidence keys/);

// 3. Advancement rejects malformed row counts and preserves/deduplicates evidence.
assert.throws(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-a', rowCount:-1, evidenceKeys:[] }), /rowCount/);
assert.throws(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-a', rowCount:1.5, evidenceKeys:[] }), /rowCount/);
assert.throws(() => advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-a', rowCount:0, evidenceKeys:[' '] }), /evidence keys/);
const enriched = advanceCheckpoint(next, { stage:'extracted', sourceHash:'sha-a', rowCount:0, evidenceKeys:['source:sha-a','extract:1'] });
assert.deepEqual(enriched.evidenceKeys, ['extract:1','source:sha-a']);

// 4. Resume validation rejects missing identity, malformed evidence, invalid timestamps/row counts, and unknown stages.
assert.equal(resumeFromCheckpoint(enriched), 'extracted');
assert.throws(() => resumeFromCheckpoint({ ...enriched, sourceHash:'' }), /source hash/);
assert.throws(() => resumeFromCheckpoint({ ...enriched, evidenceKeys:null as unknown as string[] }), /evidence keys/);
assert.throws(() => resumeFromCheckpoint({ ...enriched, evidenceKeys:[' '] }), /evidence keys/);
assert.throws(() => resumeFromCheckpoint({ ...enriched, updatedAt:Number.NaN }), /timestamp/);
assert.throws(() => resumeFromCheckpoint({ ...enriched, updatedAt:-1 }), /timestamp/);
assert.throws(() => resumeFromCheckpoint({ ...enriched, rowCount:-1 }), /rowCount/);
assert.throws(() => resumeFromCheckpoint({ ...enriched, stage:'unknown' as ReportExecutionCheckpoint['stage'] }), /unknown checkpoint stage/);

// 5. Execution request validation rejects whitespace identity and blank snapshot context.
const request: ReportExecutionRequest = { reportId:'r', tenantId:'t', requestedBy:'u', parameters:{}, formats:['web'], idempotencyKey:'k' };
assert.doesNotThrow(() => assertExecutionRequest(request));
assert.throws(() => assertExecutionRequest({ ...request, tenantId:'   ' }), /Invalid report execution identity/);
assert.throws(() => assertExecutionRequest({ ...request, reportId:' ' }), /Invalid report execution identity/);
assert.throws(() => assertExecutionRequest({ ...request, requestedBy:' ' }), /Invalid report execution identity/);
assert.throws(() => assertExecutionRequest({ ...request, idempotencyKey:' ' }), /idempotency key/);
assert.throws(() => assertExecutionRequest({ ...request, sourceSnapshotId:' ' }), /Source snapshot id/);
assert.throws(() => assertExecutionRequest({ ...request, formats:['web','web'] }), /Duplicate output formats/);
assert.throws(() => assertExecutionRequest({ ...request, formats:['csv' as ReportExecutionRequest['formats'][number]] }), /Unsupported report output format/);

// 6. Evidence tenant validation is fail-closed, including a blank caller tenant.
const evidence = { tenantId:'t' } as Parameters<typeof assertEvidenceTenant>[0];
assert.doesNotThrow(() => assertEvidenceTenant(evidence, 't'));
assert.throws(() => assertEvidenceTenant(evidence, 'other'), /tenant mismatch/);
assert.throws(() => assertEvidenceTenant(evidence, ' '), /tenant context/);

// 7. Durable identity is tenant + idempotency + source snapshot scoped.
assert.equal(SupabaseReportExecutionStore.requestIdentity(request), 't:k:latest');
assert.equal(SupabaseReportExecutionStore.requestIdentity({ ...request, sourceSnapshotId:'snapshot-1' }), 't:k:snapshot-1');
assert.throws(() => SupabaseReportExecutionStore.requestIdentity({ ...request, tenantId:'' }), /tenant and idempotency context/);
assert.throws(() => SupabaseReportExecutionStore.requestIdentity({ ...request, idempotencyKey:'' }), /tenant and idempotency context/);
assert.throws(() => SupabaseReportExecutionStore.requestIdentity({ ...request, sourceSnapshotId:' ' }), /source snapshot id/);
assert.notEqual(
  SupabaseReportExecutionStore.requestIdentity({ ...request, sourceSnapshotId:'snapshot-1' }),
  SupabaseReportExecutionStore.requestIdentity(request),
);

// 8. Adapter enforces worker identity and positive lease duration before making RPC calls.
const adapterSource = fs.readFileSync('src/lib/report-execution/durable-worker-adapter.ts', 'utf8');
for (const token of [
  'requireNonBlank(jobId',
  'requireNonBlank(workerId',
  'requirePositiveLease(leaseSeconds)',
  "rpc('claim_report_execution_job'",
  "rpc('heartbeat_report_execution_job'",
  "rpc('advance_report_execution_checkpoint'",
  "rpc('complete_report_execution_job'",
  "rpc('fail_report_execution_job'",
  "rpc('retry_report_execution_job'",
]) {
  assert.ok(adapterSource.includes(token), `missing adapter runtime guard/RPC: ${token}`);
}

// 9. Execute all durable adapter RPC paths against a deterministic in-memory Supabase double.
const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
const fakeClient = {
  rpc: async (name: string, args: Record<string, unknown>) => { calls.push({ name, args }); return { data: true, error: null }; },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: { id:'job-1', company_id:'tenant-a', status:'processing', checkpoint: enriched, attempt:1, max_attempts:3, lease_owner:'worker-a', lease_expires_at:'2099-01-01T00:00:00Z' }, error:null }),
      }),
    }),
  }),
};
const store = new SupabaseReportExecutionStore(fakeClient as never);
await store.claim('job-1', 'worker-a', 60);
await store.heartbeat('job-1', 'worker-a', 60);
await store.saveCheckpoint('job-1', enriched, 'worker-a');
await store.complete('job-1', 'worker-a', { ok:true });
await store.fail('job-1', 'worker-a', { code:'E_TEST' });
await store.retry('job-1');
assert.deepEqual(calls.map((call) => call.name), [
  'claim_report_execution_job',
  'heartbeat_report_execution_job',
  'advance_report_execution_checkpoint',
  'complete_report_execution_job',
  'fail_report_execution_job',
  'retry_report_execution_job',
]);
assert.equal(calls[0].args.p_lease_seconds, 60);
assert.equal(calls[2].args.p_worker_id, 'worker-a');
assert.deepEqual(calls[3].args.p_evidence, { ok:true });

// 10. Adapter rejects invalid input before any RPC side effect.
const beforeInvalid = calls.length;
await assert.rejects(() => store.claim(' ', 'worker-a'), /job id is required/);
await assert.rejects(() => store.claim('job-1', ' ', 60), /worker id is required/);
await assert.rejects(() => store.claim('job-1', 'worker-a', 0), /positive integer/);
await assert.rejects(() => store.heartbeat('job-1', 'worker-a', 1.5), /positive integer/);
await assert.rejects(() => store.saveCheckpoint('job-1', enriched), /active worker lease owner/);
await assert.rejects(() => store.complete('job-1', ' '), /worker id is required/);
assert.equal(calls.length, beforeInvalid);

// 11. Lease/failure/dead-letter SQL remains tenant-scoped and fail-closed.
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

console.log('Report execution runtime: PASS (checkpoint + evidence + request identity + tenant boundary + durable adapter execution + lease/failure invariants)');
