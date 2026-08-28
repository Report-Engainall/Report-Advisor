import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DATABASE_TABLES, CHILD_TABLES, RPC_MATRIX, discoverRepositoryRpcSurface } from './runtime-evidence-matrix.mjs';
import { RUNTIME_EVIDENCE_FIELDS, createEvidenceRecord } from './runtime-evidence-record.mjs';
import { requireSafeRuntimeEnvironment, requireAuthenticatedContext } from './runtime-evidence-config.mjs';

const ROOT = process.cwd();
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const expectThrow = (label, fn, marker) => assert.throws(fn, (error) => String(error.message).includes(marker), label);

// A/B: environment guard must reject absent, unknown and production-like environments.
for (const value of [undefined, '', 'unknown', 'undefined', 'production', 'PROD']) {
  expectThrow(`environment guard: ${String(value)}`, () => requireSafeRuntimeEnvironment(
    value === undefined ? {} : { RUNTIME_EVIDENCE_ENV: value },
  ), 'ABORT');
}
assert.equal(requireSafeRuntimeEnvironment({ RUNTIME_EVIDENCE_ENV: 'staging' }), 'staging');
assert.equal(requireSafeRuntimeEnvironment({ RUNTIME_EVIDENCE_ENV: 'TEST' }), 'test');

// C: every authenticated runtime field is mandatory.
const validContext = {
  actor: 'actor-a', authorizedTenant: 'tenant-a', targetTenant: 'tenant-b',
  environment: 'staging', release: 'release-1', commitSha: 'commit-1',
};
for (const field of Object.keys(validContext)) {
  const candidate = { ...validContext };
  delete candidate[field];
  expectThrow(`authenticated context missing ${field}`, () => requireAuthenticatedContext(candidate), 'NOT VERIFIED');
}

// D: every evidence field is mandatory; PASS cannot be forged with missing row counts.
const validEvidence = Object.fromEntries(RUNTIME_EVIDENCE_FIELDS.map((field) => {
  if (field === 'RESULT') return [field, 'PASS'];
  if (field === 'ROWS_RETURNED' || field === 'ROWS_AFFECTED') return [field, 0];
  return [field, `${field}-value`];
}));
for (const field of RUNTIME_EVIDENCE_FIELDS) {
  const candidate = { ...validEvidence };
  delete candidate[field];
  expectThrow(`evidence missing ${field}`, () => createEvidenceRecord(candidate), 'NOT VERIFIED');
}
expectThrow('forged PASS missing rows', () => createEvidenceRecord({ ...validEvidence, ROWS_RETURNED: undefined }), 'NOT VERIFIED');
expectThrow('invalid evidence result', () => createEvidenceRecord({ ...validEvidence, RESULT: 'SUCCESS' }), 'Invalid evidence result');

// E: fake secret values must never survive evidence serialization.
const redacted = createEvidenceRecord({
  ...validEvidence,
  INPUT: {
    password: 'FAKE_TEST_PASSWORD', token: 'FAKE_TEST_TOKEN',
    service_role: 'FAKE_TEST_SERVICE_ROLE', authorization: 'FAKE_AUTH', cookie: 'FAKE_COOKIE',
    nested: { password: 'FAKE_TEST_PASSWORD' },
  },
});
const redactedText = JSON.stringify(redacted);
for (const secret of ['FAKE_TEST_PASSWORD', 'FAKE_TEST_TOKEN', 'FAKE_TEST_SERVICE_ROLE', 'FAKE_AUTH', 'FAKE_COOKIE']) {
  assert.equal(redactedText.includes(secret), false, `secret leaked: ${secret}`);
}

// F: seed must abort before it can construct or use the privileged client when no safe environment exists.
const seedSource = read('scripts/runtime-evidence-seed.mjs');
const guardPos = seedSource.indexOf('const environment = requireSafeRuntimeEnvironment();');
const clientPos = seedSource.indexOf('createClient(');
assert.ok(guardPos >= 0 && clientPos >= 0 && guardPos < clientPos, 'seed safety guard must precede client construction');
const seedRun = spawnSync(process.execPath, ['scripts/runtime-evidence-seed.mjs'], {
  cwd: ROOT,
  env: { ...process.env, RUNTIME_EVIDENCE_ENV: '' },
  encoding: 'utf8',
});
assert.notEqual(seedRun.status, 0, 'seed without environment must exit non-zero');
assert.match(`${seedRun.stdout}\n${seedRun.stderr}`, /ABORT/);

// G: the live harness must not convert a real FAIL or an operational query error into PASS.
const harnessSource = read('scripts/p0-2-live-isolation-harness.mjs');
assert.match(harnessSource, /if \(!result\.verified\)/);
assert.match(harnessSource, /RESULT: result\.leak \? 'FAIL' : 'PASS'/);
assert.match(harnessSource, /if \(record\.RESULT === 'FAIL'\) throw/);
assert.match(harnessSource, /if \(failures\.length \|\| unverified\.length\) process\.exitCode = 1/);

// H: matrix ↔ canonical schema. Direct tenant tables are extracted from the migration, not copied from memory.
const rlsSource = read('supabase/migrations/20260823000000_tenant_rls_global_hardening.sql');
const directBlock = rlsSource.match(/FOREACH t IN ARRAY ARRAY\[([\s\S]*?)\]\n\s*LOOP/);
assert.ok(directBlock, 'canonical tenant table array not found');
const canonicalDirectTables = [...directBlock[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
const matrixDirectTables = DATABASE_TABLES.filter((table) => table !== 'companies' && !CHILD_TABLES.includes(table));
assert.deepEqual([...matrixDirectTables].sort(), [...canonicalDirectTables].sort(), 'STALE MATRIX: direct tenant table coverage differs from canonical RLS migration');
for (const child of CHILD_TABLES) assert.match(rlsSource, new RegExp(`CREATE POLICY tenant_${child}\\b`), `MISSING COVERAGE: child table ${child}`);
assert.ok(DATABASE_TABLES.includes('companies'), 'MISSING COVERAGE: companies tenant boundary');

// I: RPC matrix ↔ repository function surface. No hand-written aliases are accepted.
const independentlyDiscovered = new Set();
const migrationDir = path.join(ROOT, 'supabase', 'migrations');
for (const file of fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort()) {
  const text = fs.readFileSync(path.join(migrationDir, file), 'utf8');
  for (const match of text.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:(?:public)\.)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gi) independentlyDiscovered.add(match[1]);
}
const matrixRpcNames = RPC_MATRIX.map((entry) => entry.rpc);
assert.deepEqual([...new Set(matrixRpcNames)].sort(), [...independentlyDiscovered].sort(), 'STALE/MISSING COVERAGE: RPC matrix differs from repository SQL function surface');
assert.deepEqual(matrixRpcNames, discoverRepositoryRpcSurface(ROOT).map((entry) => entry.rpc));

// J: master index and workflow must preserve certification separation.
const index = read('docs/MASTER_EXECUTION_INDEX_FINAL_DEEP_VERIFICATION_2026-08-28.md');
assert.match(index, /P0-2A runtime evidence readiness[^\n]*READY/);
assert.match(index, /P0-2 Tenant A\/B live database isolation[^\n]*BLOCKED/);
assert.match(index, /\*\*PRODUCTION-CERTIFIED: NO\.\*\*/);
assert.doesNotMatch(index, /P0-2\s*=\s*PASS/);
const workflow = read('.github/workflows/quality.yml');
assert.match(workflow, /P0-2A runtime evidence readiness/);
assert.doesNotMatch(workflow, /p0-2-live-isolation-harness\.mjs/);
assert.doesNotMatch(workflow, /P0-2[^\n]*(?:LIVE|VERIFIED|CERTIFIED)\s*=/i);

console.log('P0-2A SELF-VALIDATION: PASS');
console.log(`environment guard: PASS; evidence validator: PASS; redaction: PASS; seed safety: PASS; harness fail-closed: PASS; tables: ${DATABASE_TABLES.length}; RPCs: ${RPC_MATRIX.length}`);
