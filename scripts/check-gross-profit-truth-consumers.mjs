import { readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const dashboard = read('src/pages/DashboardPage.tsx');
const semantic = read('src/lib/semanticMetrics.ts');
const canonical = read('src/lib/canonicalFinancialQueries.ts');
const executive = read('supabase/migrations/20260819210000_executive_metrics.sql');
const failures = [];

const mustContain = [
  [dashboard, 'fetchCanonicalDashboardKPIs', 'Dashboard must consume canonical KPI query'],
  [dashboard, 'fetchCanonicalMonthlyTrend', 'Dashboard trend must consume canonical line-item revenue'],
  [dashboard, 'fetchCanonicalTopCustomers', 'Dashboard customer revenue must use canonical line-item revenue'],
  [semantic, "formula:'SUM(sale_items.line_total)'", 'net_sales semantic contract must use line-item revenue'],
  [canonical, 'SUM(sale_items.line_total)', 'canonical query module must define line-item revenue'],
  [canonical, 'sale_items.cost_price', 'canonical query module must define cost of sales from line items'],
  [executive, 'sum(si.line_total)', 'executive SQL must use line-item revenue'],
];
for (const [text, needle, message] of mustContain) if (!text.includes(needle)) failures.push(message);

const forbiddenDashboardImports = /fetchDashboardKPIs|fetchMonthlyTrend|fetchTopCustomers/;
if (forbiddenDashboardImports.test(dashboard)) failures.push('Dashboard still imports legacy divergent financial consumers from queries.ts');

const forbiddenCanonical = /sales_invoices\.subtotal/;
if (forbiddenCanonical.test(canonical)) failures.push('Canonical financial query module must not use sales_invoices.subtotal as revenue');

if (failures.length) {
  console.error('GROSS_PROFIT_TRUTH_CONSUMER_GATE: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('GROSS_PROFIT_TRUTH_CONSUMER_GATE: PASS');
