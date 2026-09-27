import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationDir = path.join(root, 'supabase', 'migrations');
const files = fs.existsSync(migrationDir) ? fs.readdirSync(migrationDir).filter((f) => f.endsWith('.sql')) : [];
const text = files.map((f) => fs.readFileSync(path.join(migrationDir, f), 'utf8')).join('\n');

const required = [
  /import_jobs/i,
  /import_job_rows/i,
  /(?:finalize|finish[_ ]?job|terminal|completed)/i,
  /(?:rollback|failed|cancel(?:led|lled)?)/i,
  /FOR\s+UPDATE|advisory|lock/i,
  /import_commit_batch/i,
  /any row failure rolls back the whole chunk/i,
];
for (const pattern of required) {
  if (!pattern.test(text)) throw new Error(`Import transaction contract missing: ${pattern}`);
}

const lifecycleMigration = files
  .filter((f) => /import.*(?:job|engine|finish|lifecycle)|security.*import/i.test(f))
  .map((f) => fs.readFileSync(path.join(migrationDir, f), 'utf8'))
  .join('\n');
if (!/(?:status\s*=\s*p_status|p_status)/i.test(lifecycleMigration)) {
  throw new Error('Import transaction lifecycle does not persist terminal status');
}
if (!/failed/i.test(lifecycleMigration) || !/cancelled/i.test(lifecycleMigration)) {
  throw new Error('Import transaction lifecycle must support failed and cancelled states');
}
if (!/IMPORT_TERMINAL_STATUS_REQUIRED/i.test(lifecycleMigration)) {
  throw new Error('Import finalization must reject non-terminal statuses');
}
if (!/p_status\s+NOT\s+IN\s+\(\s*['\"]completed['\"]\s*,\s*['\"]partial['\"]\s*,\s*['\"]failed['\"]\s*,\s*['\"]cancelled['\"]\s*\)/i.test(lifecycleMigration)) {
  throw new Error('Import finalization must enumerate the allowed terminal states');
}
if (!/v_existing_summary/i.test(lifecycleMigration) || !/result_summary\s*=\s*coalesce\(v_existing_summary/i.test(lifecycleMigration)) {
  throw new Error('Import finalization must preserve existing result-summary lineage');
}
if (!/IMPORT_COMPLETED_WITH_ERROR/i.test(lifecycleMigration)) {
  throw new Error('Completed imports must not carry an error state');
}

const canonicalCommitPath = path.join(root, 'src', 'lib', 'import', 'canonical-commit.ts');
if (fs.existsSync(canonicalCommitPath)) {
  const canonical = fs.readFileSync(canonicalCommitPath, 'utf8');
  if (!/resolveCurrentCompanyId\(\)/.test(canonical) || !/import_commit_batch/.test(canonical)) {
    throw new Error('Canonical import must resolve authoritative tenant and commit through the atomic RPC wrapper');
  }
  if (!/p_source_hash\s*:\s*sourceHash/.test(canonical)) {
    throw new Error('Canonical import commit must bind the atomic RPC to the exact source hash');
  }
  if (!/CANONICAL_SOURCE_HASH_MISMATCH/.test(canonical)) {
    throw new Error('Canonical import must reject provenance rows whose source hash differs from the durable source hash');
  }
  if (!/IMPORT_COMMIT_RESULT_MISMATCH/.test(canonical)) {
    throw new Error('Canonical import must verify the durable batch result count and IDs');
  }
}

const adapterPath = path.join(root, 'src', 'lib', 'import', 'canonical-production-adapter.ts');
if (!fs.existsSync(adapterPath)) throw new Error('Canonical durable import adapter is missing');
const adapter = fs.readFileSync(adapterPath, 'utf8');
if (!/runDurableProductionLifecycle/.test(adapter) || !/SupabaseReportExecutionStore/.test(adapter)) {
  throw new Error('Canonical import must use the existing durable production runner/store');
}
if (!/stage === 'committed'\)\s*await commitImportBatch/.test(adapter)) {
  throw new Error('Canonical commit must execute only at the durable committed lifecycle stage');
}
if (/batchSize|for \(let i = 0; i < reconciled\.rows\.length/.test(adapter)) {
  throw new Error('Canonical durable adapter must not reintroduce UI-level batch splitting');
}
if (!/enqueue_report_execution_job/.test(adapter) || !/p_source_hash:\s*input\.sourceHash/.test(adapter)) {
  throw new Error('Canonical durable adapter must enqueue a source-bound durable job');
}
if (!/\/api\/canonical-import-execute/.test(adapter) || !/Authorization:.*accessToken/.test(adapter)) {
  throw new Error('Canonical browser import must route durable worker authority through the authenticated server boundary');
}
if (!/serverExecution\?: boolean/.test(adapter) || !/workerClient\?: SupabaseClient/.test(adapter) || !/dataClient\?: SupabaseClient/.test(adapter)) {
  throw new Error('Canonical durable adapter must separate service-role worker client from authenticated data client');
}
if (/from ['"]@\/lib\//.test(adapter) || /from ['"]@\/lib\//.test(fs.readFileSync(canonicalCommitPath, 'utf8'))) {
  throw new Error('Canonical server execution dependency graph must not require Vite-only @/lib aliases');
}
if (!/await import\('\.\.\/supabase'\)/.test(adapter) || !/await import\('\.\.\/supabase'\)/.test(fs.readFileSync(canonicalCommitPath, 'utf8'))) {
  throw new Error('Browser Supabase client must remain lazy in server-importable canonical modules');
}
if (!/commitImportBatch\(input\.entityType,\s*input\.rows,\s*input\.sourceHash,\s*\{\s*client:\s*activeDataClient,\s*companyId,\s*importJobId:\s*input\.importId\s*\}\)/.test(adapter)) {
  throw new Error('Canonical import commit must remain tenant-bound to the authenticated data client and source import job');
}
if (!/IMPORT_DURABLE_JOB_ALREADY_RUNNING/.test(adapter)) {
  throw new Error('Canonical durable adapter must fail closed when the same durable import is already running');
}
if (!/qualityApproved: boolean/.test(adapter) || !/qualityApproved/.test(adapter)) {
  throw new Error('Canonical durable adapter must carry explicit quality approval state');
}

const specialtyMigrationPath = path.join(migrationDir, '20260927213000_expand_canonical_import_specialties.sql');
if (!fs.existsSync(specialtyMigrationPath)) throw new Error('Canonical specialty import migration is missing');
const specialtyMigration = fs.readFileSync(specialtyMigrationPath, 'utf8');
for (const token of [
  'purchase_invoices','suppliers','inventory_balances','payments',
  'SUPPLIER_NAME_REQUIRED','PURCHASE_SUPPLIER_REQUIRED',
  'INVENTORY_PRODUCT_REQUIRED','INVENTORY_WAREHOUSE_REQUIRED',
  'PAYMENT_DIRECTION_INVALID','PAYMENT_AMOUNT_REQUIRED',
  'AUTHORITATIVE_SOURCE_HASH_MISMATCH','AUTHORITATIVE_SOURCE_NOT_VERIFIED',
  'PERFORM pg_advisory_xact_lock',
  'v_requested_payment_id := nullif(v_row->>\'payment_id\',\'\')::uuid', 'WHERE id=v_requested_payment_id', 'coalesce(v_requested_payment_id, gen_random_uuid())',
  'INSERT INTO public.purchase_items(', 'purchase_items_line_total_nonnegative', 'PURCHASE_ITEM_PRODUCT_TENANT_MISMATCH',
  'INVENTORY_UNIT_COST_INVALID',
  'RETURN public.import_commit_batch(',
  'DROP FUNCTION IF EXISTS public.import_commit_batch(uuid,text,jsonb,text,text,uuid)',
  'CREATE FUNCTION public.import_commit_batch(',
  'p_import_job_id uuid',
]) {
  if (!specialtyMigration.includes(token)) throw new Error('Specialty import transaction contract missing: ' + token);
}
if (/CREATE OR REPLACE FUNCTION public\.import_commit_batch\(/.test(specialtyMigration)) {
  throw new Error('Specialty migration must not replace the legacy 5-argument RPC implementation');
}
if (!/p_null_policy text,\s+p_source_hash text,\s+p_import_job_id uuid/.test(specialtyMigration)) {
  throw new Error('Authoritative six-argument RPC signature must have no illegal defaults before p_import_job_id');
}
if (!/entity_type IN \('products','customers','sales_invoices','purchase_invoices','suppliers','inventory_balances','payments'\)/.test(specialtyMigration)) {
  throw new Error('Canonical import entity-type boundary must enumerate all typed specialties');
}

const serverCorePath = path.join(root, 'src', 'server', 'canonical-import-executor.ts');
if (!fs.existsSync(serverCorePath)) throw new Error('Canonical durable import server execution core is missing');
const serverAdapter = fs.readFileSync(serverCorePath, 'utf8');
const serverAdapterPath = path.join(root, 'netlify', 'functions', 'canonical-import-execute.mts');
if (!fs.existsSync(serverAdapterPath)) throw new Error('Canonical durable import deployment wrapper is missing');
const serverWrapper = fs.readFileSync(serverAdapterPath, 'utf8');
const apiWrapperPath = path.join(root, 'api', 'canonical-import-execute.ts');
if (!fs.existsSync(apiWrapperPath)) throw new Error('Canonical API deployment wrapper is missing');
const apiWrapper = fs.readFileSync(apiWrapperPath, 'utf8');
if (!/parseFile\(bytes\.buffer, fileRecord\.file_name/.test(serverAdapter)) {
  throw new Error('Canonical server boundary must re-extract rows from the authoritative source bytes');
}
if (!/reconcileForCanonical\(/.test(serverAdapter)) {
  throw new Error('Canonical server boundary must reconcile authoritative source rows before durable execution');
}
if (!/authoritativeQualityScore/.test(serverAdapter) || !/authoritativeQualityScore < 50/.test(serverAdapter) || !/authoritativeQualityScore < 75/.test(serverAdapter)) {
  throw new Error('Canonical server boundary must enforce authoritative quality gates');
}
if (!/qualityApproved/.test(serverAdapter)) {
  throw new Error('Canonical import quality approval must cross the server boundary');
}
if (!/authoritativeRowCount/.test(serverAdapter) || !/authoritativePreview/.test(serverAdapter)) {
  throw new Error('Canonical server boundary must return authoritative parse evidence for persistence');
}
if (!/const dbBlock =/i.test('noop')) {
  // marker kept intentionally unreachable; avoids accidental future broad replacements
}
const authoritativeParseIndex = serverAdapter.indexOf('const authoritativeDatasets =');
const sourceReadyWriteIndex = serverAdapter.indexOf(".from('file_records')", authoritativeParseIndex);
const verifiedMetadataIndex = serverAdapter.indexOf('const verifiedMetadata =', authoritativeParseIndex);
if (authoritativeParseIndex < 0 || sourceReadyWriteIndex < 0 || verifiedMetadataIndex < 0 || sourceReadyWriteIndex < authoritativeParseIndex || sourceReadyWriteIndex < verifiedMetadataIndex) {
  throw new Error('Source must not be marked ready before authoritative parsing');
}

for (const token of [
  "Authorization",
  "userClient.rpc('current_company_id')",
  "serverExecution: true",
  "workerClient: serviceClient",
  "dataClient: userClient",
  ".from('import_jobs')",
  ".eq('id', payload.importId)",
  ".eq('company_id', companyId)",
  "mode === 'finalize-source'",
]) {
  if (!serverAdapter.includes(token)) throw new Error(`Canonical server execution boundary missing: ${token}`);
}

if (!/request\.method\s*!==\s*['"]POST['"]/.test(serverWrapper)) {
  throw new Error('Netlify canonical deployment wrapper must enforce POST');
}
if (!/env\(['"]VITE_SUPABASE_URL['"]\)/.test(serverWrapper) ||
    !/env\(['"]VITE_SUPABASE_ANON_KEY['"]\)/.test(serverWrapper) ||
    !/env\(['"]SUPABASE_SERVICE_ROLE_KEY['"]\)/.test(serverWrapper)) {
  throw new Error('Netlify canonical deployment wrapper must bind all required Supabase server credentials');
}
if (!/request\.headers\.get\(['"]authorization['"]\)/i.test(serverWrapper) ||
    !/executeCanonicalImport/.test(serverWrapper)) {
  throw new Error('Netlify canonical deployment wrapper must forward authenticated requests to the shared server execution core');
}
if (!/requireMethod\(req, res, ['"]POST['"]\)/.test(apiWrapper)) {
  throw new Error('API canonical deployment wrapper must enforce POST');
}
if (!/SUPABASE_SERVICE_ROLE_KEY/.test(apiWrapper) ||
    !/VITE_SUPABASE_ANON_KEY/.test(apiWrapper) ||
    !/executeCanonicalImport/.test(apiWrapper)) {
  throw new Error('API canonical deployment wrapper must bind required Supabase configuration and delegate to the shared server execution core');
}
if (!/authorization/i.test(apiWrapper) || !/bearerToken/.test(apiWrapper) || !/const token\s*=\s*bearerToken\(req\)/.test(apiWrapper)) {
  throw new Error('API canonical deployment wrapper must require an authenticated bearer token');
}
if (/grant execute on function public\\.(claim|heartbeat|advance|complete|fail|retry)_report_execution_job[^\\n]*to authenticated/i.test(serverAdapter)) {
  throw new Error('Canonical server boundary must not add authenticated worker RPC grants');
}

const pagePath = path.join(root, 'src', 'pages', 'CanonicalImportPage.tsx');
if (fs.existsSync(pagePath)) {
  const page = fs.readFileSync(pagePath, 'utf8');
  if (!/runCanonicalImportThroughDurableRunner/.test(page) || /import \{[^}]*commitImportBatch/.test(page)) {
    throw new Error('Canonical import UI must route through the durable adapter and not invoke the batch RPC wrapper directly');
  }
  if (!/supabase\.rpc\('import_finish_job'/.test(page)) {
    throw new Error('Canonical import UI must close terminal state only through import_finish_job');
  }
  if (/updateImportRecord\([^\n]*(status:\s*['"](?:completed|failed|partial|cancelled)['"])/.test(page)) {
    throw new Error('Canonical import UI must not directly write terminal import status');
  }
  if (!/const durableSourceHash = `sha256:\$\{fileHash\}`/.test(page)) {
    throw new Error('Canonical import UI must bind the computed file hash to the durable SHA-256 source identity');
  }
  if (!/quality < 50/.test(page) || !/quality < 75 && !qualityApproved/.test(page)) {
    throw new Error('Canonical import UI must enforce the 50% rejection and 50–74% explicit approval gates');
  }
}

const runnerPath = path.join(root, 'src', 'lib', 'report-execution', 'durable-production-runner.ts');
if (fs.existsSync(runnerPath)) {
  const runner = fs.readFileSync(runnerPath, 'utf8');
  const executeIndex = runner.indexOf('await input.executeStage(following');
  const checkpointIndex = runner.indexOf('await store.saveCheckpoint(input.jobId, checkpoint');
  if (executeIndex < 0 || checkpointIndex < 0 || executeIndex > checkpointIndex) {
    throw new Error('Durable runner must persist a checkpoint only after the stage executor succeeds');
  }
}

const batchFolderPath = path.join(root, 'src', 'lib', 'import', 'batch-folder.ts');
if (fs.existsSync(batchFolderPath)) {
  const batch = fs.readFileSync(batchFolderPath, 'utf8');
  if (!/offset\+=500/.test(batch)) throw new Error('Folder import must use bounded atomic chunks');
  if (!/status:'failed'|status\s*:\s*'failed'/.test(batch) || !/updateImportRecord\(importRecordId,\{status:'failed'/.test(batch)) {
    throw new Error('Failed folder imports must persist a terminal failed state');
  }
  if (!/committed\s*,\s*error:message/.test(batch) || !/committed\s*,\s*error\??:message/.test(batch)) {
    throw new Error('Failed folder imports must preserve committed progress and error detail');
  }
}

const forbiddenDirectBulk = /supabase\.from\([^)]*(products|import_job_rows|orders)[^)]*\)\.(insert|upsert|update)\s*\(/is;
const sourceDirs = ['src/lib', 'src/services'];
for (const dir of sourceDirs) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) continue;
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
        const body = fs.readFileSync(full, 'utf8');
        if (forbiddenDirectBulk.test(body) && !/import-upsert|unified-import/i.test(full)) {
          throw new Error(`Direct bulk write outside governed import path: ${full}`);
        }
      }
    }
  }
}

console.log('Import transaction contract: PASS');

for (const [name, wrapper] of [
  ['Netlify', serverWrapper],
  ['API', apiWrapper],
]) {
  if (!wrapper.includes('executeCanonicalImport') || wrapper.includes('authoritativeDatasets') || wrapper.includes('reconcileForCanonical')) {
    throw new Error(`${name} canonical deployment wrapper must delegate to the shared server execution core without duplicating source semantics`);
  }
}
