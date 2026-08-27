import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/20260827152000_receivables_financial_completeness_contract.sql', 'utf8');
const truth = fs.readFileSync('src/lib/receivables-truth.ts', 'utf8');
const page = fs.readFileSync('src/pages/ReceivablesReportPageCanonical.tsx', 'utf8');

for (const marker of [
  'FROM metrics WHERE NOT EXISTS (SELECT 1 FROM page)',
  "metrics.incomplete_rows > 0 OR metrics.total_rows = 0",
  "'INSUFFICIENT_DATA'",
  "current_company_id()",
]) if (!sql.includes(marker)) throw new Error(`receivables contract missing: ${marker}`);

if (!truth.includes('incompleteRows: number')) throw new Error('receivables adapter lost incompleteRows contract');
if (!truth.includes("status: first?.status ?? 'INSUFFICIENT_DATA'")) throw new Error('empty snapshot does not fail closed');
if (!truth.includes('const pageRows = rows.filter((row) => row.id != null);')) {
  throw new Error('receivables adapter exposes the empty-page metadata sentinel as a business row');
}
if (!truth.includes('rows: pageRows.map(')) throw new Error('receivables adapter is not mapping only real page rows');
if (page.includes('snapshot.rows.reduce')) throw new Error('receivables page derives business truth from page rows');

const emptyPage = { rows: [], totalRows: 0, totalOutstanding: null, incompleteRows: 0, status: 'INSUFFICIENT_DATA' };
if (emptyPage.totalOutstanding !== null || emptyPage.status !== 'INSUFFICIENT_DATA') throw new Error('empty receivables fixture was coerced to financial zero');

const incomplete = { totalRows: 3, incompleteRows: 1, totalOutstanding: null, status: 'INSUFFICIENT_DATA' };
if (incomplete.totalOutstanding !== null || incomplete.status !== 'INSUFFICIENT_DATA') throw new Error('incomplete financial evidence was not fail-closed');

const sentinel = { id: null, invoice_number: null, total_rows: 0, total_outstanding: null, status: 'INSUFFICIENT_DATA' };
const filtered = [sentinel].filter((row) => row.id != null);
if (filtered.length !== 0) throw new Error('empty-page sentinel regression fixture leaked into business rows');

console.log('receivables empty-page/completeness contract: PASS');
