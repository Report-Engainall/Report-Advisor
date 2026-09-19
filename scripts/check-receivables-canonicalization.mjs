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
assert.match(page, /fetchReceivablesExportRows/);
assert.match(page, /تصدير XLSX/);

assert.match(legacyPage, /export \{ ReceivablesReportCanonicalPage as ReceivablesReportPageCanonical \}/);
assert.ok(legacyPage.length < 300, 'legacy receivables page must remain an adapter only');

assert.match(queries, /export type ReceivablesReportRow = ReceivablesReportRowCanonical/);
assert.doesNotMatch(queries, /export async function fetchReceivablesReportPage/);
assert.doesNotMatch(queries, /export async function fetchReceivablesExportRows/);

console.log('Receivables canonicalization contract: PASS (one page, one domain service, one export implementation, compatibility adapters only).');
