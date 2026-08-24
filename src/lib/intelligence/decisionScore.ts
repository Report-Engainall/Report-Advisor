export type DecisionScoreInput = {
  demandPressure: number;
  velocity: number;
  stockoutExposure: number;
  alternativeAvailability: number;
  forecastConfidence: number;
  liquiditySafety: number;
  scenarioSafety: number;
  freshness: number;
};

export type DecisionScore = {
  score: number;
  band: 'BLOCKED' | 'CAUTION' | 'READY' | 'HIGH_PRIORITY';
  components: Record<keyof DecisionScoreInput, number>;
  blockers: string[];
  rationale: string[];
};

const clamp = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function calculateDecisionScore(input: DecisionScoreInput): DecisionScore {
  const components = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, clamp(value)])
  ) as Record<keyof DecisionScoreInput, number>;

  const blockers: string[] = [];
  if (components.forecastConfidence < 0.5) blockers.push('LOW_FORECAST_CONFIDENCE');
  if (components.liquiditySafety < 0.5) blockers.push('LIQUIDITY_UNSAFE');
  if (components.scenarioSafety < 0.5) blockers.push('SCENARIO_UNSAFE');
  if (components.freshness < 0.5) blockers.push('STALE_EVIDENCE');

  const score = clamp(
    components.demandPressure * 0.18 +
    components.velocity * 0.12 +
    components.stockoutExposure * 0.18 +
    (1 - components.alternativeAvailability) * 0.10 +
    components.forecastConfidence * 0.14 +
    components.liquiditySafety * 0.12 +
    components.scenarioSafety * 0.10 +
    components.freshness * 0.06
  );

  const band = blockers.length > 0
    ? 'BLOCKED'
    : score >= 0.8 ? 'HIGH_PRIORITY'
    : score >= 0.6 ? 'READY'
    : 'CAUTION';

  const rationale: string[] = [];
  if (components.demandPressure >= 0.7) rationale.push('DEMAND_PRESSURE_HIGH');
  if (components.velocity >= 0.7) rationale.push('VELOCITY_HIGH');
  if (components.stockoutExposure >= 0.7) rationale.push('STOCKOUT_EXPOSURE_HIGH');
  if (components.alternativeAvailability >= 0.7) rationale.push('ALTERNATIVE_STOCK_AVAILABLE');
  if (components.liquiditySafety < 0.7) rationale.push('LIQUIDITY_REQUIRES_ATTENTION');
  if (components.freshness < 0.7) rationale.push('EVIDENCE_FRESHNESS_REQUIRES_ATTENTION');

  return { score, band, components, blockers, rationale: [...new Set(rationale)] };
}

export function canAutomateDecision(result: DecisionScore, minimumScore = 0.8): boolean {
  return result.blockers.length === 0 && result.score >= minimumScore && result.band === 'HIGH_PRIORITY';
}
