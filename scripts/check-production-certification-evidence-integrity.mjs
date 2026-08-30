import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260825150000_phase_m_certification_bundle.sql', 'utf8');
const contract = fs.readFileSync('scripts/check-production-certification-contract.mjs', 'utf8');

const requiredColumns = [
  'tenant_isolation_passed','storage_passed','realtime_passed','ai_isolation_passed',
  'backup_restore_passed','migration_parity_passed','artifact_integrity_passed',
  'rollback_passed','security_audit_passed'
];
const requiredFunctions = [
  'can_release_production_certification',
  'is_continuous_trust_healthy'
];

for (const column of requiredColumns) {
  if (!migration.includes(column)) throw new Error(`Missing certification evidence field: ${column}`);
}
for (const fn of requiredFunctions) {
  if (!migration.includes(fn)) throw new Error(`Missing certification dependency: ${fn}`);
}
if (!/ALTER TABLE[^;]+ENABLE ROW LEVEL SECURITY/i.test(migration) &&
    !/ENABLE ROW LEVEL SECURITY/i.test(migration)) throw new Error('Certification evidence tables must enable RLS');
const hasAnonRevoke = /REVOKE ALL ON TABLE[^;]+FROM anon/i.test(migration) ||
  /REVOKE ALL ON TABLE %I FROM anon/i.test(migration) ||
  /format\(\s*['"]REVOKE ALL ON TABLE %I FROM anon/i.test(migration);
if (!hasAnonRevoke) throw new Error('Certification evidence tables must revoke anon access');
if (!/company_id\s*=\s*public\.current_company_id\(\)/i.test(migration)) throw new Error('Certification evidence must be tenant-authoritative');
if (!/SET search_path\s*=\s*public/i.test(migration)) throw new Error('Certification SECURITY DEFINER function must pin search_path');
if (!/status\s*=\s*'passed'/i.test(migration)) throw new Error('Certification release gate must require passed status');
if (!/runtime|live/i.test(contract)) throw new Error('Certification contract must distinguish runtime/live evidence');

console.log('PRODUCTION_CERTIFICATION_EVIDENCE_INTEGRITY_PASS');
