import { readFileSync, existsSync } from 'node:fs';

const files = [
  'src/lib/report-execution/report-execution-contract.ts',
  'src/lib/report-execution/idempotency.ts',
  'src/lib/report-execution/execution-gate.ts',
  'src/lib/report-execution/queue.ts',
  'src/lib/report-execution/renderers.ts',
  'src/lib/report-execution/download.ts',
  'src/lib/report-execution/durable-worker-adapter.ts',
  'src/lib/report-execution/execution-ledger.ts',
  'netlify/functions/canonical-import-execute.mts',
  'supabase/migrations/20261011202515_disambiguate_enqueue_report_execution_job_rpc_overloads.sql',
  'supabase/migrations/20261011203323_remove_ambiguous_legacy_enqueue_report_execution_job_overload.sql',
  'supabase/migrations/20261011203457_restore_tenant_bound_legacy_enqueue_report_execution_job_overload.sql',
  'supabase/migrations/20261011204019_disambiguate_import_commit_batch_rpc_overloads.sql',
  'src/lib/import/canonical-commit.ts',
];

for (const file of files) if (!existsSync(file)) throw new Error(`Missing report execution component: ${file}`);
const read = file => readFileSync(file, 'utf8');
const contract = read(files[0]);
const idem = read(files[1]);
const gate = read(files[2]);
const queue = read(files[3]);
const renderers = read(files[4]);
const download = read(files[5]);
const durable = read(files[6]);
const ledger = read(files[7]);
const canonicalImport = read(files[8]);
const enqueueRpcMigration = read(files[9]);
const removeLegacyEnqueueRpcMigration = read(files[10]);
const restoreLegacyEnqueueRpcMigration = read(files[11]);
const importCommitRpcMigration = read(files[12]);
const canonicalCommit = read(files[13]);

const required = (source, tokens, label) => {
  for (const token of tokens) if (!source.includes(token)) throw new Error(`${label} missing ${token}`);
};

required(contract, ['tenantId', 'sourceSnapshotId', 'idempotencyKey', 'ReportExecutionEvidence'], 'Execution contract');
required(idem, ['IdempotencyRegistry', 'fingerprintRequest', 'different request'], 'Idempotency contract');
required(gate, ['assertExecutionRequest', 'assertGovernedRoute', 'sourceSnapshotId', 'assertNoQuarantine', 'fail-closed'], 'Execution gate');
required(queue, ['claim', 'lease', 'maxAttempts', 'attempts', 'fail', 'heartbeat', 'listDeadLetters'], 'Queue runtime');
required(renderers.toLowerCase(), ['pdf', 'xlsx', 'web'], 'Renderer');
required(download, ['renderArtifact', 'downloadReportArtifact', 'Blob', 'anchor.download'], 'Report download path');
required(durable, ['claim_report_execution_job', 'heartbeat_report_execution_job', 'advance_report_execution_checkpoint', 'complete_report_execution_job', 'fail_report_execution_job', 'retry_report_execution_job'], 'Durable worker adapter');
required(ledger, ['artifactRefs', 'evidence', 'tenantId', 'immutable'], 'Execution ledger');
required(canonicalImport, [
  ".select('id,company_id,source_path,source_hash,job_key,status,checkpoint,evidence')",
  'sourceHash: String(reportJob.source_hash ?? sourceHash)',
  'sourcePath: String(reportJob.source_path ?? fileName)',
  'importId: checkpointImportId',
], 'Canonical evidence recovery must preserve source lineage');

const assertGateImplementation = (source) => {
  if (!source.includes("if (!input.sourceSnapshotId) throw new Error('Report execution requires a source snapshot');")) {
    throw new Error('source snapshot guard missing');
  }
  if (!source.includes('assertNoQuarantine(input.routePlan);')) throw new Error('quarantine guard missing');
};
assertGateImplementation(gate);

// Test-of-test: prove the gate checker detects removal of the two critical
// fail-closed preconditions instead of merely checking that their names exist.
const tamperedWithoutSnapshot = gate.replace(
  /  if \(!input\.sourceSnapshotId\) throw new Error\('Report execution requires a source snapshot'\);\r?\n/,
  '',
);
let snapshotTamperRejected = false;
try { assertGateImplementation(tamperedWithoutSnapshot); } catch { snapshotTamperRejected = true; }
if (!snapshotTamperRejected) throw new Error('Test-of-test failed: source snapshot guard removal was not detected');

const tamperedWithoutQuarantine = gate.replace(/  assertNoQuarantine\(input\.routePlan\);\r?\n/, '');
let quarantineTamperRejected = false;
try { assertGateImplementation(tamperedWithoutQuarantine); } catch { quarantineTamperRejected = true; }
if (!quarantineTamperRejected) throw new Error('Test-of-test failed: quarantine gate removal was not detected');



required(canonicalImport, [
  'function describeError(error: unknown): string',
  'const detail = describeError(error);',
  'const message = describeError(error)',
], 'Canonical import must preserve structured RPC failures');

required(enqueueRpcMigration, [
  'drop function public.enqueue_report_execution_job(uuid,text,text,text,text[],integer,boolean);',
  'create function public.enqueue_report_execution_job(',
  'revoke all on function public.enqueue_report_execution_job(uuid,text,text,text,text[],integer,boolean) from public, anon, authenticated;',
  'grant execute on function public.enqueue_report_execution_job(uuid,text,text,text,text[],integer,boolean) to service_role;',
], 'Enqueue RPC overload migration must preserve the service-only force-reprocess boundary');
const sevenArgumentSignature = enqueueRpcMigration.match(
  /create function public\.enqueue_report_execution_job\(([\s\S]*?)\)\s*returns jsonb/i,
)?.[1];
if (!sevenArgumentSignature) throw new Error('Seven-argument enqueue RPC signature missing');
if (/\bDEFAULT\b/i.test(sevenArgumentSignature)) {
  throw new Error('Seven-argument force-reprocess RPC must not accept omitted arguments');
}
if (/grant execute on function public\.enqueue_report_execution_job\([^)]*\) to (?:public|anon|authenticated)\b/i.test(enqueueRpcMigration)) {
  throw new Error('Force-reprocess RPC must not broaden execute permissions');
}


const normalizedRemoveLegacyEnqueueRpcMigration = removeLegacyEnqueueRpcMigration.toLowerCase().replace(/\s+/g, ' ');
for (const marker of [
  'drop function if exists public.enqueue_report_execution_job(uuid, text, text, text, text[], integer);',
  'revoke all on function public.enqueue_report_execution_job(uuid, text, text, text, text[], integer, boolean) from public, anon, authenticated;',
  'grant execute on function public.enqueue_report_execution_job(uuid, text, text, text, text[], integer, boolean) to service_role;',
]) {
  if (!normalizedRemoveLegacyEnqueueRpcMigration.includes(marker)) throw new Error('Legacy enqueue overload cleanup migration missing: ' + marker);
}

const normalizedRestoreLegacyEnqueueRpcMigration = restoreLegacyEnqueueRpcMigration.toLowerCase().replace(/\s+/g, ' ');
for (const marker of [
  'create or replace function public.enqueue_report_execution_job(',
  'p_max_attempts integer default 5',
  'select public.enqueue_report_execution_job(',
  'p_max_attempts, false',
  'revoke all on function public.enqueue_report_execution_job(uuid, text, text, text, text[], integer) from public, anon;',
  'grant execute on function public.enqueue_report_execution_job(uuid, text, text, text, text[], integer) to authenticated, service_role;',
]) {
  if (!normalizedRestoreLegacyEnqueueRpcMigration.includes(marker)) throw new Error('Tenant-bound normal enqueue wrapper missing: ' + marker);
}

required(canonicalCommit, [
  'const rpcArgs: Record<string, unknown> = {',
  'const repairExistingSource = context.repairExistingSource === true;',
  'if (repairExistingSource) rpcArgs.p_repair = true;',
  "'import_commit_batch'",
], 'Canonical commit caller must send repair only for explicit repair requests');

const normalizedImportCommitRpcMigration = importCommitRpcMigration.toLowerCase().replace(/\s+/g, ' ');
for (const marker of [
  'drop function public.import_commit_batch(uuid,text,jsonb,text,text,uuid,boolean);',
  'create function public.import_commit_batch(',
  'revoke all on function public.import_commit_batch(uuid,text,jsonb,text,text,uuid,boolean) from public, anon, authenticated;',
  'grant execute on function public.import_commit_batch(uuid,text,jsonb,text,text,uuid,boolean) to service_role;',
]) {
  if (!normalizedImportCommitRpcMigration.includes(marker)) throw new Error('import_commit_batch overload migration missing: ' + marker);
}
const repairCommitSignature = importCommitRpcMigration.match(
  /create function public\.import_commit_batch\(([\s\S]*?)\)\s*returns jsonb/i,
)?.[1];
if (!repairCommitSignature) throw new Error('Seven-argument import_commit_batch signature missing');
if (/\bDEFAULT\b/i.test(repairCommitSignature)) {
  throw new Error('Seven-argument import_commit_batch repair overload must not accept omitted arguments');
}

console.log('Report execution E2E contract: PASS (component boundaries plus adversarial guard-removal tests)');
