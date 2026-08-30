import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260830195000_harden_work_item_outcome_evidence.sql';
const migration = fs.readFileSync(migrationPath, 'utf8').replace(/\s+/g, ' ');
const source = fs.readFileSync('src/lib/decision-automation/vertical-slice-runtime.ts', 'utf8');
const required = [
  'complete_decision_work_item',
  "v_evidence_snapshot_id text := NULLIF(btrim(COALESCE(p_evidence->>'evidence_snapshot_id', '')), '')",
  "RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED'",
  'v_status :=',
  "'insufficient'",
  "'positive'",
  "'negative'",
  "'neutral'",
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

// Test-of-test: removing the evidence guard must make the checker fail.
const tampered = migration.replace("RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED';", 'NULL;');
if (tampered.includes("RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED'")) {
  throw new Error('Test-of-test failed: tampered provenance guard still appears present');
}

console.log('Work-item outcome provenance boundary: PASS (including adversarial test-of-test)');
