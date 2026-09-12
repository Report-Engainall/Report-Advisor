import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import { advanceCheckpoint, canAdvanceCheckpoint, type ReportExecutionCheckpoint } from '../src/lib/report-execution/checkpoint.ts';
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

const commitLedger = fs.readFileSync('supabase/migrations/20260912183000_import_commit_idempotency_ledger.sql', 'utf8');
for (const token of [
  'canonical_import_commits',
  'UNIQUE(company_id, entity_type, source_hash)',
  'idempotent_replay',
  'FOR UPDATE',
]) {
  assert.ok(commitLedger.includes(token), `missing atomic commit retry invariant: ${token}`);
}

const canonicalAdapter = fs.readFileSync('src/lib/import/canonical-production-adapter.ts', 'utf8');
assert.ok(canonicalAdapter.includes('await commitImportBatch(input.entityType, input.rows, input.sourceHash)'), 'canonical import must commit through the existing atomic boundary');
assert.ok(canonicalAdapter.includes("updateFileRecordStatus(fileRecord.id, 'failed')"), 'import failure must mark the source file record failed');
assert.ok(canonicalAdapter.includes("updateFileRecordStatus(fileRecord.id, 'completed')"), 'import success must mark the source file record completed');

const decisionEvidence = fs.readFileSync('supabase/migrations/20260912150000_decision_evidence_guard.sql', 'utf8');
for (const token of [
  'p_evidence IS NULL',
  "jsonb_typeof(p_evidence) <> 'object'",
  "p_evidence = '{}'::jsonb",
  "'DECISION_EVIDENCE_REQUIRED'",
  "'PROPOSED'",
]) {
  assert.ok(decisionEvidence.includes(token), `missing decision evidence guard: ${token}`);
}

const decisionWorkflow = fs.readFileSync('supabase/migrations/20260912160555_harden_decision_workflow_mutation_authorization.sql', 'utf8');
for (const token of [
  "d.status='APPROVED'",
  "'RECOMMENDATION_NOT_FOUND_OR_NOT_LINKED'",
  "'WORK_ITEM_EVIDENCE_REQUIRED'",
  "w.status='COMPLETED'",
  "'OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN'",
  "'OUTCOME_ALREADY_RECORDED'",
]) {
  assert.ok(decisionWorkflow.includes(token), `missing decision lifecycle guard: ${token}`);
}

const automation = fs.readFileSync('src/lib/decision/automationExecutor.ts', 'utf8');
for (const token of [
  'certification.certified',
  "action.status !== 'READY'",
  'requiresApproval && !action.approved',
  "sideEffect === 'EXTERNAL' && !action.approved",
]) {
  assert.ok(automation.includes(token), `missing automation approval guard: ${token}`);
}

console.log('Report execution runtime: PASS (checkpoint + durable commit + decision evidence/approval/work-item/outcome guards)');
