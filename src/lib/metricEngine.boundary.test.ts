import { describe, expect, it } from 'vitest';
import { evaluateMetric, metricCanDriveDecision } from './metricEngine';

describe('metric confidence boundary', () => {
  it('fails closed when confidence is NaN', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: Number.NaN, sourceRows: 1 });
    expect(metric.confidence).toBe(0);
    expect(metricCanDriveDecision(metric)).toBe(false);
  });
  it('fails closed when confidence is positive infinity', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: Number.POSITIVE_INFINITY, sourceRows: 1 });
    expect(metric.confidence).toBe(0);
    expect(metricCanDriveDecision(metric)).toBe(false);
  });
  it('fails closed when confidence is negative infinity', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: Number.NEGATIVE_INFINITY, sourceRows: 1 });
    expect(metric.confidence).toBe(0);
    expect(metricCanDriveDecision(metric)).toBe(false);
  });
  it('fails closed when confidence is negative', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: -1, sourceRows: 1 });
    expect(metric.confidence).toBe(0);
    expect(metricCanDriveDecision(metric)).toBe(false);
  });
  it('fails closed when confidence is greater than one', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: 1.0001, sourceRows: 1 });
    expect(metric.confidence).toBe(0);
    expect(metricCanDriveDecision(metric)).toBe(false);
  });
  it('fails closed when confidence is missing', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, sourceRows: 1 });
    expect(metric.confidence).toBe(0);
    expect(metricCanDriveDecision(metric)).toBe(false);
  });
  it('accepts valid boundary confidence zero', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: 0, sourceRows: 1 });
    expect(metric.confidence).toBe(0);
    expect(metricCanDriveDecision(metric)).toBe(false);
  });
  it('accepts valid boundary confidence one', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: 1, sourceRows: 1 });
    expect(metric.confidence).toBe(1);
    expect(metricCanDriveDecision(metric)).toBe(true);
  });
  it('rejects missing source evidence', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: 1 });
    expect(metric.status).toBe('INSUFFICIENT_DATA');
    expect(metric.confidence).toBe(0);
    expect(metricCanDriveDecision(metric)).toBe(false);
  });
  it('rejects invalid source evidence', () => {
    for (const sourceRows of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: 1, sourceRows });
      expect(metric.status).toBe('INSUFFICIENT_DATA');
      expect(metric.confidence).toBe(0);
      expect(metricCanDriveDecision(metric)).toBe(false);
    }
  });
  it('forces unavailable values to zero confidence', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: Number.NaN, confidence: 1, sourceRows: 1 });
    expect(metric.status).toBe('UNAVAILABLE');
    expect(metric.confidence).toBe(0);
  });
});
