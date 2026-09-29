import { describe, expect, it } from 'vitest';
import { buildPostImportReportSurfaces, buildPostImportReportSummary, reportTypeDomain } from './post-import-report-surfaces';

describe('post-import report surfaces', () => {
  it('maps each governed report type to an existing product surface', () => {
    expect(reportTypeDomain('sales')).toBe('sales');
    expect(reportTypeDomain('purchases')).toBe('purchases');
    expect(reportTypeDomain('inventory')).toBe('inventory');
    expect(reportTypeDomain('customerBalances')).toBe('customers');
    expect(reportTypeDomain('supplierBalances')).toBe('suppliers');
    expect(reportTypeDomain('stockMovement')).toBe('inventory');
    expect(reportTypeDomain('unknown')).toBeNull();
  });

  it('builds the complete post-import journey without inventing an unavailable builder', () => {
    const surfaces = buildPostImportReportSurfaces('sales', 'job-123', ['demand', 'liquidity']);
    expect(surfaces.map((surface) => surface.key)).toEqual([
      'executive',
      'domain',
      'evidence',
      'decision',
      'work',
      'outcome',
      'benchmark',
    ]);
    expect(surfaces.find((surface) => surface.key === 'executive')?.path).toBe('/reports/executive?import=job-123');
    expect(surfaces.find((surface) => surface.key === 'domain')?.path).toBe('/reports/sales?import=job-123');
    expect(surfaces.find((surface) => surface.key === 'decision')?.path).toBe('/decision-experience?import=job-123&stage=decision');
    expect(surfaces.find((surface) => surface.key === 'outcome')?.path).toBe('/decision-experience?import=job-123&stage=outcome');
    expect(surfaces.every((surface) => surface.available)).toBe(true);
  });

  it('fails closed for an unknown report type', () => {
    const surfaces = buildPostImportReportSurfaces('unknown', 'job-456');
    const domain = surfaces.find((surface) => surface.key === 'domain');
    expect(domain?.available).toBe(false);
    expect(domain?.path).toBe('/reports');
    expect(buildPostImportReportSummary('unknown', 0)).toContain('دون تخمين');
  });
});
