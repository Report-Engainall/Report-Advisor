import { supabase, resolveCurrentCompanyId } from './supabase';
import type { IntelligenceTask, TaskHorizon, TaskRole } from './roleTaskEngine';

export interface PersistedTaskProposal extends IntelligenceTask {
  id: string;
  status: 'proposed' | 'accepted' | 'dismissed' | 'converted';
  createdAt: string;
  decisionId: string | null;
  convertedWorkItemId: string | null;
}

export interface OperationalDailyPlanRow {
  role: TaskRole;
  horizon: TaskHorizon;
  proposed: number;
  accepted: number;
  awaitingApproval: number;
  openWork: number;
  inProgress: number;
  completed: number;
  overdue: number;
  evidenceMissing: number;
}

function taskKey(companyId: string, task: IntelligenceTask): string {
  const sourceId = task.sourceId ?? '';
  return [companyId, task.role, task.horizon, task.sourceType, sourceId, task.title.trim().toLowerCase()].join('|');
}

export async function fetchTaskProposals(limit = 200): Promise<PersistedTaskProposal[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error('TASK_QUERY_INVALID_LIMIT');
  const { data, error } = await supabase.from('operational_task_proposals')
    .select('id,role,horizon,priority,title,reason,source_type,source_id,expected_outcome,evidence_required,status,decision_id,converted_work_item_id,created_at')
    .eq('company_id', companyId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id), role: row.role as IntelligenceTask['role'], horizon: row.horizon as IntelligenceTask['horizon'],
    priority: row.priority as IntelligenceTask['priority'], title: String(row.title), reason: String(row.reason),
    sourceType: row.source_type as IntelligenceTask['sourceType'], sourceId: row.source_id ? String(row.source_id) : null,
    expectedOutcome: String(row.expected_outcome), evidenceRequired: Array.isArray(row.evidence_required) ? row.evidence_required.map(String) : [],
    status: row.status as PersistedTaskProposal['status'], createdAt: String(row.created_at),
    decisionId: row.decision_id ? String(row.decision_id) : null,
    convertedWorkItemId: row.converted_work_item_id ? String(row.converted_work_item_id) : null,
  }));
}

export async function fetchOperationalDailyPlan(role?: TaskRole | null, horizon?: TaskHorizon | null): Promise<OperationalDailyPlanRow[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.rpc('get_operational_daily_plan', {
    p_role: role ?? null,
    p_horizon: horizon ?? null,
  });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    role: row.role as TaskRole,
    horizon: row.horizon as TaskHorizon,
    proposed: Number(row.proposed ?? 0),
    accepted: Number(row.accepted ?? 0),
    awaitingApproval: Number(row.awaiting_approval ?? 0),
    openWork: Number(row.open_work ?? 0),
    inProgress: Number(row.in_progress ?? 0),
    completed: Number(row.completed ?? 0),
    overdue: Number(row.overdue ?? 0),
    evidenceMissing: Number(row.evidence_missing ?? 0),
  }));
}

export async function persistTaskProposals(tasks: IntelligenceTask[]): Promise<number> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  if (tasks.length === 0) return 0;
  const rows = tasks.slice(0, 500).map((task) => ({
    company_id: companyId, task_key: taskKey(companyId, task), role: task.role, horizon: task.horizon,
    priority: task.priority, title: task.title, reason: task.reason, source_type: task.sourceType,
    source_id: task.sourceId, expected_outcome: task.expectedOutcome, evidence_required: task.evidenceRequired, status: 'proposed',
  }));
  const { data, error } = await supabase.from('operational_task_proposals')
    .insert(rows, { onConflict: 'company_id,task_key', ignoreDuplicates: true }).select('id');
  if (error) throw error;
  return data?.length ?? 0;
}

export async function updateTaskProposalStatus(id: string, status: PersistedTaskProposal['status']): Promise<void> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  if (status === 'converted') throw new Error('TASK_PROPOSAL_CONVERSION_REQUIRES_APPROVED_DECISION');
  const { error } = await supabase.from('operational_task_proposals').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('company_id', companyId);
  if (error) throw error;
}

export async function convertAcceptedTaskProposal(input: { proposalId: string; decisionId: string; assigneeId?: string | null; assigneeLabel?: string | null; dueAt?: string | null }): Promise<string> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  if (!input.proposalId || !input.decisionId) throw new Error('APPROVED_DECISION_REQUIRED');
  const { data, error } = await supabase.rpc('convert_operational_task_proposal', {
    p_proposal_id: input.proposalId, p_decision_id: input.decisionId,
    p_assignee_id: input.assigneeId ?? null, p_assignee_label: input.assigneeLabel ?? null, p_due_at: input.dueAt ?? null,
  });
  if (error) throw error;
  if (!data) throw new Error('TASK_PROPOSAL_CONVERSION_FAILED');
  return String(data);
}
