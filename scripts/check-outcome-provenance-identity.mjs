import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260830235000_harden_outcome_provenance_identity.sql';
if (!fs.existsSync(migrationPath)) throw new Error('Missing outcome provenance identity migration');
const sql = fs.readFileSync(migrationPath, 'utf8');

const stripSqlComments = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\n)\s*--[^\n]*/g, '$1');

const required = [
  'OUTCOME_PROVENANCE_NOT_FOUND',
  'r.id::text = p_recommendation_key',
  'd.decision_key = p_decision_fingerprint',
  'r.decision_fingerprint = p_decision_fingerprint',
  'REVOKE ALL ON FUNCTION public.record_recommendation_outcome',
  'REVOKE ALL ON FUNCTION public.record_decision_outcome',
];

const assertContract = (source) => {
  const executable = stripSqlComments(source);
  for (const marker of required) {
    if (!executable.includes(marker)) throw new Error('Missing outcome provenance guard: ' + marker);
  }
};

assertContract(sql);

// Test-of-test: remove an executable guard and require the same assertion to fail.
const guard = 'OUTCOME_PROVENANCE_NOT_FOUND';
const tampered = sql.replace(guard, 'OUTCOME_PROVENANCE_REMOVED');
let tamperedRejected = false;
try {
  assertContract(tampered);
} catch {
  tamperedRejected = true;
}
if (!tamperedRejected) throw new Error('Test-of-test failed: tampered identity guard still satisfied the contract');

// Test-of-test: a comment-only marker must never satisfy the executable contract.
const commentDecoy = `/* ${guard} */`;
let decoyRejected = false;
try {
  assertContract(commentDecoy);
} catch {
  decoyRejected = true;
}
if (!decoyRejected) throw new Error('Test-of-test accepted a comment-only identity marker');

console.log('Outcome provenance identity regression: PASS (executable contract and adversarial test-of-test)');
