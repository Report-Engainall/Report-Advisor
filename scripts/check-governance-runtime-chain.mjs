import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort()
  .map((file) => path.join(migrationsDir, file));

if (!migrationFiles.length) throw new Error('Missing governance migration directory contents');

const sql = migrationFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const runtimePath = path.join(root, 'src/lib/phase-kl-runtime.ts');
if (!fs.existsSync(runtimePath)) throw new Error('Missing governance runtime component: src/lib/phase-kl-runtime.ts');
const runtime = fs.readFileSync(runtimePath, 'utf8');

for (const t of ['governance_policies', 'bi_decisions', 'governance_alerts', 'risk_budgets', 'decision_graph', 'anomaly_correlations', 'human_overrides', 'intelligence_quality_scores', 'governed_scenarios']) {
  if (!sql.includes(t)) throw new Error(`Governance primitive missing from migration lineage: ${t}`);
}
for (const t of ['riskBudgetValid', 'trustHealthy', 'evidenceQuality', 'canAutonomouslyExecute']) {
  if (!runtime.includes(t)) throw new Error(`Governance-to-autonomy link missing: ${t}`);
}
if (/GRANT\s+ALL\s+TO\s+anon/i.test(sql)) throw new Error('Unsafe anonymous governance grant detected');
console.log(`Governance runtime chain: PASS (${migrationFiles.length} migrations inspected)`);
