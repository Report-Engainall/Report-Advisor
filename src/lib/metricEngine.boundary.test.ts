import { describe, expect, it } from 'vitest';
import { evaluateMetric, evaluateMetricBatch, metricCanDriveDecision, metricDisplayValue } from './metricEngine';

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
  it('fails closed instead of throwing on hostile numeric runtime values', () => {
    for (const value of [Symbol('poison'), 10n, Number.POSITIVE_INFINITY, Number.NaN]) {
      const metric = evaluateMetric({ key: 'net_sales', value: value as never, sourceRows: 1 });
      expect(metric.value).toBeNull();
      expect(metric.status).toBe('UNAVAILABLE');
      expect(metric.confidence).toBe(0);
    }
  });
  it('does not trust malformed warning containers', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, sourceRows: 1, warnings: 'not-an-array' as never });
    expect(metric.warnings).toEqual([]);
  });
  it('rejects malformed top-level and batch inputs before property access', () => {
    expect(() => evaluateMetric(null as never)).toThrow('Metric input is required');
    expect(() => evaluateMetric([] as never)).toThrow('Metric input is required');
    expect(() => evaluateMetric({ key: '' } as never)).toThrow('Metric key is required');
    expect(() => evaluateMetricBatch(null as never)).toThrow('Metric batch input is required');
  });
  it('keeps decision/display boundaries finite', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: 1, sourceRows: 1 });
    expect(metricCanDriveDecision(metric)).toBe(true);
    expect(metricDisplayValue(metric)).toContain('100');
  });
});
