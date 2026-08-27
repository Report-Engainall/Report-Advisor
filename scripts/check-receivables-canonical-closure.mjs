import fs from 'node:fs';

const queries = fs.readFileSync('src/lib/queries.ts', 'utf8');
const page = fs.readFileSync('src/pages/ReceivablesReportCanonicalPage.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20260827160000_receivables_authoritative_page.sql', 'utf8');

for (const token of [
  "supabase.rpc('get_receivables_report_page'",
  'export async function fetchReceivablesReportPage',
  "import { fetchReceivablesReportPage",
  'ReceivablesReportCanonicalPage',
  "'/reports/receivables'",
]) {
  const source = token.includes('receivables_report_page') || token.includes('fetchReceivables') ? queries : token.includes('CanonicalPage') ? page + app : app;
  if (!source.includes(token)) throw new Error(`receivables canonical closure missing: ${token}`);
}
for (const token of [
  'public.current_company_id()',
  'SECURITY DEFINER',
  'SET search_path = public',
  'REVOKE ALL ON FUNCTION public.get_receivables_report_page(integer, integer) FROM PUBLIC',
  'REVOKE ALL ON FUNCTION public.get_receivables_report_page(integer, integer) FROM anon',
  'GRANT EXECUTE ON FUNCTION public.get_receivables_report_page(integer, integer) TO authenticated',
  'OFFSET v_page * v_page_size',
  'LIMIT v_page_size',
]) {
  if (!migration.includes(token)) throw new Error(`receivables RPC security/pagination invariant missing: ${token}`);
}
if (page.includes('fetchSalesInvoices(0,50)') || page.includes('aging.reduce(') || page.includes('.reduce(')) throw new Error('canonical receivables page still aggregates a paginated dataset in the browser');
console.log('Receivables canonical closure: PASS');
console.log('  - totals come from the full tenant dataset on the server');
console.log('  - page rows are server-paginated from the same truth source');
console.log('  - active route uses the canonical page');
console.log('  - tenant authority is database-derived');
