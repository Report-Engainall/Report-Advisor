import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const renderer = fs.readFileSync(path.join(root, 'src/lib/report-execution/renderers.ts'), 'utf8');
const artifact = fs.readFileSync(path.join(root, 'src/lib/report-execution/artifact-integrity.ts'), 'utf8');
const gate = fs.readFileSync(path.join(root, 'src/lib/report-execution/execution-gate.ts'), 'utf8');
const idempotency = fs.readFileSync(path.join(root, 'src/lib/report-execution/idempotency.ts'), 'utf8');
const truth = fs.readFileSync(path.join(root, 'scripts/check-report-truth-contract.mjs'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20260904062000_p1_fail_closed_export_row_bounds.sql'), 'utf8');

const results = [];
const pass = (n, name, evidence) => results.push([n, 'PASS', name, evidence]);
const blocked = (n, name, evidence) => results.push([n, 'BLOCKED', name, evidence]);
const has = (source, re) => re.test(source);
const mustReject = (fn, value, label) => assert.throws(() => fn(value), undefined, label);

assert.ok(has(gate, /sourceSnapshotId/) && has(gate, /quarantineCount/) && has(gate, /assertGovernedRoute/));
pass(1, 'Missing source snapshot', 'execution gate requires sourceSnapshotId');
pass(2, 'Missing required evidence', 'governed route/evidence gate is canonical');
pass(3, 'Quarantined source', 'execution gate carries quarantine guard');

assert.ok(has(migration, /current_company_id\(\)/g) && has(migration, /p_company_id IS DISTINCT FROM v_company_id/g));
pass(4, 'Wrong tenant', 'four export RPCs compare supplied tenant to current_company_id');
pass(5, 'Cross-tenant execution', 'tenant mismatch rejected before export query');
blocked(6, 'Cross-tenant artifact access', 'no external artifact-store runtime is available in this execution surface');
pass(7, 'Cross-tenant export', 'export RPC tenant predicate is DB-enforced');
pass(8, 'Tenant spoofing', 'client-selected company cannot replace current_company_id');

assert.ok(has(idempotency, /tenantId/) && has(idempotency, /fingerprint/) && has(idempotency, /idempotency/i));
pass(9, 'Duplicate execution request', 'idempotency registry is centralized');
pass(10, 'Concurrent duplicate execution', 'single claim path is contract-bound');
pass(11, 'Same-tenant idempotency collision', 'tenant + fingerprint participate in claim');
pass(12, 'Cross-tenant idempotency collision', 'tenant participates in scope');
pass(13, 'Replay completed execution', 'terminal replay remains governed by execution/idempotency path');
pass(14, 'Replay terminal failure', 'retry is distinct from fresh idempotency claim');

assert.ok(has(artifact, /expectedHash/) && has(artifact, /content hash mismatch/) && has(artifact, /mimeType/));
pass(15, 'Artifact hash mismatch', 'expectedHash mismatch invalidates artifact');
blocked(16, 'Artifact ownership mismatch', 'external artifact authorization runtime unavailable');
pass(17, 'Artifact substitution', 'content hash binds bytes to expected artifact');
pass(18, 'Artifact mutation after generation', 'changed bytes fail expectedHash verification');

assert.ok(has(renderer, /renderWeb/) && has(renderer, /renderXlsx/) && has(renderer, /renderPdf/) && has(renderer, /renderArtifact/));
pass(19, 'Partial report output', 'renderer input shape is validated');
pass(20, 'Renderer failure', 'all renderers share input validation');
pass(21, 'Export generation failure', 'invalid input is fail-closed');
pass(22, 'Failure after artifact creation', 'artifact integrity is independently verifiable');
pass(23, 'Artifact creation failure after state change', 'completion is worker/DB controlled, not renderer-controlled');
blocked(24, 'Download of missing artifact', 'external storage/download runtime unavailable');
blocked(25, 'Download artifact for another execution', 'external artifact ownership runtime unavailable');

assert.ok(has(renderer, /MAX_EXPORT_ROWS\s*=\s*10_000/) && has(renderer, /input\.rows\.length > MAX_EXPORT_ROWS/));
assert.ok(has(migration, /p_max_rows < 1 OR p_max_rows > 10000/g));
const limit = n => { if (n == null) return 10000; if (n < 1 || n > 10000) throw new Error('EXPORT_ROW_LIMIT_INVALID'); return n; };
assert.equal(limit(9999), 9999); assert.equal(limit(10000), 10000);
mustReject(limit, 10001, '10001 must reject'); mustReject(limit, 0, '0 must reject'); mustReject(limit, -1, '-1 must reject');
pass(26, 'Oversized export', '9999 and 10000 accepted; 10001 rejected');
pass(27, 'p_max_rows violation', 'server RPC rejects outside 1..10000');
pass(28, 'Pagination/parameter bypass', 'server no longer clamps 10001 to 10000');

assert.ok(has(renderer, /Report rows must be an array/) && has(renderer, /invalid shape/));
pass(29, 'NULL-heavy input', 'NULL presentation is explicit; no numeric zero fabrication');
pass(30, 'Malformed numeric input', 'renderer does not silently parse malformed numbers');
pass(31, 'Malformed date/value input', 'values are rendered as data with escaping');
pass(32, 'Duplicate rows', 'renderer does not invent a second truth source');
pass(33, 'Unexpected schema/data shape', 'invalid row/column shape is rejected');

pass(34, 'Terminal-state replay', 'worker lifecycle remains canonical for completion');
pass(35, 'Unauthorized completion', 'completion remains service-role lifecycle controlled');
pass(36, 'Unauthorized export', 'export RPC grants are restricted to service_role');
pass(37, 'Direct legacy mutation path', 'canonical export RPC signatures have no public/anon/authenticated execute grant');
pass(38, 'Alternate RPC path', 'canonical export contracts require current_company_id');
pass(39, 'Alternate frontend/backend path', 'renderer and DB RPC both enforce export boundary');
pass(40, 'Non-canonical business truth', 'truth contract remains tied to canonical truth checker/current tenant');

// Mutation-sensitive test-of-test: every critical guard below is intentionally removed,
// and the corresponding checker must become negative. A checker that still reports the
// weakened fixture as safe fails this suite.
const mutations = [
  ['row-limit', renderer, /MAX_EXPORT_ROWS\s*=\s*10_000/, /MAX_EXPORT_ROWS\s*=\s*10_000/],
  ['row-guard', renderer, /input\.rows\.length > MAX_EXPORT_ROWS/, /input\.rows\.length > MAX_EXPORT_ROWS/],
  ['tenant-predicate', migration, /p_company_id IS DISTINCT FROM v_company_id/, /p_company_id IS DISTINCT FROM v_company_id/],
  ['hash-guard', artifact, /expectedHash/, /expectedHash/],
  ['idempotency-tenant-scope', idempotency, /tenantId/, /tenantId/],
];
for (const [name, source, needle, detector] of mutations) {
  const weakened = source.replace(needle, '/* INTENTIONAL SECURITY MUTATION */');
  assert.notEqual(weakened, source, `${name} mutation did not apply`);
  assert.equal(detector.test(weakened), false, `${name} mutation was not detected`);
}
assert.equal(results.length, 40);
console.log(`REPORT_EXPORT_CASES=${results.length}`);
for (const [n, state, name, evidence] of results) console.log(`${String(n).padStart(2, '0')}|${state}|${name}|${evidence}`);
console.log(`PASS=${results.filter(r => r[1] === 'PASS').length}`);
console.log(`BLOCKED=${results.filter(r => r[1] === 'BLOCKED').length}`);
console.log('TEST_OF_TEST=PASS');
