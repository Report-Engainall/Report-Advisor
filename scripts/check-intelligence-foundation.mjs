import assert from 'node:assert/strict';
import { calculateGroupDemand, aggregateAlternativeGroup } from '../src/lib/intelligence/groupDemand.ts';
import { calculateInventoryDecision } from '../src/lib/intelligence/inventoryEngine.ts';
import { forecastNaive, forecastMovingAverage, forecastEma, forecastLinear, selectBestForecast } from '../src/lib/free-toolbox/time-series.ts';
import { buildExecutiveScorecard } from '../src/lib/free-toolbox/executive-scorecard.ts';

const group = calculateGroupDemand('g1', [
  { sku: 'A', dailyUnits: 100, stock: 500, factor: 1 },
  { sku: 'B', dailyUnits: 50, stock: 200, factor: 2 },
]);
assert.equal(group.normalizedDailyDemand, 200);
assert.equal(group.normalizedStock, 900);
assert.equal(group.daysOfCover, 4.5);

const alternative = aggregateAlternativeGroup({ id: 'g1', name: 'زيت 20 لتر', members: [
  { sku: 'A', dailyDemand: 100, stock: 500, factor: 1, netSales: 1000 },
  { sku: 'A', dailyDemand: 999, stock: 999, factor: 1, netSales: 999 },
  { sku: 'B', dailyDemand: 50, stock: 200, factor: 2, netSales: 600 },
] });
assert.equal(alternative.memberSkus.length, 2);
assert.equal(alternative.normalizedDemand, 200);
assert.equal(alternative.normalizedStock, 900);

const inv = calculateInventoryDecision({ sku: 'A', stock: 20, dailySales: [10, 12, 9, 11, 14, 13, 12], leadTimeDays: 7 });
assert.ok(inv.reorderPoint > 0);
assert.ok(inv.recommendedOrder > 0);
assert.equal(inv.priority, 'critical');

const history = [10, 12, 11, 13, 15, 14, 16, 18, 17, 20];
const candidates = [forecastNaive(history, 3), forecastMovingAverage(history, 3, 5), forecastEma(history, 3), forecastLinear(history, 3)];
const best = selectBestForecast([18, 19, 20], candidates);
assert.ok(best.points.length === 3);
assert.ok(Number.isFinite(best.mae ?? NaN));

const score = buildExecutiveScorecard({ revenueGrowth: 10, grossMargin: .3, cashCoverageDays: 45, inventoryTurnover: 4, stockoutRate: .02, customerRetention: .85, dataQuality: 95 });
assert.ok(score.overall >= 0 && score.overall <= 100);
assert.ok(['A','B','C','D','F'].includes(score.grade));

console.log('intelligence foundation fixtures: PASS');
