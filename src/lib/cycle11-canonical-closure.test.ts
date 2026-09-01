import { describe, expect, it } from 'vitest';
import { buildCanonicalIntelligence } from './canonicalIntelligence';

const fixture = {
  sales: [
    { id: 'sale-1', total: 100, paidAmount: 50, date: '2026-01-01' },
    { id: 'sale-2', total: 200, paidAmount: 0, date: '2026-01-31' },
  ],
  purchases: [
    { total: 200, paidAmount: 50 },
  ],
  inventory: [
    { sku: 'A', stock: 10, unitCost: 5, dailySales: [2, 3, 4], leadTimeDays: 5 },
    { sku: 'B', stock: 5, unitCost: 4, dailySales: [1, 2, 3], leadTimeDays: 7 },
  ],
  salesHistory: [10, 20, 30, 40, 50, 60, 70],
  costOfSales: 120,
  openingLiquidity: 1000,
  dailyInflow: 100,
  dailyOutflow: 80,
  committedOutflow: 200,
  periodDays: 30,
};

describe('cycle 11 canonical closure', () => {
  it('keeps the primary canonical metrics deterministic', () => {
    const result = buildCanonicalIntelligence(fixture);
    const byKey = new Map(result.metrics.map((metric) => [metric.key, metric]));

    expect(byKey.get('net_sales')?.value).toBe(300);
    expect(byKey.get('receivables')?.value).toBe(250);
    expect(byKey.get('payables')?.value).toBe(150);
    expect(byKey.get('inventory_value')?.value).toBe(70);
    expect(byKey.get('inventory_velocity')?.value).toBe(40);
    expect(byKey.get('stock_coverage')?.value).toBeCloseTo(0.375, 10);
    expect(result.replenishment).toHaveLength(2);
    expect(result.stochasticInventory).toHaveLength(2);
    expect(result.liquidity).toHaveLength(6);
    expect(Number.isFinite(result.confidence)).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('fails closed for empty, null, negative and non-finite numeric inputs', () => {
    const result = buildCanonicalIntelligence({
      sales: [
        { id: 'valid', total: 100, paidAmount: 20 },
        { id: 'nan', total: Number.NaN, paidAmount: 10 },
      ],
      purchases: [{ total: -100, paidAmount: Number.POSITIVE_INFINITY }],
      inventory: [
        { sku: 'bad', stock: Number.NaN, unitCost: 5, dailySales: [Number.NaN, -10, 10] },
        { sku: 'good', stock: 4, unitCost: 5, dailySales: [2, Number.POSITIVE_INFINITY, -2] },
      ],
      salesHistory: [Number.NaN, -20, 20],
      costOfSales: Number.POSITIVE_INFINITY,
      openingLiquidity: Number.NaN,
      dailyInflow: Number.POSITIVE_INFINITY,
      dailyOutflow: -10,
      committedOutflow: Number.NEGATIVE_INFINITY,
    });

    const keys = new Set(result.metrics.map((metric) => metric.key));
    expect(keys).toEqual(new Set(['net_sales', 'receivables', 'payables', 'inventory_value', 'inventory_velocity', 'stock_coverage']));
    expect(result.metrics.every((metric) => Number.isFinite(metric.value ?? 0))).toBe(true);
    expect(Number.isFinite(result.confidence)).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('does not substitute purchases for missing cost of sales in CCC', () => {
    const result = buildCanonicalIntelligence({
      ...fixture,
      costOfSales: undefined,
    });

    expect(result.cashConversionCycle.status).toBe('INSUFFICIENT_DATA');
    expect(result.warnings.some((warning) => warning.includes('تكلفة المبيعات'))).toBe(true);
  });
});
