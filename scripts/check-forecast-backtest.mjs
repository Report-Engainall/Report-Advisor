import { readFileSync } from 'node:fs';
const file = readFileSync('src/lib/intelligence/forecastBacktest.ts', 'utf8');
for (const token of ['evaluateForecast', 'compareForecasts', 'mae', 'rmse', 'bias', 'coverage']) {
  if (!file.includes(token)) throw new Error(`Missing forecast backtest contract: ${token}`);
}
if (!file.includes('FORECAST_BACKTEST_DATA_REQUIRED')) throw new Error('Forecast minimum-data guard missing');
console.log('Forecast backtest contract: PASS');
