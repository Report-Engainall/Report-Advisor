import { readFileSync } from 'node:fs';
const read = p => readFileSync(p, 'utf8');
const sources = {
  Dashboard: read('src/pages/DashboardPage.tsx'),
  ExecutiveDecision: read('src/pages/ExecutiveCommandCenterPage.tsx'),
  Reports: read('src/pages/ReportsPage.tsx'),
  semantic: read('src/lib/semanticMetrics.ts'),
  canonical: read('src/lib/canonicalFinancialQueries.ts'),
};
const failures = [];
for (const [name, text] of Object.entries(sources)) {
  if (!['Dashboard','ExecutiveDecision','Reports'].includes(name)) continue;
  if (/fetchDashboardKPIs|fetchMonthlyTrend|fetchTopCustomers/.test(text)) {
    failures.push(`${name}: legacy divergent financial consumer detected`);
  }
}
if (!sources.Dashboard.includes('fetchCanonicalDashboardKPIs')) failures.push('Dashboard KPI must use canonical financial query');
if (!sources.Dashboard.includes('fetchCanonicalMonthlyTrend')) failures.push('Dashboard trend must use canonical financial query');
if (!sources.Dashboard.includes('fetchCanonicalTopCustomers')) failures.push('Dashboard customer revenue must use canonical line-item revenue');
if (!sources.semantic.includes("formula:'SUM(sale_items.line_total)'")) failures.push('net_sales semantic contract must use line-item revenue');
if (!sources.canonical.includes('sale_items.line_total')) failures.push('canonical query must use line-item revenue');
if (!sources.canonical.includes('sale_items.cost_price')) failures.push('canonical query must use line-item cost');
if (/sales_invoices\.subtotal/.test(sources.canonical)) failures.push('canonical financial query contains invoice subtotal as revenue');
if (failures.length) {
  console.error('GROSS_PROFIT_TRUTH_CONSUMER_GATE: FAIL');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log('GROSS_PROFIT_TRUTH_CONSUMER_GATE: PASS');
