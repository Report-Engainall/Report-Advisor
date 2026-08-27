import fs from 'node:fs';

const files = [
  'supabase/migrations/20260827170000_effective_financial_truth_fail_closed.sql',
  'src/lib/queries.ts',
  'src/pages/DashboardPage.tsx',
];
const migration = fs.readFileSync(files[0], 'utf8');
const queries = fs.readFileSync(files[1], 'utf8');
const dashboard = fs.readFileSync(files[2], 'utf8');

for (const marker of [
  "CASE WHEN state.status='CALCULATED' THEN iq.total_sales ELSE NULL END",
  "CASE WHEN state.status='CALCULATED' THEN invv.inventory_value ELSE NULL END",
  "CASE WHEN tr.status='CALCULATED' THEN c.revenue ELSE NULL END",
  "CASE WHEN tr.status='CALCULATED' THEN tr.total_revenue ELSE NULL END",
]) if (!migration.includes(marker)) throw new Error(`Effective financial fail-closed contract missing: ${marker}`);

if (!queries.includes("supabase.rpc('report_dashboard_truth')")) throw new Error('Dashboard KPI adapter lost canonical RPC');
if (!dashboard.includes('fetchDashboardKPIs')) throw new Error('Dashboard lost canonical KPI consumer');

// The secondary dashboard family has now been migrated to its canonical adapter.
// This gate must reject reintroduction of the legacy browser-side business consumers.
for (const fn of ['fetchMonthlyTrend', 'fetchTopCustomers', 'fetchTopProducts', 'fetchCategoryBreakdown']) {
  if (dashboard.includes(fn)) throw new Error(`Dashboard legacy sibling consumer reintroduced: ${fn}`);
}
if (!dashboard.includes('fetchDashboardSecondaryTruth')) throw new Error('Dashboard lost canonical secondary-truth consumer');

console.log('Effective financial truth contract: PASS (final SQL definitions are fail-closed; dashboard KPI and secondary truth remain canonical)');
