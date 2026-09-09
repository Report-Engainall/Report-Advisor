import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
for (const token of [
  'قرارك التجاري يبدأ من هنا',
  'مركز القيادة',
  'التقرير التنفيذي',
  'المؤشرات الأساسية',
  'تغطية المؤشرات',
  'مركز الانتباه',
  'التوصيات النشطة',
  'ماذا تريد أن تنجز؟',
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
