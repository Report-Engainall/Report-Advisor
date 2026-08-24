export type ForecastObservation = { actual: number; predicted: number; confidence?: number };
export type CalibrationSummary = { count: number; mae: number; bias: number; coverage: number; meanConfidence: number; calibrated: boolean };

export function calibrateForecast(observations: ForecastObservation[], tolerance = 0.2): CalibrationSummary {
  if (!observations.length) return { count: 0, mae: 0, bias: 0, coverage: 0, meanConfidence: 0, calibrated: false };
  let abs = 0, bias = 0, covered = 0, confidence = 0;
  for (const o of observations) {
    if (!Number.isFinite(o.actual) || !Number.isFinite(o.predicted)) continue;
    const error = o.predicted - o.actual;
    abs += Math.abs(error); bias += error;
    if (Math.abs(error) <= Math.max(1, Math.abs(o.actual) * tolerance)) covered += 1;
    confidence += Number.isFinite(o.confidence) ? Math.max(0, Math.min(1, o.confidence ?? 0)) : 0;
  }
  const count = observations.length;
  const mae = abs / count;
  const normalizedBias = bias / count;
  const coverage = covered / count;
  const meanConfidence = confidence / count;
  return { count, mae, bias: normalizedBias, coverage, meanConfidence, calibrated: coverage >= 0.8 && Math.abs(normalizedBias) <= Math.max(1, mae) };
}
