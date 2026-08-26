import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const reports = read('src/pages/ReportsPage.tsx');
const executive = read('src/pages/ExecutiveCommandCenterPage.tsx');
const analytics = read('src/lib/canonical-analytics.ts');
const secondary = read('src/lib/canonical-secondary-data-truth.ts');
const exportsLoader = read('src/lib/report-export-data.ts');
const exportSql = read('supabase/migrations/20260826140000_inventory_export_truth.sql');
const analyticsSql = read('supabase/migrations/20260826131000_analytics_domain_truth.sql');
const agingSql = read('supabase/migrations/20260826130000_cross_surface_truth_closure.sql');
const decisionScore = read('src/lib/intelligence/decisionScore.ts');

const assertions = [
  ['reports use bounded full export loaders', reports.includes('fetchSalesInvoicesForExport') && reports.includes('fetchPurchaseInvoicesForExport') && reports.includes('fetchInventoryBalancesForExport')],
  ['inventory export consumes canonical row values', reports.includes("result.rows.map(b=>({'المنتج':b.product_name") && reports.includes("'القيمة':b.value") && !reports.includes("b.quantity==null||b.unit_cost==null?null:b.quantity*b.unit_cost")],
  ['inventory export has a tenant-authoritative RPC', exportsLoader.includes("get_inventory_export_truth") && exportSql.includes('current_company_id()') && exportSql.includes('TENANT_CONTEXT_MISMATCH')],
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
  ['decision score fails closed on missing factors', decisionScore.includes('score: number | null') && decisionScore.includes('INSUFFICIENT_DATA') && decisionScore.includes("band: 'BLOCKED'" )],
  ['executive command center uses canonical KPI source', executive.includes('fetchCanonicalDashboardKPIs') && !executive.includes('fetchDashboardKPIs') && !executive.includes('dashboard-kpi-guards')],
  ['executive command center does not expose a misleading unused period selector', !executive.includes("setPeriod") && !executive.includes("['7','30','90']")],
];

for (const [name, ok] of assertions) {
  if (!ok) throw new Error(`WAVE09_TRUTH_REGRESSION_FAILED:${name}`);
  console.log(`PASS ${name}`);
}
console.log(`Wave 09 cross-surface truth regressions: ${assertions.length}/${assertions.length} PASS`);