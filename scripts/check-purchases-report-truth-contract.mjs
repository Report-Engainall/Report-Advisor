import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');

for (const token of [
  'export function PurchasesReportPage',
  'fetchPurchaseSummary()',
  'Awaited<ReturnType<typeof fetchPurchaseSummary>>',
  'summary.data_status',
  'summary.as_of',
  'rangeLabel="النطاق: سجل المشتريات بالكامل"',
]) {
  assert.ok(source.includes(token), 'missing purchases report truth token: ' + token);
}

const strip = '<TruthContextStrip status={summary.data_status === \'NO_DATA\' ? \'NO_DATA\' : \'CALCULATED\'} asOf={summary.as_of || \'غير متاح\'} rangeLabel="النطاق: سجل المشتريات بالكامل"/>';
assert.ok(source.includes(strip), 'purchase truth strip must consume canonical purchase summary fields');
console.log('Purchases report truth contract: PASS');
