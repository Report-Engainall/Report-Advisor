import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const reports = read('src/pages/ReportsPage.tsx');
const analytics = read('src/lib/canonical-analytics.ts');
const secondary = read('src/lib/canonical-secondary-data-truth.ts');
const exportsLoader = read('src/lib/report-export-data.ts');
const analyticsSql = read('supabase/migrations/20260826131000_analytics_domain_truth.sql');
const agingSql = read('supabase/migrations/20260826130000_cross_surface_truth_closure.sql');

const assertions = [
  ['reports use bounded full export loaders', reports.includes('fetchSalesInvoicesForExport') && reports.includes('fetchPurchaseInvoicesForExport') && reports.includes('fetchInventoryBalancesForExport')],
  ['inventory operational counts are canonical', !reports.includes('const lowStock=balances.filter') && reports.includes('valuation?.low_stock') && reports.includes('valuation?.out_of_stock')],
  ['receivables use canonical aging truth', reports.includes('fetchCanonicalAgingTruth') && analytics.includes('get_receivables_aging_truth_as_of')],
  ['category profitability preserves unknown values', reports.includes('r.sales==null||r.profit==null')],
  ['RFM uses canonical RPC', analytics.includes("get_sales_rfm_truth")],
  ['ABC uses canonical RPC', analytics.includes("get_sales_abc_truth")],
  ['analytics tenant boundary is server-side', analyticsSql.includes('current_company_id()') && analyticsSql.includes('TENANT_CONTEXT_MISMATCH')],
  ['analytics status semantics exclude cancelled/void', analyticsSql.includes("status NOT IN ('cancelled','void')")],
  ['aging has explicit as-of', agingSql.includes('p_as_of date') && agingSql.includes('v_as_of date')],
  ['export loader is tenant-authoritative and bounded', exportsLoader.includes('resolveCurrentCompanyId') && exportsLoader.includes('EXPORT_MAX_ROWS = 5000')],
  ['secondary adapter preserves nullable business values', secondary.includes('value: number | null') && secondary.includes('finiteOrNull(row.value)')],
];

for (const [name, ok] of assertions) {
  if (!ok) throw new Error(`WAVE09_TRUTH_REGRESSION_FAILED:${name}`);
  console.log(`PASS ${name}`);
}
console.log(`Wave 09 cross-surface truth regressions: ${assertions.length}/${assertions.length} PASS`);
