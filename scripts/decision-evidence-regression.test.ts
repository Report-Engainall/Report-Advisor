import assert from 'node:assert/strict';
import { createDecision } from '../src/lib/free-toolbox/decision-log.ts';
import { alternativeGroupDecisions, inventoryDecisions } from '../src/lib/intelligence/decisionEngine.ts';

assert.throws(() => createDecision({
  title: 'بدون دليل', reason: 'invalid', status: 'proposed', priority: 1, evidenceIds: [], action: 'HOLD',
}), /DECISION_EVIDENCE_REQUIRED/);

const decision = createDecision({
  title: 'قرار موثق', reason: 'evidence-backed', status: 'proposed', priority: 1,
  evidenceIds: [' evidence-1 ', 'evidence-1', 'evidence-2'], action: 'BUY_SOON',
});
assert.deepEqual(decision.evidenceIds, ['evidence-1', 'evidence-2']);

const criticalWithoutCoverage = alternativeGroupDecisions([{
  id: 'g-null', name: 'مجموعة بلا تغطية', stockoutRisk: 'critical', normalizedStock: 10, normalizedDemand: 5,
  coverageDays: null, recommendedOrder: 20, trendPct: 4,
} as never])[0];
assert.ok(criticalWithoutCoverage);
assert.equal(criticalWithoutCoverage.evidence.some((item) => item.metric === 'group_coverage'), false);
assert.equal(criticalWithoutCoverage.evidence.some((item) => item.metric === 'group_coverage' && item.value === 0), false);

const invalidAlternativeGroup = alternativeGroupDecisions([{
  id: 'g-invalid', name: 'مجموعة بقيم غير قابلة للاستخدام', stockoutRisk: 'critical',
  normalizedStock: Number.POSITIVE_INFINITY, normalizedDemand: 5, coverageDays: 1,
  normalizedSales: 10, trendPct: 4, recommendedOrder: 20, memberSkus: [],
}])[0];
assert.equal(invalidAlternativeGroup, undefined);

const invalidTrendAlternativeGroup = alternativeGroupDecisions([{
  id: 'g-trend-invalid', name: 'مجموعة باتجاه غير صالح', stockoutRisk: 'medium',
  normalizedStock: 20, normalizedDemand: 5, coverageDays: 4,
  normalizedSales: 10, trendPct: Number.NaN, recommendedOrder: 10, memberSkus: [],
}])[0];
assert.equal(invalidTrendAlternativeGroup, undefined);

const infiniteCoverageFrozen = inventoryDecisions([{
  sku: 'sku-frozen', avgDailySales: 0, stdDailySales: 0, demandDuringLeadTime: 0, safetyStock: 0,
  reorderPoint: 0, minStock: 0, maxStock: 10, daysOfCover: Number.POSITIVE_INFINITY, stockoutDate: null,
  recommendedOrder: 0, classification: 'frozen', priority: 'medium',
}])[0];
assert.ok(infiniteCoverageFrozen);
assert.equal(infiniteCoverageFrozen.evidence.some((item) => item.value === Number.POSITIVE_INFINITY), false);
assert.equal(infiniteCoverageFrozen.evidence.some((item) => item.metric === 'avg_daily_sales' && item.value === 0), true);

const unusableCriticalInventory = inventoryDecisions([{
  sku: 'sku-invalid', avgDailySales: 0, stdDailySales: 0, demandDuringLeadTime: 0, safetyStock: 0,
  reorderPoint: 0, minStock: 0, maxStock: 0, daysOfCover: Number.POSITIVE_INFINITY, stockoutDate: null,
  recommendedOrder: 0, classification: 'at_risk', priority: 'critical',
}])[0];
assert.equal(unusableCriticalInventory, undefined);

console.log('PASS: decision evidence stays fail-closed and never substitutes unavailable coverage with zero.');
