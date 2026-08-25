export type TrustDimension =
  | 'data'
  | 'extraction'
  | 'mapping'
  | 'entityResolution'
  | 'validation'
  | 'calculation'
  | 'forecast'
  | 'decision';

export interface TrustVector {
  data: number;
  extraction: number;
  mapping: number;
  entityResolution: number;
  validation: number;
  calculation: number;
  forecast: number;
  decision: number;
}

export type FreshnessState = 'FRESH' | 'WARNING' | 'STALE' | 'CRITICAL' | 'UNKNOWN';
export type DecisionPermission = 'ALLOW' | 'ALLOW_WITH_WARNING' | 'BLOCK';

export interface FreshnessPolicy {
  warningMinutes: number;
  staleMinutes: number;
  criticalMinutes: number;
}

export interface FreshnessEvaluation {
  state: FreshnessState;
  ageMinutes: number | null;
  dataAsOf: string | null;
  lastSync: string | null;
  permission: DecisionPermission;
  reason?: string;
}

const clamp = (value: number): number => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function normalizeTrustVector(input: Partial<TrustVector>): TrustVector {
  return {
    data: clamp(input.data ?? 0),
    extraction: clamp(input.extraction ?? 0),
    mapping: clamp(input.mapping ?? 0),
    entityResolution: clamp(input.entityResolution ?? 0),
    validation: clamp(input.validation ?? 0),
    calculation: clamp(input.calculation ?? 0),
    forecast: clamp(input.forecast ?? 0),
    decision: clamp(input.decision ?? 0),
  };
}

/** Conservative geometric trust: a weak critical dimension cannot be hidden by strong dimensions. */
export function overallTrust(input: Partial<TrustVector>): number {
  const v = normalizeTrustVector(input);
  const values = Object.values(v);
  const product = values.reduce((acc, value) => acc * value, 1);
  return Math.pow(product, 1 / values.length);
}

export function evaluateFreshness(
  lastSync: string | null | undefined,
  now = new Date(),
  policy: FreshnessPolicy = { warningMinutes: 120, staleMinutes: 1440, criticalMinutes: 10080 },
): FreshnessEvaluation {
  if (!lastSync) {
    return { state: 'UNKNOWN', ageMinutes: null, dataAsOf: null, lastSync: null, permission: 'BLOCK', reason: 'No authoritative source freshness timestamp is available.' };
  }
  const timestamp = Date.parse(lastSync);
  if (!Number.isFinite(timestamp)) {
    return { state: 'UNKNOWN', ageMinutes: null, dataAsOf: lastSync, lastSync, permission: 'BLOCK', reason: 'Source freshness timestamp is invalid.' };
  }
  const ageMinutes = Math.max(0, (now.getTime() - timestamp) / 60000);
  if (ageMinutes <= policy.warningMinutes) return { state: 'FRESH', ageMinutes, dataAsOf: lastSync, lastSync, permission: 'ALLOW' };
  if (ageMinutes <= policy.staleMinutes) return { state: 'WARNING', ageMinutes, dataAsOf: lastSync, lastSync, permission: 'ALLOW_WITH_WARNING', reason: 'Data is older than the preferred freshness window.' };
  if (ageMinutes <= policy.criticalMinutes) return { state: 'STALE', ageMinutes, dataAsOf: lastSync, lastSync, permission: 'BLOCK', reason: 'Data is too stale for automated action.' };
  return { state: 'CRITICAL', ageMinutes, dataAsOf: lastSync, lastSync, permission: 'BLOCK', reason: 'Data freshness is critically old.' };
}

export function trustAllowsDecision(trust: Partial<TrustVector>, freshness: FreshnessEvaluation, minimum = 0.7): boolean {
  return overallTrust(trust) >= minimum && freshness.permission !== 'BLOCK';
}
