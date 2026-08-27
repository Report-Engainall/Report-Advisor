import fs from 'node:fs';
const queries = fs.readFileSync('src/lib/queries.ts','utf8');
const sensitive = ['sales_invoices','purchase_invoices','import_jobs','alerts','recommendations','customers','products'];
for (const table of sensitive) {
  const re = new RegExp(`supabase\\.from\\(['"]${table}['"]\\)`,'g');
  for (const match of queries.matchAll(re)) {
    const tail = queries.slice(match.index, Math.min(queries.length, match.index + 700));
    if (!tail.includes(".eq('company_id',companyId)") && !tail.includes(".eq('company_id', companyId)")) {
      throw new Error(`TENANT_SIBLING_BOUNDARY_FAIL:${table}`);
    }
  }
}
const forecast = fs.readFileSync('supabase/migrations/20260826073000_forecast_canonical_snapshot.sql','utf8');
for (const token of ['current_company_id()', 'where company_id = v_company_id', 'REVOKE ALL', 'TO authenticated']) if (!forecast.toLowerCase().includes(token.toLowerCase())) throw new Error(`FORECAST_TENANT_BOUNDARY_FAIL:${token}`);
console.log('Tenant sibling boundaries: PASS');
