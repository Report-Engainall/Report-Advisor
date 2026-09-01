import { describe, expect, it } from 'vitest';
import { analyzeTrend, buildAgingBuckets, cashConversionCycle, decideReplenishment, projectLiquidity, scoreCustomer, scoreSupplier, whatIf } from './businessIntelligenceEngines';

describe('BI adversarial input contract', () => {
  it('rejects negative inventory demand inputs', () => {
    expect(() => decideReplenishment({ onHand: -1, avgDailyDemand: 2, leadTimeDays: 3 })).toThrow('BI_NEGATIVE_VALUE:onHand');
    expect(() => decideReplenishment({ onHand: 1, avgDailyDemand: 2, leadTimeDays: -3 })).toThrow('BI_NEGATIVE_VALUE:leadTimeDays');
  });
  it('rejects negative customer financial inputs', () => {
    expect(() => scoreCustomer({ recencyDays: -1, orders: 2, revenue: 10 })).toThrow('BI_NEGATIVE_VALUE:recencyDays');
    expect(() => scoreCustomer({ recencyDays: 1, orders: 2, revenue: -10 })).toThrow('BI_NEGATIVE_VALUE:revenue');
  });
  it('rejects negative supplier dependency input', () => {
    expect(() => scoreSupplier({ avgDeliveryDelayDays: 1, priceVariationPct: 2, dependencyPct: -1 })).toThrow('BI_NEGATIVE_VALUE:dependencyPct');
  });
  it('rejects negative liquidity rates and horizons', () => {
    expect(() => projectLiquidity({ openingLiquidity: 100, horizons: [30], dailyInflow: -1, dailyOutflow: 1 })).toThrow('BI_NEGATIVE_VALUE:dailyInflow');
    expect(() => projectLiquidity({ openingLiquidity: 100, horizons: [-30], dailyInflow: 1, dailyOutflow: 1 })).toThrow('BI_NEGATIVE_VALUE:horizonDays');
  });
  it('rejects negative CCC accounting values', () => {
    expect(() => cashConversionCycle({ receivables: -1, revenue: 1, inventory: 1, costOfSales: 1, payables: 1, purchases: 1 })).toThrow('BI_NEGATIVE_VALUE:receivables');
    expect(() => cashConversionCycle({ receivables: 1, revenue: 1, inventory: 1, costOfSales: 1, payables: -1, purchases: 1 })).toThrow('BI_NEGATIVE_VALUE:payables');
  });
  it('rejects non-finite What-If baseline and changes', () => {
    expect(() => whatIf({ baseline: Number.POSITIVE_INFINITY, changes: [] })).toThrow('BI_INVALID_NUMBER:baseline');
    expect(() => whatIf({ baseline: 100, changes: [{ label: 'x', pct: Number.NEGATIVE_INFINITY }] })).toThrow('BI_INVALID_WHAT_IF_CHANGE');
    expect(() => whatIf({ baseline: 100, changes: [{ label: 'x', pct: -101 }] })).toThrow('BI_INVALID_WHAT_IF_CHANGE');
  });
  it('rejects NaN and non-array runtime payloads at public boundaries', () => {
    expect(() => decideReplenishment({ onHand: Number.NaN, avgDailyDemand: 1, leadTimeDays: 1 })).toThrow('BI_INVALID_NUMBER:onHand');
    expect(() => scoreCustomer({ recencyDays: 1, orders: Number.POSITIVE_INFINITY, revenue: 1 })).toThrow('BI_INVALID_NUMBER:orders');
    expect(() => projectLiquidity({ openingLiquidity: 1, horizons: '30', dailyInflow: 1, dailyOutflow: 1 } as never)).toThrow('BI_INVALID_HORIZONS');
    expect(() => whatIf({ baseline: 1, changes: null } as never)).toThrow('BI_INVALID_CHANGES');
  });
  it('fails closed instead of silently dropping malformed aging records', () => {
    expect(() => buildAgingBuckets([{ amount: Number.NaN }], new Date('2026-01-01'))).toThrow('BI_INVALID_NUMBER:aging.amount');
    expect(() => buildAgingBuckets([{ amount: -1 }], new Date('2026-01-01'))).toThrow('BI_NEGATIVE_VALUE:aging.amount');
    expect(() => buildAgingBuckets([{ amount: 1, dueDate: 'not-a-date' }], new Date('2026-01-01'))).toThrow('BI_INVALID_DATE:aging.dueDate');
  });
  it('fails closed on malformed trend points instead of silently filtering them', () => {
    expect(() => analyzeTrend([{ date: '2026-01-01', value: 1 }, { date: 'bad-date', value: 2 }, { date: '2026-01-03', value: 3 }])).toThrow('BI_INVALID_DATE:trend.date');
    expect(() => analyzeTrend([{ date: '2026-01-01', value: Number.NaN }, { date: '2026-01-02', value: 2 }, { date: '2026-01-03', value: 3 }])).toThrow('BI_INVALID_NUMBER:trend.value');
  });
});
