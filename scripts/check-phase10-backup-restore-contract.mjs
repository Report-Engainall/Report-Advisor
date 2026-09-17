import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const migration = read('supabase/migrations/20260829023000_restore_import_lifecycle_rpcs.sql');
const evidence = read('scripts/check-production-certification-evidence-integrity.mjs');
const contract = read('scripts/check-production-certification-contract.mjs');
const index = read('docs/MASTER_EXECUTION_INDEX.md');
const recoveryRegister = read('docs/RECOVERY_REMAINING_WORK.md');

const stripSqlComments = (sql) => sql
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\n)\s*--[^\n]*/g, '$1');
const executable = stripSqlComments(migration);

for (const token of [
  'CREATE OR REPLACE FUNCTION public.import_create_job',
  'CREATE OR REPLACE FUNCTION public.import_update_job_progress',
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

// Keep the recovery evidence boundary explicit without overloading the master
// execution index with transient remaining-work wording. The companion register
// is required and remains fail-closed until runtime recovery evidence exists.
const recoveryBoundary = `${index}\n${recoveryRegister}`.toLowerCase();
for (const token of ['backup/restore', 'rollback', 'recovery', 'not proven']) {
  if (!recoveryBoundary.includes(token)) throw new Error(`Recovery remaining-work register lost boundary: ${token}`);
}

const decoy = `-- CREATE OR REPLACE FUNCTION public.import_create_job\n-- current_company_id()\n-- TENANT_CONTEXT_MISMATCH`;
const sanitizedDecoy = stripSqlComments(decoy);
for (const token of ['CREATE OR REPLACE FUNCTION public.import_create_job', 'current_company_id()', 'TENANT_CONTEXT_MISMATCH']) {
  if (sanitizedDecoy.includes(token)) throw new Error(`Test-of-test failed: SQL comment decoy satisfied ${token}`);
}

console.log('Phase 10 backup/restore contract: PASS (source-level only; restore drill/RPO/RTO remain runtime evidence)');
