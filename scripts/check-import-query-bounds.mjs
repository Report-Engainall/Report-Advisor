import { readFileSync } from 'node:fs';

const source = readFileSync('src/lib/queries.ts', 'utf8');
const start = source.indexOf('export async function fetchImportRecords');
const end = source.indexOf('export async function markAlertRead', start);

if (start < 0 || end < 0) {
  throw new Error('fetchImportRecords boundary not found');
}

const fn = source.slice(start, end);

for (const token of [
  "{ count: 'exact' }",
  '.range(0, MAX_IMPORT_RECORD_ROWS - 1)',
  'REPORT_QUERY_LIMIT_EXCEEDED: imports require explicit pagination',
  'if (count == null) throw new Error',
]) {
  if (!fn.includes(token)) {
    throw new Error(`import query bound contract missing: ${token}`);
  }
}

if (!/select\([^)]*result_summary/.test(fn)) {
  throw new Error('import history projection missing');
}

const importRead = fn.match(/\.from\('import_jobs'\)[^;]+;/)?.[0] ?? '';
if (importRead && !/\.range\s*\(\s*0\s*,\s*MAX_IMPORT_RECORD_ROWS\s*-\s*1\s*\)/.test(importRead)) {
  throw new Error('import history query still has an unbounded tenant read');
}

console.log('Import query bounds regression: PASS');
