import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('data quality architecture contract', () => {
  const migration = readFileSync(resolve(process.cwd(), 'supabase/migrations/20260830240000_fix_empty_quality_truth.sql'), 'utf8');
  const adapter = readFileSync(resolve(process.cwd(), 'src/lib/data-quality-snapshot-runtime.ts'), 'utf8');
  const page = readFileSync(resolve(process.cwd(), 'src/pages/DataQualitySnapshotPage.tsx'), 'utf8');
  const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');

  it('uses a tenant-authoritative RPC with no tenant parameter', () => {
    expect(migration).toContain('get_data_quality_snapshot()');
    expect(migration).toContain('current_company_id()');
    expect(migration).toContain('SECURITY INVOKER');
    expect(migration).toContain('SET search_path = public');
    expect(migration).not.toContain('SECURITY DEFINER');
    expect(migration).not.toMatch(/get_data_quality_snapshot\([^)]*(company|tenant|organization)[^)]*\)/i);
  });

  it('keeps the browser adapter on the canonical RPC and preserves EMPTY truth', () => {
    expect(adapter).toContain("supabase.rpc('get_data_quality_snapshot')");
    expect(adapter).toContain('validateDataQualitySnapshot');
    expect(adapter).toContain("status: 'OK' | 'EMPTY'");
    expect(adapter).toContain('DATA_QUALITY_EMPTY_SNAPSHOT_INCONSISTENT');
    expect(adapter).not.toContain("from('customers')");
    expect(adapter).not.toContain("from('products')");
    expect(adapter).not.toContain("from('sales_invoices')");
    expect(adapter).not.toContain("from('inventory_balances')");
  });

  it('consumes the empty-aware adapter and does not turn EMPTY into a false 100%', () => {
    expect(page).toContain("@/lib/data-quality-snapshot-runtime");
    expect(page).toContain("snapshot.status === 'EMPTY' ? 0");
    expect(page).toContain('Math.max(0, Math.min(100');
    expect(page).toContain("totalRecords===0?'لا توجد بيانات تجارية بعد؛ النتيجة EMPTY وليست نجاح جودة بيانات.'");
  });

  it('routes the data-quality surface to the canonical page', () => {
    expect(app).toContain("@/pages/DataQualitySnapshotPage");
    expect(app).not.toContain("@/pages/EntityPages').then(m => ({ default: m.DataQualityPage }))");
  });
});
