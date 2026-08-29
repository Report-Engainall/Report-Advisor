import fs from 'node:fs';

const source = fs.readFileSync('src/lib/queries.ts', 'utf8');

const forbidden = [
  "p_valid_rows: Math.max(0, Math.round(patch.progress))",
  "p_invalid_rows: 0",
  "p_duplicate_rows: 0",
];
for (const token of forbidden) {
  if (source.includes(token)) throw new Error(`IMPORT_TRUTH_FORBIDDEN_FALLBACK: ${token}`);
}

if (!source.includes('loadImportJobCounters')) throw new Error('IMPORT_TRUTH_COUNTER_SOURCE_MISSING');
if (!source.includes('current.valid_rows')) throw new Error('IMPORT_TRUTH_VALID_COUNTER_NOT_PRESERVED');
if (!source.includes('current.invalid_rows')) throw new Error('IMPORT_TRUTH_INVALID_COUNTER_NOT_PRESERVED');
if (!source.includes('current.duplicate_rows')) throw new Error('IMPORT_TRUTH_DUPLICATE_COUNTER_NOT_PRESERVED');
if (!source.includes('patch.progress === undefined')) throw new Error('IMPORT_TRUTH_PROGRESS_PRESERVATION_MISSING');

console.log('Import truth contract: PASS');
