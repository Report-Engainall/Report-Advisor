import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');

for (const token of [
  'export function InventoryReportPage',
  'fetchInventoryReportSnapshot(0,25)',
  'snapshot.dataStatus',
  'asOf="غير متاحة من المصدر"',
  'asOfLabel="حداثة المصدر"',
  'rangeLabel="لقطة المخزون الحالية"',
]) {
  assert.ok(source.includes(token), 'missing inventory report truth token: ' + token);
}

assert.ok(
  source.includes('<TruthContextStrip status={snapshot.dataStatus} asOf="غير متاحة من المصدر" asOfLabel="حداثة المصدر" rangeLabel="لقطة المخزون الحالية"/>'),
  'inventory truth strip must not invent an as-of timestamp',
);

console.log('Inventory report truth contract: PASS');
