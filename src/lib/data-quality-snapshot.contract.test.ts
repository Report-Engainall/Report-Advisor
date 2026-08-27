import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('data quality architecture contract', () => {
  const migration = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260826040000_data_quality_snapshot.sql'), 'utf8');
  const adapter = readFileSync(resolve(process.cwd(), 'src/lib/data-quality-snapshot.ts'), 'utf8');
  const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');

  it('uses a tenant-authoritative RPC with no tenant parameter', () => {
    expect(migration).toContain('get_data_quality_snapshot()');
    expect(migration).toContain('current_company_id()');
    expect(migration).toContain('SECURITY DEFINER');
    expect(migration).toContain('SET search_path = public');
    expect(migration).toContain('REVOKE ALL ON FUNCTION public.get_data_quality_snapshot() FROM PUBLIC');
    expect(migration).toContain('GRANT EXECUTE ON FUNCTION public.get_data_quality_snapshot() TO authenticated');
    expect(migration).not.toMatch(/get_data_quality_snapshot\([^)]*(company|tenant|organization)[^)]*\)/i);
  });

  it('keeps the browser adapter on the canonical RPC', () => {
    expect(adapter).toContain("supabase.rpc('get_data_quality_snapshot')");
    expect(adapter).not.toContain("from('customers')");
    expect(adapter).not.toContain("from('products')");
    expect(adapter).not.toContain("from('sales_invoices')");
    expect(adapter).not.toContain("from('inventory_balances')");
  });

  it('routes the data-quality surface to the canonical page', () => {
    expect(app).toContain("@/pages/DataQualitySnapshotPage");
    expect(app).not.toContain("@/pages/EntityPages').then(m => ({ default: m.DataQualityPage }))");
  });
});
