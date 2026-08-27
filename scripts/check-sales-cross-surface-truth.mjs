#!/usr/bin/env node
import fs from 'node:fs';

const page = fs.readFileSync('src/pages/SalesReportPageCanonical.tsx', 'utf8');
const adapter = fs.readFileSync('src/lib/sales-report-truth.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20260827195000_sales_truth_contract.sql', 'utf8');

const checks = [
  ['sales page consumes canonical adapter', page.includes('fetchSalesReportTruth()')],
  ['sales page does not consume dashboard KPI truth', !page.includes('fetchDashboardKPIs')],
  ['sales adapter calls report_sales_truth', adapter.includes("rpc('report_sales_truth')")],
  ['sales migration derives tenant from current_company_id', migration.includes('public.current_company_id()')],
  ['sales migration fail-closes missing totals', migration.includes('bad_rows > 0 THEN NULL')],
  ['sales page preserves null financial evidence', page.includes("truth.status === 'INSUFFICIENT_DATA'")],
  ['sales page export is explicitly current-view', page.includes("'تقرير المبيعات (الصفحة الحالية)'")],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
console.log('Sales cross-surface canonical regression: PASS');
