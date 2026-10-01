import { supabase, resolveCurrentCompanyId } from './supabase';
import { getAuthenticatedUser } from './auth-session';
import { createRuntimeRecommendation, createRuntimeDecision, linkRecommendationToDecision } from './decision-automation/vertical-slice-runtime';

export type SourceDecisionProposal = {
  id: string;
  status: string;
  decisionKey: string;
  recommendationId: string | null;
};

export async function createSourceDecisionProposal(input: {
  reportJobId: string;
  sourceHash: string;
  signalId: string;
  signalTitle: string;
  signalMessage: string;
  severity: string;
  evidence: string[];
  evidenceSnapshotId: string;
}): Promise<SourceDecisionProposal> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  if (!input.evidenceSnapshotId.trim()) throw new Error('SOURCE_EVIDENCE_SNAPSHOT_REQUIRED');

  const decisionKey = [
    'source-intelligence',
    input.sourceHash,
    input.signalId,
  ].join(':');

  const { data: existing, error: existingError } = await supabase
    .from('business_intelligence_decisions')
    .select('id,status,recommendation_id')
    .eq('company_id', companyId)
    .eq('decision_key', decisionKey)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.id) {
    return {
      id: String(existing.id),
      status: String(existing.status ?? 'PROPOSED'),
      decisionKey,
      recommendationId: existing.recommendation_id == null ? null : String(existing.recommendation_id),
    };
  }

  const evidence = {
    type: 'SOURCE_INTELLIGENCE_SIGNAL',
    sourceDecisionKey: decisionKey,
    reportExecutionJobId: input.reportJobId,
    sourceHash: input.sourceHash,
    signalId: input.signalId,
    signalTitle: input.signalTitle,
    signalMessage: input.signalMessage,
    severity: input.severity,
    evidence: input.evidence,
    evidenceSnapshotId: input.evidenceSnapshotId,
    decisionBoundary: 'PROPOSED_ONLY',
    confidenceSemantics: 'NEUTRAL_PROPOSAL_VALUE',
  };

  const priority = input.severity === 'critical' ? 'critical' : input.severity === 'high' ? 'high' : input.severity === 'medium' ? 'medium' : 'low';

  let recommendationId: string;
  const { data: existingRecommendation, error: recommendationLookupError } = await supabase
    .from('recommendations')
    .select('id,decision_id')
    .eq('company_id', companyId)
    .contains('evidence', { sourceDecisionKey: decisionKey })
    .maybeSingle();

  if (recommendationLookupError) throw recommendationLookupError;

  if (existingRecommendation?.id) {
    recommendationId = String(existingRecommendation.id);
  } else {
    recommendationId = await createRuntimeRecommendation({
      category: 'source-intelligence',
      priority,
      title: input.signalTitle,
      description: input.signalMessage,
      evidenceSnapshotId: input.evidenceSnapshotId,
      evidence,
      expectedImpact: null,
      metricVersions: {},
    });
  }

  let decisionId: string;
  try {
    decisionId = await createRuntimeDecision({
      decisionKey,
      decisionType: 'SOURCE_INTELLIGENCE_SIGNAL',
      confidence: 0.5,
      expectedImpact: null,
      evidence: { ...evidence, recommendationId },
    });
  } catch (error) {
    if (!String(error instanceof Error ? error.message : error).toLowerCase().includes('duplicate')) throw error;
    const { data: retryExisting, error: retryError } = await supabase
      .from('business_intelligence_decisions')
      .select('id,status,recommendation_id')
      .eq('company_id', companyId)
      .eq('decision_key', decisionKey)
      .maybeSingle();
    if (retryError) throw retryError;
    if (!retryExisting?.id) throw error;
    decisionId = String(retryExisting.id);
  }

  await linkRecommendationToDecision(recommendationId, decisionId);

  return {
    id: decisionId,
    status: 'PROPOSED',
    decisionKey,
    recommendationId,
  };
}


export type SourceDecisionState = SourceDecisionProposal & {
  recommendationTitle: string | null;
  recommendationStatus: string | null;
  recommendationEvidenceSnapshotId: string | null;
  signalId: string | null;
  signalTitle: string | null;
  signalSeverity: string | null;
  signalMessage: string | null;
  createdAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  workItemId: string | null;
  workItemStatus: string | null;
  outcomeId: string | null;
  outcomeEvidenceSnapshotId: string | null;
  outcomeStatus: string | null;
  outcomeQuality: number | null;
  expectedImpact: number | null;
  actualImpact: number | null;
  observedAt: string | null;
  approvalId: string | null;
  approvalStatus: string | null;
  approvalRequestedBy: string | null;
  approvalDecidedBy: string | null;
};

export async function fetchSourceDecisionProposals(sourceHash: string): Promise<SourceDecisionState[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const { data, error } = await supabase
    .from('business_intelligence_decisions')
    .select('id,decision_key,status,created_at,approved_at,approved_by,recommendation_id,evidence')
    .eq('company_id', companyId)
    .like('decision_key', 'source-intelligence:' + sourceHash + ':%')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const decisionRows = data ?? [];
  const decisionIds = decisionRows.map((row) => String(row.id));

  const recommendationIds = decisionRows
    .map((row) => row.recommendation_id)
    .filter((id): id is string => Boolean(id));

  const { data: recommendationRows, error: recommendationError } = recommendationIds.length
    ? await supabase
        .from('recommendations')
        .select('id,title,status,evidence_snapshot_id')
        .eq('company_id', companyId)
        .in('id', recommendationIds)
    : { data: [], error: null };

  if (recommendationError) throw recommendationError;

  const recommendationById = new Map<string, {
    title: string | null;
    status: string | null;
    evidenceSnapshotId: string | null;
  }>();

  for (const recommendation of recommendationRows ?? []) {
    recommendationById.set(String(recommendation.id), {
      title: recommendation.title == null ? null : String(recommendation.title),
      status: recommendation.status == null ? null : String(recommendation.status),
      evidenceSnapshotId: recommendation.evidence_snapshot_id == null ? null : String(recommendation.evidence_snapshot_id),
    });
  }
  const { data: workRows, error: workError } = decisionIds.length
    ? await supabase
        .from('decision_work_items')
        .select('id,decision_id,status')
        .eq('company_id', companyId)
        .in('decision_id', decisionIds)
        .order('created_at', { ascending: false })
    : { data: [], error: null };

  if (workError) throw workError;

  const workByDecision = new Map<string, { id: string; status: string }>();
  for (const work of workRows ?? []) {
    const decisionId = String(work.decision_id);
    if (!workByDecision.has(decisionId)) {
      workByDecision.set(decisionId, { id: String(work.id), status: String(work.status ?? 'OPEN') });
    }
  }

  const { data: outcomes, error: outcomeError } = decisionIds.length
    ? await supabase
        .from('recommendation_outcomes')
        .select('id,decision_id,status,outcome_quality,expected_impact,actual_impact,observed_at,evidence')
        .eq('company_id', companyId)
        .in('decision_id', decisionIds)
        .order('observed_at', { ascending: false })
    : { data: [], error: null };

  if (outcomeError) throw outcomeError;
  const { data: approvals, error: approvalError } = decisionIds.length
    ? await supabase
        .from('decision_approvals')
        .select('id,decision_id,status,requested_by,decided_by')
        .eq('company_id', companyId)
        .in('decision_id', decisionIds)
        .order('requested_at', { ascending: false })
    : { data: [], error: null };

  if (approvalError) throw approvalError;

  const approvalByDecision = new Map();
  for (const approval of approvals ?? []) {
    const decisionId = String(approval.decision_id);
    if (!approvalByDecision.has(decisionId)) {
      approvalByDecision.set(decisionId, {
        id: String(approval.id),
        status: String(approval.status ?? 'PENDING'),
        requestedBy: approval.requested_by == null ? null : String(approval.requested_by),
        decidedBy: approval.decided_by == null ? null : String(approval.decided_by),
      });
    }
  }

  const outcomeByDecision = new Map<string, {
    id: string;
    status: string;
    outcomeQuality: number | null;
    evidenceSnapshotId: string | null;
    expectedImpact: number | null;
    actualImpact: number | null;
    observedAt: string | null;
  }>();

  for (const outcome of outcomes ?? []) {
    const decisionId = String(outcome.decision_id);
    if (!outcomeByDecision.has(decisionId)) {
      const outcomeEvidence = outcome.evidence && typeof outcome.evidence === 'object'
        ? outcome.evidence as Record<string, unknown>
        : {};
      outcomeByDecision.set(decisionId, {
        id: String(outcome.id),
        status: String(outcome.status ?? 'insufficient'),
        evidenceSnapshotId: outcomeEvidence.evidence_snapshot_id == null ? null : String(outcomeEvidence.evidence_snapshot_id),
        outcomeQuality: outcome.outcome_quality == null ? null : Number(outcome.outcome_quality),
        expectedImpact: outcome.expected_impact == null ? null : Number(outcome.expected_impact),
        actualImpact: outcome.actual_impact == null ? null : Number(outcome.actual_impact),
        observedAt: outcome.observed_at == null ? null : String(outcome.observed_at),
      });
    }
  }

  return decisionRows.map((row) => {
    const evidence = row.evidence && typeof row.evidence === 'object'
      ? row.evidence as Record<string, unknown>
      : {};
    const work = workByDecision.get(String(row.id));
    const outcome = outcomeByDecision.get(String(row.id));
    const recommendation = row.recommendation_id == null ? null : recommendationById.get(String(row.recommendation_id));
    return {
      id: String(row.id),
      status: String(row.status ?? 'PROPOSED'),
      recommendationTitle: recommendation?.title ?? null,
      recommendationStatus: recommendation?.status ?? null,
      recommendationEvidenceSnapshotId: recommendation?.evidenceSnapshotId ?? null,
      decisionKey: String(row.decision_key),
      recommendationId: row.recommendation_id == null ? null : String(row.recommendation_id),
      signalId: evidence.signalId == null ? null : String(evidence.signalId),
      signalTitle: evidence.signalTitle == null ? null : String(evidence.signalTitle),
      signalSeverity: evidence.severity == null ? null : String(evidence.severity),
      signalMessage: evidence.signalMessage == null ? null : String(evidence.signalMessage),
      createdAt: row.created_at == null ? null : String(row.created_at),
      approvedAt: row.approved_at == null ? null : String(row.approved_at),
      approvedBy: row.approved_by == null ? null : String(row.approved_by),
      workItemId: work?.id ?? null,
      workItemStatus: work?.status ?? null,
      outcomeId: outcome?.id ?? null,
      outcomeEvidenceSnapshotId: outcome?.evidenceSnapshotId ?? null,
      outcomeStatus: outcome?.status ?? null,
      outcomeQuality: outcome?.outcomeQuality ?? null,
      expectedImpact: outcome?.expectedImpact ?? null,
      actualImpact: outcome?.actualImpact ?? null,
      observedAt: outcome?.observedAt ?? null,
      approvalId: approvalByDecision.get(String(row.id))?.id ?? null,
      approvalStatus: approvalByDecision.get(String(row.id))?.status ?? null,
      approvalRequestedBy: approvalByDecision.get(String(row.id))?.requestedBy ?? null,
      approvalDecidedBy: approvalByDecision.get(String(row.id))?.decidedBy ?? null,
    };
  });
}

export type DecisionAuditTrace = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  source: string | null;
  userLabel: string | null;
  createdAt: string;
};

export async function fetchSourceDecisionAuditTrace(
  decisionId: string,
  approvalId?: string | null,
  workItemId?: string | null,
  outcomeId?: string | null,
): Promise<DecisionAuditTrace[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const entityIds = [decisionId, approvalId, workItemId, outcomeId].filter((value): value is string => Boolean(value));
  if (!entityIds.length) return [];

  const { data, error } = await supabase
    .from('audit_logs')
    .select('id,action,entity_type,entity_id,source,user_label,created_at')
    .eq('company_id', companyId)
    .in('entity_id', entityIds)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    action: String(row.action ?? ''),
    entityType: String(row.entity_type ?? ''),
    entityId: String(row.entity_id ?? ''),
    source: row.source == null ? null : String(row.source),
    userLabel: row.user_label == null ? null : String(row.user_label),
    createdAt: String(row.created_at),
  }));
}

export async function requestSourceDecisionApproval(decisionId: string, reason: string): Promise<string> {
  const { data, error } = await supabase.rpc('request_decision_approval', {
    p_decision_id: decisionId,
    p_reason: reason,
  });
  if (error) throw error;
  return String(data);
}

export async function decideSourceDecisionApproval(decisionApprovalId: string, approve: boolean, reason?: string): Promise<void> {
  const { error } = await supabase.rpc('decide_approval', {
    p_approval_id: decisionApprovalId,
    p_approve: approve,
    p_reason: reason ?? null,
  });
  if (error) throw error;
}


function workItemPriority(severity: string | null): string {
  if (severity === 'critical') return 'CRITICAL';
  if (severity === 'high') return 'HIGH';
  if (severity === 'low' || severity === 'info') return 'LOW';
  return 'MEDIUM';
}

export async function createApprovedDecisionWorkItemForCurrentUser(input: {
  decisionId: string;
  reportJobId: string;
  sourceHash: string;
  signalTitle: string;
  signalMessage: string | null;
  signalSeverity: string | null;
  recommendationId: string | null;
  evidenceSnapshotId: string | null;
  department: string;
  dueAt?: string | null;
}): Promise<string> {
  const user = await getAuthenticatedUser();
  if (!user?.id) throw new Error('AUTHENTICATED_USER_REQUIRED');

  const evidenceRefs = [
    {
      type: 'SOURCE_REPORT',
      reportExecutionJobId: input.reportJobId,
      sourceHash: input.sourceHash,
      decisionId: input.decisionId,
      recommendationId: input.recommendationId,
      evidenceSnapshotId: input.evidenceSnapshotId,
    },
    ...(input.signalMessage ? [{ type: 'SIGNAL', message: input.signalMessage }] : []),
  ];

  const { data, error } = await supabase.rpc('create_decision_work_item', {
    p_decision_id: input.decisionId,
    p_recommendation_id: input.recommendationId,
    p_department: input.department || 'تشغيل',
    p_assignee_id: user.id,
    p_assignee_label: user.email || user.id,
    p_title: input.signalTitle,
    p_description: 'عنصر عمل ناشئ من قرار مصدرّي موافق عليه. ارجع إلى التقرير والبصمة الأصلية قبل التنفيذ.',
    p_priority: workItemPriority(input.signalSeverity),
    p_due_at: input.dueAt ?? null,
    p_expected_impact: null,
    p_evidence_refs: evidenceRefs,
  });

  if (error) throw error;
  const workItemId = String(data);

  try {
    await supabase.rpc('notify_decision_work_item', {
      p_work_item_id: workItemId,
      p_title: 'عنصر عمل جديد من تقرير مصدرّي',
      p_description: input.signalTitle + ' — افتح التقرير والبصمة الأصلية قبل التنفيذ.',
    });
  } catch {
    // Notification failure must not roll back the persisted work item.
  }

  return workItemId;
}


export async function startSourceDecisionWorkItem(workItemId: string): Promise<void> {
  const { error } = await supabase.rpc('start_decision_work_item', {
    p_work_item_id: workItemId,
  });
  if (error) throw error;
}

export async function completeSourceDecisionWorkItem(input: {
  workItemId: string;
  actualImpact: number | null;
  evidenceSnapshotId: string;
  reportJobId: string;
  sourceHash: string;
}): Promise<void> {
  if (!input.evidenceSnapshotId.trim()) throw new Error('WORK_ITEM_EVIDENCE_SNAPSHOT_REQUIRED');

  const evidence = {
    evidence_snapshot_id: input.evidenceSnapshotId,
    reportExecutionJobId: input.reportJobId,
    sourceHash: input.sourceHash,
    completionBoundary: 'PERSISTED_OUTCOME',
  };

  const { error } = await supabase.rpc('complete_decision_work_item', {
    p_work_item_id: input.workItemId,
    p_actual_impact: input.actualImpact,
    p_evidence: evidence,
  });

  if (error) throw error;
}


export type DecisionActivityRecord = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  source: string | null;
  createdAt: string;
};

export async function fetchRecentDecisionActivity(limit = 20): Promise<DecisionActivityRecord[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id,action,entity_type,entity_id,source,created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    action: String(row.action ?? ''),
    entityType: String(row.entity_type ?? ''),
    entityId: String(row.entity_id ?? ''),
    source: row.source == null ? null : String(row.source),
    createdAt: String(row.created_at),
  }));
}

export async function fetchPendingDecisionApprovals(limit = 50): Promise<number> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));
  const { data, error } = await supabase
    .from('decision_approvals')
    .select('id')
    .eq('company_id', companyId)
    .eq('status', 'PENDING')
    .order('requested_at', { ascending: false })
    .limit(safeLimit);

  if (error) throw error;
  return (data ?? []).length;
}

export type DecisionWorkItemRecord = {
  id: string;
  decisionId: string;
  status: string;
  department: string;
  assigneeId: string | null;
  assigneeLabel: string | null;
  title: string;
  priority: string;
  dueAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  expectedImpact: number | null;
  actualImpact: number | null;
  evidenceRefs: unknown[];
  evidenceSnapshotId: string | null;
  sourceReportJobId: string | null;
  sourceHash: string | null;
};

export async function fetchDecisionWorkItems(limit = 200): Promise<DecisionWorkItemRecord[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit)));
  const { data, error } = await supabase
    .from('decision_work_items')
    .select('id,decision_id,status,department,assignee_id,assignee_label,title,priority,due_at,started_at,completed_at,expected_impact,actual_impact,evidence_refs')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    decisionId: String(row.decision_id),
    status: String(row.status ?? 'OPEN'),
    department: String(row.department ?? ''),
    assigneeId: row.assignee_id == null ? null : String(row.assignee_id),
    assigneeLabel: row.assignee_label == null ? null : String(row.assignee_label),
    title: String(row.title ?? ''),
    priority: String(row.priority ?? 'MEDIUM'),
    dueAt: row.due_at == null ? null : String(row.due_at),
    startedAt: row.started_at == null ? null : String(row.started_at),
    completedAt: row.completed_at == null ? null : String(row.completed_at),
    expectedImpact: row.expected_impact == null ? null : Number(row.expected_impact),
    actualImpact: row.actual_impact == null ? null : Number(row.actual_impact),
    evidenceRefs: Array.isArray(row.evidence_refs) ? row.evidence_refs : [],
    evidenceSnapshotId: Array.isArray(row.evidence_refs)
      ? (() => {
          const source = row.evidence_refs.find((ref): ref is Record<string, unknown> => Boolean(ref) && typeof ref === 'object' && (ref as Record<string, unknown>).type === 'SOURCE_REPORT');
          return typeof source?.evidenceSnapshotId === 'string' ? source.evidenceSnapshotId : null;
        })()
      : null,
    sourceReportJobId: Array.isArray(row.evidence_refs)
      ? (() => {
          const source = row.evidence_refs.find((ref): ref is Record<string, unknown> => Boolean(ref) && typeof ref === 'object' && (ref as Record<string, unknown>).type === 'SOURCE_REPORT');
          return typeof source?.reportExecutionJobId === 'string' ? source.reportExecutionJobId : null;
        })()
      : null,
    sourceHash: Array.isArray(row.evidence_refs)
      ? (() => {
          const source = row.evidence_refs.find((ref): ref is Record<string, unknown> => Boolean(ref) && typeof ref === 'object' && (ref as Record<string, unknown>).type === 'SOURCE_REPORT');
          return typeof source?.sourceHash === 'string' ? source.sourceHash : null;
        })()
      : null,
  }));
}
