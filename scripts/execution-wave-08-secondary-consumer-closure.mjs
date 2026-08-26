import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const migration = read('supabase/migrations/20260826120000_secondary_consumer_truth.sql');
const adapter = read('src/lib/canonical-secondary-data-truth.ts');

const failures = [];
const must = (condition, message) => { if (!condition) failures.push(message); };

// Security/authority contract: every secondary RPC must derive authority from trusted context.
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

// No public/anonymous execution path.
must(/REVOKE ALL ON FUNCTION public\.get_sales_top_customers/.test(migration), 'top customers: PUBLIC revoke missing');
must(/REVOKE ALL ON FUNCTION public\.get_sales_top_products/.test(migration), 'top products: PUBLIC revoke missing');
must(/REVOKE ALL ON FUNCTION public\.get_sales_category_breakdown/.test(migration), 'category breakdown: PUBLIC revoke missing');
must(/REVOKE ALL ON FUNCTION public\.get_receivables_aging_truth/.test(migration), 'aging: PUBLIC revoke missing');

// Bounded aggregation: no client-side pagination or unbounded row scan is introduced by the adapters.
must(/LEAST\(GREATEST\(COALESCE\(p_limit, 5\), 1\), 50\)/.test(migration), 'top-N aggregate is not bounded');
must(!/\.from\(['"]sales_invoices['"]\).*\.select\(/s.test(adapter), 'secondary adapter must not aggregate raw sales rows in browser');
must(!/\.from\(['"]sale_items['"]\).*\.select\(/s.test(adapter), 'secondary adapter must not aggregate sale rows in browser');

// Truth semantics: missing values remain null at the domain boundary.
must(/value: finiteOrNull\(row\.value\)/.test(adapter), 'top entities must preserve unknown values as null');
must(/'INSUFFICIENT_DATA'/.test(migration), 'canonical secondary aggregates need explicit insufficient-data status');
must(/'UNDATED'/.test(migration), 'aging must distinguish missing due dates from a numeric bucket');

// Tenant assertion must be explicit at the adapter boundary too.
must(/resolveCurrentCompanyId\(\)/.test(adapter), 'adapter must resolve tenant from trusted context');
must(/p_company_id: companyId/.test(adapter), 'adapter must pass trusted tenant context to RPC');

if (failures.length) {
  console.error('Wave 08 secondary consumer closure FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Wave 08 secondary consumer closure checks: PASS');
console.log('Verified: tenant authority, bounded aggregates, null/unknown semantics, aging provenance, and browser-side aggregation avoidance.');
