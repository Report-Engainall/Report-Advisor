import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase/migrations');
const migrations = fs.readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql'))
  .sort();
const sql = migrations
  .map((name) => fs.readFileSync(path.join(migrationsDir, name), 'utf8'))
  .join('\n');

const required = [
  'tenant_isolation_canary_runs',
  'automation_remediation_runs',
  'intelligence_safety_adjustments',
  'billing_liveness_probes',
  'artifact_verification_runs',
  'incident_regression_links',
  'is_continuous_trust_healthy',
  'is_trust_certificate_valid',
  'company_id = public.current_company_id()',
  'REVOKE ALL ON TABLE',
];
const missing = required.filter((term) => !sql.includes(term));
if (missing.length) throw new Error(`Phase H blockers:\n${missing.join('\n')}`);

const workflow = fs.readFileSync(path.join(root, '.github/workflows/quality.yml'), 'utf8');
if (!workflow.includes('test:continuous-trust')) {
  throw new Error('Quality workflow is missing Phase H gate');
}

console.log(`Phase H continuous trust contract: PASS (${migrations.length} migrations scanned)`);
