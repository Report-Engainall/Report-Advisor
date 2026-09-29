import { describe, expect, it } from 'vitest';
import { buildPostImportReportSurfaces } from '../lib/report-intelligence/post-import-report-surfaces';
import { normalizeDomain } from './SourceBoundReportPage';

describe('source-bound report continuity contract', () => {
  it('routes every recognized domain import to the exact source-bound report surface', () => {
    const importId = '74c499d1-6e65-4834-a093-eef1eb633fb2';
    for (const reportType of ['sales', 'inventory', 'purchases', 'customerBalances', 'supplierBalances', 'stockMovement'] as const) {
      const surfaces = buildPostImportReportSurfaces(reportType, importId, ['demand','customerDemand','liquidity']);
      expect(surfaces.find((surface) => surface.key === 'domain')?.path)
        .toBe('/reports/import/' + importId);
    }
  });

  it('classifies known report files from source-name evidence before semantic hints', () => {
    expect(normalizeDomain('sales', 'ف العملاء الاجل من ت 01-06 حتى تاريخ 15-08.pdf')).toBe('receivables');
    expect(normalizeDomain('sales', 'تقارير ادارية للمورد.pdf')).toBe('suppliers');
    expect(normalizeDomain('inventory', 'تقارير حركة الصندوق.xlsx')).toBe('payments');
    expect(normalizeDomain('source-data', 'تقارير أرصدة المخزون.pdf')).toBe('inventory');
    expect(normalizeDomain('source-data', 'تقرير بيانات الاصناف اجمالي.pdf')).toBe('products');
  });
});
