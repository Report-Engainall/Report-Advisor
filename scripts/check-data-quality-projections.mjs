import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const legacyQueryPath = path.join(ROOT, 'src/lib/data-quality-queries.ts');
const pagePath = path.join(ROOT, 'src/pages/EntityPages.tsx');
const adapterPath = path.join(ROOT, 'src/lib/data-quality-snapshot.ts');
const routePath = path.join(ROOT, 'src/pages/DataQualitySnapshotPage.tsx');
const emptyTruthMigrationPath = path.join(ROOT, 'supabase/migrations/20260830240000_fix_empty_quality_truth.sql');

if (fs.existsSync(legacyQueryPath)) {
  throw new Error('Legacy Data Quality client dataset bridge still exists: src/lib/data-quality-queries.ts');
}

const pageSource = fs.readFileSync(pagePath, 'utf8');
const adapterSource = fs.readFileSync(adapterPath, 'utf8');
const routeSource = fs.readFileSync(routePath, 'utf8');
const emptyTruthMigration = fs.readFileSync(emptyTruthMigrationPath, 'utf8');

if (/fetchDataQualityDatasets|DataQualityPage/.test(pageSource)) {
  throw new Error('EntityPages.tsx still contains a legacy Data Quality consumer');
}
if (/supabase\.from\(/.test(adapterSource)) {
  throw new Error('Data Quality adapter must not perform direct table reads');
}
if (!adapterSource.includes("supabase.rpc('get_data_quality_snapshot')")) {
  throw new Error('Data Quality adapter must call the canonical snapshot RPC');
}
if (!adapterSource.includes('DATA_QUALITY_SNAPSHOT_INVALID')) {
  throw new Error('Data Quality adapter must fail closed on invalid snapshots');
}
if (!routeSource.includes('fetchDataQualitySnapshot')) {
  throw new Error('DataQualitySnapshotPage must consume the canonical snapshot adapter');
}
if (!emptyTruthMigration.includes("'status',case when customer_total+product_total+invoice_total+balance_total=0 then 'EMPTY' else 'OK' end")) {
  throw new Error('Empty Data Quality snapshot must be explicitly marked EMPTY');
}
if ((emptyTruthMigration.match(/'score',case when [^\n]+ else 0 end/g) || []).length !== 4) {
  throw new Error('All four empty entity scores must remain 0, never 100');
}
if (/else 100 end/.test(emptyTruthMigration)) {
  throw new Error('Empty Data Quality truth must never fall back to a perfect 100 score');
}

console.log('Data Quality canonical snapshot contract: PASS');
console.log('  - legacy client dataset bridge removed');
console.log('  - legacy DataQualityPage consumer removed from EntityPages');
console.log('  - adapter has no direct table reads');
console.log('  - adapter calls get_data_quality_snapshot');
console.log('  - invalid snapshot payloads fail closed');
console.log('  - route consumes the canonical snapshot adapter');
console.log('  - empty datasets are explicit EMPTY/0, not perfect quality');
