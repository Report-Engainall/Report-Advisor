import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('business replay contract', () => {
  const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
  const page = readFileSync(resolve(process.cwd(), 'src/pages/BusinessReplayPage.tsx'), 'utf8');
  const queries = readFileSync(resolve(process.cwd(), 'src/lib/queries.ts'), 'utf8');

  it('exposes a routed replay surface and tenant-scoped snapshot query', () => {
    expect(app).toContain("path=\"/replay\"");
    expect(page).toContain('BUSINESS REPLAY');
    expect(queries).toContain('fetchBusinessReplaySnapshot');
    expect(queries).toContain("from('business_state_snapshots')");
    expect(queries).toContain("from('recommendation_outcomes')");
    expect(queries).toContain("from('decision_work_items')");
    expect((queries.match(/\.eq\('company_id', companyId\)/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(queries).not.toContain('service_role');
  });

  it('fails closed when historical replay evidence is missing', () => {
    expect(page).toContain('INSUFFICIENT_DATA');
    expect(page).toContain('لا توجد أحداث أو نتائج سابقة');
    expect(page).toContain('snapshotCount > 0 && snapshot.outcomeCount > 0');
  });
});
