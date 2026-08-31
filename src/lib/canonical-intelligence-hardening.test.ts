import { describe, expect, it } from 'vitest';
import { buildCanonicalIntelligence } from './canonicalIntelligence';

describe('canonical intelligence numeric boundaries', () => {
  it('clamps negative payments so receivables cannot be inflated', () => {
    const result = buildCanonicalIntelligence({ sales: [{ id: 's1', total: 100, paidAmount: -50 }], purchases: [], inventory: [], salesHistory: [] });
    expect(result.metrics.find((metric) => metric.key === 'receivables')?.value).toBe(100);
  });
  it('treats NaN payments as zero paid', () => {
    const result = buildCanonicalIntelligence({ sales: [{ id: 's1', total: 100, paidAmount: Number.NaN }], purchases: [], inventory: [], salesHistory: [] });
    expect(result.metrics.find((metric) => metric.key === 'receivables')?.value).toBe(100);
  });
  it('fails closed for non-finite caller-supplied payment priorities', () => {
    const result = buildCanonicalIntelligence({ sales: [], purchases: [{ total: 100, paidAmount: 0 }], inventory: [], salesHistory: [], supplierPaymentPriorities: [{ id: 'p1', amount: Number.NaN, overdueDays: 1 }] as never });
    expect(result.supplierPayments[0]?.amount).toBe(0);
  });
  it('fails closed for infinite caller-supplied receivable priorities', () => {
    const result = buildCanonicalIntelligence({ sales: [{ id: 's1', total: 100, paidAmount: 0 }], purchases: [], inventory: [], salesHistory: [], receivablePriorities: [{ id: 'r1', amount: Number.POSITIVE_INFINITY, overdueDays: 1 }] as never });
    expect(result.collections[0]?.amount).toBe(0);
  });
  it('clamps negative sales history before forecasting and velocity', () => {
    const result = buildCanonicalIntelligence({ sales: [], purchases: [], inventory: [{ sku: 'A', stock: 10, unitCost: 2 }], salesHistory: [10, -100, 20] });
    expect(result.metrics.find((metric) => metric.key === 'inventory_velocity')?.value).toBe(10);
  });
  it('clamps negative daily demand before replenishment', () => {
    const result = buildCanonicalIntelligence({ sales: [], purchases: [], inventory: [{ sku: 'A', stock: 10, unitCost: 2, dailySales: [10, -100, 20] }], salesHistory: [] });
    expect(result.replenishment).toHaveLength(1);
  });
  it('keeps non-finite daily demand out of stochastic inventory input', () => {
    const result = buildCanonicalIntelligence({ sales: [], purchases: [], inventory: [{ sku: 'A', stock: 10, unitCost: 2, dailySales: [10, Number.NaN, 20] }], salesHistory: [] });
    expect(result.stochasticInventory).toHaveLength(1);
  });
});
