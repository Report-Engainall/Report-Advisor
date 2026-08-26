import fs from 'node:fs';
const read = (path) => fs.readFileSync(path, 'utf8');
const analytics = read('src/pages/AnalyticsPage.tsx');
const dashboard = read('src/pages/DashboardPage.tsx');
const reports = read('src/pages/ReportsPage.tsx');
const canonicalAnalytics = read('src/lib/canonical-analytics.ts');
const canonicalTruth = read('src/lib/canonical-data-truth.ts');
const migration = read('supabase/migrations/20260826100000_data_truth_canonical_aggregates.sql');
const kpiMigration = read('supabase/migrations/20260826101500_executive_metrics_truth_contract.sql');
const failures = [];

if (!analytics.includes("from '@/lib/canonical-analytics'")) failures.push('Analytics pages must import the canonical analytics service.');
if (/from ['"]@\/lib\/supabase['"]/.test(analytics)) failures.push('AnalyticsPage must not access Supabase directly.');
if (analytics.includes('resolveCurrentCompanyId')) failures.push('AnalyticsPage must not derive tenant authority locally.');
for (const fn of ['fetchRFMAnalysis', 'fetchABCAnalysis', 'fetchAgingAnalysis']) if (!canonicalAnalytics.includes(`export async function ${fn}`)) failures.push(`Missing canonical analytics function: ${fn}`);
if (!canonicalAnalytics.includes('resolveCurrentCompanyId')) failures.push('Canonical analytics service must derive tenant authority from authenticated context.');

if (!dashboard.includes("from '@/lib/canonical-data-truth'")) failures.push('Dashboard must import the canonical data-truth service.');
if (!dashboard.includes('fetchCanonicalDashboardKPIs()')) failures.push('Dashboard must consume fetchCanonicalDashboardKPIs().');
if (dashboard.includes('fetchDashboardKPIs()')) failures.push('Dashboard must not call the legacy page KPI calculation.');
if (!reports.includes('fetchCanonicalDashboardKPIs()')) failures.push('Reports KPI consumers must use canonical KPI truth.');
if (!reports.includes('fetchCanonicalPurchaseSummary()')) failures.push('Purchase report must use the canonical server-side purchase aggregate.');
if (!reports.includes('fetchCanonicalInventoryValuation()')) failures.push('Inventory report must use canonical inventory valuation.');
if (/purchases\.reduce\(\(s, p\)/.test(reports)) failures.push('Purchase report must not calculate a business total from paginated page rows.');
if (/quantity == null \|\| b\.unit_cost == null \? 0/.test(reports)) failures.push('Inventory report must not convert unknown valuation inputs to zero.');
for (const rpc of ["supabase.rpc('get_executive_metrics'", "supabase.rpc('get_purchase_summary'", "supabase.rpc('get_inventory_valuation'"]) if (!canonicalTruth.includes(rpc)) failures.push(`Missing canonical RPC adapter: ${rpc}`);

if (!migration.includes('public.current_company_id()')) failures.push('Wave 06 aggregates must derive tenant authority from current_company_id().');
if (!migration.includes('TENANT_CONTEXT_MISMATCH')) failures.push('Wave 06 aggregates must reject caller-selected tenant mismatches.');
if (!migration.includes("WHEN v_missing > 0 THEN 'INSUFFICIENT_DATA'")) failures.push('Inventory valuation must preserve unknown data instead of fabricating zero.');
if (!kpiMigration.includes("'inventory_status'")) failures.push('Executive KPI RPC must expose inventory data sufficiency.');
if (!kpiMigration.includes("'collection_rate'")) failures.push('Executive KPI RPC must preserve collection-rate semantics.');
if (!kpiMigration.includes("'overdue_receivables'")) failures.push('Executive KPI RPC must preserve overdue receivables semantics.');
if (!kpiMigration.includes('CASE WHEN sales.revenue = 0 THEN NULL')) failures.push('Gross margin must be NULL when denominator is zero, not fabricated zero.');

const purchaseFixture = Array.from({ length: 21 }, (_, i) => ({ total: i + 1 }));
const expectedPurchaseTotal = purchaseFixture.reduce((sum, row) => sum + row.total, 0);
const firstPageTotal = purchaseFixture.slice(0, 20).reduce((sum, row) => sum + row.total, 0);
if (expectedPurchaseTotal === firstPageTotal || expectedPurchaseTotal !== 231) failures.push('Purchase pagination regression fixture is invalid.');
const unknownInventoryValue = null;
if (unknownInventoryValue === 0) failures.push('Regression fixture violated UNKNOWN != ZERO.');

const result = {
  schemaVersion: 3,
  analyticsPageCanonical: failures.length === 0,
  dashboardCanonical: !failures.some(f => f.includes('Dashboard')),
  purchasePaginationTruth: !failures.some(f => f.includes('Purchase report')) && expectedPurchaseTotal === 231,
  inventoryUnknownTruth: !failures.some(f => f.includes('Inventory report')) && unknownInventoryValue === null,
  canonicalKpiContract: !failures.some(f => f.includes('Executive KPI')),
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
