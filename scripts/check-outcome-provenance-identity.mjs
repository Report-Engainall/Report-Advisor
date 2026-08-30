import fs from 'node:fs';

const migration = fs.readdirSync('supabase/migrations').find(name => name.endsWith('_outcome_provenance_identity.sql'));
if (!migration) throw new Error('Missing outcome provenance identity migration');
const sql = fs.readFileSync('supabase/migrations/'+migration,'utf8');
for (const marker of [
  'OUTCOME_PROVENANCE_NOT_FOUND',
  'r.id::text = p_recommendation_key',
  'd.decision_key = p_decision_fingerprint',
  'r.decision_fingerprint = p_decision_fingerprint',
  'REVOKE ALL ON FUNCTION public.record_recommendation_outcome',
  'REVOKE ALL ON FUNCTION public.record_decision_outcome'
]) if (!sql.includes(marker)) throw new Error('Missing outcome provenance guard: '+marker);
console.log('Outcome provenance identity regression: PASS');
