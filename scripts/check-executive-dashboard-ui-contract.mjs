import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
for (const token of [
  'من البيانات إلى القرار التجاري — في شاشة واحدة.',
  'مركز القيادة',
  'التقرير التنفيذي',
  'مؤشرات أساسية',
  'تغطية المؤشرات',
  'مركز الانتباه',
  'طابور القرار',
  'مسارات العمل',
  'fetchDashboardSnapshot',
  'fetchDashboardIntelligence',
  'metricStatus',
  'QUICK_ACTIONS',
]) assert.ok(source.includes(token), `dashboard UI contract missing: ${token}`);

assert.match(source, /kpis\.totalSales/);
assert.match(source, /kpis\.grossProfit/);
assert.match(source, /kpis\.totalReceivables/);
assert.match(source, /kpis\.inventoryValue/);
assert.match(source, /aging\.rows/);
assert.match(source, /activeAlerts\.map/);
assert.match(source, /activeRecommendations\.map/);
assert.match(source, /TREND_RANGES\.map/);

console.log('Executive dashboard UI contract: PASS');
