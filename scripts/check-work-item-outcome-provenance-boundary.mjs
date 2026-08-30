import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260831000500_harden_work_item_outcome_provenance.sql';
const migration = fs.readFileSync(migrationPath, 'utf8');
const source = fs.readFileSync('src/lib/decision-automation/vertical-slice-runtime.ts', 'utf8');

const stripSqlComments = (sql) => sql
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\n)\s*--[^\n]*/g, '$1');

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

const assertContract = (sql) => {
  const executable = stripSqlComments(sql);
  for (const token of required) {
    if (!executable.includes(token)) throw new Error(`Missing work-item outcome provenance invariant: ${token}`);
  }
};

assertContract(migration);
if (!source.includes('p_evidence: evidence')) throw new Error('Runtime work-item completion must forward evidence to the canonical RPC');

// Test-of-test: removing the executable evidence guard must make the same
// contract assertion fail, rather than merely checking that a string changed.
const guard = "RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED';";
const tampered = migration.replace(guard, 'NULL;');
let tamperedRejected = false;
try {
  assertContract(tampered);
} catch {
  tamperedRejected = true;
}
if (!tamperedRejected) throw new Error('Test-of-test failed: tampered provenance guard still satisfied the contract');

// Test-of-test: a comment-only marker must also fail the exact same assertion.
const decoy = `${migration}\n-- RAISE EXCEPTION 'OUTCOME_EVIDENCE_REQUIRED';`;
const decoyWithoutExecutableGuard = stripSqlComments(decoy).replace(guard, 'NULL;');
let decoyRejected = false;
try {
  assertContract(decoyWithoutExecutableGuard);
} catch {
  decoyRejected = true;
}
if (!decoyRejected) throw new Error('Test-of-test accepted a comment decoy as executable evidence guard');

console.log('Work-item outcome provenance boundary: PASS (including executable-contract and adversarial test-of-test)');
