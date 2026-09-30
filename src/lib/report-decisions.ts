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

  return (data ?? []).map((row) => {
    const evidence = row.evidence && typeof row.evidence === 'object'
      ? row.evidence as Record<string, unknown>
      : {};
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
