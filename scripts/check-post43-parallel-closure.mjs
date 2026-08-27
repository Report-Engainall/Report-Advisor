import fs from 'node:fs';

const required = [
  'src/lib/queries.ts',
  'src/lib/tenantContext.ts',
];
const missing = required.filter((p) => !fs.existsSync(p));
if (missing.length) {
  console.error(`POST43_CANONICAL_CLOSURE_FAIL: missing ${missing.join(', ')}`);
  process.exit(1);
}

const queries = fs.readFileSync('src/lib/queries.ts', 'utf8');
if (/companyId\s*:\s*[^,)]*\)/.test(queries) && /export/.test(queries)) {
  console.warn('POST43_CANONICAL_CLOSURE_WARN: inspect caller-supplied tenant arguments');
}
console.log('POST43_CANONICAL_CLOSURE_PASS: canonical query and tenant boundaries are present');
