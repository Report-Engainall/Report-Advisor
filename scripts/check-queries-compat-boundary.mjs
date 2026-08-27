import fs from 'node:fs';

const adapter = fs.readFileSync('src/lib/queries-compat.ts', 'utf8');
const canonical = fs.readFileSync('src/lib/queries.ts', 'utf8');

if (!adapter.includes("export * from './queries'")) throw new Error('compatibility boundary must re-export canonical queries');
if (/^export (async )?function /m.test(adapter)) throw new Error('compatibility boundary must not define business functions');
if (adapter.includes("supabase.from('alerts')") || adapter.includes("supabase.from('recommendations')") || adapter.includes("supabase.from('import_jobs')")) throw new Error('compatibility boundary must not own tenant DB access');
if (adapter.includes('get_sales_secondary_metrics')) throw new Error('compatibility boundary must not call legacy secondary analytics RPC');

const requiredCanonicalExports = [
  'fetchMonthlyTrend','fetchTopCustomers','fetchTopProducts','fetchCategoryBreakdown','fetchAgingBuckets',
  'fetchForecasts','fetchCustomers','fetchProducts','markAlertRead','updateRecommendationStatus',
  'createImportRecord','updateImportRecord','fetchImportRecords','fetchPurchaseSummary','fetchInventoryValuation',
  'fetchSalesExportRows','fetchPurchaseExportRows','fetchInventoryExportRows','fetchReceivablesExportRows'
];
for (const name of requiredCanonicalExports) {
  if (!canonical.includes(`export async function ${name}`) && !canonical.includes(`export const ${name}`)) throw new Error(`canonical export missing: ${name}`);
}

console.log('queries-compat boundary regression: PASS');
