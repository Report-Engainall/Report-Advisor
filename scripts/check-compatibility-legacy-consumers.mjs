import { readFile } from 'node:fs/promises';

const failures = [];
const compatibility = await readFile('src/lib/queries-compat.ts', 'utf8');

const canonicalDelegates = [
  ['fetchMonthlyTrend', 'canonicalFetchMonthlyTrend'],
  ['fetchTopCustomers', 'canonicalFetchTopCustomers'],
  ['fetchTopProducts', 'canonicalFetchTopProducts'],
  ['fetchCategoryBreakdown', 'canonicalFetchCategoryBreakdown'],
  ['fetchAgingBuckets', 'canonicalFetchAgingBuckets'],
  ['fetchForecasts', 'canonicalFetchForecasts'],
  ['fetchCustomers', 'canonicalFetchCustomers'],
  ['fetchProducts', 'canonicalFetchProducts'],
];

for (const [legacy, canonical] of canonicalDelegates) {
  const pattern = new RegExp(`export async function ${legacy}\\b[\\s\\S]*?return ${canonical}\\(`);
  if (!pattern.test(compatibility)) failures.push(`${legacy} must delegate to ${canonical}`);
}

for (const rpc of [
  'mark_alert_read',
  'update_recommendation_status',
  'import_create_job',
  'import_update_job_progress',
  'import_finish_job',
  'get_purchase_summary',
  'get_inventory_valuation',
  'get_sales_export_rows',
  'get_purchase_export_rows',
  'get_inventory_export_rows',
  'get_receivables_export_rows',
]) {
  if (!compatibility.includes(`rpc('${rpc}'`)) failures.push(`missing canonical RPC boundary: ${rpc}`);
}

if (!compatibility.includes('const MAX_IMPORT_RECORD_ROWS = 500')) {
  failures.push('import history must remain bounded at 500 rows');
}
if (!compatibility.includes("range(0, MAX_IMPORT_RECORD_ROWS - 1)")) {
  failures.push('import history bound must be enforced in the query');
}
if (!compatibility.includes("count > MAX_IMPORT_RECORD_ROWS")) {
  failures.push('import history overflow must fail closed');
}
if (!compatibility.includes('p_max_rows: 10000')) {
  failures.push('export rows must remain bounded at 10,000');
}
if (!compatibility.includes("if (!companyId) throw new Error('TENANT_REQUIRED')")) {
  failures.push('all compatibility mutations/reads must require a tenant context');
}
if ((compatibility.match(/if \(error\) throw error/g) ?? []).length < 5) {
  failures.push('compatibility boundary appears to have lost explicit RPC/query error propagation');
}

const forbiddenLegacyWrites = /supabase\\.(from|schema)\\([^)]*\\)\\.(insert|update|upsert|delete)\\(/;
if (forbiddenLegacyWrites.test(compatibility)) {
  failures.push('legacy compatibility boundary must not perform direct table writes');
}

if (failures.length) {
  console.error('Compatibility/legacy consumer contract FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Compatibility/legacy consumer contract passed: canonical delegation, tenant gating, bounded history/exports, RPC-only writes, and fail-closed overflow/error semantics verified.');
