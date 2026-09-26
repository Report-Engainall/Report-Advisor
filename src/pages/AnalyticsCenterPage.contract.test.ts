import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/pages/AnalyticsPage.tsx'), 'utf8');

describe('analytics center readiness contract', () => {
  it('reads live readiness instead of rendering static availability claims', () => {
    expect(page).toContain('type AnalyticsReadiness');
    expect(page).toContain('Promise.allSettled');
    expect(page).toContain('fetchRFMSnapshot(100)');
    expect(page).toContain('fetchABCSnapshot(100)');
    expect(page).toContain('fetchAgingSnapshot()');
    expect(page).toContain('fetchDashboardSnapshot(1)');
    expect(page).toContain('بيانات غير كافية');
    expect(page).toContain('فشل القراءة');
  });

  it('exposes a real refresh action and avoids synthetic readiness', () => {
    expect(page).toContain('تحديث الجاهزية');
    expect(page).toContain('لا توجد أرقام اصطناعية');
    expect(page).not.toContain("state === 'CALCULATED' ? 'متاح من المصدر' : 'متاح'");
  });
});
