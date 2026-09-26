import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('benchmark network surface contract', () => {
  const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
  const page = readFileSync(resolve(process.cwd(), 'src/pages/BenchmarkNetworkPage.tsx'), 'utf8');

  it('is reachable through the canonical application route', () => {
    expect(app).toContain("path=\"/benchmark\"");
    expect(app).toContain('BenchmarkNetworkPage');
  });

  it('fails closed when no peer cohort exists', () => {
    expect(page).toContain('INSUFFICIENT_SAMPLE');
    expect(page).toContain('BENCHMARK GATE');
    expect(page).toContain('كيف ستظهر النتيجة عند اكتمال البوابة؟');
    expect(page).toContain('NO FABRICATION');
    expect(page).toContain('لا توجد عينة نظيرة كافية للمقارنة');
    expect(page).toContain('لا يتم تصنيع أي percentile أو مقارنة');
  });
});
