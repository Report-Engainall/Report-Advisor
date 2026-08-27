import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260827140000_profitability_truth.sql','utf8');
const page = fs.readFileSync('src/pages/ReportsPage.tsx','utf8');

for (const s of [
  'public.current_company_id()',
  "line_total IS NULL OR cost_price IS NULL OR quantity IS NULL",
  "WHEN q.incomplete_rows > 0 THEN 'INSUFFICIENT_DATA'",
  "WHEN q.currency_count > 1 THEN 'INSUFFICIENT_DATA'",
  "si.company_id = public.current_company_id()",
  "lower(coalesce(si.status, '')) NOT IN ('cancelled', 'canceled', 'void')",
]) if (!migration.includes(s)) throw new Error('Missing profitability truth invariant: '+s);

if (/fetchDashboardKPIs\(\),fetchCategoryBreakdown\(\)/.test(page))
  throw new Error('Profitability page still derives its financial truth from generic dashboard/browser aggregations.');
if (!page.includes('report_profitability_truth'))
  throw new Error('Profitability page is not wired to canonical truth.');

console.log('Profitability truth contract: PASS');
