export type OutcomeLabel = 'correct' | 'incorrect' | 'partial' | 'unknown';
export interface DecisionOutcome { tenantId: string; decisionFingerprint: string; evidenceSnapshotId: string; actionId?: string; observedAt: string; label: OutcomeLabel; actualValue?: number; expectedValue?: number; impactValue?: number; notes?: string; }
export interface OutcomeQuality { count: number; accuracy: number; coverage: number; impact: number; }

export function recordOutcome(outcomes: DecisionOutcome[], outcome: DecisionOutcome): DecisionOutcome[] {
  if (!outcome.tenantId || !outcome.decisionFingerprint || !outcome.evidenceSnapshotId) throw new Error('Outcome identity is incomplete');
  if (!outcome.observedAt) throw new Error('Outcome timestamp is required');
  const duplicate = outcomes.some(item => item.tenantId === outcome.tenantId && item.decisionFingerprint === outcome.decisionFingerprint && item.observedAt === outcome.observedAt);
  return duplicate ? outcomes : [...outcomes, { ...outcome }];
}

export function summarizeOutcomes(outcomes: DecisionOutcome[], tenantId: string): OutcomeQuality {
  const scoped = outcomes.filter(item => item.tenantId === tenantId);
  if (!scoped.length) return { count: 0, accuracy: 0, coverage: 0, impact: 0 };
  const known = scoped.filter(item => item.label !== 'unknown');
  const correct = known.filter(item => item.label === 'correct').length;
  const partial = known.filter(item => item.label === 'partial').length;
  const impact = scoped.reduce((sum, item) => sum + (item.impactValue ?? 0), 0);
  return { count: scoped.length, accuracy: known.length ? (correct + partial * 0.5) / known.length : 0, coverage: known.length / scoped.length, impact };
}
