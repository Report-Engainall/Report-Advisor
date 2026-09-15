import { readFileSync } from 'node:fs';

const source = readFileSync('src/lib/queries.ts', 'utf8');
const start = source.indexOf('export async function fetchImportRecords');
const end = source.indexOf('export async function markAlertRead', start);

if (start < 0 || end < 0) throw new Error('fetchImportRecords boundary not found');
const fn = source.slice(start, end);
for (const token of [
  "{ count: 'exact' }",
  'const pageSize = MAX_IMPORT_RECORD_ROWS',
  'const from = page * pageSize',
  '.range(from, to)',
  'if (rows.length < pageSize || allRows.length >= total) break',
]) if (!fn.includes(token)) throw new Error(`import pagination contract missing: ${token}`);
if (fn.includes('REPORT_QUERY_LIMIT_EXCEEDED: imports require explicit pagination')) throw new Error('import history still rejects datasets above the page bound');
if (fn.includes('if (observedTotal > MAX_IMPORT_RECORD_ROWS) throw new Error')) throw new Error('import history still rejects datasets above the page bound');
if (fn.includes('if (count == null) throw new Error')) throw new Error('import query bound contract still rejects missing count');
if (!/select\([^)]*result_summary/.test(fn)) throw new Error('import history projection missing');
const importRead = fn.match(/\.from\('import_jobs'\)[\s\S]*?\.range\(from, to\)/)?.[0] ?? '';
if (!importRead) throw new Error('import history query missing bounded paginated range');
if (!importRead.includes(".eq('company_id', companyId)")) throw new Error('import history query missing tenant filter');
console.log('Import query pagination regression: PASS');

const compat = readFileSync('src/lib/queries-compat.ts', 'utf8');
const compatStart = compat.indexOf('export async function fetchImportRecords');
if (compatStart < 0) throw new Error('compat fetchImportRecords boundary not found');
const compatEnd = compat.indexOf('export interface PurchaseSummary', compatStart);
if (compatEnd < 0) throw new Error('compat fetchImportRecords end boundary not found');
const compatFn = compat.slice(compatStart, compatEnd);
for (const token of [
  "{ count: 'exact' }",
  'const allRows: ImportRecord[] = []',
  'let page = 0',
  'const from = page * MAX_IMPORT_RECORD_ROWS',
  'const to = from + MAX_IMPORT_RECORD_ROWS - 1',
  '.range(from, to)',
  'total ??= count ?? 0',
  'if (rows.length < MAX_IMPORT_RECORD_ROWS || allRows.length >= total) break',
]) if (!compatFn.includes(token)) throw new Error(`compat import pagination contract missing: ${token}`);
if (compatFn.includes('REPORT_QUERY_LIMIT_EXCEEDED: imports require explicit pagination')) throw new Error('compat import history still rejects datasets above the page bound');
console.log('Compatibility import query pagination regression: PASS');