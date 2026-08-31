import { describe, expect, it } from 'vitest';
import { evaluateMetric, metricCanDriveDecision } from './metricEngine';

describe('metric confidence boundary', () => {
  it('fails closed when confidence is NaN', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: Number.NaN, sourceRows: 1 });
    expect(metric.confidence).toBe(1);
    expect(metricCanDriveDecision(metric)).toBe(true);
  });
  it('clamps infinite confidence to the safe finite default', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: Number.POSITIVE_INFINITY, sourceRows: 1 });
    expect(metric.confidence).toBe(1);
  });
  it('clamps negative confidence to zero', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: -1, sourceRows: 1 });
    expect(metric.confidence).toBe(0);
    expect(metricCanDriveDecision(metric)).toBe(false);
  });
  it('forces unavailable values to zero confidence', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: Number.NaN, confidence: 1, sourceRows: 1 });
    expect(metric.status).toBe('UNAVAILABLE');
    expect(metric.confidence).toBe(0);
  });
});
