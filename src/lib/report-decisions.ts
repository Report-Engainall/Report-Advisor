import { supabase, resolveCurrentCompanyId } from './supabase';
import { getAuthenticatedUser } from './auth-session';

export type SourceDecisionProposal = {
  id: string;
  status: string;
  decisionKey: string;
};

export async function createSourceDecisionProposal(input: {
  reportJobId: string;
  sourceHash: string;
  signalId: string;
  signalTitle: string;
  signalMessage: string;
  severity: string;
  evidence: string[];
}): Promise<SourceDecisionProposal> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const decisionKey = [
    'source-intelligence',
    input.sourceHash,
    input.signalId,
  ].join(':');

  const { data: existing, error: existingError } = await supabase
    .from('business_intelligence_decisions')
    .select('id,status')
    .eq('company_id', companyId)
    .eq('decision_key', decisionKey)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.id) {
    return {
      id: String(existing.id),
      status: String(existing.status ?? 'PROPOSED'),
      decisionKey,
    };
  }

  const evidence = {
    type: 'SOURCE_INTELLIGENCE_SIGNAL',
    reportExecutionJobId: input.reportJobId,
    sourceHash: input.sourceHash,
    signalId: input.signalId,
    signalTitle: input.signalTitle,
    signalMessage: input.signalMessage,
    severity: input.severity,
    evidence: input.evidence,
    decisionBoundary: 'PROPOSED_ONLY',
    confidenceSemantics: 'NEUTRAL_PROPOSAL_VALUE',
  };

  const { data, error } = await supabase.rpc('create_runtime_decision', {
    p_decision_key: decisionKey,
    p_decision_type: 'SOURCE_INTELLIGENCE_SIGNAL',
    p_confidence: 0.5,
    p_expected_impact: null,
    p_evidence: evidence,
  });

  if (error) {
    if (String(error.message ?? '').toLowerCase().includes('duplicate') || String(error.code ?? '') === '23505') {
      const { data: retryExisting, error: retryError } = await supabase
        .from('business_intelligence_decisions')
        .select('id,status')
        .eq('company_id', companyId)
        .eq('decision_key', decisionKey)
        .maybeSingle();
      if (retryError) throw retryError;
      if (retryExisting?.id) {
        return { id: String(retryExisting.id), status: String(retryExisting.status ?? 'PROPOSED'), decisionKey };
      }
    }
    throw error;
  }

  return {
    id: String(data),
    status: 'PROPOSED',
    decisionKey,
  };
}


export type SourceDecisionState = SourceDecisionProposal & {
  signalId: string | null;
  signalTitle: string | null;
  signalSeverity: string | null;
  signalMessage: string | null;
  createdAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  workItemId: string | null;
  workItemStatus: string | null;
};

export async function fetchSourceDecisionProposals(sourceHash: string): Promise<SourceDecisionState[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const { data, error } = await supabase
    .from('business_intelligence_decisions')
    .select('id,decision_key,status,created_at,approved_at,approved_by,evidence')
    .eq('company_id', companyId)
    .like('decision_key', 'source-intelligence:' + sourceHash + ':%')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const decisionRows = data ?? [];
  const decisionIds = decisionRows.map((row) => String(row.id));
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

  return decisionRows.map((row) => {
    const evidence = row.evidence && typeof row.evidence === 'object'
      ? row.evidence as Record<string, unknown>
      : {};
    const work = workByDecision.get(String(row.id));
    return {
      id: String(row.id),
      status: String(row.status ?? 'PROPOSED'),
      decisionKey: String(row.decision_key),
      signalId: evidence.signalId == null ? null : String(evidence.signalId),
      signalTitle: evidence.signalTitle == null ? null : String(evidence.signalTitle),
      signalSeverity: evidence.severity == null ? null : String(evidence.severity),
      signalMessage: evidence.signalMessage == null ? null : String(evidence.signalMessage),
      createdAt: row.created_at == null ? null : String(row.created_at),
      approvedAt: row.approved_at == null ? null : String(row.approved_at),
      approvedBy: row.approved_by == null ? null : String(row.approved_by),
      workItemId: work?.id ?? null,
      workItemStatus: work?.status ?? null,
    };
  });
}

export async function requestSourceDecisionApproval(decisionId: string, reason: string): Promise<string> {
  const { data, error } = await supabase.rpc('request_decision_approval', {
    p_decision_id: decisionId,
    p_reason: reason,
  });
  if (error) throw error;
  return String(data);
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
  department: string;
}): Promise<string> {
  const user = await getAuthenticatedUser();
  if (!user?.id) throw new Error('AUTHENTICATED_USER_REQUIRED');

  const evidenceRefs = [
    {
      type: 'SOURCE_REPORT',
      reportExecutionJobId: input.reportJobId,
      sourceHash: input.sourceHash,
      decisionId: input.decisionId,
    },
    ...(input.signalMessage ? [{ type: 'SIGNAL', message: input.signalMessage }] : []),
  ];

  const { data, error } = await supabase.rpc('create_decision_work_item', {
    p_decision_id: input.decisionId,
    p_recommendation_id: null,
    p_department: input.department || 'تشغيل',
    p_assignee_id: user.id,
    p_assignee_label: user.email || user.id,
    p_title: input.signalTitle,
    p_description: 'عنصر عمل ناشئ من قرار مصدرّي موافق عليه. ارجع إلى التقرير والبصمة الأصلية قبل التنفيذ.',
    p_priority: workItemPriority(input.signalSeverity),
    p_due_at: null,
    p_expected_impact: null,
    p_evidence_refs: evidenceRefs,
  });

  if (error) throw error;
  return String(data);
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
