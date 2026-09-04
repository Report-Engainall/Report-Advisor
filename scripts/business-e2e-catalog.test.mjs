import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const catalog = fs.readFileSync(path.join(process.cwd(), 'docs/evidence/BUSINESS_E2E_CATALOG_2026-09-04.md'), 'utf8');
const required = ['Input / Action','Expected UI','Expected RPC/API','Expected DB effect','Business result','Security','Persistence','Expected failure'];
const header = '| ID | Flow | Input / Action | Expected UI | Expected RPC/API | Expected DB effect | Business result | Security | Persistence | Expected failure |';
assert.ok(catalog.includes(header), 'business flow catalog header is missing or changed');

const rows = catalog
  .split('\n')
  .filter(line => /^\| BF-\d{3} \|/.test(line))
  .map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));

assert.equal(rows.length, 20, 'business flow catalog must contain exactly 20 required flows');
assert.equal(new Set(rows.map(row => row[0])).size, 20, 'business flow IDs must be unique');
for (const row of rows) {
  assert.equal(row.length, 10, `catalog row ${row[0]} must contain exactly 10 columns`);
  for (const [index, value] of row.entries()) {
    assert.ok(value.length > 0, `catalog row ${row[0]} column ${index + 1} must not be blank`);
  }
  assert.match(row[0], /^BF-\d{3}$/, `invalid business flow ID: ${row[0]}`);
}
for (const field of required) assert.ok(catalog.includes(field), `missing oracle field: ${field}`);
for (const id of ['BF-001','BF-002','BF-003','BF-004','BF-006','BF-011','BF-012','BF-013','BF-014','BF-015','BF-016','BF-017','BF-018','BF-019','BF-020']) assert.ok(catalog.includes(`| ${id} |`), `missing critical flow ${id}`);
for (const token of ['source_truth','parsed_truth','normalized_truth','db_truth','rpc_truth','analytics_truth','ui_truth','export_truth','exact_head']) assert.ok(catalog.includes(token), `missing evidence envelope field: ${token}`);

// Test-of-test: the same row validator must reject a deliberately blank required cell.
const mutated = rows.map(row => [...row]);
mutated[0][2] = '';
assert.throws(
  () => mutated.forEach((row) => row.forEach((value, index) => assert.ok(value.length > 0, `mutated row column ${index + 1} blank`))),
  /mutated row column 3 blank/,
  'catalog test-of-test failed: blank required cell did not fail',
);

console.log(JSON.stringify({
  status: 'PASS',
  rows: rows.length,
  validated_columns_per_row: 10,
  oracle_fields: required.length,
  test_of_test: 'blank required cell rejected',
  runtime_execution: 'NOT_PROVEN',
}, null, 2));
