import fs from 'node:fs';

const q = fs.readFileSync('src/lib/queries.ts','utf8');
const mustNotUse = [
  "fetchDashboardKPIs",
  "fetchMonthlyTrend",
  "fetchTopCustomers",
  "fetchTopProducts",
  "fetchCategoryBreakdown",
  "fetchAgingBuckets",
];
const report = fs.readFileSync('src/pages/ReportsPage.tsx','utf8');
if (!report.includes('fetchProfitabilityTruth')) throw new Error('Reports page must use canonical profitability truth.');
if (!report.includes('fetchReceivablesReportSnapshot')) throw new Error('Reports page must use canonical receivables truth.');
if (/fetchDashboardKPIs().*fetchCategoryBreakdown()/s.test(report)) throw new Error('Reports page still combines legacy financial aggregators.');

const dashboard = fs.readFileSync('src/pages/DashboardPage.tsx','utf8');
for (const fn of ['fetchDashboardKPIs','fetchMonthlyTrend','fetchTopCustomers','fetchTopProducts']) {
  if (dashboard.includes(fn)) throw new Error('Dashboard still consumes legacy browser aggregation: '+fn);
}
console.log('financial browser-aggregation consumer sweep: PASS');
