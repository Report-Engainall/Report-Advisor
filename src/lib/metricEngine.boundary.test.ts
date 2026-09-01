import { describe, expect, it } from 'vitest';
import { evaluateMetric, metricCanDriveDecision } from './metricEngine';

describe('metric confidence and source boundaries', () => {
  it('fails closed for NaN and infinite confidence', () => {
    for (const confidence of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence, sourceRows: 1 });
      expect(metric.confidence).toBe(0);
      expect(metricCanDriveDecision(metric)).toBe(false);
    }
  });
  it('preserves omitted confidence fallback for valid data', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, sourceRows: 1 });
    expect(metric.confidence).toBe(1);
    expect(metricCanDriveDecision(metric)).toBe(true);
  });
  it('rejects missing or invalid source evidence', () => {
    for (const sourceRows of [undefined, 0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: 1, sourceRows });
      expect(metric.status).toBe('INSUFFICIENT_DATA');
      expect(metric.confidence).toBe(0);
      expect(metricCanDriveDecision(metric)).toBe(false);
    }
  });
});
