import type { Forecast } from './types';

export type GovernedForecast = Forecast & {
  horizonMonths: number | null;
  intervalWidth: number | null;
  intervalWidthRatio: number | null;
  provenanceStatus: 'grounded' | 'insufficient' | 'invalid';
  governanceReason: string;
};

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function horizonMonths(period: string): number | null {
  const time = Date.parse(period);
  if (!Number.isFinite(time)) return null;
  const months = Math.round((time - Date.now()) / (1000 * 60 * 60 * 24 * 30.4375));
  return Math.max(0, months);
}

export function applyForecastGovernance(forecasts: Forecast[]): GovernedForecast[] {
  return forecasts.map((forecast) => {
    const horizon = horizonMonths(forecast.period);
    const validBounds = finite(forecast.lower_bound) && finite(forecast.upper_bound) && forecast.lower_bound <= forecast.upper_bound;
    const validValue = finite(forecast.forecast_value);
    const hasModel = typeof forecast.model_name === 'string' && forecast.model_name.trim().length > 0;
    const hasPoints = Number.isFinite(forecast.data_points) && forecast.data_points > 0;
    const quality = forecast.quality_score;
    const validQuality = quality == null || (finite(quality) && quality >= 0 && quality <= 1);
    const grounded = validValue && validBounds && hasModel && hasPoints && validQuality;
    const width = grounded ? forecast.upper_bound - forecast.lower_bound : null;
    const ratio = grounded && forecast.forecast_value !== 0 && width != null ? width / Math.abs(forecast.forecast_value) : null;
    const status = !grounded ? 'invalid' : forecast.data_points < 3 ? 'insufficient' : 'grounded';
    const reason = status === 'grounded'
      ? `model=${forecast.model_name}; points=${forecast.data_points}; interval=${width}`
      : status === 'insufficient'
        ? `insufficient historical observations (${forecast.data_points})`
        : 'forecast payload failed numeric/provenance validation';
    return { ...forecast, horizonMonths: horizon, intervalWidth: width, intervalWidthRatio: ratio, provenanceStatus: status, governanceReason: reason };
  });
}
