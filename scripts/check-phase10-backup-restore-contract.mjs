import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const migration = read('supabase/migrations/20260829023000_restore_import_lifecycle_rpcs.sql');
const evidence = read('scripts/check-production-certification-evidence-integrity.mjs');
const contract = read('scripts/check-production-certification-contract.mjs');
const index = read('docs/MASTER_EXECUTION_INDEX.md');

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

// Bind Phase 10 to the repository's real persisted certification evidence
// contract. Narrative wording such as "exact" or "SHA" is intentionally not
// used as a source-level proof requirement.
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
const indexLower = index.toLowerCase();
const recoveryBoundaryTokens = [
  'p1-h — backup / restore / dr',
  'r16 — backup / restore / dr',
];
if (!recoveryBoundaryTokens.some((token) => indexLower.includes(token))) {
  throw new Error('Remaining-work register lost recovery boundary: expected canonical P1-H or legacy R16 backup / restore / DR boundary');
}
for (const token of ['rpo', 'rto', 'actual restore drill']) {
  if (!indexLower.includes(token)) throw new Error(`Remaining-work register lost recovery boundary: ${token}`);
}

// Test-of-test: commented-out SQL must never satisfy the executable contract.
const decoy = `-- CREATE OR REPLACE FUNCTION public.import_create_job\n-- current_company_id()\n-- TENANT_CONTEXT_MISMATCH`;
const sanitizedDecoy = stripSqlComments(decoy);
for (const token of ['CREATE OR REPLACE FUNCTION public.import_create_job', 'current_company_id()', 'TENANT_CONTEXT_MISMATCH']) {
  if (sanitizedDecoy.includes(token)) throw new Error(`Test-of-test failed: SQL comment decoy satisfied ${token}`);
}

console.log('Phase 10 backup/restore contract: PASS (source-level only; restore drill/RPO/RTO remain runtime evidence)');
