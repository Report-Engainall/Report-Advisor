import { readFileSync } from 'node:fs';

const migration = readFileSync('supabase/migrations/20260904210000_harden_recommendation_outcome_lifecycle.sql', 'utf8');

const required = [
  "d.status = 'APPROVED'",
  "w.status = 'COMPLETED'",
  "raise exception 'OUTCOME_DECISION_NOT_APPROVED_OR_FORBIDDEN'",
  "raise exception 'OUTCOME_WORK_NOT_COMPLETED'",
  "raise exception 'OUTCOME_EVIDENCE_REQUIRED'",
  "raise exception 'OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN'",
  "revoke execute on function public.record_recommendation_outcome",
  "grant execute on function public.record_recommendation_outcome",
];

for (const marker of required) {
  if (!migration.includes(marker)) {
    throw new Error(`RECOMMENDATION_OUTCOME_LIFECYCLE_CONTRACT_MISSING: ${marker}`);
  }
}

const functionBody = migration.split('$function$')[1] ?? '';
if (!functionBody.includes('current_company_id()') || !functionBody.includes('auth.uid()')) {
  throw new Error('RECOMMENDATION_OUTCOME_AUTH_TENANT_GUARD_MISSING');
}

console.log(JSON.stringify({
  status: 'PASS',
  contract: 'recommendation-outcome-lifecycle',
  invariants: required.length,
  runtime_execution: 'NOT_PROVEN',
}, null, 2));
