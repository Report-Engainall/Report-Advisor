export type DecisionAction = 'BUY_NOW' | 'BUY_SOON' | 'MONITOR' | 'DO_NOT_BUY' | 'OVERSTOCK' | 'COLLECT_NOW' | 'COLLECT_SOON' | 'HOLD_PAYMENT' | 'PAY_NOW' | 'PAY_SOON';

export interface AgingBucket { label: string; minDays: number; maxDays: number | null; amount: number; count: number; }
export interface AgingItem { amount: number; dueDate?: string | null; asOf?: string; }
export interface TrendPoint { date: string; value: number; }
export interface TrendAnalysis { direction: 'UP' | 'DOWN' | 'FLAT' | 'INSUFFICIENT_DATA'; velocity: number | null; acceleration: number | null; volatility: number | null; seasonalityHint: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'; }
export interface InventoryDecision { action: DecisionAction; suggestedQuantity: number; coverageDays: number | null; reason: string; confidence: number; }
export interface CustomerScore { recency: number; frequency: number; monetary: number; inactivityDays: number; segment: 'CHAMPION' | 'LOYAL' | 'AT_RISK' | 'INACTIVE' | 'NEW' | 'OTHER'; score: number; }
export interface SupplierScore { score: number; deliveryRisk: number; priceRisk: number; dependencyRisk: number; priority: 'CRITICAL' | 'HIGH' | 'NORMAL'; }
export interface LiquidityProjection { horizonDays: number; openingLiquidity: number; expectedInflow: number; expectedOutflow: number; projectedLiquidity: number; gap: number; status: 'SAFE' | 'WATCH' | 'GAP'; }
export interface CashConversionCycle { dso: number | null; dio: number | null; dpo: number | null; ccc: number | null; status: 'READY' | 'INSUFFICIENT_DATA'; }
export interface WhatIfResult { baseline: number; scenario: number; delta: number; deltaPct: number | null; assumptions: string[]; }

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : 0));
const safeDiv = (a: number, b: number) => b === 0 ? null : a / b;
const mean = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;

export function buildAgingBuckets(items: AgingItem[], asOf = new Date()): AgingBucket[] {
  const ranges = [
    ['0-30', 0, 30], ['31-60', 31, 60], ['61-90', 61, 90], ['91-180', 91, 180], ['180+', 181, null],
  ] as const;
  const buckets = ranges.map(([label, minDays, maxDays]) => ({ label, minDays, maxDays, amount: 0, count: 0 }));
  for (const item of items) {
    if (!Number.isFinite(item.amount)) continue;
    const days = item.dueDate ? Math.max(0, Math.floor((asOf.getTime() - new Date(item.dueDate).getTime()) / 86400000)) : null;
    const bucket = days == null ? buckets[0] : buckets.find(b => days >= b.minDays && (b.maxDays == null || days <= b.maxDays));
    if (bucket) { bucket.amount += item.amount; bucket.count += 1; }
  }
  return buckets;
}

export function analyzeTrend(points: TrendPoint[]): TrendAnalysis {
  const values = points.map(p => p.value).filter(Number.isFinite);
  if (values.length < 3) return { direction: 'INSUFFICIENT_DATA', velocity: null, acceleration: null, volatility: null, seasonalityHint: 'UNKNOWN' };
  const n = values.length;
  const half = Math.max(1, Math.floor(n / 2));
  const first = mean(values.slice(0, half))!;
  const last = mean(values.slice(-half))!;
  const velocity = safeDiv(last - first, Math.max(1, half));
  const prevVelocity = safeDiv(values[n - 2] - values[0], Math.max(1, n - 2));
  const acceleration = velocity != null && prevVelocity != null ? velocity - prevVelocity : null;
  const avg = mean(values)!;
  const variance = mean(values.map(v => (v - avg) ** 2))!;
  const volatility = avg === 0 ? 0 : Math.sqrt(variance) / Math.abs(avg);
  const direction = Math.abs(last - first) <= Math.max(1e-9, Math.abs(avg) * 0.02) ? 'FLAT' : last > first ? 'UP' : 'DOWN';
  return { direction, velocity, acceleration, volatility, seasonalityHint: volatility > 0.5 ? 'HIGH' : volatility > 0.2 ? 'MEDIUM' : 'LOW' };
}

export function decideReplenishment(input: { onHand: number; reserved?: number; onOrder?: number; avgDailyDemand: number; leadTimeDays: number; safetyDays?: number; maxStockDays?: number; }): InventoryDecision {
  const reserved = Math.max(0, input.reserved ?? 0);
  const onOrder = Math.max(0, input.onOrder ?? 0);
  const available = Math.max(0, input.onHand - reserved);
  if (input.avgDailyDemand <= 0) return { action: available > 0 ? 'MONITOR' : 'DO_NOT_BUY', suggestedQuantity: 0, coverageDays: null, reason: 'No valid demand baseline', confidence: 35 };
  const coverageDays = available / input.avgDailyDemand;
  const safetyDays = Math.max(0, input.safetyDays ?? 7);
  const targetDays = Math.max(safetyDays, input.leadTimeDays + safetyDays);
  const required = Math.max(0, input.avgDailyDemand * targetDays - available - onOrder);
  const maxDays = input.maxStockDays ?? targetDays * 2.5;
  if (coverageDays > maxDays && onOrder > 0) return { action: 'OVERSTOCK', suggestedQuantity: 0, coverageDays, reason: 'Projected coverage exceeds maximum target and stock is already on order', confidence: 86 };
  if (coverageDays <= input.leadTimeDays) return { action: 'BUY_NOW', suggestedQuantity: Math.ceil(required), coverageDays, reason: 'Available stock does not cover lead time', confidence: 88 };
  if (coverageDays <= targetDays) return { action: 'BUY_SOON', suggestedQuantity: Math.ceil(required), coverageDays, reason: 'Coverage is approaching safety target', confidence: 82 };
  return { action: 'MONITOR', suggestedQuantity: 0, coverageDays, reason: 'Current coverage is above target', confidence: 84 };
}

export function scoreCustomer(input: { recencyDays: number; orders: number; revenue: number; inactivityThresholdDays?: number }): CustomerScore {
  const threshold = Math.max(1, input.inactivityThresholdDays ?? 90);
  const recency = clamp(100 - (Math.max(0, input.recencyDays) / threshold) * 100);
  const frequency = clamp(input.orders * 10);
  const monetary = clamp(input.revenue <= 0 ? 0 : 50 + Math.log10(input.revenue + 1) * 10);
  const score = Math.round(recency * 0.4 + frequency * 0.25 + monetary * 0.35);
  const segment = input.orders <= 1 && input.recencyDays <= 30 ? 'NEW' : input.recencyDays > threshold * 1.5 ? 'INACTIVE' : input.recencyDays > threshold ? 'AT_RISK' : score >= 80 ? 'CHAMPION' : score >= 60 ? 'LOYAL' : 'OTHER';
  return { recency, frequency, monetary, inactivityDays: input.recencyDays, segment, score };
}

export function scoreSupplier(input: { avgDeliveryDelayDays: number; priceVariationPct: number; dependencyPct: number }): SupplierScore {
  const deliveryRisk = clamp(input.avgDeliveryDelayDays * 12);
  const priceRisk = clamp(Math.abs(input.priceVariationPct) * 2);
  const dependencyRisk = clamp(input.dependencyPct);
  const risk = deliveryRisk * 0.35 + priceRisk * 0.25 + dependencyRisk * 0.4;
  return { score: Math.round(100 - risk), deliveryRisk, priceRisk, dependencyRisk, priority: risk >= 70 ? 'CRITICAL' : risk >= 45 ? 'HIGH' : 'NORMAL' };
}

export function projectLiquidity(input: { openingLiquidity: number; horizons: number[]; dailyInflow: number; dailyOutflow: number; committedOutflow?: number }): LiquidityProjection[] {
  const committed = Math.max(0, input.committedOutflow ?? 0);
  return [...input.horizons].sort((a, b) => a - b).map(horizonDays => {
    const expectedInflow = Math.max(0, input.dailyInflow) * horizonDays;
    const expectedOutflow = Math.max(0, input.dailyOutflow) * horizonDays + committed;
    const projectedLiquidity = input.openingLiquidity + expectedInflow - expectedOutflow;
    const gap = Math.max(0, -projectedLiquidity);
    return { horizonDays, openingLiquidity: input.openingLiquidity, expectedInflow, expectedOutflow, projectedLiquidity, gap, status: gap > 0 ? 'GAP' : projectedLiquidity < input.openingLiquidity * 0.2 ? 'WATCH' : 'SAFE' };
  });
}

export function cashConversionCycle(input: { receivables: number; revenue: number; inventory: number; costOfSales: number; payables: number; purchases: number; periodDays?: number }): CashConversionCycle {
  const days = input.periodDays ?? 365;
  const dso = input.revenue > 0 ? input.receivables / input.revenue * days : null;
  const dio = input.costOfSales > 0 ? input.inventory / input.costOfSales * days : null;
  const dpo = input.purchases > 0 ? input.payables / input.purchases * days : null;
  if (dso == null || dio == null || dpo == null) return { dso, dio, dpo, ccc: null, status: 'INSUFFICIENT_DATA' };
  return { dso, dio, dpo, ccc: dso + dio - dpo, status: 'READY' };
}

export function whatIf(input: { baseline: number; changes: Array<{ label: string; pct: number }> }): WhatIfResult {
  let scenario = input.baseline;
  for (const change of input.changes) scenario *= 1 + change.pct / 100;
  return { baseline: input.baseline, scenario, delta: scenario - input.baseline, deltaPct: input.baseline === 0 ? null : (scenario - input.baseline) / Math.abs(input.baseline) * 100, assumptions: input.changes.map(c => `${c.label}: ${c.pct}%`) };
}
