import type { DecisionLearningSignal } from './decision-learning';

export type AlternativeCandidate = {
  memberId: string;
  sku: string;
  conversionFactor: number;
  productId: string | null;
  productName: string | null;
  unit: string | null;
  productActive: boolean;
  costPrice: number | null;
  sellingPrice: number | null;
};

export type RankedAlternative = AlternativeCandidate & {
  rank: number;
  baseScore: number;
  learningAdjustment: number;
  finalScore: number;
  learningStatus: DecisionLearningSignal['signal'] | 'unavailable';
  learningSampleSize: number;
  reason: string;
};

const MIN_SAMPLES = 3;
const MAX_ADJUSTMENT = 0.15;

export function rankAlternativeCandidates(
  candidates: AlternativeCandidate[],
  learning?: DecisionLearningSignal | null,
): RankedAlternative[] {
  const signal = learning && learning.outcomes >= MIN_SAMPLES && learning.signal !== 'insufficient' ? learning : null;
  const adjustment = signal?.signal === 'positive' ? MAX_ADJUSTMENT : signal?.signal === 'negative' ? -MAX_ADJUSTMENT : 0;
  return candidates
    .map((candidate) => {
      const activeScore = candidate.productActive ? 1 : 0;
      const conversionScore = 1 / (1 + Math.abs(candidate.conversionFactor - 1));
      const baseScore = activeScore * 0.7 + conversionScore * 0.3;
      return {
        ...candidate,
        rank: 0,
        baseScore,
        learningAdjustment: adjustment,
        finalScore: baseScore + adjustment,
        learningStatus: signal?.signal ?? learning?.signal ?? 'unavailable',
        learningSampleSize: signal?.outcomes ?? learning?.outcomes ?? 0,
        reason: signal
          ? `${signal.signal} learning signal from ${signal.outcomes} observed outcomes`
          : learning
            ? `learning sample below governance threshold (${learning.outcomes}/${MIN_SAMPLES})`
            : 'deterministic alternative ranking; no learning signal',
      };
    })
    .sort((a, b) => (b.finalScore - a.finalScore) || (b.baseScore - a.baseScore) || a.sku.localeCompare(b.sku))
    .map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}
