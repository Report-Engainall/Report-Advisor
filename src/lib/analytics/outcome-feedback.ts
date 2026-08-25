import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';

export type OutcomeLabel = 'correct' | 'incorrect' | 'partial' | 'unknown';
export interface DecisionOutcome { tenantId: string; decisionFingerprint: string; evidenceSnapshotId: string; actionId?: string; observedAt: string; label: OutcomeLabel; actualValue?: number; expectedValue?: number; impactValue?: number; notes?: string; }
export interface OutcomeQuality { count: number; accuracy: number | null; coverage: number | null; impact: number | null; }

function finiteOptional(value: number | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value)) throw new Error(`OUTCOME_INVALID_NUMBER:${field}`);
  return value;
}

function validateOutcome(outcome: DecisionOutcome): void {
  if (!outcome.tenantId || !outcome.decisionFingerprint || !outcome.evidenceSnapshotId) throw new Error('Outcome identity is incomplete');
  const observed = new Date(outcome.observedAt).getTime();
  if (!Number.isFinite(observed)) throw new Error('Outcome timestamp is invalid');
  finiteOptional(outcome.actualValue, 'actualValue');
  finiteOptional(outcome.expectedValue, 'expectedValue');
  finiteOptional(outcome.impactValue, 'impactValue');
  if (outcome.label !== 'unknown' && (outcome.actualValue === undefined || outcome.expectedValue === undefined)) {
    throw new Error('OUTCOME_VALUES_REQUIRED_FOR_KNOWN_LABEL');
  }
}

export function recordOutcome(outcomes: DecisionOutcome[], outcome: DecisionOutcome): DecisionOutcome[] {
  validateOutcome(outcome);
  // Persistence is keyed by tenant + recommendation key, so the in-memory contract
  // must use the same identity rather than observedAt (which previously diverged).
  const duplicate = outcomes.some(item => item.tenantId === outcome.tenantId && item.decisionFingerprint === outcome.decisionFingerprint);
  return duplicate ? outcomes : [...outcomes, { ...outcome }];
}

export async function persistOutcome(outcome: DecisionOutcome): Promise<void> {
  validateOutcome(outcome);
  const companyId = await resolveCurrentCompanyId();
  if (!companyId || companyId !== outcome.tenantId) throw new Error('OUTCOME_TENANT_CONTEXT_MISMATCH');
  const status = outcome.label === 'correct' ? 'positive' : outcome.label === 'incorrect' ? 'negative' : outcome.label === 'partial' ? 'neutral' : 'insufficient';
  const { error } = await supabase.from('recommendation_outcomes').upsert({
    company_id: companyId,
    recommendation_key: outcome.decisionFingerprint,
    observed_at: outcome.observedAt,
    expected_impact: outcome.expectedValue ?? null,
    actual_impact: outcome.actualValue ?? null,
    outcome_quality: outcome.label === 'correct' ? 1 : outcome.label === 'partial' ? 0.5 : outcome.label === 'incorrect' ? 0 : null,
    status,
    decision_id: outcome.actionId ?? null,
    evidence: {
      evidence_snapshot_id: outcome.evidenceSnapshotId,
      notes: outcome.notes ?? null,
      impact_value: outcome.impactValue ?? null,
    },
  }, { onConflict: 'company_id,recommendation_key' });
  if (error) throw error;
}

export async function loadPersistedOutcomes(tenantId: string): Promise<DecisionOutcome[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId || companyId !== tenantId) throw new Error('OUTCOME_TENANT_CONTEXT_MISMATCH');
  const { data, error } = await supabase.from('recommendation_outcomes')
    .select('company_id, recommendation_key, decision_id, observed_at, expected_impact, actual_impact, outcome_quality, status, evidence')
    .eq('company_id', companyId)
    .order('observed_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const evidence = row.evidence as { evidence_snapshot_id?: string; notes?: string | null; impact_value?: number | null } | null;
    const label: OutcomeLabel = row.status === 'positive' ? 'correct' : row.status === 'negative' ? 'incorrect' : row.status === 'neutral' ? 'partial' : 'unknown';
    return {
      tenantId: row.company_id,
      decisionFingerprint: row.recommendation_key,
      evidenceSnapshotId: evidence?.evidence_snapshot_id ?? '',
      actionId: row.decision_id ?? undefined,
      observedAt: row.observed_at,
      label,
      actualValue: row.actual_impact ?? undefined,
      expectedValue: row.expected_impact ?? undefined,
      impactValue: evidence?.impact_value ?? undefined,
      notes: evidence?.notes ?? undefined,
    };
  }).filter((row) => Boolean(row.evidenceSnapshotId));
}

export function summarizeOutcomes(outcomes: DecisionOutcome[], tenantId: string): OutcomeQuality {
  const scoped = outcomes.filter(item => item.tenantId === tenantId);
  if (!scoped.length) return { count: 0, accuracy: null, coverage: null, impact: null };
  const known = scoped.filter(item => item.label !== 'unknown');
  const correct = known.filter(item => item.label === 'correct').length;
  const partial = known.filter(item => item.label === 'partial').length;
  const impacts = scoped.map(item => item.impactValue).filter((value): value is number => Number.isFinite(value));
  return {
    count: scoped.length,
    accuracy: known.length ? (correct + partial * 0.5) / known.length : null,
    coverage: scoped.length ? known.length / scoped.length : null,
    impact: impacts.length ? impacts.reduce((sum, value) => sum + value, 0) : null,
  };
}
