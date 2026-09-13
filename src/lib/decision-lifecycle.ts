import { supabase, resolveCurrentCompanyId } from './supabase';

export type DecisionRecommendation = {
  id: string;
  company_id: string;
  category: string;
  priority: string;
  title: string;
  description: string | null;
  expected_impact: number | null;
  confidence: string;
  status: string;
  owner: string | null;
  deadline: string | null;
  impact_result: string | null;
  created_at: string;
  evidence_snapshot_id: string | null;
  decision_id: string | null;
};

export async function fetchDecisionRecommendations(): Promise<DecisionRecommendation[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase
    .from('recommendations')
    .select('id,company_id,category,priority,title,description,expected_impact,confidence,status,owner,deadline,impact_result,created_at,evidence_snapshot_id,decision_id')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as DecisionRecommendation[];
}

function requireUuid(value: unknown, code: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(code);
  return value;
}

async function requirePersistedRow(table: string, id: string, expected: Record<string, unknown>, code: string) {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from(table).select('*').eq('id', id).eq('company_id', companyId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(code);
  for (const [key, value] of Object.entries(expected)) {
    if (value !== undefined && data[key] !== value) throw new Error(code);
  }
  return data;
}

export async function createRuntimeDecision(input: {
  decisionKey: string;
  decisionType: string;
  confidence: number;
  expectedImpact: number | null;
  evidence: Record<string, unknown>;
}): Promise<string> {
  const { data, error } = await supabase.rpc('create_runtime_decision', {
    p_decision_key: input.decisionKey,
    p_decision_type: input.decisionType,
    p_confidence: input.confidence,
    p_expected_impact: input.expectedImpact,
    p_evidence: input.evidence,
  });
  if (error) throw error;
  const id = requireUuid(data, 'DECISION_ID_NOT_RETURNED');
  await requirePersistedRow('business_intelligence_decisions', id, { status: 'PROPOSED', decision_key: input.decisionKey }, 'DECISION_PERSISTENCE_NOT_CONFIRMED');
  return id;
}

export async function linkRecommendationToDecision(recommendationId: string, decisionId: string): Promise<void> {
  const { error } = await supabase.rpc('link_recommendation_to_decision', {
    p_recommendation_id: recommendationId,
    p_decision_id: decisionId,
  });
  if (error) throw error;
  await requirePersistedRow('business_intelligence_decisions', decisionId, { recommendation_id: recommendationId }, 'DECISION_RECOMMENDATION_LINK_NOT_PERSISTED');
  await requirePersistedRow('recommendations', recommendationId, { decision_id: decisionId }, 'RECOMMENDATION_DECISION_LINK_NOT_PERSISTED');
}

export async function requestDecisionApproval(decisionId: string, reason?: string | null): Promise<string> {
  const { data, error } = await supabase.rpc('request_decision_approval', {
    p_decision_id: decisionId,
    p_reason: reason ?? null,
  });
  if (error) throw error;
  const id = requireUuid(data, 'APPROVAL_ID_NOT_RETURNED');
  await requirePersistedRow('decision_approvals', id, { decision_id: decisionId, status: 'PENDING' }, 'APPROVAL_PERSISTENCE_NOT_CONFIRMED');
  return id;
}

export async function decideApproval(approvalId: string, approve: boolean, reason?: string | null): Promise<void> {
  const { data, error } = await supabase.rpc('decide_approval', {
    p_approval_id: approvalId,
    p_approve: approve,
    p_reason: reason ?? null,
  });
  if (error) throw error;
  if (data !== true) throw new Error('APPROVAL_DECISION_NOT_CONFIRMED');
  const expectedStatus = approve ? 'APPROVED' : 'REJECTED';
  await requirePersistedRow('decision_approvals', approvalId, { status: expectedStatus }, 'APPROVAL_PERSISTENCE_NOT_CONFIRMED');
  const { data: approval, error: approvalError } = await supabase.from('decision_approvals').select('decision_id').eq('id', approvalId).maybeSingle();
  if (approvalError) throw approvalError;
  const decisionId = requireUuid(approval?.decision_id, 'APPROVAL_DECISION_ID_NOT_RETURNED');
  await requirePersistedRow('business_intelligence_decisions', decisionId, { status: expectedStatus }, 'DECISION_PERSISTENCE_NOT_CONFIRMED');
}

export async function createDecisionWorkItem(input: {
  decisionId: string;
  recommendationId: string | null;
  department: string;
  assigneeId: string;
  assigneeLabel: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueAt: string | null;
  expectedImpact: number | null;
  evidenceRefs: Array<Record<string, unknown>>;
}): Promise<string> {
  const { data, error } = await supabase.rpc('create_decision_work_item', {
    p_decision_id: input.decisionId,
    p_recommendation_id: input.recommendationId,
    p_department: input.department,
    p_assignee_id: input.assigneeId,
    p_assignee_label: input.assigneeLabel,
    p_title: input.title,
    p_description: input.description,
    p_priority: input.priority,
    p_due_at: input.dueAt,
    p_expected_impact: input.expectedImpact,
    p_evidence_refs: input.evidenceRefs,
  });
  if (error) throw error;
  const id = requireUuid(data, 'WORK_ITEM_ID_NOT_RETURNED');
  await requirePersistedRow('decision_work_items', id, { decision_id: input.decisionId, recommendation_id: input.recommendationId, status: 'OPEN' }, 'WORK_ITEM_PERSISTENCE_NOT_CONFIRMED');
  return id;
}

export async function completeDecisionWorkItem(workItemId: string, actualImpact: number | null, evidence: Record<string, unknown>): Promise<void> {
  const { data, error } = await supabase.rpc('complete_decision_work_item', {
    p_work_item_id: workItemId,
    p_actual_impact: actualImpact,
    p_evidence: evidence,
  });
  if (error) throw error;
  if (data !== true) throw new Error('WORK_ITEM_COMPLETION_NOT_CONFIRMED');
  await requirePersistedRow('decision_work_items', workItemId, { status: 'COMPLETED' }, 'WORK_ITEM_COMPLETION_NOT_PERSISTED');
}
