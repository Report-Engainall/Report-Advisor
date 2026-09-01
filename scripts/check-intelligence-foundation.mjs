import assert from 'node:assert/strict';
import { aggregateAlternativeGroup } from '../src/lib/intelligence/groupDemand.ts';
import { calculateInventoryDecision } from '../src/lib/intelligence/inventoryEngine.ts';
import { forecastNaive, forecastMovingAverage, forecastEma, forecastLinear, selectBestForecast } from '../src/lib/free-toolbox/time-series.ts';
import { buildExecutiveScorecard } from '../src/lib/free-toolbox/executive-scorecard.ts';

const group = aggregateAlternativeGroup({ id: 'g1', name: 'g1', members: [
  { sku: 'A', dailyDemand: 100, stock: 500, factor: 1 },
  { sku: 'B', dailyDemand: 50, stock: 200, factor: 2 },
] });
assert.equal(group.normalizedDemand, 200);
assert.equal(group.normalizedStock, 900);
assert.equal(group.coverageDays, 4.5);

const alternative = aggregateAlternativeGroup({ id: 'g1', name: 'زيت 20 لتر', members: [
  { sku: 'A', dailyDemand: 100, stock: 500, factor: 1, netSales: 1000 },
  { sku: 'A', dailyDemand: 999, stock: 999, factor: 1, netSales: 999 },
  { sku: 'B', dailyDemand: 50, stock: 200, factor: 2, netSales: 600 },
] });
assert.deepEqual(alternative.memberSkus, ['A', 'B']);
assert.equal(alternative.normalizedDemand, 200);
assert.equal(alternative.normalizedStock, 900);
assert.equal(alternative.normalizedSales, 1600);
assert.equal(alternative.stockoutRisk, 'critical');
assert.equal(alternative.recommendedOrder, 5100);

const inv = calculateInventoryDecision({ sku: 'A', stock: 20, dailySales: [10, 12, 9, 11, 14, 13, 12], leadTimeDays: 7 });
assert.ok(inv.reorderPoint > 0);
assert.ok(inv.recommendedOrder > 0);
assert.equal(inv.priority, 'critical');

const history = [10, 12, 11, 13, 15, 14, 16, 18, 17, 20];
const candidates = [forecastNaive(history, 3), forecastMovingAverage(history, 3, 5), forecastEma(history, 3), forecastLinear(history, 3)];
const best = selectBestForecast([18, 19, 20], candidates);
assert.equal(best.points.length, 3);
assert.ok(Number.isFinite(best.mae ?? NaN));

const scoreMetrics = [
  { key: 'revenueGrowth', label: 'Revenue growth', value: 10, target: 10, weight: 1 },
  { key: 'grossMargin', label: 'Gross margin', value: .3, target: .3, weight: 1 },
  { key: 'cashCoverageDays', label: 'Cash coverage', value: 45, target: 45, weight: 1 },
  { key: 'inventoryTurnover', label: 'Inventory turnover', value: 4, target: 4, weight: 1 },
  { key: 'stockoutRate', label: 'Stockout rate', value: .02, target: .02, weight: 1, higherIsBetter: false },
  { key: 'customerRetention', label: 'Customer retention', value: .85, target: .85, weight: 1 },
  { key: 'dataQuality', label: 'Data quality', value: 95, target: 95, weight: 1 },
];
const score = buildExecutiveScorecard(scoreMetrics);
assert.ok(score.score >= 0 && score.score <= 100);
assert.ok(['A', 'B', 'C', 'D', 'F'].includes(score.grade));
assert.equal(score.metrics.length, scoreMetrics.length);
assert.ok(score.metrics.every((metric) => Number.isFinite(metric.achievement) && Number.isFinite(metric.weighted)));

console.log('intelligence foundation fixtures: PASS');
