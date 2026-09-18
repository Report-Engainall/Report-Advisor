import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');

for (const token of [
  'fetchDashboardSnapshot',
  'TruthContextStrip',
  "truth?.kpis.status",
  "truth?.asOf",
  'حالة المصدر',
  'confirmedReasons: []',
  'حالة البيانات التفصيلية للمخرج لا تثبت من وجود المسار وحده.',
]) {
  assert.ok(source.includes(token), 'missing reports center truth token: ' + token);
}

assert.ok(!source.includes("confirmedReasons: ['يوجد مسار تطبيق مخصص لهذا المخرج.']"));
assert.match(source, /source: 'get_dashboard_snapshot'/);
console.log('Reports center truth contract: PASS');
