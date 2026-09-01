import { describe, expect, it } from 'vitest';
import { analyzeTrend, projectLiquidity } from './businessIntelligenceEngines';

describe('BI input immutability contract', () => {
  it('does not mutate trend input ordering', () => {
    const points = [
      { date: '2026-08-03', value: 30 },
      { date: '2026-08-01', value: 10 },
      { date: '2026-08-02', value: 20 },
    ];
    const before = structuredClone(points);
    analyzeTrend(points);
    expect(points).toEqual(before);
  });

  it('does not mutate liquidity horizon ordering', () => {
    const horizons = [90, 30, 60];
    projectLiquidity({ openingLiquidity: 1000, horizons, dailyInflow: 20, dailyOutflow: 10 });
    expect(horizons).toEqual([90, 30, 60]);
  });
});
