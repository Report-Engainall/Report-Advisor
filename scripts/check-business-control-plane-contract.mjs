import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20260825120000_business_control_plane.sql'), 'utf8');
const runtimeGate = fs.readFileSync(path.join(root, 'supabase/migrations/20260825164000_decision_evidence_runtime_gate.sql'), 'utf8');
const required = [
  'business_state_snapshots', 'control_plane_optimization_runs', 'recommendation_outcomes',
  'executive_kpi_lineage', 'control_plane_drift_events', 'can_execute_control_plane_run',
  'is_continuous_trust_healthy', 'REVOKE ALL ON TABLE', 'WITH CHECK', 'liquidity_reserved',
  'service_level_target',
];
const runtimeRequired = [
  'r.state_snapshot_id', 'r.risk_budget IS NOT NULL', 'jsonb_typeof(r.evidence)=\'object\'',
  "jsonb_typeof(r.evidence->'source_refs')='array'", 'jsonb_array_length(r.evidence->\'source_refs\') > 0',
  's.quality_score >= 0.80', 'NULLIF(trim(s.source_version),\'\') IS NOT NULL',
];
const missing = required.filter(x => !sql.includes(x));
const runtimeMissing = runtimeRequired.filter(x => !runtimeGate.includes(x));
if (missing.length || runtimeMissing.length) throw new Error(`Business control plane blockers:\n${[...missing, ...runtimeMissing].join('\n')}`);

const roadmap = fs.readFileSync(path.join(root, 'docs/IMPLEMENTATION_ROADMAP.md'), 'utf8');
for (const item of ['Unified business-state snapshot', 'Constraint-aware optimization', 'Closed-loop recommendation evaluation', 'Causal/evidence lineage', 'Automatic drift detection']) {
  if (!roadmap.includes(item)) throw new Error(`Control-plane roadmap item missing: ${item}`);
}
console.log('Business control plane contract: PASS');
