import { supabase, resolveCurrentCompanyId } from './supabase';

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
