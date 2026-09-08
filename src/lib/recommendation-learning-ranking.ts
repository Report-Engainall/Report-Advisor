import type { Recommendation } from './types';
import type { DecisionLearningSignal } from './decision-learning';

export type GovernedRecommendation = Recommendation & {
  learning_status: DecisionLearningSignal['signal'] | 'unavailable';
  learning_sample_size: number;
  learning_success_rate: number | null;
  learning_adjustment: number;
  learning_reason: string;
};

const MIN_SAMPLES = 3;
const MAX_ADJUSTMENT = 0.15;

function recommendationId(row: Recommendation): string | null {
  const value = (row as Recommendation & { decision_id?: unknown }).decision_id;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function signalForRecommendation(row: Recommendation, signals: DecisionLearningSignal[]): DecisionLearningSignal | null {
  const exact = signals.find(signal => signal.recommendationId === row.id);
  if (exact) return exact;
  const decisionId = recommendationId(row);
  if (decisionId) return signals.find(signal => signal.decisionFingerprint === decisionId || signal.recommendationId === decisionId) ?? null;
  return null;
}

export function applyGovernedRecommendationLearning(
  recommendations: Recommendation[],
  signals: DecisionLearningSignal[],
): GovernedRecommendation[] {
  return recommendations.map((recommendation) => {
    const signal = signalForRecommendation(recommendation, signals);
    if (!signal || signal.outcomes < MIN_SAMPLES || signal.signal === 'insufficient') {
      return { ...recommendation, learning_status: signal?.signal ?? 'unavailable', learning_sample_size: signal?.outcomes ?? 0, learning_success_rate: signal?.successRate ?? null, learning_adjustment: 0, learning_reason: signal ? `insufficient learning sample (${signal.outcomes}/${MIN_SAMPLES})` : 'no attributable learning signal' };
    }
    const adjustment = signal.signal === 'positive' ? MAX_ADJUSTMENT : signal.signal === 'negative' ? -MAX_ADJUSTMENT : 0;
    return { ...recommendation, learning_status: signal.signal, learning_sample_size: signal.outcomes, learning_success_rate: signal.successRate, learning_adjustment: adjustment, learning_reason: `${signal.signal} outcome signal from ${signal.outcomes} observed outcomes` };
  }).sort((a, b) => (b.learning_adjustment - a.learning_adjustment) || ((b.expected_impact ?? 0) - (a.expected_impact ?? 0)) || a.title.localeCompare(b.title));
}
