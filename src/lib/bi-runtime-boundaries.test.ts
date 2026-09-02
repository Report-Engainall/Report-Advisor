import { describe, expect, it } from 'vitest';
import { analyzeTrend, buildAgingBuckets, cashConversionCycle, decideReplenishment, projectLiquidity, scoreCustomer, whatIf } from './businessIntelligenceEngines';

describe('BI runtime boundary contracts', () => {
  it('rejects non-array aging payloads', () => expect(() => buildAgingBuckets(null as never)).toThrow('BI_INVALID_ITEMS:aging'));
  it('rejects non-array trend payloads', () => expect(() => analyzeTrend(null as never)).toThrow('BI_INVALID_POINTS:trend'));
  it('fails closed on non-positive CCC period', () => expect(() => cashConversionCycle({ receivables: 1, revenue: 1, inventory: 1, costOfSales: 1, payables: 1, purchases: 1, periodDays: 0 })).toThrow('BI_NON_POSITIVE_PERIOD:periodDays'));
  it('rejects non-finite replenishment demand', () => expect(() => decideReplenishment({ onHand: 10, avgDailyDemand: Number.NaN, leadTimeDays: 2 })).toThrow('BI_INVALID_NUMBER:avgDailyDemand'));
  it('rejects non-array liquidity horizons', () => expect(() => projectLiquidity({ openingLiquidity: 100, horizons: null as never, dailyInflow: 1, dailyOutflow: 1 })).toThrow('BI_INVALID_HORIZONS'));
  it('rejects malformed what-if changes', () => expect(() => whatIf({ baseline: 100, changes: null as never })).toThrow('BI_INVALID_CHANGES'));
  it('preserves deterministic customer scoring for valid inputs', () => expect(scoreCustomer({ recencyDays: 10, orders: 4, revenue: 1000 }).score).toBeGreaterThan(0));
  it('preserves chronological trend semantics', () => expect(analyzeTrend([{ date: '2026-08-03', value: 30 }, { date: '2026-08-01', value: 10 }, { date: '2026-08-02', value: 20 }]).direction).toBe('UP'));
  it('preserves explicit un-dated aging semantics', () => expect(buildAgingBuckets([{ amount: 100, dueDate: null }]).find(bucket => bucket.label === 'UNDATED')?.amount).toBe(100));
});
