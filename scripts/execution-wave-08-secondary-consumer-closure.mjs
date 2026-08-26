import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const migration = read('supabase/migrations/20260826120000_secondary_consumer_truth.sql');
const adapter = read('src/lib/canonical-secondary-data-truth.ts');

const failures = [];
const must = (condition, message) => { if (!condition) failures.push(message); };

for (const fn of [
  'get_sales_top_customers',
  'get_sales_top_products',
  'get_sales_category_breakdown',
  'get_receivables_aging_truth',
]) {
  const start = migration.indexOf(`FUNCTION public.${fn}`);
  const next = migration.indexOf('CREATE OR REPLACE FUNCTION', start + 10);
  const body = migration.slice(start, next < 0 ? migration.length : next);
  must(start >= 0, `${fn}: function missing`);
  must(/SECURITY INVOKER/.test(body), `${fn}: must be SECURITY INVOKER`);
  must(/current_company_id\(\)/.test(body), `${fn}: missing trusted tenant authority`);
  must(/TENANT_CONTEXT_MISMATCH/.test(body), `${fn}: missing tenant mismatch denial`);
  must(/SET search_path = public/.test(body), `${fn}: missing explicit search_path`);
}

must(/REVOKE ALL ON FUNCTION public\.get_sales_top_customers/.test(migration), 'top customers: PUBLIC revoke missing');
must(/REVOKE ALL ON FUNCTION public\.get_sales_top_products/.test(migration), 'top products: PUBLIC revoke missing');
must(/REVOKE ALL ON FUNCTION public\.get_sales_category_breakdown/.test(migration), 'category breakdown: PUBLIC revoke missing');
must(/REVOKE ALL ON FUNCTION public\.get_receivables_aging_truth/.test(migration), 'aging: PUBLIC revoke missing');

must(/LEAST\(GREATEST\(COALESCE\(p_limit, 5\), 1\), 50\)/.test(migration), 'top-N aggregate is not bounded');
must(!/\.from\(['"]sales_invoices['"]\).*\.select\(/s.test(adapter), 'secondary adapter must not aggregate raw sales rows in browser');
must(!/\.from\(['"]sale_items['"]\).*\.select\(/s.test(adapter), 'secondary adapter must not aggregate raw sale rows in browser');

// Unknown values must never be turned into a numeric zero. The adapter either preserves
// null at the canonical boundary or raises REPORT_DATA_UNAVAILABLE for strict UI contracts.
must(/requiredNumber\(row\.value/.test(adapter), 'top entities must reject unknown values rather than coercing them to zero');
must(/REPORT_DATA_UNAVAILABLE/.test(adapter), 'adapter must expose an unavailable-data contract');
must(/'INSUFFICIENT_DATA'/.test(migration), 'canonical secondary aggregates need explicit insufficient-data status');
must(/'UNDATED'/.test(migration), 'aging must distinguish missing due dates from a numeric bucket');

must(/resolveCurrentCompanyId\(\)/.test(adapter), 'adapter must resolve tenant from trusted context');
must(/p_company_id: companyId/.test(adapter), 'adapter must pass trusted tenant context to RPC');

if (failures.length) {
  console.error('Wave 08 secondary consumer closure FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Wave 08 secondary consumer closure checks: PASS');
console.log('Verified: tenant authority, bounded aggregates, unknown-data semantics, aging provenance, and browser-side aggregation avoidance.');
