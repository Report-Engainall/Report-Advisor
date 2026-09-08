import { supabase, resolveCurrentCompanyId } from './supabase';
import type { IntelligenceTask } from './roleTaskEngine';

export interface PersistedTaskProposal extends IntelligenceTask {
  id: string;
  status: 'proposed' | 'accepted' | 'dismissed' | 'converted';
  createdAt: string;
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
    .select('id,role,horizon,priority,title,reason,source_type,source_id,expected_outcome,evidence_required,status,created_at')
    .eq('company_id', companyId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id), role: row.role as IntelligenceTask['role'], horizon: row.horizon as IntelligenceTask['horizon'],
    priority: row.priority as IntelligenceTask['priority'], title: String(row.title), reason: String(row.reason),
    sourceType: row.source_type as IntelligenceTask['sourceType'], sourceId: row.source_id ? String(row.source_id) : null,
    expectedOutcome: String(row.expected_outcome), evidenceRequired: Array.isArray(row.evidence_required) ? row.evidence_required.map(String) : [],
    status: row.status as PersistedTaskProposal['status'], createdAt: String(row.created_at),
  }));
}

export async function persistTaskProposals(tasks: IntelligenceTask[]): Promise<number> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  if (tasks.length === 0) return 0;
  const rows = tasks.slice(0, 500).map((task) => ({
    company_id: companyId,
    task_key: taskKey(companyId, task),
    role: task.role,
    horizon: task.horizon,
    priority: task.priority,
    title: task.title,
    reason: task.reason,
    source_type: task.sourceType,
    source_id: task.sourceId,
    expected_outcome: task.expectedOutcome,
    evidence_required: task.evidenceRequired,
    status: 'proposed',
  }));
  const { data, error } = await supabase.from('operational_task_proposals')
    .insert(rows, { onConflict: 'company_id,task_key', ignoreDuplicates: true })
    .select('id');
  if (error) throw error;
  return data?.length ?? 0;
}

export async function updateTaskProposalStatus(id: string, status: PersistedTaskProposal['status']): Promise<void> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { error } = await supabase.from('operational_task_proposals').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('company_id', companyId);
  if (error) throw error;
}
