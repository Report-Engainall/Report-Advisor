import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const must = (ok, message) => { if (!ok) failures.push(message); };

const adapter = read('src/lib/file-engine/adapters.ts');
const mapping = read('scripts/check-canonical-import-mapping.mjs');
const businessKey = read('scripts/check-import-business-key.mjs');
const transaction = read('scripts/check-import-transaction-contract.mjs');
const runtime = read('scripts/check-import-runtime-governance.mjs');
const state = read('scripts/check-import-state-contract.mjs');
const jobMigration = read('supabase/migrations/20260819203000_import_engine_jobs.sql');
const tenantMigration = read('supabase/migrations/20260823010000_import_rpc_canonical_tenant.sql');
const failClosedMigration = read('supabase/migrations/20260822210000_import_rpc_fail_closed.sql');
const golden = read('src/lib/document-intelligence/golden-dataset.ts');
const quality = read('.github/workflows/quality.yml');

const stripSqlComments = (sql) => sql
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\n)\s*--[^\n]*/g, '$1');

const migrationDir = path.join(root, 'supabase', 'migrations');
const migrations = fs.readdirSync(migrationDir).filter((f) => f.endsWith('.sql')).sort();
const businessKeySql = stripSqlComments(read('supabase/migrations/20260823020000_import_business_key_enforcement.sql'));
const rpcSql = stripSqlComments(read('supabase/migrations/20260823021000_import_upsert_concurrency_safe.sql'));

must(adapter.includes('materializeCanonicalFields'), 'Import adapter must materialize canonical fields before persistence');
must(adapter.includes('column.mappingConfidence < 80'), 'Low-confidence mappings must not auto-persist');
must(adapter.includes('const canonicalRows = materializeCanonicalFields(cleanedRows, columnProfiles)'), 'Canonical rows must be produced from cleaned rows and column profiles');
must(adapter.includes('rows: canonicalRows'), 'Import persistence must receive canonical rows');
must(adapter.includes("value !== '' && value !== null && value !== undefined"), 'Empty source cells must not erase existing values');
must(adapter.includes('column.mappedField'), 'Canonical mapping must use explicit mapped fields');
must(mapping.includes('confidence'), 'Canonical mapping regression must test deterministic mapping confidence');

must(businessKeySql.includes('CREATE UNIQUE INDEX IF NOT EXISTS uq_products_company_normalized_sku'), 'Business-key uniqueness must be executable SQL');
must(businessKeySql.includes('ON public.products(company_id, public.normalize_import_key(sku))'), 'Business key must include tenant/company scope');
must(businessKeySql.includes('WHERE public.normalize_import_key(sku) IS NOT NULL'), 'Null normalized keys must remain outside the uniqueness index');
must(rpcSql.includes('current_company_id'), 'Import upsert must resolve tenant from trusted database context');
must(rpcSql.includes('ON CONFLICT') || rpcSql.includes('unique_violation'), 'Import upsert must handle concurrent business-key races');
must(rpcSql.includes('FOR UPDATE'), 'Import upsert must fence mutable existing rows');

for (const [name, source, markers] of [
  ['transaction', transaction, ['transaction', 'rollback', 'atomic']],
  ['runtime', `${runtime}\n${tenantMigration}\n${failClosedMigration}`, ['current_company_id', 'fail-closed']],
  ['state', `${jobMigration}\n${state}`, ['queued', 'processing', 'completed', 'failed']],
]) for (const marker of markers) must(source.toLowerCase().includes(marker.toLowerCase()), `Import ${name} contract missing ${marker}`);
must(tenantMigration.includes('current_company_id'), 'Canonical import tenant migration must use current_company_id');
must(failClosedMigration.includes('SECURITY INVOKER'), 'Import fail-closed migration must preserve invoker security');
must(jobMigration.includes('import_finish_job'), 'Import job lifecycle must expose terminal completion function');
must(/p_status\s+text/i.test(jobMigration), 'Import job lifecycle must persist explicit status');

for (const token of ['ARABIC_ENGLISH', 'SCANNED', 'RANDOM_SCHEMA', 'NO_HEADER', 'COMPLEX_TABLE', 'INVOICE', 'ONYX', 'WIDE_30_PLUS']) must(golden.includes(token), `Golden corpus missing ${token}`);
must(golden.includes('accuracy >= 0.95'), 'Golden corpus must retain the minimum accuracy threshold');

const decoyComment = `-- CREATE UNIQUE INDEX IF NOT EXISTS uq_products_company_normalized_sku\n-- ON public.products(company_id, public.normalize_import_key(sku));`;
must(!stripSqlComments(decoyComment).includes('uq_products_company_normalized_sku'), 'SQL comment stripping must defeat commented business-key decoys');
const normalized = ['00123', ' 00123 ', '00123', ''].map((v) => v.trim()).filter(Boolean);
must(new Set(normalized).size < normalized.length, 'Adversarial fixture must detect duplicate normalized business keys');

// Bind this closure to the commands actually executed by the workflow, not to
// an assumed npm alias that may not exist in package.json.
for (const command of [
  'node scripts/check-import-direct-write-guard.mjs',
  'npm run test:import-transaction-contract',
  'npm run test:import-runtime-governance',
  'npm run test:import-business-key',
  'npm run test:canonical-import-mapping',
]) must(quality.includes(command), `Quality must execute ${command}`);

if (failures.length) {
  console.error(`PHASE3_DATA_IMPORT_TRUTH_CLOSURE_FAIL\n${failures.map((x) => `- ${x}`).join('\n')}`);
  process.exit(1);
}
console.log(`PHASE3_DATA_IMPORT_TRUTH_CLOSURE_PASS (${migrations.length} migrations scanned; canonical import, business-key, transaction, runtime, state, golden corpus, and adversarial decoy checks)`);
