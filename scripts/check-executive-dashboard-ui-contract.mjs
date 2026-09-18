import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
for (const token of [
  'BUSINESS COMMAND SYSTEM',
  'نبض الأعمال',
  'مركز الانتباه',
  'طابور القرار',
  'مسارات العمل',
  'مساحة الإثبات والتحليل',
  'fetchDashboardSnapshot',
  'fetchDashboardIntelligence',
  'metricStatus',
  'BusinessInvestigationDrawer',
  'openKpi',
  'openAlert',
  'openRecommendation',
  'snapshotAsOf',
]) assert.ok(source.includes(token), `dashboard UI contract missing: ${token}`);

assert.match(source, /kpis\.totalSales/);
assert.match(source, /kpis\.grossProfit/);
assert.match(source, /kpis\.totalReceivables/);
assert.match(source, /kpis\.inventoryValue/);
assert.match(source, /aging\.rows/);
assert.match(source, /liveAlerts\.map/);
assert.match(source, /liveRecommendations\.map/);
assert.match(source, /TREND_RANGES\.map/);
assert.match(source, /BusinessInvestigationDrawer target=\{investigation\}/);

console.log('Executive dashboard UI contract: PASS');
