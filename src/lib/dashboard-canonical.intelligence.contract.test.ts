import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const adapter = fs.readFileSync(path.join(root, 'src/lib/dashboard-canonical.ts'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20260826070000_dashboard_intelligence_canonical.sql'), 'utf8');

describe('dashboard intelligence canonical tenant contract', () => {
  it('uses the authoritative RPC rather than direct recommendation/alert reads', () => {
    expect(adapter).toContain("supabase.rpc('get_dashboard_intelligence'");
    expect(adapter).not.toMatch(/supabase\.from\(['"]recommendations['"]\)/);
    expect(adapter).not.toMatch(/supabase\.from\(['"]alerts['"]\)/);
  });

  it('derives tenant authority server-side and restricts execution', () => {
    expect(migration).toContain('public.current_company_id()');
    expect(migration).toContain('security invoker');
    expect(migration).toContain('set search_path = public');
    expect(migration).toContain('revoke all on function public.get_dashboard_intelligence(integer) from public');
    expect(migration).toContain('revoke all on function public.get_dashboard_intelligence(integer) from anon');
    expect(migration).toContain('grant execute on function public.get_dashboard_intelligence(integer) to authenticated');
    expect(migration).toContain('where company_id = v_company_id');
  });
});


describe('dashboard intelligence payload semantics', () => {
  it('guards recommendation and alert object shapes before UI consumption', () => {
    expect(adapter).toContain('isRecommendation');
    expect(adapter).toContain('isAlert');
    expect(adapter).toContain("requiredArray<Recommendation>(row.recommendations, 'recommendations', isRecommendation)");
    expect(adapter).toContain("requiredArray<Alert>(row.alerts, 'alerts', isAlert)");
  });
});
