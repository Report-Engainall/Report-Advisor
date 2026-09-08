import { readFileSync, existsSync } from 'node:fs';

const required = [
  'supabase/migrations/20260908205000_operational_task_proposals.sql',
  'supabase/migrations/20260908212000_operational_task_proposal_dedupe.sql',
  'supabase/migrations/20260908220000_operational_task_proposal_decision_conversion.sql',
  'supabase/migrations/20260908140631_operational_daily_plan_read_model.sql',
  'src/lib/role-task-persistence.ts',
  'src/pages/IntelligenceTaskCenterPage.tsx',
];
for (const file of required) {
  if (!existsSync(file)) throw new Error(`MISSING_LIFECYCLE_ARTIFACT:${file}`);
}

const conversion = readFileSync('supabase/migrations/20260908220000_operational_task_proposal_decision_conversion.sql', 'utf8');
const dailyPlan = readFileSync('supabase/migrations/20260908140631_operational_daily_plan_read_model.sql', 'utf8');
const persistence = readFileSync('src/lib/role-task-persistence.ts', 'utf8');
const taskCenter = readFileSync('src/pages/IntelligenceTaskCenterPage.tsx', 'utf8');

const assertions = [
  [conversion, "v_status <> 'accepted'", 'conversion_requires_accepted'],
  [conversion, "d.status='APPROVED'", 'conversion_requires_approved_decision'],
  [conversion, 'ASSIGNEE_NOT_ACTIVE_TENANT_MEMBER', 'conversion_requires_active_assignee'],
  [conversion, "status='converted'", 'conversion_closes_proposal'],
  [dailyPlan, 'public.current_company_id()', 'daily_plan_tenant_boundary'],
  [dailyPlan, "status='IN_PROGRESS'", 'daily_plan_tracks_execution'],
  [dailyPlan, 'evidence_missing', 'daily_plan_tracks_evidence'],
  [persistence, "rpc('convert_operational_task_proposal'", 'client_uses_approval_gate_rpc'],
  [persistence, "rpc('get_operational_daily_plan'", 'client_uses_durable_daily_plan'],
  [taskCenter, 'fetchOperationalDailyPlan', 'ui_reads_durable_plan'],
  [taskCenter, 'يحتاج دليلًا', 'ui_surfaces_evidence_state'],
];

for (const [content, needle, label] of assertions) {
  if (!content.includes(needle)) throw new Error(`LIFECYCLE_CONTRACT_FAILED:${label}`);
}

console.log(`Operational task lifecycle guard PASS: ${assertions.length} assertions`);
