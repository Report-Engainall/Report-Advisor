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
  const companyId = await companyIdOrThrow();
  const { data, error } = await supabase.from('recommendations').insert({
    company_id: companyId,
    category: input.category,
    priority: input.priority,
    title: input.title,
    description: input.description ?? null,
    evidence: input.evidence,
    expected_impact: input.expectedImpact,
    confidence: 'CALCULATED',
    status: 'new',
    evidence_snapshot_id: input.evidenceSnapshotId,
    metric_versions: input.metricVersions,
  }).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function createRuntimeDecision(input: RuntimeDecisionInput): Promise<string> {
  const companyId = await companyIdOrThrow();
  if (input.confidence < 0 || input.confidence > 1) throw new Error('DECISION_CONFIDENCE_OUT_OF_RANGE');
  const { data, error } = await supabase.from('business_intelligence_decisions').insert({
    company_id: companyId,
    decision_key: input.decisionKey,
    decision_type: input.decisionType,
    status: 'PROPOSED',
    confidence: input.confidence,
    expected_impact: input.expectedImpact,
    evidence: input.evidence,
  }).select('id').single();
  if (error) throw error;
  return data.id;
}

export async function linkRecommendationToDecision(recommendationId: string, decisionId: string): Promise<void> {
  const companyId = await companyIdOrThrow();
  const { error: recommendationError } = await supabase.from('recommendations')
    .update({ decision_id: decisionId })
    .eq('id', recommendationId).eq('company_id', companyId);
  if (recommendationError) throw recommendationError;
  const { error: decisionError } = await supabase.from('business_intelligence_decisions')
    .update({ recommendation_id: recommendationId })
    .eq('id', decisionId).eq('company_id', companyId);
  if (decisionError) throw decisionError;
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

export async function notifyWorkItem(workItemId: string, title: string, description: string): Promise<string> {
  const companyId = await companyIdOrThrow();
  const { data, error } = await supabase.from('decision_work_items').select('id,decision_id,department,assignee_id').eq('id', workItemId).eq('company_id', companyId).single();
  if (error) throw error;
  const { data: alert, error: alertError } = await supabase.from('alerts').insert({
    company_id: companyId,
    severity: 'info',
    category: 'decision_action',
    title,
    description,
    entity_type: 'decision_work_item',
    entity_id: data.id,
  }).select('id').single();
  if (alertError) throw alertError;
  return alert.id;
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