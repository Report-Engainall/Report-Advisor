import { qualityScore, type QualityDimensions } from './data-quality-score';

export interface QualityMetrics {
  completeness: number;
  validity: number;
  uniqueness: number;
  consistency: number;
  freshness: number;
}

export interface QualityGate {
  score: number;
  passed: boolean;
  blocking: string[];
}

/**
 * Canonical quality math lives in data-quality-score.ts.
 * This module is the policy gate adapter: it applies a configurable blocking threshold
 * without introducing a second scoring algorithm.
 */
export function evaluateQuality(m: QualityMetrics, threshold = 80): QualityGate {
  const dimensions: QualityDimensions = {
    completeness: m.completeness,
    validity: m.validity,
    uniqueness: m.uniqueness,
    consistency: m.consistency,
    timeliness: m.freshness,
  };
  const score = qualityScore(dimensions).overall;
  const blocking = (Object.entries(m) as [keyof QualityMetrics, number][])
    .filter(([, value]) => value < threshold)
    .map(([key]) => key);

  return { score, passed: blocking.length === 0, blocking };
}
