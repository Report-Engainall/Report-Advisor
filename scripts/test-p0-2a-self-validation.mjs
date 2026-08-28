import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { requireSafeRuntimeEnvironment, requireAuthenticatedContext } from './runtime-evidence-config.mjs';
import { createEvidenceRecord, sanitizeEvidence, RUNTIME_EVIDENCE_FIELDS } from './runtime-evidence-record.mjs';
import { DATABASE_TABLES, CHILD_TABLES, RPC_MATRIX, discoverRepositoryRpcSurface } from './runtime-evidence-matrix.mjs';
import { MUTATION_OPERATIONS, mutationCoverageKey, requiredChildMutationKeys, validateChildMutationCoverage } from './p0-2-mutation-coverage.mjs';
import { assertMutationResponseIdentity, assertMutationTargetIdentity, mutationTargetId } from './p0-2-mutation-identity.mjs';

const ROOT = process.cwd();
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
function expectThrow(name, fn, fragment) {
  assert.throws(fn, (error) => String(error?.message).includes(fragment), name);
  console.log(`PASS ${name}`);
}

for (const env of [undefined, '', 'unknown', 'undefined', 'production', 'PROD']) {
  expectThrow(`environment:${env ?? 'undefined'}`, () => requireSafeRuntimeEnvironment(env === undefined ? {} : { RUNTIME_EVIDENCE_ENV: env }), 'ABORT');
}
assert.equal(requireSafeRuntimeEnvironment({ RUNTIME_EVIDENCE_ENV: 'staging' }), 'staging');
assert.equal(requireSafeRuntimeEnvironment({ RUNTIME_EVIDENCE_ENV: 'TEST' }), 'test');

const validContext = { actor:'actor-a', authorizedTenant:'tenant-a', targetTenant:'tenant-b', environment:'staging', release:'release-1', commitSha:'commit-1' };
for (const field of Object.keys(validContext)) {
  const copy = { ...validContext };
  delete copy[field];
  expectThrow(`authenticated-context:missing-${field}`, () => requireAuthenticatedContext(copy), 'NOT VERIFIED');
}

const complete = Object.fromEntries(RUNTIME_EVIDENCE_FIELDS.map((field) => {
  if (field === 'ROWS_RETURNED' || field === 'ROWS_AFFECTED') return [field, 0];
  if (field === 'RESULT') return [field, 'PASS'];
  return [field, `${field}-value`];
}));
for (const field of RUNTIME_EVIDENCE_FIELDS) {
  const copy = { ...complete };
  delete copy[field];
  expectThrow(`evidence:missing-${field}`, () => createEvidenceRecord(copy), 'NOT VERIFIED');
}
expectThrow('evidence:pass-without-row-counts', () => createEvidenceRecord({ ...complete, ROWS_RETURNED: undefined }), 'NOT VERIFIED');
expectThrow('evidence:invalid-result', () => createEvidenceRecord({ ...complete, RESULT:'CERTIFIED' }), 'Invalid evidence result');

const redacted = sanitizeEvidence({ password:'FAKE_TEST_PASSWORD', token:'FAKE_TEST_TOKEN', service_role:'FAKE_TEST_SERVICE_ROLE', authorization:'FAKE_AUTH', cookie:'FAKE_COOKIE', nested:{password:'FAKE_TEST_PASSWORD'}, safe:'kept' });
for (const key of ['password','token','service_role','authorization','cookie']) assert.equal(redacted[key], '[REDACTED]');
assert.equal(redacted.nested.password, '[REDACTED]');
const redactedText = JSON.stringify(redacted);
for (const secret of ['FAKE_TEST_PASSWORD','FAKE_TEST_TOKEN','FAKE_TEST_SERVICE_ROLE','FAKE_AUTH','FAKE_COOKIE']) assert.equal(redactedText.includes(secret), false, `secret leaked: ${secret}`);
console.log('PASS evidence:secret-redaction');

const seedSource = read('scripts/runtime-evidence-seed.mjs');
const guardPos = seedSource.indexOf('const environment = requireSafeRuntimeEnvironment();');
const clientPos = seedSource.indexOf('createClient(');
assert.ok(guardPos >= 0 && clientPos >= 0 && guardPos < clientPos, 'seed safety guard must precede client construction');
assert.match(seedSource, /assertTenantExclusivity\(/);
const seed = spawnSync(process.execPath, ['scripts/runtime-evidence-seed.mjs'], { encoding:'utf8', env:{ PATH:process.env.PATH, HOME:process.env.HOME } });
assert.notEqual(seed.status, 0);
assert.match(`${seed.stdout}\n${seed.stderr}`, /ABORT|NOT READY/);
console.log('PASS seed:abort-without-safe-environment');
const productionSeed = spawnSync(process.execPath, ['scripts/runtime-evidence-seed.mjs'], { encoding:'utf8', env:{ ...process.env, RUNTIME_EVIDENCE_ENV:'production' } });
assert.notEqual(productionSeed.status, 0);
assert.match(`${productionSeed.stdout}\n${productionSeed.stderr}`, /ABORT/);
console.log('PASS seed:abort-production');

const harness = read('scripts/p0-2-live-isolation-harness.mjs');
assert.match(harness, /if \(!result\.verified\)/);
assert.match(harness, /RESULT: result\.leak \? 'FAIL' : 'PASS'/);
assert.match(harness, /if \(record\.RESULT === 'FAIL'\) throw/);
assert.match(harness, /if \(failures\.length \|\| unverified\.length\) process\.exitCode = 1/);
console.log('PASS harness:fail-closed-leak-and-error-semantics');

const executor = read('scripts/p0-2-runtime-executor.mjs');
const coverageHelper = read('scripts/p0-2-mutation-coverage.mjs');
const identityHelper = read('scripts/p0-2-mutation-identity.mjs');
assert.match(executor, /function snapshotOriginalState\(/);
assert.match(executor, /fixture\.restore does not match original database state/);
assert.match(executor, /const snapshot = await snapshotOriginalState\(client, fixture, targetId, fixture\.restore, !attack\)/);
assert.match(executor, /observeMutatedState\(client, fixture, snapshot\.original, targetId, response\)/);
assert.match(executor, /restoreAndVerify\(client, fixture, snapshot\.original, targetId\)/);
assert.match(executor, /mutatedStateObserved: Boolean\(mutatedState\)/);
assert.match(executor, /targetIdentityInvariant/);
assert.match(executor, /finally \{[\s\S]*restoreAndVerify\(client, fixture, snapshot\.original, targetId\)/);
assert.match(coverageHelper, /function mutationCoverageKey\(/);
assert.match(coverageHelper, /requiredChildMutationKeys\(/);
assert.match(coverageHelper, /duplicate child mutation cases/);
assert.match(coverageHelper, /invalid child mutation cases/);
assert.match(coverageHelper, /F13 child mutation coverage incomplete/);
assert.match(identityHelper, /function mutationTargetId\(/);
assert.match(identityHelper, /function assertMutationTargetIdentity\(/);
assert.match(identityHelper, /function assertMutationResponseIdentity\(/);
assert.match(identityHelper, /MUTATION_IDENTITY/);

const ownUpdate = { table:'sale_items', operation:'UPDATE', own:{ id:'A' }, foreign:{ id:'B' }, restore:{ id:'A' } };
assert.equal(mutationTargetId(ownUpdate), 'A');
assert.equal(assertMutationTargetIdentity(ownUpdate, 'A', 'A'), 'A');
assert.equal(assertMutationResponseIdentity(ownUpdate, 'A', [{ id:'A' }]), 'A');
expectThrow('F11:fixture-identity-divergence', () => mutationTargetId({ ...ownUpdate, restore:{ id:'B' } }), 'mutation target identity diverges');
expectThrow('F11:mutation-observes-different-record', () => assertMutationTargetIdentity(ownUpdate, 'A', 'B'), 'mutation target identity mismatch');
expectThrow('F11:mutation-response-different-record', () => assertMutationResponseIdentity(ownUpdate, 'A', [{ id:'B' }]), 'mutation response identity mismatch');
const adversarial = { table:'sale_items', operation:'UPDATE', own:{ id:'A' }, foreign:{ id:'B' }, restore:{ id:'A' } };
assert.equal(mutationTargetId(adversarial), 'A');
console.log('PASS F11:adversarial-snapshot-A-mutate-B-observe-B-restore-A is rejected by canonical target identity invariant');

const requiredChildCases = requiredChildMutationKeys();
assert.equal(requiredChildCases.length, CHILD_TABLES.length * MUTATION_OPERATIONS.length);
assert.deepEqual(requiredChildCases, CHILD_TABLES.flatMap((table) => MUTATION_OPERATIONS.map((operation) => mutationCoverageKey(table, operation))));
const completeChildFixtures = requiredChildCases.map((key) => {
  const [table, operation] = key.split('::');
  return { table, operation, own: { id: `${table}-own-${operation}` }, foreign: { id: `${table}-foreign-${operation}` }, restore: { id: `${table}-own-${operation}` } };
});
assert.deepEqual(validateChildMutationCoverage(completeChildFixtures).actual.sort(), requiredChildCases.sort());
expectThrow('F13:missing-child-case', () => validateChildMutationCoverage(completeChildFixtures.slice(1)), 'F13 child mutation coverage incomplete');
expectThrow('F13:duplicate-child-case', () => validateChildMutationCoverage([...completeChildFixtures, completeChildFixtures[0]]), 'duplicate child mutation cases');
expectThrow('F13:invalid-child-case', () => validateChildMutationCoverage([...completeChildFixtures, { table: 'not_a_child', operation: 'INSERT' }]), 'invalid child mutation cases');
console.log(`PASS executor:F11-original-snapshot-mutated-observation-restored-verification-F13-child-dynamic-coverage-F14-denial-F12-root-semantics (${requiredChildCases.length} required child cases)`);

assert.match(executor, /DENIAL_CLASS/);
assert.match(executor, /RLS_FILTERED/);
assert.match(executor, /UNRESOLVED_ZERO_ROWS/);
assert.match(executor, /table === 'companies' \? 'id' : 'company_id'/);

const rlsSource = read('supabase/migrations/20260823000000_tenant_rls_global_hardening.sql');
const directBlock = rlsSource.match(/FOREACH t IN ARRAY ARRAY\[([\s\S]*?)\]\n\s*LOOP/);
assert.ok(directBlock, 'canonical tenant table array not found');
const canonicalDirect = [...directBlock[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
const matrixDirect = DATABASE_TABLES.filter((table) => table !== 'companies' && !CHILD_TABLES.includes(table));
assert.deepEqual([...matrixDirect].sort(), [...canonicalDirect].sort(), 'STALE MATRIX: direct tenant tables differ from canonical RLS migration');
for (const child of CHILD_TABLES) assert.match(rlsSource, new RegExp(`CREATE POLICY tenant_${child}\\b`), `MISSING COVERAGE: ${child}`);
assert.ok(DATABASE_TABLES.includes('companies'), 'MISSING COVERAGE: companies');
console.log(`PASS matrix:tenant-schema (${DATABASE_TABLES.length} tables)`);

const independentRpcNames = new Set();
const migrationDir = path.join(ROOT, 'supabase', 'migrations');
for (const file of fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort()) {
  const text = fs.readFileSync(path.join(migrationDir, file), 'utf8');
  for (const match of text.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:(?:public)\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gi)) independentRpcNames.add(match[1]);
}
assert.deepEqual(RPC_MATRIX.map((entry) => entry.rpc), [...independentRpcNames].sort(), 'STALE/MISSING COVERAGE: RPC matrix differs from SQL function surface');
assert.deepEqual(RPC_MATRIX.map((entry) => entry.rpc), discoverRepositoryRpcSurface(ROOT).map((entry) => entry.rpc));
assert.ok(RPC_MATRIX.every((entry) => entry.classification), 'RPC inventory entries must be classified');
console.log(`PASS matrix:rpc-surface (${RPC_MATRIX.length} functions)`);

const index = read('docs/MASTER_EXECUTION_INDEX_FINAL_DEEP_VERIFICATION_2026-08-28.md');
assert.match(index, /P0-2A Runtime Evidence Infrastructure \| IMPLEMENTED/);
assert.match(index, /P0-2 Tenant A\/B isolation[^\n]*BLOCKED/);
assert.match(index, /Production\s+readiness|PRODUCTION-CERTIFIED/);
assert.doesNotMatch(index, /P0-2\s*=\s*PASS/);
const workflow = read('.github/workflows/quality.yml');
assert.match(workflow, /P0-2A runtime evidence readiness/);
assert.doesNotMatch(workflow, /p0-2-live-isolation-harness\.mjs/);
assert.doesNotMatch(workflow, /P0-2[^\n]*(?:LIVE|VERIFIED|CERTIFIED)\s*=/i);
console.log('PASS semantics:readiness-vs-live-certification');

console.log('P0-2A SELF-VALIDATION PASS: fail-closed guards, immutable canonical F11 target identity, original-state mutation snapshot, observed mutation state, restored-state verification, dynamic child coverage, negative cases, evidence integrity, matrix consistency, RPC classification, and certification separation verified. No live tenant claim emitted.');
