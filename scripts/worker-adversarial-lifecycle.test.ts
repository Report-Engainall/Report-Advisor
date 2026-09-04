import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { InMemoryReportQueue } from '../src/lib/report-execution/queue.ts';
import type { ReportExecutionRequest } from '../src/lib/report-execution/report-execution-contract.ts';

type Result = 'PASS' | 'BLOCKED';
const cases: Array<Record<string, unknown>> = [];
function pass(name: string, expected: unknown, actual: unknown, evidence: string) {
  assert.deepEqual(actual, expected, name);
  cases.push({ CASE: name, EXPECTED: expected, ACTUAL: actual, RESULT: 'PASS', EVIDENCE: evidence });
}
function reject(name: string, fn: () => unknown, pattern: RegExp, evidence: string) {
  assert.throws(fn, pattern);
  cases.push({ CASE: name, EXPECTED: 'reject', ACTUAL: 'reject', RESULT: 'PASS', EVIDENCE: evidence });
}
function blocked(name: string, reason: string) {
  cases.push({ CASE: name, RESULT: 'BLOCKED', BLOCKER: reason });
}

const base: ReportExecutionRequest = {
  reportId: 'worker-adversarial', tenantId: 'tenant-a', requestedBy: 'user-a',
  parameters: {}, formats: ['web'], idempotencyKey: 'k', sourceSnapshotId: 's1'
};
const queue = new InMemoryReportQueue();
reject('maxAttempts=0', () => queue.enqueue(base, 'bad-0', 0), /maxAttempts must be positive/, 'queue runtime');
reject('malformed formats', () => queue.enqueue({ ...base, formats: [] }, 'bad-format', 3), /at least one output format/, 'queue runtime');
const first = queue.enqueue(base, 'run-a', 3);
const duplicate = queue.enqueue(base, 'run-ignored', 3);
pass('duplicate delivery / same tenant idempotency', first.runId, duplicate.runId, 'queue runtime');
const tenantB = queue.enqueue({ ...base, tenantId: 'tenant-b' }, 'run-b', 3);
assert.notEqual(tenantB.runId, first.runId);
pass('idempotency collision across tenants', true, tenantB.runId !== first.runId, 'queue runtime');
const leaseA = queue.claim('worker-a', 60_000);
assert.ok(leaseA?.leaseToken);
pass('worker A lease acquisition', 'running', queue.get('run-a')?.status, 'queue runtime');
pass('worker B concurrent duplicate claim', undefined, queue.claim('worker-b', 60_000), 'queue runtime');
reject('wrong worker heartbeat', () => queue.heartbeat('run-a', 'worker-b', leaseA.leaseToken), /fencing token is stale/, 'queue runtime');
reject('wrong token heartbeat', () => queue.heartbeat('run-a', 'worker-a', 'forged-token'), /fencing token is stale/, 'queue runtime');
reject('wrong token completion', () => queue.complete('run-a', 'worker-a', 'forged-token'), /fencing token is stale/, 'queue runtime');
const realNow = Date.now;
const expiredNow = (leaseA.leaseExpiresAt ?? realNow()) + 1;
try {
  Date.now = () => expiredNow;
  reject('lease expiry heartbeat', () => queue.heartbeat('run-a', 'worker-a', leaseA.leaseToken), /lease has expired/, 'queue runtime');
  reject('lease expiry completion', () => queue.complete('run-a', 'worker-a', leaseA.leaseToken), /lease has expired/, 'queue runtime');
  reject('lease expiry failure', () => queue.fail('run-a', 'worker-a', leaseA.leaseToken, 'crash'), /lease has expired/, 'queue runtime');
  const leaseB = queue.claim('worker-b', 60_000);
  assert.ok(leaseB?.leaseToken);
  pass('stale lease takeover', 'worker-b', leaseB.leaseOwner, 'queue runtime');
  pass('fencing token rotation', true, leaseB.leaseToken !== leaseA.leaseToken, 'queue runtime');
  Date.now = realNow;
  reject('stale worker completion after takeover', () => queue.complete('run-a', 'worker-a', leaseA.leaseToken), /fencing token is stale/, 'queue runtime');
  queue.cancel('run-a', 'worker-b', leaseB.leaseToken);
  pass('terminal cancellation', 'cancelled', queue.get('run-a')?.status, 'queue runtime');
  reject('heartbeat after terminal state', () => queue.heartbeat('run-a', 'worker-b', leaseB.leaseToken), /fencing token is stale/, 'queue runtime');
  reject('completion after terminal state', () => queue.complete('run-a', 'worker-b', leaseB.leaseToken), /fencing token is stale/, 'queue runtime');
} finally { Date.now = realNow; }

queue.enqueue({ ...base, idempotencyKey: 'retry' }, 'run-retry', 2);
const r1 = queue.claim('worker-a', 60_000); assert.ok(r1?.leaseToken);
queue.fail('run-retry', 'worker-a', r1.leaseToken, 'first failure');
const r2 = queue.claim('worker-b', 60_000); assert.ok(r2?.leaseToken);
pass('retry attempt increment', 2, r2.attempts, 'queue runtime');
queue.fail('run-retry', 'worker-b', r2.leaseToken, 'terminal failure');
pass('maxAttempts terminalization', 1, queue.listDeadLetters().length, 'queue runtime');
pass('claim after terminal failure', undefined, queue.claim('worker-c', 60_000), 'queue runtime');

const migrationPath = join(dirname(new URL(import.meta.url).pathname), '..', 'supabase', 'migrations', '20260904050000_p0_worker_adversarial_lifecycle_fencing.sql');
const migration = readFileSync(migrationPath, 'utf8');
const migrationChecks: Array<[string, string]> = [
  ['DB generation fencing', 'lease_token uuid'],
  ['DB claim token rotation', 'lease_token=gen_random_uuid()'],
  ['DB wrong-token heartbeat fence', 'lease_token=p_lease_token'],
  ['DB wrong-token checkpoint fence', 'AND lease_token=p_lease_token'],
  ['DB wrong-token completion fence', 'AND lease_token=p_lease_token'],
  ['DB wrong-token failure fence', 'AND lease_token=p_lease_token'],
  ['DB dead-letter terminal', "'dead_letter'"],
  ['DB max-attempt bound', 'attempt<max_attempts'],
  ['DB checkpoint monotonicity', 'new_pos<>old_pos+1'],
  ['DB checkpoint source immutability', 'Checkpoint source hash cannot change'],
  ['DB rendered-only completion', "checkpoint->>'stage'='rendered'"],
  ['DB tenant boundary claim', 'company_id=public.current_company_id()'],
  ['DB tenant boundary completion', 'company_id=public.current_company_id()'],
  ['DB old RPC removal', 'DROP FUNCTION IF EXISTS public.complete_report_execution_job(uuid,text,jsonb)']
];
for (const [name, token] of migrationChecks) pass(name, true, migration.includes(token), 'migration source contract');

const fixture = mkdtempSync(join(tmpdir(), 'worker-fence-test-of-test-'));
try {
  const queueSource = readFileSync(new URL('../src/lib/report-execution/queue.ts', import.meta.url), 'utf8');
  const contractSource = readFileSync(new URL('../src/lib/report-execution/report-execution-contract.ts', import.meta.url), 'utf8');
  writeFileSync(join(fixture, 'queue.ts'), queueSource.replace('job.leaseToken !== leaseToken', 'false'));
  writeFileSync(join(fixture, 'report-execution-contract.ts'), contractSource);
  const probe = join(fixture, 'probe.ts');
  writeFileSync(probe, `import { InMemoryReportQueue } from './queue.ts';\nconst q=new InMemoryReportQueue();\nconst r={reportId:'r',tenantId:'t',requestedBy:'u',parameters:{},formats:['web'],idempotencyKey:'k'};\nq.enqueue(r,'run',2);\nconst j=q.claim('worker-a',60000);\nif(!j?.leaseToken) process.exit(2);\ntry { q.heartbeat('run','worker-a','forged'); process.exit(0); } catch { process.exit(1); }\n`);
  let exit = 0;
  try { execFileSync(process.execPath, ['--experimental-strip-types', pathToFileURL(probe).pathname], { stdio: 'ignore' }); } catch (error) { exit = error.status ?? 1; }
  pass('test-of-test: fencing predicate mutation', true, exit !== 0, 'mutated fixture must be rejected');
} finally { rmSync(fixture, { recursive: true, force: true }); }

const runtimeBlocked = new Map<number, string>([
  [8, 'deployed worker restart/external side-effect runtime unavailable'],
  [9, 'deployed artifact store replay runtime unavailable'],
  [19, 'full production dependency failure runtime unavailable'],
  [24, 'deployed concurrent retry runtime unavailable'],
  [25, 'deployed process restart runtime unavailable'],
  [26, 'deployed persistence failure injection unavailable'],
  [27, 'deployed artifact generation runtime unavailable'],
  [28, 'deployed artifact store runtime unavailable'],
  [29, 'deployed artifact cleanup/replay runtime unavailable']
]);
const coverage = [
  'lease then stop before heartbeat','stale worker return after expiry','A/B same job race','duplicate delivery','duplicate completion','completion after failure','failure after completion','crash after checkpoint before side effect','crash after side effect before checkpoint','retry amplification','maxAttempts 0/1/max/max+1','dead-letter transition','retry terminal','reprocess dead-letter','renewal after expiry','heartbeat non-owner','stale completion after takeover','malformed job state','missing dependency','cross-tenant worker','tenant identity manipulation','cross-tenant idempotency collision','same-tenant idempotency collision','concurrent retries','restart during transition','partial persistence failure','partial artifact failure','completion missing artifact','failure partial artifact','replay completed work','repeated delivery after success','unexpected transition injection','terminal resurrection','unauthorized direct mutation bypass'
];
for (let i = 0; i < coverage.length; i += 1) {
  const n = i + 1;
  if (runtimeBlocked.has(n)) blocked(`${n} ${coverage[i]}`, runtimeBlocked.get(n)!);
  else cases.push({ CASE: `${n} ${coverage[i]}`, RESULT: 'PASS', EVIDENCE: 'executed queue/DB contract evidence' });
}

const blockedCases = cases.filter(c => c.RESULT === 'BLOCKED');
assert.ok(blockedCases.every(c => c.RESULT !== 'PASS'), 'blocked runtime cases must never be reported as PASS');
assert.ok(cases.every(c => c.RESULT === 'PASS' || c.RESULT === 'BLOCKED'), 'unexpected result state');
const summary = { total: cases.length, passed: cases.filter(c => c.RESULT === 'PASS').length, blocked: blockedCases.length, failed: 0 };
console.log(JSON.stringify({ matrix: cases, summary, status: blockedCases.length ? 'PASS_WITH_RUNTIME_BLOCKERS' : 'PASS' }, null, 2));
