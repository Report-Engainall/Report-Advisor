import fs from 'node:fs';

const tsconfig = JSON.parse(fs.readFileSync('tsconfig.app.json', 'utf8'));
const alias = tsconfig.compilerOptions?.paths?.['@/lib/queries'];
if (JSON.stringify(alias) !== JSON.stringify(['./src/lib/queries.ts'])) {
  throw new Error(`Canonical query alias must target ./src/lib/queries.ts; got ${JSON.stringify(alias)}`);
}

if (fs.existsSync('src/lib/queries-compat.ts')) {
  throw new Error('queries-compat.ts must remain removed after zero-consumer closure.');
}

const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(path);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) sourceFiles.push(path);
  }
}
walk('src');

const forbidden = [];
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('queries-compat')) forbidden.push(file);
}
if (forbidden.length) {
  throw new Error(`Removed compatibility module is still referenced by source consumers: ${forbidden.join(', ')}`);
}

const canonical = fs.readFileSync('src/lib/queries.ts', 'utf8');
for (const name of ['fetchInventoryBalances', 'fetchImportRecords', 'markAlertRead', 'updateRecommendationStatus', 'fetchForecasts', 'fetchCustomers', 'fetchProducts']) {
  if (!new RegExp(`export\\s+async\\s+function\\s+${name}\\b`).test(canonical)) {
    throw new Error(`Canonical query implementation is missing required consumer export: ${name}`);
  }
}

console.log('Canonical query alias closure: PASS (alias→queries.ts, compatibility module absent, required exports canonical)');
