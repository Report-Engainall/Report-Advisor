import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const queries = fs.readFileSync(path.join(process.cwd(), 'src/lib/queries.ts'), 'utf8');

describe('invoice page-read tenant contract', () => {
  it('requires authoritative tenant context for sales and purchase invoice reads', () => {
    expect(queries).toContain("const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const from=page*pageSize");
    expect(queries).toContain("supabase.from('sales_invoices').select('*, customer:customers(id,name)',{count:'exact'}).eq('company_id',companyId)");
    expect(queries).toContain("supabase.from('purchase_invoices').select('*, supplier:suppliers(id,name)',{count:'exact'}).eq('company_id',companyId)");
  });

  it('keeps deterministic bounded pagination for both invoice surfaces', () => {
    expect(queries).toContain(".order('invoice_date',{ascending:false}).order('id',{ascending:true}).range(from,to)");
    expect((queries.match(/REPORT_QUERY_INVALID_PAGE_SIZE/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});
