import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20260826080000_export_tenant_authority_hardening.sql'), 'utf8');
const queriesCompat = fs.readFileSync(path.join(root, 'src/lib/queries-compat.ts'), 'utf8');

describe('export tenant authority contract', () => {
  it('requires client tenant ids to match server authority for inventory exports', () => {
    expect(migration).toContain('public.current_company_id()');
    expect(migration).toContain("p_company_id is distinct from v_company_id");
    expect(migration).toContain("raise exception 'TENANT_CONTEXT_MISMATCH'");
    expect(migration).toContain('where ib.company_id=v_company_id');
  });

  it('hardens all canonical export RPCs against anonymous execution', () => {
    for (const fn of ['get_sales_export_rows', 'get_purchase_export_rows', 'get_inventory_export_rows', 'get_receivables_export_rows']) {
      expect(migration).toContain(`revoke all on function public.${fn}(uuid, integer) from anon`);
      expect(migration).toContain(`alter function public.${fn}(uuid, integer) set search_path = public`);
    }
  });

  it('keeps export adapters tenant-aware', () => {
    expect(queriesCompat).toContain("supabase.rpc(functionName, { p_company_id: companyId, p_max_rows: 10000 })");
    expect(queriesCompat).toContain("if (!companyId) throw new Error('TENANT_REQUIRED')");
  });
});
