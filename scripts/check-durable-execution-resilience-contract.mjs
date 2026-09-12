import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const runner = read('src/lib/report-execution/durable-production-runner.ts');
const adapter = read('src/lib/report-execution/durable-worker-adapter.ts');
const ledger = read('supabase/migrations/20260912183000_import_commit_idempotency_ledger.sql');
const importCommit = read('src/lib/import/canonical-commit.ts');

const required = [
  ['runner executes stage before checkpoint', /await input\.executeStage\(following/],
  ['runner checkpoints only after stage success', /await input\.executeStage\(following[\s\S]*?await store\.saveCheckpoint/],
  ['runner heartbeat failure is fail-closed', /if \(heartbeatFailure\) throw heartbeatFailure/],
  ['runner failure persists fail state', /await store\.fail\(input\.jobId/],
  ['runner retries within durable budget', /if \(job\.attempt < job\.maxAttempts\) await store\.retry/],
  ['checkpoint requires lease owner', /Checkpoint persistence requires the active worker lease owner/],
  ['checkpoint uses lease token', /p_lease_token: lease\.leaseToken/],
  ['heartbeat uses lease token', /heartbeat_report_execution_job/],
  ['claim stores lease token', /this\.leases\.set\(jobId/],
  ['ledger unique tenant source identity', /UNIQUE \(company_id, entity_type, source_hash\)/],
  ['ledger transaction follows canonical mutation', /canonical_import_commits/],
  ['canonical commit requires source hash', /IMPORT_SOURCE_HASH_REQUIRED/],
  ['canonical commit validates source hash', /IMPORT_SOURCE_HASH_INVALID/],
];

const missing = required.filter(([, pattern]) => !pattern.test(`${runner}\n${adapter}\n${ledger}\n${importCommit}`)).map(([name]) => name);
if (missing.length) throw new Error(`Durable execution resilience contract blockers:\n${missing.join('\n')}`);

if (!/BEGIN[\s\S]*?canonical_import_commits[\s\S]*?FOR UPDATE[\s\S]*?IF FOUND THEN RETURN/.test(ledger)) {
  throw new Error('Crash-retry ledger must replay an existing tenant/source commit before mutation');
}

console.log('Durable execution resilience contract: PASS (source-level fail-closed invariants locked)');
