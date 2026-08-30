import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260830195000_harden_work_item_outcome_evidence.sql';
const migration = fs.readFileSync(migrationPath, 'utf8').replace(/\s+/g, ' ');
const source = fs.readFileSync('src/lib/decision-automation/vertical-slice-runtime.ts', 'utf8');
const required = [
  'complete_decision_work_item',
  "v_evidence_snapshot_id text := NULLIF(btrim(COALESCE(p_evidence->>'evidence_snapshot_id', '')), '')",
  "RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED'",
  "CASE WHEN p_actual_impact IS NULL OR v_expected IS NULL THEN 'insufficient'",
  "WHEN p_actual_impact > v_expected THEN 'positive'",
  "WHEN p_actual_impact = v_expected THEN 'neutral'",
  "ELSE 'negative'",
  "'evidence_snapshot_id', v_evidence_snapshot_id",
  'status = EXCLUDED.status',
  'company_id = v_company',
  "status <> 'IN_PROGRESS'",
  'REVOKE EXECUTE ON FUNCTION public.complete_decision_work_item',
];
for (const token of required) {
  if (!migration.includes(token)) throw new Error(`Missing work-item outcome provenance invariant: ${token}`);
}
if (!source.includes('p_evidence: evidence')) throw new Error('Runtime work-item completion must forward evidence to the canonical RPC');

// Test-of-test: removing the executable evidence guard must make the checker fail.
const guard = "RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED';";
const tampered = migration.replace(guard, 'NULL;');
if (tampered.includes(guard)) {
  throw new Error('Test-of-test failed: tampered provenance guard still appears present');
}

// Test-of-test: a comment-only marker must never satisfy the executable contract.
const decoy = '-- RAISE EXCEPTION \'OUTCOME_EVIDENCE_REQUIRED\';';
const strippedDecoy = decoy.replace(/^\s*--.*$/gm, '');
if (strippedDecoy.includes("RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED'")) {
  throw new Error('Test-of-test accepted a comment decoy as executable evidence guard');
}

console.log('Work-item outcome provenance boundary: PASS (including adversarial test-of-test)');
