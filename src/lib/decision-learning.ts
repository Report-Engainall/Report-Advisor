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

export function summarizeDecisionLearning(rows: DecisionLearning[]) {
  const total = rows.length;
  const measured = rows.filter(r => r.actual_value != null && r.expected_value != null);
  const positive = rows.filter(r => r.label === 'correct').length;
  const partial = rows.filter(r => r.label === 'partial').length;
  const incorrect = rows.filter(r => r.label === 'incorrect').length;
  const avgImpact = measured.length ? measured.reduce((sum, r) => sum + Number(r.impact_value ?? 0), 0) / measured.length : null;
  return {
    total,
    measured: measured.length,
    positive,
    partial,
    incorrect,
    unknown: rows.filter(r => r.label === 'unknown').length,
    successRate: total ? positive / total : null,
    avgImpact,
  };
}
