import { supabase, resolveCurrentCompanyId } from './supabase';

export type DecisionLearning = {
  id: string;
  decision_fingerprint: string;
  action_id: string | null;
  observed_at: string;
  label: 'correct' | 'incorrect' | 'partial' | 'unknown';
  actual_value: number | null;
  expected_value: number | null;
  impact_value: number | null;
  notes: string | null;
  evidence_snapshot_id: string;
  created_at: string;
};

export type DecisionLearningSignal = {
  decisionFingerprint: string;
  decisionType: string | null;
  policyKey: string | null;
  recommendationId: string | null;
  outcomes: number;
  measured: number;
  correct: number;
  partial: number;
  incorrect: number;
  unknown: number;
  successRate: number | null;
  averageImpact: number | null;
  signal: 'positive' | 'mixed' | 'negative' | 'insufficient';
};

async function tenantId() {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  return companyId;
}

export async function fetchDecisionLearning(limit = 100): Promise<DecisionLearning[]> {
  const companyId = await tenantId();
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) throw new Error('LEARNING_QUERY_INVALID_LIMIT');
  const { data, error } = await supabase.from('decision_outcomes')
    .select('id,decision_fingerprint,action_id,observed_at,label,actual_value,expected_value,impact_value,notes,evidence_snapshot_id,created_at')
    .eq('company_id', companyId).order('observed_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as DecisionLearning[];
}

export async function fetchDecisionLearningSignals(rows?: DecisionLearning[]): Promise<DecisionLearningSignal[]> {
  const companyId = await tenantId();
  const outcomes = rows ?? await fetchDecisionLearning();
  if (outcomes.length === 0) return [];
  const fingerprints = [...new Set(outcomes.map(row => row.decision_fingerprint).filter(Boolean))];
  const { data, error } = await supabase.from('business_intelligence_decisions')
    .select('decision_key,decision_type,policy_key,recommendation_id')
    .eq('company_id', companyId).in('decision_key', fingerprints);
  if (error) throw error;
  const metadata = new Map((data ?? []).map(row => [row.decision_key as string, row]));
  const grouped = new Map<string, DecisionLearning[]>();
  for (const row of outcomes) grouped.set(row.decision_fingerprint, [...(grouped.get(row.decision_fingerprint) ?? []), row]);
  return [...grouped.entries()].map(([fingerprint, group]) => {
    const measured = group.filter(r => r.actual_value != null && r.expected_value != null);
    const correct = group.filter(r => r.label === 'correct').length;
    const partial = group.filter(r => r.label === 'partial').length;
    const incorrect = group.filter(r => r.label === 'incorrect').length;
    const unknown = group.filter(r => r.label === 'unknown').length;
    const successRate = group.length ? correct / group.length : null;
    const averageImpact = measured.length ? measured.reduce((sum, r) => sum + Number(r.impact_value ?? 0), 0) / measured.length : null;
    const signal = group.length < 3 ? 'insufficient' : successRate != null && successRate >= 0.7 && incorrect === 0 ? 'positive' : incorrect / group.length >= 0.5 ? 'negative' : 'mixed';
    const meta = metadata.get(fingerprint);
    return { decisionFingerprint: fingerprint, decisionType: (meta?.decision_type as string | null) ?? null, policyKey: (meta?.policy_key as string | null) ?? null, recommendationId: (meta?.recommendation_id as string | null) ?? null, outcomes: group.length, measured: measured.length, correct, partial, incorrect, unknown, successRate, averageImpact, signal };
  }).sort((a, b) => (a.signal === 'negative' ? 0 : a.signal === 'mixed' ? 1 : a.signal === 'insufficient' ? 2 : 3) - (b.signal === 'negative' ? 0 : b.signal === 'mixed' ? 1 : b.signal === 'insufficient' ? 2 : 3));
}

export function summarizeDecisionLearning(rows: DecisionLearning[]) {
  const total = rows.length;
  const measured = rows.filter(r => r.actual_value != null && r.expected_value != null);
  const positive = rows.filter(r => r.label === 'correct').length;
  const partial = rows.filter(r => r.label === 'partial').length;
  const incorrect = rows.filter(r => r.label === 'incorrect').length;
  const avgImpact = measured.length ? measured.reduce((sum, r) => sum + Number(r.impact_value ?? 0), 0) / measured.length : null;
  return { total, measured: measured.length, positive, partial, incorrect, unknown: rows.filter(r => r.label === 'unknown').length, successRate: total ? positive / total : null, avgImpact };
}
