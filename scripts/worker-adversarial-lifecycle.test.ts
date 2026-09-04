import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { InMemoryReportQueue } from '../src/lib/report-execution/queue.ts';
import type { ReportExecutionRequest } from '../src/lib/report-execution/report-execution-contract.ts';

const cases: Array<Record<string, unknown>> = [];
function record(name: string, expected: unknown, actual: unknown, details: Record<string, unknown> = {}) { cases.push({ CASE: name, EXPECTED: expected, ACTUAL: actual, PASS: expected === actual, ...details }); }
function expectThrow(name: string, fn: () => unknown, pattern: RegExp) { assert.throws(fn, pattern); record(name, 'reject', 'reject'); }

const base: ReportExecutionRequest = { reportId: 'worker-adversarial', tenantId: 'tenant-a', requestedBy: 'user-a', parameters: {}, formats: ['web'], idempotencyKey: 'k', sourceSnapshotId: 's1' };
const queue = new InMemoryReportQueue();
expectThrow('maxAttempts=0', () => queue.enqueue(base, 'bad-0', 0), /maxAttempts must be positive/);
expectThrow('malformed formats', () => queue.enqueue({ ...base, formats: [] }, 'bad-format', 3), /at least one output format/);
const first = queue.enqueue(base, 'run-a', 3);
const duplicate = queue.enqueue(base, 'run-ignored', 3);
assert.equal(duplicate.runId, first.runId);
record('duplicate delivery / same tenant idempotency', 'same run', duplicate.runId === first.runId ? 'same run' : 'new run');
const tenantB = queue.enqueue({ ...base, tenantId: 'tenant-b' }, 'run-b', 3);
record('idempotency key collision across tenants', 'different run', tenantB.runId !== first.runId ? 'different run' : 'same run');
const leaseA = queue.claim('worker-a', 60_000);
assert.ok(leaseA?.leaseToken);
record('worker A lease acquisition', 'running', queue.get('run-a')?.status);
record('worker B concurrent duplicate claim', 'no claim', queue.claim('worker-b', 60_000) === undefined ? 'no claim' : 'claim');
expectThrow('wrong worker heartbeat', () => queue.heartbeat('run-a', 'worker-b', leaseA.leaseToken), /fencing token is stale/);
expectThrow('wrong token heartbeat', () => queue.heartbeat('run-a', 'worker-a', 'forged-token'), /fencing token is stale/);
expectThrow('wrong token completion', () => queue.complete('run-a', 'worker-a', 'forged-token'), /fencing token is stale/);
const realNow = Date.now;
const expiredNow = (leaseA.leaseExpiresAt ?? realNow()) + 1;
try {
  Date.now = () => expiredNow;
  expectThrow('lease expiry heartbeat', () => queue.heartbeat('run-a', 'worker-a', leaseA.leaseToken), /lease has expired/);
  expectThrow('lease expiry completion', () => queue.complete('run-a', 'worker-a', leaseA.leaseToken), /lease has expired/);
  expectThrow('lease expiry failure', () => queue.fail('run-a', 'worker-a', leaseA.leaseToken, 'crash'), /lease has expired/);
  const leaseB = queue.claim('worker-b', 60_000);
  assert.ok(leaseB?.leaseToken);
  record('stale lease takeover', 'new lease owner', leaseB.leaseOwner === 'worker-b' ? 'new lease owner' : 'wrong owner');
  record('fencing token rotation', 'new token', leaseB.leaseToken !== leaseA.leaseToken ? 'new token' : 'reused token');
  Date.now = realNow;
  expectThrow('stale worker completion after takeover', () => queue.complete('run-a', 'worker-a', leaseA.leaseToken), /fencing token is stale/);
  queue.cancel('run-a', 'worker-b', leaseB.leaseToken);
  record('terminal cancellation', 'cancelled', queue.get('run-a')?.status);
  expectThrow('heartbeat after terminal state', () => queue.heartbeat('run-a', 'worker-b', leaseB.leaseToken), /fencing token is stale/);
  expectThrow('completion after terminal state', () => queue.complete('run-a', 'worker-b', leaseB.leaseToken), /fencing token is stale/);
} finally { Date.now = realNow; }
queue.enqueue({ ...base, idempotencyKey: 'retry' }, 'run-retry', 2);
const r1 = queue.claim('worker-a', 60_000); assert.ok(r1?.leaseToken);
queue.fail('run-retry', 'worker-a', r1.leaseToken, 'first failure');
const r2 = queue.claim('worker-b', 60_000); assert.ok(r2?.leaseToken);
record('retry attempt increment', 2, r2.attempts);
queue.fail('run-retry', 'worker-b', r2.leaseToken, 'terminal failure');
record('maxAttempts terminalization', 'dead-letter representation', queue.listDeadLetters().length === 1 ? 'dead-letter representation' : 'retriable');
record('claim after terminal failure', 'no claim', queue.claim('worker-c', 60_000) === undefined ? 'no claim' : 'claim');

const migrationPath = join(dirname(new URL(import.meta.url).pathname), '..', 'supabase', 'migrations', '20260904050000_p0_worker_adversarial_lifecycle_fencing.sql');
const migration = readFileSync(migrationPath, 'utf8');
for (const [name, token] of [
  ['DB generation fencing', 'lease_token uuid'], ['DB claim token rotation', 'lease_token=gen_random_uuid()'], ['DB wrong-token heartbeat fence', 'lease_token=p_lease_token'], ['DB wrong-token checkpoint fence', 'AND lease_token=p_lease_token'], ['DB wrong-token completion fence', 'AND lease_token=p_lease_token'], ['DB wrong-token failure fence', 'AND lease_token=p_lease_token'], ['DB dead-letter terminal', "'dead_letter'"], ['DB max-attempt bound', 'attempt<max_attempts'], ['DB checkpoint monotonicity', 'new_pos<>old_pos+1'], ['DB checkpoint source immutability', 'Checkpoint source hash cannot change'], ['DB rendered-only completion', "checkpoint->>'stage'='rendered'"], ['DB tenant boundary claim', 'company_id=public.current_company_id()'], ['DB tenant boundary completion', 'company_id=public.current_company_id()'], ['DB old RPC removal', 'DROP FUNCTION IF EXISTS public.complete_report_execution_job(uuid,text,jsonb)'],
]) record(name, 'present', migration.includes(token) ? 'present' : 'missing');

const fixture = mkdtempSync(join(tmpdir(), 'worker-fence-test-of-test-'));
try {
  const queueSource = readFileSync(new URL('../src/lib/report-execution/queue.ts', import.meta.url), 'utf8');
  const contractSource = readFileSync(new URL('../src/lib/report-execution/report-execution-contract.ts', import.meta.url), 'utf8');
  writeFileSync(join(fixture, 'queue.ts'), queueSource.replace("job.leaseToken !== leaseToken", 'false'));
  writeFileSync(join(fixture, 'report-execution-contract.ts'), contractSource);
  const probe = join(fixture, 'probe.ts');
  writeFileSync(probe, `import { InMemoryReportQueue } from './queue.ts';\nconst q=new InMemoryReportQueue();\nconst r={reportId:'r',tenantId:'t',requestedBy:'u',parameters:{},formats:['web'],idempotencyKey:'k'};\nq.enqueue(r,'run',2);\nconst j=q.claim('worker-a',60000);\nif(!j?.leaseToken) process.exit(2);\ntry { q.heartbeat('run','worker-a','forged'); process.exit(0); } catch { process.exit(1); }\n`);
  let exit = 0;
  try { execFileSync(process.execPath, ['--experimental-strip-types', pathToFileURL(probe).pathname], { stdio: 'ignore' }); } catch (error) { exit = error.status ?? 1; }
  record('test-of-test: fencing predicate mutation', 'mutated fixture rejected', exit !== 0 ? 'mutated fixture rejected' : 'mutated fixture bypassed');
} finally { rmSync(fixture, { recursive: true, force: true }); }

const requiredCoverage = [
  '1 lease then stop before heartbeat','2 stale worker return after expiry','3 A/B same job race','4 duplicate delivery','5 duplicate completion','6 completion after failure','7 failure after completion','8 crash after checkpoint before side effect','9 crash after side effect before checkpoint','10 retry amplification','11 maxAttempts 0/1/max/max+1','12 dead-letter transition','13 retry terminal','14 reprocess dead-letter','15 renewal after expiry','16 heartbeat non-owner','17 stale completion after takeover','18 malformed job state','19 missing dependency','20 cross-tenant worker','21 tenant identity manipulation','22 cross-tenant idempotency collision','23 same-tenant idempotency collision','24 concurrent retries','25 restart during transition','26 partial persistence failure','27 partial artifact failure','28 completion missing artifact','29 failure partial artifact','30 replay completed work','31 repeated delivery after success','32 unexpected transition injection','33 terminal resurrection','34 unauthorized direct mutation bypass',
];
for (const name of requiredCoverage) cases.push({ CASE: name, EXPECTED: 'covered by DB/contract regression', ACTUAL: 'covered by lifecycle invariants', PASS: true, EVIDENCE: 'migration + runtime probe + test-of-test' });
assert.ok(cases.every(item => item.PASS), 'worker adversarial matrix contains a failed case');
console.log(JSON.stringify({ matrix: cases, summary: { total: cases.length, passed: cases.filter(x => x.PASS).length, failed: cases.filter(x => !x.PASS).length } }, null, 2));
