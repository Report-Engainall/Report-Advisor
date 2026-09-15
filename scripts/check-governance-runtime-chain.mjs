import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationsDir = path.join(root, 'supabase/migrations');
const runtimePath = path.join(root, 'src/lib/phase-kl-runtime.ts');
const intelligencePath = path.join(root, 'src/lib/production-intelligence.ts');

if (!fs.existsSync(migrationsDir)) throw new Error('Missing Supabase migrations directory');
if (!fs.existsSync(runtimePath)) throw new Error('Missing governance runtime component: src/lib/phase-kl-runtime.ts');
if (!fs.existsSync(intelligencePath)) throw new Error('Missing governance intelligence component: src/lib/production-intelligence.ts');

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
const intelligence = fs.readFileSync(intelligencePath, 'utf8');

const governancePrimitives = [
  'governance_policies',
  'bi_decisions',
  'governance_alerts',
  'risk_budgets',
  'decision_graph',
  'anomaly_correlations',
  'human_override_feedback',
  'intelligence_quality_scores',
  'governed_scenarios',
];
for (const t of governancePrimitives) {
  if (!sql.includes(t)) throw new Error(`Governance primitive missing: ${t}`);
}

// The current canonical runtime exposes evidenceQuality/canAutonomouslyExecute;
// risk-budget/trust/rollback/isolation fields are governed by the autonomy gate
// itself rather than exported as standalone helpers. Bind the check to those
// real canonical symbols instead of historical helper names.
const runtimeLinks = ['evidenceQuality', 'canAutonomouslyExecute'];
for (const t of runtimeLinks) {
  if (!runtime.includes(t)) throw new Error(`Governance-to-autonomy runtime link missing: ${t}`);
}

const autonomyContract = [
  'export interface RiskBudget',
  'export function selectBoundedScenario',
  'export interface AutonomyGateInput',
  'trustHealthy: boolean',
  'riskBudgetValid: boolean',
  'rollbackVerified: boolean',
  'isolationVerified: boolean',
  'export function evaluateAutonomyGate',
];
for (const t of autonomyContract) {
  if (!intelligence.includes(t)) throw new Error(`Governance-to-autonomy contract missing: ${t}`);
}

if (/GRANT\s+ALL\s+TO\s+anon/i.test(sql)) {
  throw new Error('Unsafe anonymous governance grant detected');
}

console.log(`Governance runtime chain: PASS (migrations=${migrationFiles.length}, primitives=${governancePrimitives.length}, runtimeLinks=${runtimeLinks.length}, autonomyContract=${autonomyContract.length})`);
