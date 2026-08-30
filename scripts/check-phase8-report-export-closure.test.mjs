import assert from 'node:assert/strict';
import fs from 'node:fs';
const source = fs.readFileSync('scripts/check-phase8-report-export-closure.mjs', 'utf8');
assert.match(source, /candidates/);
assert.match(source, /current_company_id\|company_id/);
assert.match(source, /stripComments/);
assert.match(source, /Silent numeric fallback detected/);
assert.doesNotMatch(source, /TODO|FIXME/);
console.log('Phase 8 closure self-test: PASS');
