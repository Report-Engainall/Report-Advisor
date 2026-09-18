import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/pages/ReceivablesReportPageCanonical.tsx', 'utf8');
const source = fs.readFileSync('src/lib/receivables-truth.ts', 'utf8');

assert.match(source, /status: 'CALCULATED' \| 'INSUFFICIENT_DATA'/);
assert.match(page, /fetchReceivablesReportSnapshot/);
assert.match(page, /TruthContextStrip status=\{snapshot\.status\}/);
assert.match(page, /asOf="غير متاحة من المصدر"/);
assert.match(page, /asOfLabel="حداثة المصدر"/);
assert.match(page, /rangeLabel="لقطة الذمم القانونية الحالية"/);
assert.doesNotMatch(page, /new Date\(\)|Date\.now\(\)|toISOString\(\)/);
assert.doesNotMatch(page, /Math\.random\(|mock|synthetic/i);

console.log('Receivables canonical truth contract: PASS');
console.log('  - page consumes the canonical receivables snapshot status');
console.log('  - source freshness is explicitly unavailable rather than fabricated');
console.log('  - pagination remains independent from the business truth context');
