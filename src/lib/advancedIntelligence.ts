export interface Observation { id: string; value: number; date?: string; }
export interface ForecastResult { horizon: number; values: number[]; method: 'MOVING_AVERAGE' | 'WEIGHTED_AVERAGE'; confidence: number; insufficient: boolean; }
export interface BacktestResult { mae: number | null; rmse: number | null; mape: number | null; samples: number; ready: boolean; }
export interface ABCXYZItem { id: string; value: number; share: number; cumulativeShare: number; abc: 'A' | 'B' | 'C'; variability: number | null; xyz: 'X' | 'Y' | 'Z'; classCode: string; }
export interface FsnItem { id: string; velocity: number; fsn: 'F' | 'S' | 'N'; }
export interface Anomaly { id: string; value: number; zScore: number; direction: 'HIGH' | 'LOW'; severity: 'WARNING' | 'CRITICAL'; }
export interface Opportunity { id: string; type: 'CROSS_SELL' | 'MARGIN' | 'DEAD_STOCK' | 'CASH_RELEASE'; score: number; estimatedValue: number; reason: string; }
export interface TrendAnalysis { direction: 'UP' | 'DOWN' | 'FLAT'; slope: number; strength: number; points: number; }

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const mean = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const std = (a: number[]) => { const m = mean(a); return m == null ? null : Math.sqrt(mean(a.map(v => (v - m) ** 2))!); };
const clamp = (n: number) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const positiveInt = (n: number, fallback: number) => Number.isInteger(n) && n > 0 ? n : fallback;

export function analyzeTrend(points: Observation[]): TrendAnalysis {
  const clean = points.filter(p => finite(p.value)); const n = clean.length;
  if (n < 2) return { direction: 'FLAT', slope: 0, strength: 0, points: n };
  const xMean = (n - 1) / 2; const yMean = clean.reduce((s, p) => s + p.value, 0) / n;
  const numerator = clean.reduce((s, p, i) => s + (i - xMean) * (p.value - yMean), 0);
  const denominator = clean.reduce((s, _p, i) => s + (i - xMean) ** 2, 0) || 1;
  const slope = numerator / denominator;
  const strength = clamp(Math.abs(slope) / Math.max(Math.abs(yMean), 1e-9) * n);
  return { direction: slope > 1e-9 ? 'UP' : slope < -1e-9 ? 'DOWN' : 'FLAT', slope, strength, points: n };
}

export function forecastSeries(values: number[], horizon: number, window = 7): ForecastResult {
  const safeHorizon = positiveInt(horizon, 1); const safeWindow = positiveInt(window, 7);
  const clean = values.filter(finite).map(Number);
  if (clean.length < Math.max(3, safeWindow)) return { horizon: safeHorizon, values: [], method: 'MOVING_AVERAGE', confidence: 0, insufficient: true };
  const recent = clean.slice(-Math.min(safeWindow, clean.length));
  const weights = recent.map((_, i) => i + 1); const denominator = weights.reduce((a, b) => a + b, 0);
  const base = recent.reduce((sum, value, i) => sum + value * weights[i], 0) / denominator;
  const volatility = (std(recent) ?? 0) / Math.max(Math.abs(mean(recent) ?? 0), 1e-9);
  return { horizon: safeHorizon, values: Array.from({ length: safeHorizon }, () => Math.max(0, base)), method: 'WEIGHTED_AVERAGE', confidence: clamp(1 - volatility), insufficient: false };
}

export function backtestForecast(values: number[], window = 7): BacktestResult {
  const safeWindow = positiveInt(window, 7); const clean = values.filter(finite);
  if (clean.length < safeWindow + 3) return { mae: null, rmse: null, mape: null, samples: 0, ready: false };
  const errors: number[] = []; const pctErrors: number[] = [];
  for (let i = safeWindow; i < clean.length; i++) {
    const prediction = mean(clean.slice(i - safeWindow, i))!; const error = prediction - clean[i];
    errors.push(Math.abs(error)); if (clean[i] !== 0) pctErrors.push(Math.abs(error / clean[i]) * 100);
  }
  return { mae: mean(errors)!, rmse: Math.sqrt(mean(errors.map(e => e ** 2))!), mape: mean(pctErrors), samples: errors.length, ready: errors.length >= 3 };
}

export function classifyABCXYZ(items: Array<{ id: string; value: number; history: number[] }>): ABCXYZItem[] {
  const normalized = items.map((item, index) => ({ ...item, index, value: Math.max(0, finite(item.value) ? item.value : 0) }));
  const total = normalized.reduce((s, i) => s + i.value, 0);
  const sorted = [...normalized].sort((a, b) => b.value - a.value || a.index - b.index); let cumulative = 0;
  return sorted.map(item => {
    const share = total ? item.value / total : 0; cumulative += share;
    // Boundary is assigned to the class reached by the cumulative curve; this keeps classes monotonic.
    const abc: ABCXYZItem['abc'] = cumulative <= .8 ? 'A' : cumulative <= .95 ? 'B' : 'C';
    const history = item.history.filter(finite); const avg = mean(history);
    const variability = avg != null && avg !== 0 ? (std(history) ?? 0) / Math.abs(avg) : null;
    const xyz: ABCXYZItem['xyz'] = variability == null ? 'Z' : variability <= .1 ? 'X' : variability <= .25 ? 'Y' : 'Z';
    return { id: item.id, value: item.value, share, cumulativeShare: cumulative, abc, variability, xyz, classCode: `${abc}${xyz}` };
  });
}

export function classifyFSN(items: Array<{ id: string; unitsSold: number; days: number }>): FsnItem[] {
  return items.map(i => { const velocity = i.days > 0 && finite(i.unitsSold) ? Math.max(0, i.unitsSold) / i.days : 0; const fsn: FsnItem['fsn'] = velocity >= 1 ? 'F' : velocity >= .1 ? 'S' : 'N'; return { id: i.id, velocity, fsn }; });
}

export function detectAnomalies(items: Observation[], zThreshold = 3): Anomaly[] {
  const threshold = Number.isFinite(zThreshold) && zThreshold > 0 ? zThreshold : 3;
  const values = items.map(i => i.value).filter(finite); const m = mean(values); const s = std(values);
  if (m == null || !s || s === 0) return [];
  return items.filter(i => finite(i.value)).map(i => {
    const zScore = (i.value - m) / s; const direction: Anomaly['direction'] = i.value >= m ? 'HIGH' : 'LOW';
    const severity: Anomaly['severity'] = Math.abs(zScore) >= threshold * 1.5 ? 'CRITICAL' : 'WARNING';
    return { id: i.id, value: i.value, zScore, direction, severity };
  }).filter(a => Math.abs(a.zScore) >= threshold);
}

export function opportunityScan(input: { crossSell: Array<{ id: string; value: number; coPurchaseRate: number }>; margin: Array<{ id: string; sales: number; marginPct: number; benchmarkPct: number }>; deadStock: Array<{ id: string; value: number; daysIdle: number }>; idleCash: Array<{ id: string; value: number; velocity: number }> }): Opportunity[] {
  const result: Opportunity[] = [];
  for (const x of input.crossSell) if (finite(x.coPurchaseRate) && x.coPurchaseRate > .2) result.push({ id: x.id, type: 'CROSS_SELL', score: clamp(x.coPurchaseRate), estimatedValue: Math.max(0, x.value) * x.coPurchaseRate, reason: 'High co-purchase rate' });
  for (const x of input.margin) if (finite(x.marginPct) && finite(x.benchmarkPct) && x.marginPct < x.benchmarkPct) result.push({ id: x.id, type: 'MARGIN', score: clamp((x.benchmarkPct - x.marginPct) / 100), estimatedValue: Math.max(0, x.sales) * Math.max(0, x.benchmarkPct - x.marginPct) / 100, reason: 'Margin below benchmark' });
  for (const x of input.deadStock) if (finite(x.daysIdle) && x.daysIdle >= 90) result.push({ id: x.id, type: 'DEAD_STOCK', score: clamp(x.daysIdle / 365), estimatedValue: Math.max(0, x.value), reason: 'Stock idle for 90+ days' });
  for (const x of input.idleCash) if (finite(x.velocity) && x.velocity < .1) result.push({ id: x.id, type: 'CASH_RELEASE', score: clamp(1 - x.velocity), estimatedValue: Math.max(0, x.value), reason: 'Capital tied in low-velocity inventory' });
  return result.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function unifiedConfidence(input: { data: number; mapping: number; calculation: number; forecast: number; recommendation: number }): number {
  const weights = { data: .25, mapping: .15, calculation: .2, forecast: .2, recommendation: .2 };
  const score = input.data * weights.data + input.mapping * weights.mapping + input.calculation * weights.calculation + input.forecast * weights.forecast + input.recommendation * weights.recommendation;
  return Math.round(clamp(score) * 100) / 100;
}
