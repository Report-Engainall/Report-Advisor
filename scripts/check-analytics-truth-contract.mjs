import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/AnalyticsPage.tsx', 'utf8');

for (const token of [
  'export function RFMAnalysisPage',
  'fetchRFMSnapshot(500)',
  'setAsOf(snapshot.asOf)',
  'TruthContextStrip status={status} asOf={asOf} rangeLabel="اللقطة التحليلية الحالية"',
  'export function ABCAnalysisPage',
  'fetchABCSnapshot(500)',
  'TruthContextStrip status={status} asOf="غير متاحة من المصدر" asOfLabel="حداثة المصدر" rangeLabel="اللقطة التحليلية الحالية"',
  'export function AgingAnalysisPage',
  'fetchAgingSnapshot()',
  'setAsOf(snapshot.asOf)',
]) {
  assert.ok(source.includes(token), 'missing analytics truth token: ' + token);
}

console.log('Analytics truth contract: PASS');
