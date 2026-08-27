import fs from 'node:fs';

const report = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const dashboard = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

if (!report.includes('fetchProfitabilityTruth')) throw new Error('Profitability report must use canonical profitability truth.');
if (!app.includes("@/pages/ReceivablesReportPageCanonical")) throw new Error('Receivables route must consume the canonical snapshot page.');
if (/fetchDashboardKPIs\(\)[\s\S]{0,1200}fetchCategoryBreakdown\(\)/.test(report)) throw new Error('Reports page still combines legacy financial aggregators for profitability truth.');

for (const fn of ['fetchDashboardKPIs', 'fetchMonthlyTrend', 'fetchTopCustomers', 'fetchTopProducts']) {
  if (dashboard.includes(fn)) throw new Error('Dashboard still consumes legacy browser aggregation: ' + fn);
}

console.log('financial browser-aggregation consumer sweep: PASS (profitability and receivables routes use canonical truth boundaries)');
