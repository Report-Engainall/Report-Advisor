import { supabase, resolveCurrentCompanyId } from './supabase';
import { getAuthenticatedUser } from './auth-session';

export type SourceDecisionProposal = {
  id: string;
  recommendationId: string | null;
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
  evidenceSnapshotId: string;
}): Promise<SourceDecisionProposal> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const decisionKey = [
    'source-intelligence',
    input.sourceHash,
    input.signalId,
  ].join(':');

  const evidence = {
    type: 'SOURCE_INTELLIGENCE_SIGNAL',
    reportExecutionJobId: input.reportJobId,
    sourceHash: input.sourceHash,
    signalId: input.signalId,
    signalTitle: input.signalTitle,
    signalMessage: input.signalMessage,
    severity: input.severity,
    evidence: input.evidence,
  };

  const { data, error } = await supabase.rpc('create_source_intelligence_proposal', {
    p_report_job_id: input.reportJobId,
    p_source_hash: input.sourceHash,
    p_signal_id: input.signalId,
    p_signal_title: input.signalTitle,
    p_signal_message: input.signalMessage,
    p_severity: input.severity,
    p_evidence: evidence,