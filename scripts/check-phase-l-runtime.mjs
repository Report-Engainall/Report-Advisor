import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql'));
const sql = migrationFiles
  .map((name) => fs.readFileSync(path.join(migrationsDir, name), 'utf8'))
  .join('\n');

// Phase L was intentionally consolidated into the canonical K/L runtime migration
// surface; do not require the removed duplicate phase_l_production_autonomy.sql.
const requiredRuntimeTokens = [
  'record_control_plane_health',
  'record_executive_evidence_edge',
  'autonomy_runtime_gate',
  'is_continuous_trust_healthy',
  'current_company_id()',
];

for (const token of requiredRuntimeTokens) {
  if (!sql.includes(token)) throw new Error(`Phase L canonical runtime contract missing: ${token}`);
}

const securityTokens = [
  'ENABLE ROW LEVEL SECURITY',
  'REVOKE ALL ON TABLE',
  'CREATE POLICY',
];
for (const token of securityTokens) {
  if (!sql.includes(token)) throw new Error(`Phase L security contract missing: ${token}`);
}

const runtimeSource = fs.readFileSync(path.join(root, 'src', 'lib', 'phase-kl-supabase-runtime.ts'), 'utf8');
for (const token of ['record_control_plane_health', 'record_executive_evidence_edge', 'autonomy_runtime_gate']) {
  if (!runtimeSource.includes(token)) throw new Error(`Phase K/L runtime adapter missing: ${token}`);
}

console.log('Phase L runtime contract: PASS (canonical K/L migration/runtime surface)');
