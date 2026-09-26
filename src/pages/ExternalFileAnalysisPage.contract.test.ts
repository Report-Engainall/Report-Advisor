import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/pages/ExternalFileAnalysisPage.tsx'), 'utf8');

describe('external file analysis decision surface', () => {
  it('exposes the source readiness pipeline without claiming business-data approval', () => {
    expect(page).toContain('SOURCE READINESS');
    expect(page).toContain('الفحص الأمني');
    expect(page).toContain('كشف الصيغة');
    expect(page).toContain('المطابقة');
    expect(page).toContain('NEXT ACTION');
    expect(page).toContain('التحليل الخارجي لا يكتب بيانات الأعمال مباشرة.');
    expect(page).toContain("qualityScore == null ? 'غير متاح'");
    expect(page).toContain('Number.isFinite(dataset.qualityScore)');
  });

  it('routes the next action to canonical trust/import surfaces instead of inventing a new flow', () => {
    expect(page).toContain('to="/import"');
    expect(page).toContain('to="/trust"');
    expect(page).not.toContain('to="/product-import"');
    expect(page).not.toContain('to="/customer-import"');
  });
});
