import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'docs/evidence/REAL_REPORT_BUSINESS_WRAPPERS_2026-09-04.json');
const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
assert.equal(manifest.cases.length, 14, 'business wrapper manifest must contain 14 cases');
assert.equal(new Set(manifest.cases.map(c => c.id)).size, manifest.cases.length, 'wrapper IDs must be unique');
for (const c of manifest.cases) {
  assert.ok(c.source, `${c.id}: source missing`);
  assert.ok(['PASS','REVIEW','QUARANTINE'].includes(c.expected), `${c.id}: invalid expected disposition`);
  assert.ok(Array.isArray(c.business_flows) && c.business_flows.length > 0, `${c.id}: business flow mapping missing`);
  assert.ok(Array.isArray(c.truth_domains) && c.truth_domains.length > 0, `${c.id}: truth domains missing`);
}
for (const id of ['sales-basic','purchases-basic','receivables-basic','mixed-format','duplicate-report','partial-report','empty-report']) assert.ok(manifest.cases.some(c => c.id === id), `required wrapper missing: ${id}`);
console.log('Real-report business wrapper PASS: 14 source scenarios mapped to business flows and truth domains. Runtime execution remains blocked until real authenticated runtime is available.');