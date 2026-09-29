import { describe, expect, it } from 'vitest';
import { buildPostImportReportSurfaces } from '../lib/report-intelligence/post-import-report-surfaces';

describe('source-bound report continuity contract', () => {
  it('routes a completed sales import to the exact source-bound report surface', () => {
    const surfaces = buildPostImportReportSurfaces('sales', '74c499d1-6e65-4834-a093-eef1eb633fb2', ['demand','customerDemand','liquidity']);
    expect(surfaces.find((surface) => surface.key === 'domain')?.path)
      .toBe('/reports/import/74c499d1-6e65-4834-a093-eef1eb633fb2');
  });
});
