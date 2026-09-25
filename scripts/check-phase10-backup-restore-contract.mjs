import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const migration = read('supabase/migrations/20260829023000_restore_import_lifecycle_rpcs.sql');
const evidence = read('scripts/check-production-certification-evidence-integrity.mjs');
const contract = read('scripts/check-production-certification-contract.mjs');
const index = read('docs/MASTER_EXECUTION_INDEX.md');
const phaseFProbe = read('scripts/phase-f-live-resilience-probes.mjs');
const cartsParityMigration = read('supabase/migrations/20260925200000_restore_carts_schema_parity.sql');



// All logical source reads must use the resolved IPv4-safe runner URI, not the original host URI.
if (!/const generatedCountSql = runDockerPsql\(runnerSource, countSql\);/.test(phaseFProbe)) {
  throw new Error('Phase-F schema-count query must use the resolved runnerSource URI');
}
if (!/const directPort = parsed\.port \|\| '5432';/.test(phaseFProbe) || !/directPort === '5432'/.test(phaseFProbe)) {
  throw new Error('Phase-F direct Supabase source fallback must treat an omitted port as the default 5432');
}
if (!/runCommand\('supabase', \[\s*'db', 'dump',[\s\S]*?'--db-url', runnerSource,/.test(phaseFProbe)) {
  throw new Error('Phase-F logical dump must use the resolved runnerSource URI');
}

const stripSqlComments = (sql) => sql
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\n)\s*--[^\n]*/g, '$1');
const executable = stripSqlComments(migration);

const targetGenericReferenceMigration = read('supabase/migrations/20260829175705_harden_cross_tenant_reference_integrity_v2.sql');
const targetGenericReferenceExecutable = stripSqlComments(targetGenericReferenceMigration);
const targetGenericReferenceUpper = targetGenericReferenceExecutable.toUpperCase();
for (const token of [
  'CREATE OR REPLACE FUNCTION PUBLIC.ENFORCE_SAME_COMPANY_REFERENCE()',
  'TENANT_REFERENCE_ARGUMENTS_REQUIRED',
  'TRG_WAREHOUSE_BRANCH_COMPANY',
  "ENFORCE_SAME_COMPANY_REFERENCE('BRANCHES','BRANCH_ID')",
]) if (!targetGenericReferenceUpper.includes(token)) {
  throw new Error(`Missing Phase-F restore-chain generic tenant-reference invariant: ${token}`);
}

const profilesParityUpper = stripSqlComments(cartsParityMigration).toUpperCase();
for (const token of [
  'CREATE TABLE IF NOT EXISTS PUBLIC.PROFILES',
  'ORGANIZATION_ID UUID NOT NULL',
  'CUSTOMER_ID UUID',
  'ROLE TEXT NOT NULL',
  'PROFILES_ID_FKEY',
  'PROFILES_ORGANIZATION_ID_FKEY',
  'PROFILES_CUSTOMER_ID_FKEY',
  'PROFILES_CUSTOMER_IDX',
  'PROFILES_ORG_IDX',
  'PROFILES_SELF_SELECT',
  'GRANT ALL ON TABLE PUBLIC.PROFILES TO SERVICE_ROLE',
]) {
  if (!profilesParityUpper.includes(token)) throw new Error(`Missing profiles schema restore-parity invariant: ${token}`);
}

const cartsParityUpper = stripSqlComments(cartsParityMigration).toUpperCase();
for (const token of [
  'CREATE TABLE IF NOT EXISTS PUBLIC.PROFILES',
  'ORGANIZATION_ID UUID NOT NULL',
  'CUSTOMER_ID UUID',
  'ROLE TEXT NOT NULL',
  'PROFILES_ID_FKEY',
  'PROFILES_ORGANIZATION_ID_FKEY',
  'PROFILES_CUSTOMER_ID_FKEY',
  'PROFILES_CUSTOMER_IDX',
  'PROFILES_ORG_IDX',
  'PROFILES_SELF_SELECT',
  'CREATE TABLE IF NOT EXISTS PUBLIC.CARTS',
  'COMPANY_ID UUID NOT NULL',
  'CUSTOMER_ID UUID NOT NULL',
  'USER_ID UUID NOT NULL',
  'CARTS_COMPANY_ID_FKEY',
  'CARTS_CUSTOMER_ID_FKEY',
  'CARTS_USER_ID_FKEY',
  'CARTS_COMPANY_ID_USER_ID_KEY',
  'IDX_CARTS_CUSTOMER_ID_FK',
  'IDX_CARTS_USER_ID_FK',
  'CARTS_SELF_SELECT',
  'CREATE OR REPLACE FUNCTION PUBLIC.CURRENT_CUSTOMER_ID()',
  'CREATE OR REPLACE FUNCTION PUBLIC.CURRENT_CUSTOMER_COMPANY_ID()',
  'GRANT EXECUTE ON FUNCTION PUBLIC.CURRENT_CUSTOMER_ID() TO AUTHENTICATED, SERVICE_ROLE',
  'GRANT EXECUTE ON FUNCTION PUBLIC.CURRENT_CUSTOMER_COMPANY_ID() TO AUTHENTICATED, SERVICE_ROLE',
  'ENABLE ROW LEVEL SECURITY',
  'GRANT SELECT ON TABLE PUBLIC.CARTS TO AUTHENTICATED',
  'CREATE TABLE IF NOT EXISTS PUBLIC.CART_ITEMS',
  'CART_ID UUID NOT NULL',
  'PRODUCT_ID UUID NOT NULL',
  'QUANTITY INTEGER NOT NULL',
  'CART_ITEMS_CART_ID_FKEY',
  'CART_ITEMS_PRODUCT_ID_FKEY',
  'CART_ITEMS_CART_ID_PRODUCT_ID_KEY',
  'CART_ITEMS_QUANTITY_CHECK',
  'IDX_CART_ITEMS_PRODUCT_ID_FK',
  'CART_ITEMS_SELF_SELECT',
  'USER_ID = (SELECT AUTH.UID())',
  'CUSTOMER_ID = CURRENT_CUSTOMER_ID()',
  'COMPANY_ID = CURRENT_CUSTOMER_COMPANY_ID()',
  'GRANT SELECT ON TABLE PUBLIC.CART_ITEMS TO AUTHENTICATED',
]) {
  if (!cartsParityUpper.includes(token)) throw new Error(`Missing carts schema restore-parity invariant: ${token}`);
}

for (const token of [
  'CREATE OR REPLACE FUNCTION public.import_create_job',
  'CREATE OR REPLACE FUNCTION public.import_update_job_progress',
  'p_invalid_rows integer DEFAULT 0',
  'p_duplicate_rows integer DEFAULT 0',
  "p_status text DEFAULT 'processing'",
  'SECURITY INVOKER',
  'SET search_path = public',
  'current_company_id()',
  'TENANT_CONTEXT_MISMATCH',
  'IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN',
  'REVOKE ALL ON FUNCTION',
  'GRANT EXECUTE ON FUNCTION',
]) if (!executable.includes(token)) throw new Error(`Missing recovery security/lifecycle invariant: ${token}`);

for (const token of [
  'backup_restore_passed',
  'migration_parity_passed',
  'artifact_integrity_passed',
  'rollback_passed',
  'security_audit_passed',
  'PRODUCTION_CERTIFICATION_EVIDENCE_KEYS',
]) {
  if (!evidence.includes(token) && !contract.includes(token)) {
    throw new Error(`Missing certification evidence invariant: ${token}`);
  }
}

// Bind the remaining-work register to recovery concepts explicitly present in
// the authoritative index. Runtime recovery proof remains a separate gate.
const indexLower = index.toLowerCase();
for (const token of ['backup/restore', 'rollback', 'recovery', 'runtime proof remains open']) {
  if (!indexLower.includes(token)) throw new Error(`Remaining-work register lost recovery boundary: ${token}`);
}

const decoy = `-- CREATE OR REPLACE FUNCTION public.import_create_job\n-- current_company_id()\n-- TENANT_CONTEXT_MISMATCH`;
const sanitizedDecoy = stripSqlComments(decoy);
for (const token of ['CREATE OR REPLACE FUNCTION public.import_create_job', 'current_company_id()', 'TENANT_CONTEXT_MISMATCH']) {
  if (sanitizedDecoy.includes(token)) throw new Error(`Test-of-test failed: SQL comment decoy satisfied ${token}`);
}

console.log('Phase 10 backup/restore contract: PASS (source-level only; restore drill/RPO/RTO remain runtime evidence)');
