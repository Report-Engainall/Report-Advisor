import assert from 'node:assert/strict';
import fs from 'node:fs';

const executive = fs.readFileSync('src/pages/ExecutiveReportPage.tsx', 'utf8');
const profitability = fs.readFileSync('src/pages/ProfitabilityReportCanonicalPage.tsx', 'utf8');
const receivables = fs.readFileSync('src/pages/ReceivablesReportCanonicalPage.tsx', 'utf8');

for (const [name, source, tokens] of [
  ['executive', executive, [
    "fetchDashboardSnapshot(6)",
    "setAsOf(snapshot.asOf)",
    "TruthContextStrip",
    'rangeLabel="النطاق: آخر 6 أشهر"',
  ]],
  ['profitability', profitability, [
    "fetchProfitabilitySnapshot()",
    "snapshot.as_of",
    "TruthContextStrip",
    'rangeLabel="لقطة الربحية الحالية"',
  ]],
  ['receivables', receivables, [
    "fetchReceivablesReportPage(page, pageSize)",
    "snapshot.status",
    "TruthContextStrip",
    'asOf="غير متاحة من المصدر"',
    'asOfLabel="حداثة المصدر"',
    'rangeLabel="لقطة الذمم الحالية"',
  ]],
]) {
  for (const token of tokens) {
    assert.ok(source.includes(token), `missing ${name} canonical truth token: ${token}`);
  }
}

assert.ok(
  !receivables.includes("asOf={new Date().toISOString()}"),
  'canonical receivables must not manufacture an as-of timestamp',
);
console.log('Canonical report truth contract: PASS');
