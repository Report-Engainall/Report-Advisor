import fs from 'node:fs';
const read = (p) => fs.readFileSync(p, 'utf8');
const reports = read('src/pages/ReportsPage.tsx');
const dashboard = read('src/pages/DashboardPage.tsx');
const executive = read('src/pages/ExecutiveCommandCenterPage.tsx');
const analytics = read('src/lib/canonical-analytics.ts');
const analyticsSql = read('supabase/migrations/20260826131000_analytics_domain_truth.sql');
const secondary = read('src/lib/canonical-secondary-data-truth.ts');
const exportsLoader = read('src/lib/report-export-data.ts');
const exportSql = read('supabase/migrations/20260826140000_inventory_export_truth.sql');
const secondarySql = read('supabase/migrations/20260826150000_secondary_consumer_domain_truth.sql');
const secondaryCompatSql = read('supabase/migrations/20260826150500_secondary_consumer_rpc_compat.sql');
const secondaryPayloadSql = read('supabase/migrations/20260826151000_secondary_rpc_payload_contract.sql');
const agingSql = read('supabase/migrations/20260826160000_aging_total_canonical.sql');
const metricSql = read('supabase/migrations/20260826161000_executive_metric_null_semantics.sql');
const categorySql = read('supabase/migrations/20260826162000_category_margin_canonical.sql');
const decisionScore = read('src/lib/intelligence/decisionScore.ts');
const assertions = [
 ['reports use bounded full export loaders', reports.includes('fetchSalesInvoicesForExport') && reports.includes('fetchPurchaseInvoicesForExport') && reports.includes('fetchInventoryBalancesForExport')],
 ['inventory export consumes canonical row values', reports.includes("'القيمة':b.value") && !reports.includes("b.quantity*b.unit_cost")],
 ['inventory export has a tenant-authoritative RPC', exportsLoader.includes('get_inventory_export_truth') && exportSql.includes('current_company_id()') && exportSql.includes('TENANT_CONTEXT_MISMATCH')],
 ['inventory operational counts are canonical', !reports.includes('const lowStock=balances.filter') && reports.includes('valuation?.low_stock') && reports.includes('valuation?.out_of_stock')],
 ['receivables use canonical aging truth', reports.includes('fetchCanonicalAgingTruth') && analytics.includes('get_receivables_aging_truth_as_of')],
 ['category profitability preserves unknown values', reports.includes('c.margin_pct==null')],
 ['category margin is canonical', secondary.includes('margin_pct') && categorySql.includes('margin_pct') && reports.includes('c.margin_pct')],
 ['RFM uses canonical RPC', analytics.includes('get_sales_rfm_truth')],
 ['ABC uses canonical RPC', analytics.includes('get_sales_abc_truth')],
 ['analytics tenant boundary is server-side', analyticsSql.includes('current_company_id()') && analyticsSql.includes('TENANT_CONTEXT_MISMATCH')],
 ['analytics status semantics exclude cancelled/void', analyticsSql.includes("status NOT IN ('cancelled','void')")],
 ['aging has explicit as-of', agingSql.includes('p_as_of date') && agingSql.includes('v_as_of date')],
 ['aging total is canonical and fail-closed', agingSql.includes("'total'") && agingSql.includes('THEN NULL') && dashboard.includes("aging.status==='CALCULATED'?aging.total:null") && !dashboard.includes('aging.reduce')],
 ['export loader excludes cancelled and void', exportsLoader.includes("neq('status', 'cancelled')") && exportsLoader.includes("neq('status', 'void')")],
 ['executive metric null semantics are server-side', metricSql.includes('THEN NULL') && metricSql.includes("'status'") && metricSql.includes('TENANT_CONTEXT_MISMATCH')],
 ['secondary adapter preserves nullable business values', secondary.includes('value: number | null') && secondary.includes('finiteOrNull(row.value)')],
 ['secondary adapter consumes {status,rows} contract', secondary.includes('secondaryRpc') && secondary.includes('result.rows') && secondary.includes('result.status')],
 ['secondary RPC implementation is tenant-authoritative', secondarySql.includes('current_company_id()') && secondarySql.includes('TENANT_CONTEXT_MISMATCH')],
 ['secondary adapter RPC names are implemented', secondaryCompatSql.includes('get_sales_monthly_truth') && secondaryCompatSql.includes('get_sales_top_customers') && secondaryCompatSql.includes('get_sales_top_products') && secondaryCompatSql.includes('get_sales_category_breakdown')],
 ['secondary RPCs return explicit status and rows', secondaryPayloadSql.includes("'status'") && secondaryPayloadSql.includes("'rows'") && secondaryPayloadSql.includes('INSUFFICIENT_DATA')],
 ['secondary RPCs exclude cancelled/void', secondaryPayloadSql.includes("COALESCE(si.status,'') NOT IN ('cancelled','void')")],
 ['decision score fails closed on missing factors', decisionScore.includes('score: number | null') && decisionScore.includes('INSUFFICIENT_DATA') && decisionScore.includes("band: 'BLOCKED'")],
 ['executive command center uses canonical KPI source', executive.includes('fetchCanonicalDashboardKPIs') && !executive.includes('fetchDashboardKPIs') && !executive.includes('dashboard-kpi-guards')],
 ['executive command center narrows complete KPI fields before numeric decisions', executive.includes('type CompleteKPI') && executive.includes('isCompleteKPI') && executive.includes('kpi.inventoryValue')],
 ['executive command center does not expose a misleading unused period selector', !executive.includes('setPeriod') && !executive.includes("['7','30','90']")],
];
for (const [name, ok] of assertions) { if (!ok) throw new Error(`WAVE09_TRUTH_REGRESSION_FAILED:${name}`); console.log(`PASS ${name}`); }
console.log(`Wave 09 cross-surface truth regressions: ${assertions.length}/${assertions.length} PASS`);
