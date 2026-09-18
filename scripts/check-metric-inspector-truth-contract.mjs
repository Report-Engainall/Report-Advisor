import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/MetricInspectorPage.tsx', 'utf8');

for (const token of [
  'semanticMetricIsFresh',
  'capture?.observed_at',
  'const freshnessAsOf = capture?.observed_at ?? null',
  'التقاط دليل فعلي',
  'سياسة الحداثة',
]) {
  assert.ok(source.includes(token), 'missing metric inspector truth token: ' + token);
}

assert.ok(
  source.includes('semanticMetricIsFresh(governance ?? null, freshnessAsOf)'),
  'metric freshness must use a real observed_at only when evidence exists',
);
console.log('Metric inspector truth contract: PASS');
