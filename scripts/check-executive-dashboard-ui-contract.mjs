import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

for (const token of [
  'fetchLatestSmartReportBySourceHash',
  'PRIMARY_SMART_REPORT_SOURCE_HASH',
  'data-testid="primary-real-smart-report-card"',
  'metricStatus',
  'liveAlerts',
  'liveRecommendations',
  'TREND_RANGES',
  'formatCurrency',
  'CardHeader',
]) {
  assert.ok(source.includes(token), 'dashboard UI contract missing: ' + token);
}

for (const token of [
  /kpis\.totalSales/,
  /kpis\.grossProfit/,
  /kpis\.totalReceivables/,
  /kpis\.inventoryValue/,
  /aging\.rows/,
  /liveAlerts/,
  /liveRecommendations/,
  /TREND_RANGES\.map/,
  /<section/,
  /authoritativeCurrentRowCount/,
  /sourceHash/,
  /evidenceStatus/,
  /智能Recommendations|smartRecommendations/,
]) {
  assert.match(source, token);
}

assert.ok((source.match(/<Card>/g) || []).length >= 4, 'dashboard UI contract requires multiple analytical surfaces');
assert.ok(source.includes('TruthContextStrip'), 'dashboard UI contract requires visible truth context');
assert.ok(source.includes('لا يوجد تقرير مصدر حقيقي صالح للعرض'), 'dashboard must fail closed when no authoritative report can be resolved');
assert.ok(!source.includes('fetchSmartReportCatalog('), 'dashboard landing must not fan out through the broad Smart Report catalog');
assert.ok(!source.includes('fetchDashboardSnapshot('), 'dashboard landing must not depend on heavyweight legacy snapshot RPC');
assert.ok(!source.includes('fetchDashboardIntelligence('), 'dashboard landing must not depend on legacy dashboard intelligence RPC');

console.log('Executive dashboard UI contract: PASS');
