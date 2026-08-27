import fs from 'node:fs';
const sql = fs.readFileSync('supabase/migrations/20260827161000_profitability_financial_truth.sql','utf8');
const adapter = fs.readFileSync('src/lib/dashboard-canonical.ts','utf8');
const page = fs.readFileSync('src/pages/ProfitabilityReportCanonicalPage.tsx','utf8');
const app = fs.readFileSync('src/App.tsx','utf8');
for (const token of ['public.current_company_id()','total - tax_amount','quantity * cost_price','status','INSUFFICIENT_DATA','CURRENCY_MISMATCH','REVOKE ALL ON FUNCTION public.get_profitability_snapshot(date) FROM PUBLIC','GRANT EXECUTE ON FUNCTION public.get_profitability_snapshot(date) TO authenticated']) if (!sql.includes(token)) throw new Error(`financial truth invariant missing: ${token}`);
for (const token of ["supabase.rpc('get_profitability_snapshot'",'fetchProfitabilitySnapshot','ProfitabilityReportCanonicalPage']) if (!(adapter+page+app).includes(token)) throw new Error(`profitability canonical consumer missing: ${token}`);
if (page.includes('grossProfit') && page.includes('categories.map')) throw new Error('active profitability page must not derive gross profit from a display category array');
console.log('Profitability Financial Truth Contract: PASS');
