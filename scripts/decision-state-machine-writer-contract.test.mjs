import { readFileSync } from 'node:fs';

const migrations = [
  'supabase/migrations/20260904210000_harden_recommendation_outcome_lifecycle.sql',
  'supabase/migrations/20260904213000_harden_recommendation_status_state_machine.sql',
];
const source = migrations.map((p) => readFileSync(p, 'utf8')).join('\n');
const writers = {
  record_recommendation_outcome: ["status='APPROVED'", "status='COMPLETED'", 'OUTCOME_EVIDENCE_REQUIRED'],
  record_decision_outcome: ["status='APPROVED'", "status='COMPLETED'", 'OUTCOME_EVIDENCE_NOT_FOUND_OR_FORBIDDEN'],
  finalize_runtime_decision: ["status='APPROVED'", 'DECISION_WORK_ITEMS_INCOMPLETE', 'DECISION_OUTCOME_REQUIRED'],
  create_decision_work_item: ["status='APPROVED'", 'ASSIGNEE_NOT_ACTIVE_TENANT_MEMBER'],
  start_decision_work_item: ["status='APPROVED'", "v_status <> 'OPEN'", 'WORK_ITEM_ASSIGNEE_FORBIDDEN'],
  complete_decision_work_item: ["status='APPROVED'", "v_status<>'IN_PROGRESS'", 'OUTCOME_EVIDENCE_REQUIRED'],
  decide_approval: ["v_decision_status is distinct from 'PROPOSED'", 'SELF_APPROVAL_FORBIDDEN'],
  request_decision_approval: ["v_decision_status is distinct from 'PROPOSED'", 'APPROVAL_TERMINAL_NOT_REOPENABLE'],
  update_recommendation_status: ['RECOMMENDATION_APPROVAL_REQUIRES_APPROVED_DECISION', 'RECOMMENDATION_WORK_NOT_IN_PROGRESS', 'RECOMMENDATION_WORK_NOT_COMPLETED', 'RECOMMENDATION_TERMINAL_OR_STATE_LOCKED'],
};
for (const [writer, markers] of Object.entries(writers)) {
  if (!source.includes(`function public.${writer}`)) throw new Error(`STATE_WRITER_MISSING_FROM_AUDIT: ${writer}`);
  for (const marker of markers) if (!source.includes(marker)) throw new Error(`STATE_WRITER_GUARD_MISSING: ${writer}: ${marker}`);
}
for (const marker of ['current_company_id()', 'auth.uid()', 'security definer', "set search_path='pg_catalog'"]) {
  if (!source.includes(marker)) throw new Error(`STATE_MACHINE_GLOBAL_GUARD_MISSING: ${marker}`);
}
console.log(JSON.stringify({ status:'PASS', contract:'decision-state-machine-writers', writers:Object.keys(writers), runtime_execution:'NOT_PROVEN' }, null, 2));
