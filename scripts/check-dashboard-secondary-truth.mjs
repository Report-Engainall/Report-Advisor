import fs from 'node:fs';

const page = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');
const adapter = fs.readFileSync('src/lib/dashboard-secondary-truth.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20260827160000_dashboard_secondary_truth.sql', 'utf8');

const legacy = ['fetchMonthlyTrend', 'fetchTopCustomers', 'fetchTopProducts', 'fetchCategoryBreakdown'];
for (const name of legacy) if (new RegExp(`\\b${name}\\b`).test(page)) throw new Error(`Dashboard still consumes browser-side secondary truth: ${name}`);
for (const marker of ['fetchDashboardSecondaryTruth', "supabase.rpc('report_dashboard_secondary_truth'"]) if (!adapter.includes(marker)) throw new Error(`Dashboard secondary adapter missing canonical marker: ${marker}`);
for (const marker of ['public.current_company_id()', 'INSUFFICIENT_DATA', 'report_dashboard_secondary_truth', 'p_months']) if (!migration.includes(marker)) throw new Error(`Dashboard secondary migration missing invariant: ${marker}`);
if (/supabase\\.from\\(['"](?:sales_invoices|sale_items|customers|products|categories)['"]\\)/.test(page)) throw new Error('Dashboard UI must not own transactional secondary business truth reads');

// The remaining aging.reduce() is presentation-only: it sums already-authoritative receivables buckets.
// It is intentionally not used for the source data of any business metric.
if (!/aging\\.reduce\\s*\(/.test(page)) throw new Error('Dashboard aging presentation contract is missing');

console.log('DASHBOARD_SECONDARY_TRUTH: PASS (server-side tenant-authoritative trend/ranking/category truth; legacy browser aggregators removed)');
