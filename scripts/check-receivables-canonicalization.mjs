import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/pages/ReceivablesReportCanonicalPage.tsx', 'utf8');
const legacyPage = fs.readFileSync('src/pages/ReceivablesReportPageCanonical.tsx', 'utf8');
const service = fs.readFileSync('src/lib/receivables-truth.ts', 'utf8');
const queries = fs.readFileSync('src/lib/queries.ts', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');

assert.match(app, /import\('@/pages\/ReceivablesReportCanonicalPage'/);
assert.match(page, /from ['"]@\/lib\/receivables-truth['"]/);
assert.match(service, /export async function fetchReceivablesReportPage/);
assert.match(service, /export async function fetchReceivablesExportRows/);
assert.match(service, /ReceivablesTruthProvenance/);
assert.match(service, /REPORT_DATA_UNAVAILABLE: receivables provenance missing/);
assert.match(service, /total_outstanding missing/);
assert.match(page, /fetchReceivablesExportRows/);
assert.match(page, /تصدير XLSX/);
assert.match(page, /snapshot\.provenance\.period\.as_of_date/);

assert.match(legacyPage, /export \{ ReceivablesReportCanonicalPage as ReceivablesReportPageCanonical \}/);
assert.ok(legacyPage.length < 300, 'legacy receivables page must remain an adapter only');

assert.match(queries, /export type ReceivablesReportRow = ReceivablesReportRowCanonical/);
assert.doesNotMatch(queries, /export async function fetchReceivablesReportPage/);
assert.doesNotMatch(queries, /export async function fetchReceivablesExportRows/);

const migration = fs.readFileSync('supabase/migrations/20260919203000_receivables_truth_provenance.sql', 'utf8');
assert.match(migration, /'source', 'sales_invoices'/);
assert.match(migration, /'freshness', 'query_time'/);
assert.match(migration, /'rpc', 'get_receivables_report_page'/);

console.log('Receivables canonicalization contract: PASS (one page, one domain service, one export implementation, compatibility adapters only).');
