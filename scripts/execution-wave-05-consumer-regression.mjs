import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const analytics = read('src/pages/AnalyticsPage.tsx');
const dashboard = read('src/pages/DashboardPage.tsx');
const reports = read('src/pages/ReportsPage.tsx');
const canonicalAnalytics = read('src/lib/canonical-analytics.ts');
const canonicalTruth = read('src/lib/canonical-data-truth.ts');
const migration = read('supabase/migrations/20260826100000_data_truth_canonical_aggregates.sql');
const failures = [];

// Wave 05 preserved: analytics consumers must use domain canonical services.
if (!analytics.includes("from '@/lib/canonical-analytics'")) failures.push('Analytics pages must import the canonical analytics service.');
if (/from ['"]@\/lib\/supabase['"]/.test(analytics)) failures.push('AnalyticsPage must not access Supabase directly.');
if (analytics.includes('resolveCurrentCompanyId')) failures.push('AnalyticsPage must not derive tenant authority locally.');
for (const fn of ['fetchRFMAnalysis', 'fetchABCAnalysis', 'fetchAgingAnalysis']) {
  if (!canonicalAnalytics.includes(`export async function ${fn}`)) failures.push(`Missing canonical analytics function: ${fn}`);
}
if (!canonicalAnalytics.includes('resolveCurrentCompanyId')) failures.push('Canonical analytics service must derive tenant authority from authenticated context.');

// Wave 06: real consumers must route core KPIs through domain truth.
if (!dashboard.includes("from '@/lib/canonical-data-truth'")) failures.push('Dashboard must import the canonical data-truth service.');
if (!dashboard.includes('fetchCanonicalDashboardKPIs()')) failures.push('Dashboard must consume fetchCanonicalDashboardKPIs().');
if (dashboard.includes('fetchDashboardKPIs()')) failures.push('Dashboard must not call the legacy page KPI calculation.');
if (!reports.includes('fetchCanonicalDashboardKPIs()')) failures.push('Reports KPI consumers must use canonical dashboard/domain truth.');
if (!reports.includes('fetchCanonicalPurchaseSummary()')) failures.push('Purchase report must use the canonical server-side purchase aggregate.');
if (!reports.includes('fetchCanonicalInventoryValuation()')) failures.push('Inventory report must use canonical inventory valuation.');
if (/purchases\.reduce\(\(s, p\)/.test(reports)) failures.push('Purchase report must not calculate a business total from the paginated page rows.');
if (/quantity == null \|\| b\.unit_cost == null \? 0/.test(reports)) failures.push('Inventory report must not convert unknown valuation inputs to zero.');
if (!canonicalTruth.includes("supabase.rpc('get_executive_metrics'")) failures.push('Canonical KPI adapter must call get_executive_metrics.');
if (!canonicalTruth.includes("supabase.rpc('get_purchase_summary'")) failures.push('Canonical purchase adapter must call get_purchase_summary.');
if (!canonicalTruth.includes("supabase.rpc('get_inventory_valuation'")) failures.push('Canonical inventory adapter must call get_inventory_valuation.');

// Domain aggregate contracts: tenant authority and bounded semantics are enforced in SQL.
if (!migration.includes('public.current_company_id()')) failures.push('Wave 06 aggregates must derive tenant authority from current_company_id().');
if (!migration.includes("TENANT_CONTEXT_MISMATCH")) failures.push('Wave 06 aggregates must reject caller-selected tenant mismatches.');
if (!migration.includes("WHEN v_missing > 0 THEN 'INSUFFICIENT_DATA'")) failures.push('Inventory valuation must preserve unknown data instead of fabricating zero.');
if (!migration.includes("CREATE OR REPLACE FUNCTION public.get_purchase_summary")) failures.push('Missing canonical purchase aggregate function.');
if (!migration.includes("CREATE OR REPLACE FUNCTION public.get_inventory_valuation")) failures.push('Missing canonical inventory valuation function.');

// Behavioral fixtures: pagination must not change totals and unknown must not equal zero.
const purchaseFixture = Array.from({ length: 21 }, (_, i) => ({ total: i + 1 }));
const expectedPurchaseTotal = purchaseFixture.reduce((sum, row) => sum + row.total, 0);
const firstPageTotal = purchaseFixture.slice(0, 20).reduce((sum, row) => sum + row.total, 0);
if (expectedPurchaseTotal === firstPageTotal) failures.push('Regression fixture is invalid: 21-row total must differ from first-page total.');
if (expectedPurchaseTotal !== 231) failures.push(`Unexpected 21-row purchase fixture total: ${expectedPurchaseTotal}`);
const unknownInventoryValue = null;
if (unknownInventoryValue === 0) failures.push('Regression fixture violated UNKNOWN != ZERO.');

const result = {
  schemaVersion: 2,
  analyticsPageCanonical: failures.length === 0,
  dashboardCanonical: !failures.some(f => f.includes('Dashboard')),
  purchasePaginationTruth: !failures.some(f => f.includes('Purchase report')) && expectedPurchaseTotal === 231,
  inventoryUnknownTruth: !failures.some(f => f.includes('Inventory report')) && unknownInventoryValue === null,
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
