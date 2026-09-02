import { describe, expect, it } from 'vitest';
import { analyzeTrend, cashConversionCycle, decideReplenishment } from './businessIntelligenceEngines';

describe('BI insufficient-data semantics', () => {
  it('returns explicit insufficient trend state for short history', () => {
    expect(analyzeTrend([{ date: '2026-08-01', value: 10 }, { date: '2026-08-02', value: 12 }])).toEqual({ direction: 'INSUFFICIENT_DATA', velocity: null, acceleration: null, volatility: null, seasonalityHint: 'UNKNOWN' });
  });
  it('returns null CCC when a required denominator is absent', () => {
    const result = cashConversionCycle({ receivables: 100, revenue: 0, inventory: 100, costOfSales: 100, payables: 50, purchases: 50 });
    expect(result.status).toBe('INSUFFICIENT_DATA');
    expect(result.ccc).toBeNull();
  });
  it('does not recommend a purchase when demand is explicitly zero', () => {
    expect(decideReplenishment({ onHand: 20, avgDailyDemand: 0, leadTimeDays: 5 }).action).toBe('MONITOR');
  });
});
