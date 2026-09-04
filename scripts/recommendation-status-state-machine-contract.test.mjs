import { readFileSync } from 'node:fs';

const migration = readFileSync('supabase/migrations/20260904213000_harden_recommendation_status_state_machine.sql', 'utf8');
const required = [
  "for update",
  "RECOMMENDATION_APPROVAL_REQUIRES_APPROVED_DECISION",
  "RECOMMENDATION_WORK_REQUIRES_APPROVED",
  "RECOMMENDATION_WORK_NOT_IN_PROGRESS",
  "RECOMMENDATION_COMPLETION_REQUIRES_IN_PROGRESS",
  "RECOMMENDATION_WORK_NOT_COMPLETED",
  "RECOMMENDATION_TERMINAL_OR_STATE_LOCKED",
  "RECOMMENDATION_INVALID_TRANSITION",
  "grant execute on function public.update_recommendation_status",
  "revoke execute on function public.update_recommendation_status",
];
for (const marker of required) {
  if (!migration.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`RECOMMENDATION_STATUS_STATE_MACHINE_CONTRACT_MISSING: ${marker}`);
  }
}
for (const marker of ["current_company_id()", "auth.uid()", "status='APPROVED'", "status='IN_PROGRESS'", "status='COMPLETED'"]) {
  if (!migration.includes(marker)) throw new Error(`RECOMMENDATION_STATUS_STATE_PRECONDITION_MISSING: ${marker}`);
}
console.log(JSON.stringify({
  status: 'PASS',
  contract: 'recommendation-status-state-machine',
  invariants: required.length,
  runtime_execution: 'NOT_PROVEN',
}, null, 2));
