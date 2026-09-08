import fs from 'node:fs';

const source = fs.readFileSync('src/lib/file-engine/universal-intelligence.ts', 'utf8');
const checks = [
  ['customer code namespace', source.includes("customer_code:${value}")],
  ['customer name namespace', source.includes("customer_name:${value}")],
  ['code remains authoritative before name', source.includes("['code', 'name']")],
  ['in-batch identity tracking remains enabled', source.includes('seenIncoming')],
  ['server preview remains separate from client resolution', fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8').includes("import_resolution_preview")],
];
const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
if (failures.length) { console.error('Customer identity namespace contract FAILED'); failures.forEach((f) => console.error(`- ${f}`)); process.exit(1); }
console.log(`Customer identity namespace contract: PASS (${checks.length}/${checks.length})`);
