import fs from 'node:fs';

const report = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const dashboard = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
const queries = fs.readFileSync('src/lib/queries.ts', 'utf8');
const familyLiquidity = fs.readFileSync('src/lib/free-toolbox/family-liquidity.ts', 'utf8');

if (!report.includes('fetchProfitabilityTruth')) throw new Error('Profitability report must use canonical profitability truth.');
if (!app.includes("@/pages/ReceivablesReportPageCanonical")) throw new Error('Receivables route must consume the canonical snapshot page.');
if (!queries.includes("supabase.rpc('report_dashboard_truth')")) throw new Error('Dashboard KPI adapter must use canonical server-side dashboard truth.');
if (!dashboard.includes('fetchDashboardKPIs')) throw new Error('Dashboard must consume its canonical KPI adapter.');
if (/fetchDashboardKPIs\(\)[\s\S]{0,1200}fetchCategoryBreakdown\(\)/.test(report)) throw new Error('Reports page still combines legacy financial aggregators for profitability truth.');

// Missing profit evidence must never become an implicit zero in a share denominator.
if (!familyLiquidity.includes('const allHaveProfit =')) throw new Error('Family liquidity must explicitly prove complete profit evidence before calculating profit share.');
if (/const totalProfit = [^;]*\?[^;]*:\s*null/.test(familyLiquidity) === false) throw new Error('Family liquidity must fail closed to NULL when profit evidence is incomplete.');
if (/totalProfit[^\n]*\?\?\s*0/.test(familyLiquidity)) throw new Error('Family liquidity still converts missing total profit evidence to zero.');
if (!familyLiquidity.includes('profit_share=INSUFFICIENT_DATA')) throw new Error('Family liquidity must expose insufficient-data evidence for partial profit coverage.');

console.log('financial aggregation consumer sweep: PASS (canonical dashboard/profitability/receivables boundaries and fail-closed family profit share contract are enforced)');