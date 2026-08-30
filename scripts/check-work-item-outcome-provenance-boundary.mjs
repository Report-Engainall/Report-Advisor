import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260830162000_harden_work_item_outcome_provenance.sql', 'utf8');
const source = fs.readFileSync('src/lib/decision-automation/vertical-slice-runtime.ts', 'utf8');
const required = [
  'complete_decision_work_item',
  "v_evidence_snapshot_id text := NULLIF(btrim(COALESCE(p_evidence->>'evidence_snapshot_id', '')), '')",
  "RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED'",
  'v_status := CASE',
  "'insufficient'",
  "'positive'",
  "'negative'",
  "'neutral'",
  "'evidence_snapshot_id', v_evidence_snapshot_id",
  'status = EXCLUDED.status',
  'company_id = v_company',
  "status <> 'IN_PROGRESS'",
];

for (const token of required) {
  if (!migration.includes(token)) throw new Error(`Missing work-item outcome provenance invariant: ${token}`);
}
if (!source.includes("p_evidence: evidence")) throw new Error('Runtime work-item completion must forward evidence to the canonical RPC');

// Test-of-test: the checker must be able to distinguish a tampered migration
// with the provenance guard removed from the real implementation.
const tampered = migration.replace("    RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED';\n", '    NULL;\n');
const missingAfterTamper = ["RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED'"]
  .filter((token) => !tampered.includes(token));
if (!missingAfterTamper.includes("RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED'")) {
  throw new Error('Test-of-test failed: tampered provenance guard was not detected');
}

console.log('Work-item outcome provenance boundary: PASS (including adversarial test-of-test)');
