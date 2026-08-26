export type DecisionScoreBand = 'BLOCKED' | 'REVIEW' | 'READY' | 'HIGH_PRIORITY';

export type DecisionScoreInput = Record<string, number>;

export interface DecisionScore {
  score: number;
  band: DecisionScoreBand;
  blockers: string[];
  factors: DecisionScoreInput;
}

export function calculateDecisionScore(factors: DecisionScoreInput, blockers: string[] = []): DecisionScore {
  const values = Object.values(factors).filter((value): value is number => Number.isFinite(value));
  const score = values.length ? Math.max(0, Math.min(1, values.reduce((sum, value) => sum + value, 0) / values.length)) : 0;
  const normalizedBlockers = [...new Set(blockers.filter(Boolean))];
  const band: DecisionScoreBand = normalizedBlockers.length ? 'BLOCKED' : score >= 0.92 ? 'HIGH_PRIORITY' : score >= 0.8 ? 'READY' : 'REVIEW';
  return { score, band, blockers: normalizedBlockers, factors };
}