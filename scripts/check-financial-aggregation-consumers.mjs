import fs from 'node:fs';

const report = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const dashboard = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
const queries = fs.readFileSync('src/lib/queries.ts', 'utf8');

if (!report.includes('fetchProfitabilityTruth')) throw new Error('Profitability report must use canonical profitability truth.');
if (!app.includes("@/pages/ReceivablesReportPageCanonical")) throw new Error('Receivables route must consume the canonical snapshot page.');
if (!queries.includes("supabase.rpc('report_dashboard_truth')")) throw new Error('Dashboard KPI adapter must use canonical server-side dashboard truth.');
if (!dashboard.includes('fetchDashboardKPIs')) throw new Error('Dashboard must consume its canonical KPI adapter.');
if (/fetchDashboardKPIs\(\)[\s\S]{0,1200}fetchCategoryBreakdown\(\)/.test(report)) throw new Error('Reports page still combines legacy financial aggregators for profitability truth.');

console.log('financial aggregation consumer sweep: PASS (dashboard KPI adapter is canonical; profitability and receivables use canonical truth boundaries)');
