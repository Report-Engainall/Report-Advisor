export type DecisionScoreBand = 'BLOCKED' | 'REVIEW' | 'READY' | 'HIGH_PRIORITY';

export interface DecisionScore {
  score: number | null;
  band: DecisionScoreBand;
  blockers: string[];
  factors: Record<string, number>;
}

export function calculateDecisionScore(factors: Record<string, number>, blockers: string[] = []): DecisionScore {
  const entries = Object.entries(factors);
  const invalidFactors = entries.filter(([, value]) => !Number.isFinite(value)).map(([name]) => name);
  const values = entries.map(([, value]) => value).filter((value): value is number => Number.isFinite(value));
  const normalizedBlockers = [...new Set([
    ...blockers.filter(Boolean),
    ...(invalidFactors.length ? ['INSUFFICIENT_DATA'] : []),
  ])];
  if (!values.length) return { score: null, band: 'BLOCKED', blockers: normalizedBlockers.length ? normalizedBlockers : ['INSUFFICIENT_DATA'], factors };
  const score = Math.max(0, Math.min(1, values.reduce((sum, value) => sum + value, 0) / values.length));
  const band: DecisionScoreBand = normalizedBlockers.length ? 'BLOCKED' : score >= 0.92 ? 'HIGH_PRIORITY' : score >= 0.8 ? 'READY' : 'REVIEW';
  return { score, band, blockers: normalizedBlockers, factors };
}
