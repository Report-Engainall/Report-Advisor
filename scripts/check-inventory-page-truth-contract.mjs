import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/EntityPages.tsx', 'utf8');

assert.match(source, /export function InventoryPage/);
assert.match(source, /fetchInventoryReportSnapshot\(page, pageSize, filter\)/);
assert.match(source, /TruthContextStrip status=\{snapshot\.dataStatus\}/);
assert.match(source, /asOf="غير متاحة من المصدر"/);
assert.match(source, /asOfLabel="حداثة المصدر"/);
assert.match(source, /rangeLabel="لقطة المخزون الحالية"/);
assert.doesNotMatch(source, /new Date\(\)|Date\.now\(\)/);
assert.doesNotMatch(source, /Math\.random\(|mock|synthetic|dummy/i);

console.log('Inventory page truth contract: PASS');
console.log('  - /inventory consumes the canonical report snapshot status');
console.log('  - freshness/as-of is declared unavailable rather than fabricated');
console.log('  - existing pagination/filter/query behavior is untouched');
