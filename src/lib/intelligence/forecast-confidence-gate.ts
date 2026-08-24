export type ForecastQuality = { mae: number; rmse: number; bias: number; coverage: number; observations: number; baselineMae: number; baselineRmse: number };
export type ForecastGate = { allowed: boolean; confidence: number; reasons: string[] };

export function evaluateForecastGate(q: ForecastQuality, minimumObservations = 14): ForecastGate {
  const reasons: string[] = [];
  if (!Number.isFinite(q.mae) || !Number.isFinite(q.rmse) || !Number.isFinite(q.bias)) reasons.push('INVALID_ERROR_METRICS');
  if (!Number.isFinite(q.coverage) || q.coverage < 0.6) reasons.push('INSUFFICIENT_COVERAGE');
  if (q.observations < minimumObservations) reasons.push('INSUFFICIENT_OBSERVATIONS');
  if (Number.isFinite(q.baselineMae) && q.mae > q.baselineMae * 1.05) reasons.push('MODEL_NOT_BETTER_THAN_BASELINE');
  if (Math.abs(q.bias) > Math.max(1, q.rmse * 0.75)) reasons.push('EXCESSIVE_BIAS');
  const errorConfidence = Number.isFinite(q.baselineMae) && q.baselineMae > 0 ? Math.max(0, Math.min(1, 1 - q.mae / q.baselineMae)) : Math.max(0, Math.min(1, q.coverage));
  const confidence = Math.max(0, Math.min(1, errorConfidence * 0.6 + Math.max(0, Math.min(1, q.coverage)) * 0.4));
  return { allowed: reasons.length === 0 && confidence >= 0.5, confidence, reasons };
}
