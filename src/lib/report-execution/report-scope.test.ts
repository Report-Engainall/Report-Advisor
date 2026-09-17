import { describe, expect, it } from 'vitest';
import { resolveReportExecutionScope } from './report-scope';
import { fingerprintReportSource } from './source-fingerprint';

describe('report execution scope boundary', () => {
  const base = {
    tenantId: 'tenant-a',
    parameters: {
      dataset: 'sales',
      from: '2026-09-01',
      to: '2026-09-10',
      asOf: '2026-09-10',
      statusPolicy: 'posted-confirmed-paid',
    },
  };

  it('resolves an explicit tenant, dataset, period, as-of and status policy', () => {
    expect(resolveReportExecutionScope(base)).toEqual(base);
  });

  it('rejects a missing dataset instead of allowing an implicit source', () => {
    expect(() => resolveReportExecutionScope({ ...base, parameters: { ...base.parameters, dataset: '' } })).toThrow('REPORT_SCOPE_DATASET_REQUIRED');
  });

  it('rejects inverted periods', () => {
    expect(() => resolveReportExecutionScope({ ...base, parameters: { ...base.parameters, from: '2026-09-11' } })).toThrow('REPORT_SCOPE_PERIOD_INVALID');
  });

  it('rejects an as-of date before the selected period end', () => {
    expect(() => resolveReportExecutionScope({ ...base, parameters: { ...base.parameters, asOf: '2026-09-09' } })).toThrow('REPORT_SCOPE_AS_OF_BEFORE_PERIOD_END');
  });

  it('rejects impossible calendar dates', () => {
    expect(() => resolveReportExecutionScope({ ...base, parameters: { ...base.parameters, to: '2026-02-30' } })).toThrow('REPORT_SCOPE_TO_INVALID');
  });

  it('fingerprints the same authoritative rows identically regardless of object or row order', async () => {
    const scope = resolveReportExecutionScope(base);
    const first = await fingerprintReportSource(scope, [
      { invoice: 'B', amount: 20, customer: { z: 2, a: 1 } },
      { invoice: 'A', amount: 10, customer: { a: 1, z: 2 } },
    ]);
    const reordered = await fingerprintReportSource(scope, [
      { customer: { z: 2, a: 1 }, amount: 10, invoice: 'A' },
      { amount: 20, invoice: 'B', customer: { a: 1, z: 2 } },
    ]);
    expect(reordered).toBe(first);
  });
});
