import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260827131500_financial_truth_fail_closed.sql','utf8');
const page = fs.readFileSync('src/pages/ReportsPage.tsx','utf8');
const service = fs.readFileSync('src/lib/report-profitability-truth.ts','utf8');

for (const s of [
  'public.current_company_id()',
  "line_total IS NULL OR cost_price IS NULL OR quantity IS NULL",
  "q.incomplete_rows>0",
  "q.currency_count>1",
  "CASE WHEN tr.status='CALCULATED' THEN c.revenue ELSE NULL END",
  "CASE WHEN tr.status='CALCULATED' THEN tr.revenue ELSE NULL END",
  "si.company_id = public.current_company_id()",
  "lower(coalesce(si.status, '')) NOT IN ('cancelled', 'canceled', 'void')",
]) if (!migration.includes(s)) throw new Error('Missing fail-closed profitability invariant: '+s);

if (/fetchDashboardKPIs\(\),fetchCategoryBreakdown\(\)/.test(page)) throw new Error('Profitability page still derives financial truth from generic dashboard/browser aggregations.');
if (!page.includes('fetchProfitabilityTruth')) throw new Error('Profitability page is not wired to canonical truth service.');
if (!service.includes("supabase.rpc('report_profitability_truth'")) throw new Error('Canonical profitability service does not call report_profitability_truth.');

console.log('Profitability truth contract: PASS (missing/incomplete/multi-currency evidence fails closed to NULL, not financial zero/partial totals)');
