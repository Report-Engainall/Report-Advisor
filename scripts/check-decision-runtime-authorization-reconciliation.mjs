import fs from 'node:fs';

const migration = fs.readFileSync(
  'supabase/migrations/20260831032000_reconcile_live_cycle013_decision_runtime_authorization.sql',
  'utf8',
);

const required = [
  /current_company_id\(\)/i,
  /auth\.uid\(\)/i,
  /SELF_APPROVAL_FORBIDDEN/i,
  /requested_by/i,
  /v_status\s*<>\s*'IN_PROGRESS'/i,
  /WORK_ITEM_NOT_IN_PROGRESS/i,
  /assignee_id/i,
  /WORK_ITEM_ASSIGNEE_FORBIDDEN/i,
  /status\s*=\s*'IN_PROGRESS'/i,
  /status\s*=\s*'APPROVED'/i,
  /SET search_path\s*=\s*public/i,
];

for (const pattern of required) {
  if (!pattern.test(migration)) {
    throw new Error(`Decision runtime authorization reconciliation missing: ${pattern}`);
  }
}

console.log('Decision runtime authorization reconciliation: PASS');
