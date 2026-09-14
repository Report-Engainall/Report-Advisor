import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase/migrations');
const runtimePath = path.join(root, 'src/lib/phase-kl-runtime.ts');

if (!fs.existsSync(migrationsDir)) throw new Error('Missing Supabase migrations directory');
if (!fs.existsSync(runtimePath)) throw new Error('Missing governance runtime component: src/lib/phase-kl-runtime.ts');

// Do not bind this contract to historical migration filenames. Migrations may be
// consolidated/renamed while the governed schema contract remains unchanged.
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql'))
  .sort();
if (migrationFiles.length === 0) throw new Error('No SQL migrations found');

const sql = migrationFiles
  .map((name) => fs.readFileSync(path.join(migrationsDir, name), 'utf8'))
  .join('\n');
const runtime = fs.readFileSync(runtimePath, 'utf8');

const governancePrimitives = [
  'governance_policies',
  'bi_decisions',
  'governance_alerts',
  'risk_budgets',
  'decision_graph',
  'anomaly_correlations',
  'human_overrides',
  'intelligence_quality_scores',
  'governed_scenarios',
];
for (const t of governancePrimitives) {
  if (!sql.includes(t)) throw new Error(`Governance primitive missing: ${t}`);
}

const autonomyLinks = ['riskBudgetValid', 'trustHealthy', 'evidenceQuality', 'canAutonomouslyExecute'];
for (const t of autonomyLinks) {
  if (!runtime.includes(t)) throw new Error(`Governance-to-autonomy link missing: ${t}`);
}

if (/GRANT\s+ALL\s+TO\s+anon/i.test(sql)) {
  throw new Error('Unsafe anonymous governance grant detected');
}

console.log(`Governance runtime chain: PASS (migrations=${migrationFiles.length}, primitives=${governancePrimitives.length}, autonomyLinks=${autonomyLinks.length})`);
