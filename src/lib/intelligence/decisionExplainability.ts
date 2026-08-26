import type { DecisionScore } from './decisionScore';

export type DecisionEvidence = {
  key: keyof DecisionScore['factors'] | string;
  value: number | string;
  source: string;
  freshness: number;
  impact: 'positive' | 'negative' | 'blocking';
};

export type ExplainableDecision = {
  summary: string;
  evidence: DecisionEvidence[];
  blockers: string[];
  confidence: number;
  decisionFingerprint: string;
};

export function explainDecision(result: DecisionScore, evidence: DecisionEvidence[]): ExplainableDecision {
  const blockers = [...new Set(result.blockers)];
  const evidenceConfidence = evidence.length === 0 ? 0 : evidence.reduce((sum, item) => sum + clamp(item.freshness), 0) / evidence.length;
  const score = result.score;
  if (score === null) blockers.push('DECISION_SCORE_INSUFFICIENT_DATA');
  const confidence = score === null ? 0 : clamp(score * 0.7 + evidenceConfidence * 0.3);
  const normalizedBlockers = [...new Set(blockers)];
  const summary = normalizedBlockers.length
    ? `BLOCKED: ${normalizedBlockers.join(', ')}`
    : `${result.band}: score=${score!.toFixed(3)}, confidence=${confidence.toFixed(3)}`;
  const decisionFingerprint = stableFingerprint({ score, band: result.band, blockers: normalizedBlockers, evidence: evidence.map(({ key, value, source }) => ({ key, value, source })) });
  return { summary, evidence, blockers: normalizedBlockers, confidence, decisionFingerprint };
}

function clamp(value: number): number { return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)); }
function stableFingerprint(value: unknown): string {
  const input = JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) hash = Math.imul(hash ^ input.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
}
