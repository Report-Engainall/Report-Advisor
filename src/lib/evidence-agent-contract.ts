export const AGHBARI_EVIDENCE_PROTOCOL_VERSION = '1.0';
export const AGHBARI_EVIDENCE_ENDPOINT = '/api/evidence-context';

export const AGHBARI_EVIDENCE_TOOLS = [
  'get_dashboard_snapshot',
  'get_metric_definition',
  'get_evidence_passport',
  'get_decision_record',
  'get_decision_outcome',
] as const;

export type AghbariEvidenceTool = (typeof AGHBARI_EVIDENCE_TOOLS)[number];

export interface EvidenceAgentRequest {
  tool: AghbariEvidenceTool;
  tenantId: string;
  metricId?: string;
  decisionId?: string;
  asOf?: string;
}

export interface EvidenceAgentResponse {
  protocolVersion: string;
  truthState: 'CONFIRMED' | 'CALCULATED' | 'INSUFFICIENT_DATA' | 'BLOCKED';
  source: string;
  tenantId: string;
  period?: string;
  asOf?: string;
  freshness?: string;
  currency?: string;
  evidenceRefs: string[];
  result: Record<string, unknown>;
  missingEvidence: string[];
}

export function buildEvidenceAgentResponse(
  input: Omit<EvidenceAgentResponse, 'protocolVersion'>,
): EvidenceAgentResponse {
  return { protocolVersion: AGHBARI_EVIDENCE_PROTOCOL_VERSION, ...input };
}
