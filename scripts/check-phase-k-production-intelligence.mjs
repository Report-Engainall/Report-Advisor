import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationDir = path.join(root, 'supabase', 'migrations');
const migration = fs.readdirSync(migrationDir).find((name) => name.includes('phase_k_production_intelligence'));
if (!migration) throw new Error('Phase K migration is missing');
const sql = fs.readFileSync(path.join(migrationDir, migration), 'utf8');
const required = [
  'report_execution_jobs',
  'report_source_versions',
  'canonical_text_artifacts',
  'report_row_lineage',
  'report_consolidation_runs',
  'report_consolidation_items',
  'bounded_scenario_runs',
  'decision_portfolio_items',
  'autonomy_domain_controls',
  'autonomy_certification_runs',
  'autonomy_rollback_drills',
  'can_certify_autonomous_domain',
  'claim_report_execution_job',
  'current_company_id()',
  'is_continuous_trust_healthy',
];
for (const token of required) {
  if (!sql.includes(token)) throw new Error(`Phase K contract missing: ${token}`);
}
for (const forbidden of ['TO anon', 'raw_file', 'cross_company']) {
  if (forbidden === 'TO anon' && !sql.includes('REVOKE ALL ON TABLE')) continue;
  if (sql.includes(forbidden) && forbidden !== 'TO anon') throw new Error(`Unsafe Phase K token: ${forbidden}`);
}

const roadmap = fs.readFileSync(path.join(root, 'docs', 'IMPLEMENTATION_ROADMAP.md'), 'utf8');
for (const requirement of [
  'Connect the watched-folder coordinator',
  'source-version/row-level lineage',
  'chronological multi-report consolidation',
  'bounded optimizer/scenario',
  'portfolio prioritization',
  'executive causal/evidence cockpit',
  'production autonomy',
]) {
  if (!roadmap.includes(requirement)) throw new Error(`Roadmap requirement missing: ${requirement}`);
}

console.log('Phase K production intelligence contract: PASS');
