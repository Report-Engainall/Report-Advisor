import assert from 'node:assert/strict';
import { analyzeTrend, buildAgingBuckets, cashConversionCycle, decideReplenishment, projectLiquidity, scoreCustomer, scoreSupplier, whatIf } from '../src/lib/businessIntelligenceEngines.ts';
import { buildFinancialIntelligence } from '../src/lib/intelligence/financialIntelligence.ts';
import { buildCanonicalIntelligence } from '../src/lib/canonicalIntelligence.ts';

const asOf = new Date('2026-08-26T00:00:00Z');
const buckets = buildAgingBuckets([
  { amount: 100, dueDate: null },
  { amount: 200, dueDate: '2026-08-01T00:00:00Z' },
  { amount: 300, dueDate: '2026-05-01T00:00:00Z' },
], asOf);

assert.equal(buckets.find(b => b.label === 'UNDATED')?.amount, 100);
assert.equal(buckets.find(b => b.label === 'UNDATED')?.count, 1);
assert.equal(buckets.find(b => b.label === '0-30')?.amount, 200);
assert.equal(buckets.find(b => b.label === '91-180')?.amount, 300);
assert.equal(buckets.slice(0, 5).reduce((sum, b) => sum + b.amount, 0), 500);

const invalidDate = buildAgingBuckets([{ amount: 75, dueDate: 'not-a-date' }], asOf);
assert.equal(invalidDate.find(b => b.label === 'UNDATED')?.amount, 75);

const incomplete = cashConversionCycle({
  receivables: 1000,
  revenue: 0,
  inventory: 500,
  costOfSales: 1000,
  payables: 250,
  purchases: 0,
});
assert.equal(incomplete.status, 'INSUFFICIENT_DATA');
assert.equal(incomplete.ccc, null);

// Financial intelligence must preserve missing cost as insufficient evidence all the way into CCC.
const missingFinancialCost = buildFinancialIntelligence({
  revenue: 1000,
  receivables: 500,
  inventory: 800,
  costOfSales: null,
  payables: 200,
  purchases: 400,
  openingCash: 1000,
  dailyInflow: 100,
  dailyOutflow: 80,
});
assert.equal(missingFinancialCost.profitability.status, 'PROFIT_UNAVAILABLE');
assert.equal(missingFinancialCost.profitability.grossProfit, null);
assert.equal(missingFinancialCost.ccc.status, 'INSUFFICIENT_DATA');
assert.equal(missingFinancialCost.ccc.dio, null);
assert.equal(missingFinancialCost.ccc.ccc, null);

const completeFinancialCost = buildFinancialIntelligence({
  revenue: 1000,
  receivables: 500,
  inventory: 800,
  costOfSales: 800,
  payables: 200,
  purchases: 400,
  openingCash: 1000,
  dailyInflow: 100,
  dailyOutflow: 80,
});
assert.equal(completeFinancialCost.profitability.status, 'READY');
assert.equal(completeFinancialCost.ccc.status, 'READY');
assert.ok(completeFinancialCost.ccc.ccc !== null);

// Canonical intelligence is a sibling producer and must preserve the same missing-cost contract.
const missingCanonicalCost = buildCanonicalIntelligence({
  sales: [{ id: 's1', total: 1000, paidAmount: 500 }],
  purchases: [{ total: 400, paidAmount: 200 }],
  inventory: [{ sku: 'SKU-1', stock: 10, unitCost: 80 }],
  salesHistory: [100, 110, 120],
});
assert.equal(missingCanonicalCost.cashConversionCycle.status, 'INSUFFICIENT_DATA');
assert.equal(missingCanonicalCost.cashConversionCycle.dio, null);
assert.equal(missingCanonicalCost.cashConversionCycle.ccc, null);
assert.ok(missingCanonicalCost.warnings.some(w => w.includes('تكلفة المبيعات الفعلية غير متاحة')));

// Deep data-truth regressions: invalid numeric inputs must never become fake KPI values.
assert.throws(() => decideReplenishment({ onHand: Number.NaN, avgDailyDemand: 10, leadTimeDays: 5 }), /BI_INVALID_NUMBER:onHand/);
assert.throws(() => decideReplenishment({ onHand: 10, avgDailyDemand: -1, leadTimeDays: 5 }), /BI_NEGATIVE_VALUE:avgDailyDemand/);
assert.throws(() => scoreCustomer({ recencyDays: Number.NaN, orders: 1, revenue: 100 }), /BI_INVALID_NUMBER:recencyDays/);
assert.throws(() => scoreSupplier({ avgDeliveryDelayDays: 1, priceVariationPct: Number.NaN, dependencyPct: 10 }), /BI_INVALID_NUMBER:priceVariationPct/);
assert.throws(() => projectLiquidity({ openingLiquidity: 1000, horizons: [30], dailyInflow: Number.NaN, dailyOutflow: 10 }), /BI_INVALID_NUMBER:dailyInflow/);
assert.throws(() => cashConversionCycle({ receivables: 1, revenue: 1, inventory: 1, costOfSales: 1, payables: 1, purchases: 1, periodDays: 0 }), /BI_NON_POSITIVE_PERIOD:periodDays/);
assert.throws(() => whatIf({ baseline: 100, changes: [{ label: 'sales', pct: Number.NaN }] }), /BI_INVALID_WHAT_IF_CHANGE/);

// Trend calculations must be chronological even when upstream rows arrive out of order.
const trend = analyzeTrend([
  { date: '2026-08-03', value: 30 },
  { date: '2026-08-01', value: 10 },
  { date: '2026-08-02', value: 20 },
]);
assert.equal(trend.direction, 'UP');
assert.ok((trend.velocity ?? 0) > 0);

console.log('PASS: business intelligence regressions preserve UNKNOWN/UNDATED semantics, reject invalid numeric truth, and normalize trend chronology.');
