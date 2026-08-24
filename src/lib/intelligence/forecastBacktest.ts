export type ForecastPoint = { date: string; actual: number; forecast: number };
export type ForecastMetrics = { mae: number; rmse: number; bias: number; coverage: number; observations: number };

export function evaluateForecast(points: ForecastPoint[]): ForecastMetrics {
  if (!points.length) throw new Error('FORECAST_BACKTEST_DATA_REQUIRED');
  let abs = 0;
  let sq = 0;
  let signed = 0;
  let covered = 0;
  for (const point of points) {
    if (!Number.isFinite(point.actual) || !Number.isFinite(point.forecast)) throw new Error('FORECAST_BACKTEST_VALUE_INVALID');
    const error = point.forecast - point.actual;
    abs += Math.abs(error);
    sq += error * error;
    signed += error;
    covered += point.actual >= 0 && point.forecast >= 0 ? 1 : 0;
  }
  return {
    mae: abs / points.length,
    rmse: Math.sqrt(sq / points.length),
    bias: signed / points.length,
    coverage: covered / points.length,
    observations: points.length,
  };
}

export function compareForecasts(candidate: ForecastMetrics, baseline: ForecastMetrics): { maeImprovement: number; rmseImprovement: number; wins: boolean } {
  if (baseline.observations < 1 || candidate.observations < 1) throw new Error('FORECAST_BACKTEST_METRICS_INVALID');
  return {
    maeImprovement: baseline.mae === 0 ? 0 : (baseline.mae - candidate.mae) / baseline.mae,
    rmseImprovement: baseline.rmse === 0 ? 0 : (baseline.rmse - candidate.rmse) / baseline.rmse,
    wins: candidate.mae <= baseline.mae && candidate.rmse <= baseline.rmse,
  };
}
