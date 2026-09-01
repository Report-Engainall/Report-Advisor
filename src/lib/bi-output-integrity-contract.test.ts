import { describe, expect, it } from 'vitest';
import { analyzeTrend, cashConversionCycle, decideReplenishment, projectLiquidity, scoreCustomer, scoreSupplier, whatIf } from './businessIntelligenceEngines';

describe('BI output integrity contract', () => {
  it('keeps replenishment outputs finite and non-negative', () => {
    const result = decideReplenishment({ onHand: 20, avgDailyDemand: 4, leadTimeDays: 3 });
    expect(Number.isFinite(result.suggestedQuantity)).toBe(true);
    expect(result.suggestedQuantity).toBeGreaterThanOrEqual(0);
  });
  it('keeps customer score components bounded and finite', () => {
    const result = scoreCustomer({ recencyDays: 10, orders: 4, revenue: 1000 });
    expect([result.recency, result.frequency, result.monetary, result.score].every(Number.isFinite)).toBe(true);
    expect(result.recency).toBeGreaterThanOrEqual(0); expect(result.recency).toBeLessThanOrEqual(100);
    expect(result.frequency).toBeGreaterThanOrEqual(0); expect(result.frequency).toBeLessThanOrEqual(100);
    expect(result.monetary).toBeGreaterThanOrEqual(0); expect(result.monetary).toBeLessThanOrEqual(100);
  });
  it('keeps supplier risk outputs bounded and finite', () => {
    const result = scoreSupplier({ avgDeliveryDelayDays: 2, priceVariationPct: -4, dependencyPct: 30 });
    expect([result.score, result.deliveryRisk, result.priceRisk, result.dependencyRisk].every(Number.isFinite)).toBe(true);
    expect(result.deliveryRisk).toBeGreaterThanOrEqual(0); expect(result.deliveryRisk).toBeLessThanOrEqual(100);
    expect(result.priceRisk).toBeGreaterThanOrEqual(0); expect(result.priceRisk).toBeLessThanOrEqual(100);
    expect(result.dependencyRisk).toBeGreaterThanOrEqual(0); expect(result.dependencyRisk).toBeLessThanOrEqual(100);
  });
  it('preserves caller horizon order while returning deterministic sorted projections', () => {
    const horizons = [90, 7, 30];
    const result = projectLiquidity({ openingLiquidity: 1000, horizons, dailyInflow: 20, dailyOutflow: 10 });
    expect(horizons).toEqual([90, 7, 30]);
    expect(result.map(item => item.horizonDays)).toEqual([7, 30, 90]);
  });
  it('preserves chronological trend semantics without mutating input', () => {
    const points = [{ date: '2026-08-03', value: 30 }, { date: '2026-08-01', value: 10 }, { date: '2026-08-02', value: 20 }];
    const snapshot = structuredClone(points);
    const result = analyzeTrend(points);
    expect(result.direction).toBe('UP');
    expect(points).toEqual(snapshot);
  });
  it('keeps What-If arithmetic internally consistent', () => {
    const result = whatIf({ baseline: 1000, changes: [{ label: 'growth', pct: 10 }, { label: 'discount', pct: -5 }] });
    expect(result.scenario).toBeCloseTo(1045);
    expect(result.delta).toBeCloseTo(45);
    expect(result.deltaPct).toBeCloseTo(4.5);
  });
  it('returns explicit incomplete CCC instead of manufacturing a KPI', () => {
    const result = cashConversionCycle({ receivables: 100, revenue: 1000, inventory: 500, costOfSales: 1000, payables: 200, purchases: 0 });
    expect(result.status).toBe('INSUFFICIENT_DATA');
    expect(result.ccc).toBeNull();
  });
});
