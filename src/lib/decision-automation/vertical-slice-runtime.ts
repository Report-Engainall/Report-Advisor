import { supabase, resolveCurrentCompanyId } from '../supabase';

export type RuntimeApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type RuntimeWorkStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED';

export interface RuntimeRecommendationInput {
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  evidenceSnapshotId: string;
  evidence: Record<string, unknown>;
  expectedImpact: number;
  metricVersions: Record<string, number>;
}

export interface RuntimeDecisionInput {
  decisionKey: string;
  decisionType: string;
  confidence: number;
  expectedImpact: number;
  evidence: Record<string, unknown>;
}

export interface RuntimeWorkItemInput {
  department: string;
  assigneeId?: string;
  assigneeLabel?: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueAt?: string;
  expectedImpact: number;
  evidenceRefs: string[];
}

async function companyIdOrThrow(): Promise<string> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  return companyId;
}

export async function createRuntimeRecommendation(input: RuntimeRecommendationInput): Promise<string> {
  await companyIdOrThrow();
  const { data, error } = await supabase.rpc('create_runtime_recommendation', {
    p_category: input.category,
    p_priority: input.priority,
    p_title: input.title,
    p_description: input.description ?? null,
    p_evidence: input.evidence,
    p_expected_impact: input.expectedImpact,
    p_evidence_snapshot_id: input.evidenceSnapshotId,
    p_metric_versions: input.metricVersions,
  });
  if (error) throw error;
  return data as string;
}

export async function createRuntimeDecision(input: RuntimeDecisionInput): Promise<string> {
  await companyIdOrThrow();
  if (input.confidence < 0 || input.confidence > 1) throw new Error('DECISION_CONFIDENCE_OUT_OF_RANGE');
  const { data, error } = await supabase.rpc('create_runtime_decision', {
    p_decision_key: input.decisionKey,
    p_decision_type: input.decisionType,
    p_confidence: input.confidence,
    p_expected_impact: input.expectedImpact,
    p_evidence: input.evidence,
  });
  if (error) throw error;
  return data as string;
}

export async function linkRecommendationToDecision(recommendationId: string, decisionId: string): Promise<void> {
  const { error } = await supabase.rpc('link_recommendation_to_decision', {
    p_recommendation_id: recommendationId,
    p_decision_id: decisionId,
  });
  if (error) throw error;
}

export async function requestRuntimeApproval(decisionId: string, reason?: string): Promise<string> {
  const { data, error } = await supabase.rpc('request_decision_approval', { p_decision_id: decisionId, p_reason: reason ?? null });
  if (error) throw error;
  return data as string;
}

export async function decideRuntimeApproval(approvalId: string, approve: boolean, reason?: string): Promise<void> {
  const { error } = await supabase.rpc('decide_approval', { p_approval_id: approvalId, p_approve: approve, p_reason: reason ?? null });
  if (error) throw error;
}

export async function createRuntimeWorkItem(decisionId: string, recommendationId: string | null, input: RuntimeWorkItemInput): Promise<string> {
  const { data, error } = await supabase.rpc('create_decision_work_item', {
    p_decision_id: decisionId,
    p_recommendation_id: recommendationId,
    p_department: input.department,
    p_assignee_id: input.assigneeId ?? null,
    p_assignee_label: input.assigneeLabel ?? null,
    p_title: input.title,
    p_description: input.description ?? null,
    p_priority: input.priority,
    p_due_at: input.dueAt ?? null,
    p_expected_impact: input.expectedImpact,
    p_evidence_refs: input.evidenceRefs,
  });
  if (error) throw error;
  return data as string;
}

export async function startRuntimeWorkItem(workItemId: string): Promise<void> {
  const { error } = await supabase.rpc('start_decision_work_item', { p_work_item_id: workItemId });
  if (error) throw error;
}

export async function notifyWorkItem(workItemId: string, title: string, description: string): Promise<string> {
  await companyIdOrThrow();
  const { data, error } = await supabase.rpc('notify_decision_work_item', {
    p_work_item_id: workItemId,
    p_title: title,
    p_description: description,
  });
  if (error) throw error;
  return data as string;
}

export async function completeRuntimeWorkItem(workItemId: string, actualImpact: number, evidence: Record<string, unknown> = {}): Promise<void> {
  const { error } = await supabase.rpc('complete_decision_work_item', {
    p_work_item_id: workItemId,
    p_actual_impact: actualImpact,
    p_evidence: evidence,
  });
  if (error) throw error;
}

export async function loadRuntimeOutcome(workItemId: string): Promise<{ expectedImpact: number | null; actualImpact: number | null; status: string } | null> {
  const companyId = await companyIdOrThrow();
  const { data, error } = await supabase.from('decision_work_items')
    .select('expected_impact,actual_impact,status')
    .eq('id', workItemId).eq('company_id', companyId).single();
  if (error) throw error;
  return data ? { expectedImpact: data.expected_impact, actualImpact: data.actual_impact, status: data.status } : null;
}
