import fs from 'node:fs';

const migration = fs.readFileSync('supabase/migrations/20260830185000_harden_decision_runtime_authorization.sql', 'utf8');

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
];

for (const pattern of required) {
  if (!pattern.test(migration)) throw new Error(`Decision runtime authorization contract missing: ${pattern}`);
}

const forbidden = [
  { name: 'self approval bypass', pattern: /IF\s+p_approve\s+AND\s+v_requested_by\s*=\s*v_user/i },
  { name: 'unrestricted completion', pattern: /IF\s+v_status\s*<>\s*'IN_PROGRESS'/i },
  { name: 'assignee bypass', pattern: /v_assignee\s+IS\s+NOT\s+NULL\s+AND\s+v_assignee\s+<>\s+v_user/i },
];

for (const check of forbidden) {
  if (!check.pattern.test(migration)) throw new Error(`Decision runtime authorization regression: ${check.name}`);
}

console.log('Decision runtime authorization hardening: PASS (tenant, self-approval, lifecycle, and assignee boundaries)');
