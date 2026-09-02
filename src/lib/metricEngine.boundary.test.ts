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
    for (const sourceRows of [undefined, 0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, true as never]) {
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
  it('fails closed for structured non-numeric runtime values', () => {
    for (const value of [{ value: 100 }, [100], new Date('2026-01-01'), new Number(100), { valueOf: () => 100 }]) {
      const metric = evaluateMetric({ key: 'net_sales', value: value as never, sourceRows: 1 });
      expect(metric.value).toBeNull();
      expect(metric.status).toBe('UNAVAILABLE');
      expect(metric.confidence).toBe(0);
    }
  });
  it('rejects coercible primitive values that are not numeric types', () => {
    for (const value of [true, false, '', '   ']) {
      const metric = evaluateMetric({ key: 'net_sales', value: value as never, sourceRows: 1 });
      expect(metric.value).toBeNull();
      expect(metric.status).toBe('UNAVAILABLE');
      expect(metric.confidence).toBe(0);
    }
  });
  it('does not mutate caller-owned warnings when adding boundary warnings', () => {
    const warnings = ['caller-warning'];
    const metric = evaluateMetric({ key: 'net_sales', value: 'not-a-number' as never, sourceRows: 1, warnings });
    expect(warnings).toEqual(['caller-warning']);
    expect(metric.warnings).toEqual(['caller-warning', 'القيمة غير متاحة أو غير رقمية.']);
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
  it('rejects malformed status values instead of trusting TypeScript-only unions', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, confidence: 1, sourceRows: 1, status: 'APPROVED' as never });
    expect(metric.status).toBe('CALCULATED');
  });
  it('normalizes whitespace around metric keys without changing identity', () => {
    const metric = evaluateMetric({ key: ' net_sales ', value: 100, confidence: 1, sourceRows: 1 });
    expect(metric.key).toBe('net_sales');
    expect(metric.fact.key).toBe('net_sales');
  });
  it('drops non-string warning entries rather than exposing malformed UI payloads', () => {
    const metric = evaluateMetric({ key: 'net_sales', value: 100, sourceRows: 1, warnings: ['ok', 42] as never });
    expect(metric.warnings).toEqual([]);
  });
  it('preserves finite numeric-string compatibility while rejecting non-finite strings', () => {
    const valid = evaluateMetric({ key: 'net_sales', value: '100.5' as never, sourceRows: 1 });
    expect(valid.value).toBe(100.5);
    const invalid = evaluateMetric({ key: 'net_sales', value: 'Infinity' as never, sourceRows: 1 });
    expect(invalid.value).toBeNull();
    expect(invalid.status).toBe('UNAVAILABLE');
  });
});
