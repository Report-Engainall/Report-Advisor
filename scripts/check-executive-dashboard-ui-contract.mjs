import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
for (const token of [
  'fetchDashboardSnapshot',
  'fetchDashboardIntelligence',
  'metricStatus',
  'liveAlerts',
  'liveRecommendations',
  'TREND_RANGES',
  'formatCurrency',
  'CardHeader',

assert.match(source, /kpis\.totalSales/);
assert.match(source, /kpis\.grossProfit/);
assert.match(source, /kpis\.totalReceivables/);
assert.match(source, /kpis\.inventoryValue/);
assert.match(source, /aging\.rows/);
assert.match(source, /liveAlerts\.map/);
assert.match(source, /liveRecommendations\.map/);
assert.match(source, /TREND_RANGES\.map/);

console.log('Executive dashboard UI contract: PASS');
