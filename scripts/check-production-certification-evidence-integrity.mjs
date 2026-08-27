import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260825150000_phase_m_certification_bundle.sql', 'utf8');
const contract = fs.readFileSync('scripts/check-production-certification-contract.mjs', 'utf8');

const requiredMigrationGuards = [
  'company_id=public.current_company_id()',
  "REVOKE ALL ON TABLE",
  'SET search_path=public',
  'status=\'passed\'',
  'tenant_isolation_passed',
  'storage_passed',
  'realtime_passed',
  'ai_isolation_passed',
  'backup_restore_passed',
  'migration_parity_passed',
  'artifact_integrity_passed',
  'rollback_passed',
  'security_audit_passed',
];

for (const token of requiredMigrationGuards) {
  if (!migration.includes(token)) throw new Error(`Missing certification guard: ${token}`);
}

if (!/runtime|live/i.test(contract)) {
  throw new Error('Certification contract must explicitly distinguish runtime/live evidence');
}

console.log('PRODUCTION_CERTIFICATION_EVIDENCE_INTEGRITY_PASS');
