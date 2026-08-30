import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260831000500_harden_work_item_outcome_provenance.sql';
const provenancePath = 'supabase/migrations/20260831010000_harden_evidence_snapshot_provenance.sql';
const migration = fs.readFileSync(migrationPath, 'utf8');
const provenance = fs.readFileSync(provenancePath, 'utf8');
const source = fs.readFileSync('src/lib/decision-automation/vertical-slice-runtime.ts', 'utf8');

const stripSqlComments = (sql) => sql
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\n)\s*--[^\n]*/g, '$1');

const required = [
  'complete_decision_work_item',
  "v_evidence_snapshot_id text := NULLIF(btrim(COALESCE(p_evidence->>'evidence_snapshot_id', '')), '')",
  "RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED'",
  'OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN',
  'kpi_evidence_snapshots',
  'business_state_snapshots',
  'import_snapshots',
  'operational_health_snapshots',
  'decision_action_receipts',
  "CASE WHEN p_actual_impact IS NULL OR v_expected IS NULL THEN 'insufficient'",
  "WHEN p_actual_impact > v_expected THEN 'positive'",
  "WHEN p_actual_impact = v_expected THEN 'neutral'",
  "ELSE 'negative'",
  'status = EXCLUDED.status',
  'company_id = v_company',
  "status <> 'IN_PROGRESS'",
  'REVOKE EXECUTE ON FUNCTION public.complete_decision_work_item',
];

const assertContract = (sql) => {
  const executable = stripSqlComments(sql);
  for (const token of required) {
    if (!executable.includes(token)) throw new Error(`Missing work-item outcome provenance invariant: ${token}`);
  }
  // SQL formatting is not a semantic invariant: permit arbitrary whitespace around the JSON key/value pair.
  if (!/'evidence_snapshot_id'\s*,\s*v_evidence_snapshot_id/.test(executable)) {
    throw new Error('Missing work-item outcome provenance invariant: evidence_snapshot_id JSON identity');
  }
};

assertContract(provenance);
if (!source.includes('p_evidence: evidence')) throw new Error('Runtime work-item completion must forward evidence to the canonical RPC');
if (!migration.includes("RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED'")) throw new Error('Historical lifecycle hardening lost its explicit evidence guard');

const tampered = stripSqlComments(provenance)
  .replaceAll('OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN', '')
  .replaceAll('kpi_evidence_snapshots', '')
  .replaceAll('business_state_snapshots', '')
  .replaceAll('import_snapshots', '')
  .replaceAll('operational_health_snapshots', '')
  .replaceAll('decision_action_receipts', '')
  .replace(/'evidence_snapshot_id'\s*,\s*v_evidence_snapshot_id/g, '') + '\n-- OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN\n-- kpi_evidence_snapshots';
let tamperedRejected = false;
try {
  assertContract(tampered);
} catch {
  tamperedRejected = true;
}
if (!tamperedRejected) throw new Error('Test-of-test failed: tenant-bound evidence provenance could be removed without detection');

const decoy = `${provenance}\n-- RAISE EXCEPTION 'OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN';`;
const decoyWithoutGuard = stripSqlComments(decoy).replaceAll('OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN', '');
let decoyRejected = false;
try {
  assertContract(decoyWithoutGuard);
} catch {
  decoyRejected = true;
}
if (!decoyRejected) throw new Error('Test-of-test accepted a comment decoy as executable evidence provenance');

console.log('Work-item outcome provenance boundary: PASS (tenant-bound evidence identity and adversarial test-of-test)');
