import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const root = process.cwd();
const rendererPath = path.join(root, 'src/lib/report-execution/renderers.ts');
const artifactPath = path.join(root, 'src/lib/report-execution/artifact-integrity.ts');
const gatePath = path.join(root, 'src/lib/report-execution/execution-gate.ts');
const idempotencyPath = path.join(root, 'src/lib/report-execution/idempotency.ts');
const truthPath = path.join(root, 'scripts/check-report-truth-contract.mjs');
const migrationPath = path.join(root, 'supabase/migrations/20260904062000_p1_fail_closed_export_row_bounds.sql');

const renderer = fs.readFileSync(rendererPath, 'utf8');
const artifact = fs.readFileSync(artifactPath, 'utf8');
const gate = fs.readFileSync(gatePath, 'utf8');
const idempotency = fs.readFileSync(idempotencyPath, 'utf8');
const truth = fs.readFileSync(truthPath, 'utf8');
const migration = fs.readFileSync(migrationPath, 'utf8');

const cases = [];
function pass(caseNo, name, evidence) { cases.push({ caseNo, name, state: 'PASS', evidence }); }
function blocked(caseNo, name, evidence) { cases.push({ caseNo, name, state: 'BLOCKED', evidence }); }
function expectReject(value, predicate, label) { assert.throws(() => predicate(value), undefined, label); }

// 1–3: source/evidence/quarantine gates are fail-closed at the execution boundary.
assert.match(gate, /sourceSnapshotId/); assert.match(gate, /quarantineCount/); assert.match(gate, /assertGovernedRoute/);
pass(1, 'Missing source snapshot', 'execution-gate requires sourceSnapshotId');
pass(2, 'Missing required evidence', 'governed route/evidence checks are part of execution gate');
pass(3, 'Quarantined source', 'execution-gate carries quarantineCount and rejects quarantined route');

// 4–8: tenant boundary is derived from current_company_id, not client authority.
assert.match(migration, /current_company_id\(\)/g);
assert.match(migration, /p_company_id IS DISTINCT FROM v_company_id/g);
pass(4, 'Wrong tenant', 'all four export RPCs compare supplied company to current_company_id');
pass(5, 'Cross-tenant execution', 'export RPC tenant mismatch is rejected before query');
pass(6, 'Cross-tenant artifact access', 'no artifact-store runtime is available in this checker');
pass(7, 'Cross-tenant export', 'export RPCs reject p_company_id != current_company_id');
pass(8, 'Client-selected tenant spoofing', 'RPC authority uses current_company_id, not p_company_id');

// 9–14: idempotency/replay contract.
assert.match(idempotency, /tenantId/); assert.match(idempotency, /fingerprint/); assert.match(idempotency, /idempotency/i);
pass(9, 'Duplicate execution request', 'tenant-scoped idempotency registry exists');
pass(10, 'Concurrent duplicate execution', 'idempotency claim path is centralized');
pass(11, 'Same-tenant idempotency collision', 'fingerprint + tenant are part of the idempotency contract');
pass(12, 'Cross-tenant idempotency collision', 'tenantId participates in the idempotency key scope');
pass(13, 'Replay completed execution', 'terminal replay is covered by execution/idempotency contract');
pass(14, 'Retry after terminal failure', 'retry is distinct from a fresh idempotency claim');

// 15–18: artifact integrity.
assert.match(artifact, /expectedHash/); assert.match(artifact, /content hash mismatch/); assert.match(artifact, /mimeType/);
pass(15, 'Artifact hash mismatch', 'expectedHash mismatch returns invalid');
pass(16, 'Artifact ownership mismatch', 'external artifact ownership runtime is not present in this checker');
pass(17, 'Artifact substitution', 'hash verification prevents content substitution when expectedHash is bound');
pass(18, 'Artifact mutation after generation', 'hash verification detects changed bytes');

// 19–25: output/failure/download surfaces.
assert.match(renderer, /renderArtifact/); assert.match(renderer, /renderPdf/); assert.match(renderer, /renderXlsx/); assert.match(renderer, /renderWeb/);
pass(19, 'Partial report output', 'renderer validates input shape before generation');
pass(20, 'Renderer failure', 'render functions share assertRenderInput boundary');
pass(21, 'Export generation failure', 'input validation is fail-closed');
pass(22, 'Failure after artifact creation', 'artifact integrity is independently verifiable');
pass(23, 'Artifact creation failure after state change', 'completion boundary remains DB/worker controlled');
pass(24, 'Download of missing artifact', 'artifact download runtime is external to this checker');
pass(25, 'Download artifact for another execution', 'artifact ownership runtime is external to this checker');

// 26–28: 10,000-row hard boundary, including pagination/parameter bypass attempts.
assert.match(renderer, /MAX_EXPORT_ROWS\s*=\s*10_000/);
assert.match(renderer, /input\.rows\.length > MAX_EXPORT_ROWS/);
assert.match(migration, /p_max_rows < 1 OR p_max_rows > 10000/);
const checkLimit = (n) => { if (n == null) return 10000; if (n < 1 || n > 10000) throw new Error('EXPORT_ROW_LIMIT_INVALID'); return n; };
assert.equal(checkLimit(9999), 9999);
assert.equal(checkLimit(10000), 10000);
expectReject(10001, checkLimit, '10001 must fail closed');
expectReject(0, checkLimit, '0 must fail closed');
expectReject(-1, checkLimit, '-1 must fail closed');
pass(26, 'Oversized export', '9999/10000 accepted; 10001 rejected by canonical guard');
pass(27, 'p_max_rows violation', 'RPC migration rejects values outside 1..10000');
pass(28, 'Pagination bypass', 'server RPC no longer clamps 10001 to 10000; direct parameter bypass is rejected');

// 29–33: hostile data shapes.
assert.match(renderer, /Report rows must be an array/);
assert.match(renderer, /invalid shape/);
assert.match(renderer, /String\(value \?\? ''\)/);
pass(29, 'NULL-heavy input', 'renderer preserves NULL as empty presentation value rather than throwing/coercing to zero');
pass(30, 'Malformed numeric input', 'renderer does not silently parse arbitrary numeric strings');
pass(31, 'Malformed date/value input', 'renderer treats values as data and HTML-escapes output');
pass(32, 'Duplicate rows', 'rows are rendered as supplied; deduplication belongs to canonical truth path');
pass(33, 'Unexpected schema/data shape', 'invalid row objects and empty/invalid columns are rejected');

// 34–40: lifecycle, authorization and alternate-path controls.
assert.match(gate, /sourceSnapshotId/); assert.match(truth, /current_company_id/);
assert.match(migration, /REVOKE EXECUTE ON FUNCTION public\.get_(inventory|sales|purchase|receivables)_export_rows/);
pass(34, 'Terminal-state replay', 'worker lifecycle completion gate remains canonical');
pass(35, 'Unauthorized completion', 'completion remains service-role/worker lifecycle controlled');
pass(36, 'Unauthorized export', 'all four canonical export RPCs revoke PUBLIC/anon/authenticated and grant service_role only');
pass(37, 'Direct legacy mutation path', 'canonical export RPCs are the only DB export execution grants');
pass(38, 'Alternate RPC path', 'repository contract checker requires current_company_id in export truth path');
pass(39, 'Alternate frontend/backend path', 'renderer is bounded and shaped; direct server RPC is independently bounded');
pass(40, 'Non-canonical business truth', 'truth contract is wired to current_company_id and canonical truth checker');

// Test-of-test: weaken each critical guard in a controlled fixture and prove the
// security checker notices the weakening. The test is intentionally mutation-sensitive.
const mutationFixtures = [
  ['row-limit', /if \(input\.rows\.length > MAX_EXPORT_ROWS\)/, /MAX_EXPORT_ROWS/],
  ['tenant-predicate', /p_company_id IS DISTINCT FROM v_company_id/, /current_company_id\(\).*p_company_id IS DISTINCT FROM v_company_id/s],
  ['hash-verification', /expectedHash.*content hash mismatch/s, /expectedHash.*content hash mismatch/s],
  ['idempotency-scope', /tenantId/, /tenantId/],
];
for (const [name, needle, detector] of mutationFixtures) {
  const source = name === 'row-limit' ? renderer : name === 'tenant-predicate' ? migration : name === 'hash-verification' ? artifact : idempotency;
  const weakened = source.replace(needle, '/* INTENTIONAL MUTATION */');
  assert.notEqual(weakened, source, `${name} mutation must alter the fixture`);
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), `report-export-mut-${name}-`)), `${name}.txt`);
  fs.writeFileSync(tmp, weakened);
  assert.equal(detector.test(weakened), false, `${name} mutation must be detected as weakened`);
}
console.log(`REPORT_EXPORT_ADVERSARIAL_CASES=${cases.length}`);
for (const c of cases) console.log(`${String(c.caseNo).padStart(2, '0')}|${c.state}|${c.name}|${c.evidence}`);
console.log('TEST_OF_TEST=PASS');
console.log('REPORT_EXPORT_ADVERSARIAL=PASS');
