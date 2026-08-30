import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260830235000_harden_outcome_provenance_identity.sql';
if (!fs.existsSync(migrationPath)) throw new Error('Missing outcome provenance identity migration');
const sql = fs.readFileSync(migrationPath, 'utf8').replace(/\s+/g, ' ');
for (const marker of [
  'OUTCOME_PROVENANCE_NOT_FOUND',
  'r.id::text = p_recommendation_key',
  'd.decision_key = p_decision_fingerprint',
  'r.decision_fingerprint = p_decision_fingerprint',
  'REVOKE ALL ON FUNCTION public.record_recommendation_outcome',
  'REVOKE ALL ON FUNCTION public.record_decision_outcome',
]) if (!sql.includes(marker)) throw new Error('Missing outcome provenance guard: '+marker);

// Test-of-test: a comment-only marker must not satisfy the executable contract.
const decoy = '-- OUTCOME_PROVENANCE_NOT_FOUND';
const stripped = decoy.replace(/^\s*--.*$/gm, '');
if (stripped.includes('OUTCOME_PROVENANCE_NOT_FOUND')) throw new Error('Test-of-test accepted comment decoy');

console.log('Outcome provenance identity regression: PASS');
