import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260830162000_harden_work_item_outcome_provenance.sql', 'utf8');
const source = fs.readFileSync('src/lib/decision-automation/vertical-slice-runtime.ts', 'utf8');

for (const token of [
  'complete_decision_work_item',
  "v_evidence_snapshot_id text := NULLIF(btrim(COALESCE(p_evidence->>'evidence_snapshot_id', '')), '')",
  "RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED'",
  "v_status := CASE",
  "'insufficient'",
  "'positive'",
  "'negative'",
  "'neutral'",
  "'evidence_snapshot_id', v_evidence_snapshot_id",
  "status = EXCLUDED.status",
  'company_id = v_company',
  "status <> 'IN_PROGRESS'",
]) {
  if (!migration.includes(token)) throw new Error(`Missing work-item outcome provenance invariant: ${token}`);
}

if (!source.includes("p_evidence: evidence")) throw new Error('Runtime work-item completion must forward evidence to the canonical RPC');

// Test-of-test: removing the evidence requirement must be detected.
const decoy = migration.replace(/\n\s*IF v_evidence_snapshot_id IS NULL THEN[\s\S]*?END IF;\n/, '\n');
if (!decoy.includes("OUTCOME_EVIDENCE_REQUIRED")) {
  // The gate itself must not accept a mutation that deletes the required guard.
  console.log('test-of-test: missing evidence guard correctly detected');
} else {
  throw new Error('Test-of-test failed: provenance guard removal was not detectable');
}

console.log('Work-item outcome provenance boundary: PASS');
