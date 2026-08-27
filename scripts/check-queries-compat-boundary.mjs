import fs from 'node:fs';

const adapter = fs.readFileSync('src/lib/queries-compat.ts', 'utf8');
const canonical = fs.readFileSync('src/lib/queries.ts', 'utf8');

const requiredCanonicalDelegates = [
  ['fetchMonthlyTrend', 'canonicalFetchMonthlyTrend'],
  ['fetchTopCustomers', 'canonicalFetchTopCustomers'],
  ['fetchTopProducts', 'canonicalFetchTopProducts'],
  ['fetchCategoryBreakdown', 'canonicalFetchCategoryBreakdown'],
  ['fetchAgingBuckets', 'canonicalFetchAgingBuckets'],
  ['fetchForecasts', 'canonicalFetchForecasts'],
  ['fetchCustomers', 'canonicalFetchCustomers'],
  ['fetchProducts', 'canonicalFetchProducts'],
];

for (const [name, delegate] of requiredCanonicalDelegates) {
  if (!adapter.includes(`export async function ${name}`)) throw new Error(`compatibility export missing: ${name}`);
  if (!canonical.includes(`export async function ${name}`)) throw new Error(`canonical implementation missing: ${name}`);
  if (!adapter.includes(`return ${delegate}(`)) throw new Error(`${name} must delegate to canonical implementation`);
}

if (!adapter.includes('resolveCurrentCompanyId')) throw new Error('compatibility boundary must use authoritative tenant resolver');
if (!adapter.includes("throw new Error('TENANT_REQUIRED')")) throw new Error('compatibility boundary must fail closed without tenant');

for (const path of ["supabase.from('alerts')", "supabase.from('recommendations')", "supabase.from('import_jobs')"]) {
  if (adapter.includes(path) && !adapter.includes('requireTenant()')) throw new Error(`${path} is missing authoritative tenant guard`);
}

if (!adapter.includes('p_max_rows: 10000')) throw new Error('export compatibility bridge must retain bounded row limit');
if (!adapter.includes('const companyId = await requireTenant()')) throw new Error('compatibility paths must resolve tenant before DB access');
if (adapter.includes("supabase.from('sales_invoices')") || adapter.includes("supabase.from('sale_items')")) {
  throw new Error('compatibility boundary must not own sales business aggregation');
}
if (adapter.includes('get_sales_secondary_metrics')) throw new Error('compatibility boundary must not call legacy secondary analytics RPC');

console.log('queries-compat boundary regression: PASS');
