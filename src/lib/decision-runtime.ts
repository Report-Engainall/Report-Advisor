import { supabase, resolveCurrentCompanyId } from './supabase';

export type RuntimeDecision = {
  id: string;
  decision_key: string;
  decision_type: string;
  status: string;
  confidence: number | null;
  expected_impact: number | null;
  recommendation_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
};

export type RuntimeWorkItem = {
  id: string;
  decision_id: string;
  recommendation_id: string | null;
  department: string;
  assignee_id: string | null;
  assignee_label: string | null;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  evidence_refs: unknown;
  expected_impact: number | null;
  actual_impact: number | null;
};

export type TenantAssignee = { user_id: string; role: string; is_active: boolean };

async function tenantId() {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  return companyId;
}

export async function fetchApprovedDecisions(limit = 100): Promise<RuntimeDecision[]> {
  const companyId = await tenantId();
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) throw new Error('DECISION_QUERY_INVALID_LIMIT');
  const { data, error } = await supabase.from('business_intelligence_decisions')
    .select('id,decision_key,decision_type,status,confidence,expected_impact,recommendation_id,approved_by,approved_at')
    .eq('company_id', companyId).eq('status', 'APPROVED').order('approved_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as RuntimeDecision[];
}

export async function fetchDecisionWorkItem(id: string): Promise<RuntimeWorkItem | null> {
  const companyId = await tenantId();
  if (!id) return null;
  const { data, error } = await supabase.from('decision_work_items')
    .select('id,decision_id,recommendation_id,department,assignee_id,assignee_label,title,description,priority,status,due_at,started_at,completed_at,evidence_refs,expected_impact,actual_impact')
    .eq('company_id', companyId).eq('id', id).maybeSingle();
  if (error) throw error;
  return data as RuntimeWorkItem | null;
}

export async function fetchDecisionWorkItems(decisionId: string): Promise<RuntimeWorkItem[]> {
  const companyId = await tenantId();
  const { data, error } = await supabase.from('decision_work_items')
    .select('id,decision_id,recommendation_id,department,assignee_id,assignee_label,title,description,priority,status,due_at,started_at,completed_at,evidence_refs,expected_impact,actual_impact')
    .eq('company_id', companyId).eq('decision_id', decisionId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as RuntimeWorkItem[];
}

export async function fetchActiveTenantAssignees(): Promise<TenantAssignee[]> {
  const companyId = await tenantId();
  const { data, error } = await supabase.from('company_memberships')
    .select('user_id,role,is_active').eq('company_id', companyId).eq('is_active', true).order('role').order('user_id');
  if (error) throw error;
  return (data ?? []) as TenantAssignee[];
}

export async function startDecisionWorkItem(workItemId: string): Promise<void> {
  await tenantId();
  const { error } = await supabase.rpc('start_decision_work_item', { p_work_item_id: workItemId });
  if (error) throw error;
}

export async function completeDecisionWorkItem(workItemId: string, actualImpact: number | null, evidenceSnapshotId: string): Promise<void> {
  await tenantId();
  if (!evidenceSnapshotId.trim()) throw new Error('OUTCOME_EVIDENCE_REQUIRED');
  const { error } = await supabase.rpc('complete_decision_work_item', {
    p_work_item_id: workItemId,
    p_actual_impact: actualImpact,
    p_evidence: { evidence_snapshot_id: evidenceSnapshotId.trim() },
  });
  if (error) throw error;
}

export async function recordDecisionOutcome(input: {
  decisionFingerprint: string;
  evidenceSnapshotId: string;
  workItemId: string;
  observedAt?: string;
  label: 'correct' | 'incorrect' | 'partial' | 'unknown';
  actualValue?: number | null;
  expectedValue?: number | null;
  impactValue?: number | null;
  notes?: string | null;
}): Promise<string> {
  await tenantId();
  if (!input.decisionFingerprint.trim() || !input.evidenceSnapshotId.trim() || !input.workItemId.trim()) throw new Error('OUTCOME_IDENTITY_INCOMPLETE');
  const { data, error } = await supabase.rpc('record_decision_outcome', {
    p_decision_fingerprint: input.decisionFingerprint.trim(),
    p_evidence_snapshot_id: input.evidenceSnapshotId.trim(),
    p_action_id: input.workItemId.trim(),
    p_observed_at: input.observedAt ?? new Date().toISOString(),
    p_label: input.label,
    p_actual_value: input.actualValue ?? null,
    p_expected_value: input.expectedValue ?? null,
    p_impact_value: input.impactValue ?? null,
    p_notes: input.notes?.trim() || null,
  });
  if (error) throw error;
  return String(data);
}
