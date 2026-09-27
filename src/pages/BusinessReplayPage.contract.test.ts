import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('business replay contract', () => {
  const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');
  const page = readFileSync(resolve(process.cwd(), 'src/pages/BusinessReplayPage.tsx'), 'utf8');
  const queries = readFileSync(resolve(process.cwd(), 'src/lib/queries.ts'), 'utf8');
  const sidebar = readFileSync(resolve(process.cwd(), 'src/components/Sidebar.tsx'), 'utf8');

  it('exposes a routed replay surface and tenant-scoped snapshot query', () => {
    expect(app).toContain("path=\"/replay\"");
    expect(page).toContain('BUSINESS REPLAY');
    expect(queries).toContain('fetchBusinessReplaySnapshot');
    expect(queries).toContain("from('business_state_snapshots')");
    expect(queries).toContain("from('recommendation_outcomes')");
    expect(queries).toContain("from('decision_work_items')");
    expect((queries.match(/\.eq\('company_id', companyId\)/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(queries).not.toContain('service_role');
    expect(queries).toContain("snapshot_key,source_version,quality_score,evidence");
    expect(queries).toContain("recommendation_key,status,expected_impact,actual_impact,outcome_quality,evidence");
    expect(queries).toContain("title,status,priority,description,completed_at,updated_at,evidence_refs,expected_impact,actual_impact");
    expect(queries).toContain('windowLimit + 1');
    expect(queries).toContain('function replayEvidencePresent');
    expect(queries).toContain('Object.keys(value as Record<string, unknown>).length > 0');
    expect(page).toContain('REPLAY TIMELINE');
    expect(page).toContain('المعروض ليس إجمالي التاريخ');
  });

  it('fails closed when historical replay evidence is missing', () => {
    expect(page).toContain('INSUFFICIENT_DATA');
    expect(page).toContain('لا توجد أحداث أو نتائج سابقة');
    expect(page).toContain('snapshotCount > 0 && snapshot.outcomeCount > 0');
    expect(page).toContain('hasMoreHistory');
    expect(page).toContain('نافذة القراءة الحالية');
    expect(page).toContain('دليل مرتبط');
  });
});
