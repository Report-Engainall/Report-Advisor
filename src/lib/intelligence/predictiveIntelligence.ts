import { backtestForecast, forecastSeries, analyzeTrend, type BacktestResult, type ForecastResult, type TrendAnalysis } from '../advancedIntelligence';
import { scoreCustomer, decideReplenishment, type CustomerScore, type InventoryDecision } from '../businessIntelligenceEngines';

export interface PredictiveSeriesInput { id: string; history: number[]; horizon?: number; window?: number; }
export interface PredictiveSeriesResult { id: string; forecast: ForecastResult; backtest: BacktestResult; trend: TrendAnalysis; confidence: number; status: 'READY' | 'INSUFFICIENT_DATA' | 'LOW_CONFIDENCE'; }
export interface CustomerChurnInput { id: string; recencyDays: number; orders: number; revenue: number; }
export interface CustomerChurnResult { id: string; score: CustomerScore; churnRisk: 'LOW' | 'MEDIUM' | 'HIGH'; confidence: number; reason: string; }
export interface StockoutForecast { id: string; daysToStockout: number | null; risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'; confidence: number; }

export function buildPredictiveIntelligence(input: {
  series?: PredictiveSeriesInput[];
  customers?: CustomerChurnInput[];
  stock?: Array<{ id: string; onHand: number; avgDailyDemand: number; leadTimeDays: number }>;
}): { series: PredictiveSeriesResult[]; churn: CustomerChurnResult[]; stockout: StockoutForecast[]; warnings: string[] } {
  const warnings: string[] = [];
  const series = (input.series ?? []).map(item => {
    const values = item.history.filter(Number.isFinite);
    const horizon = Math.max(1, item.horizon ?? 30);
    const window = Math.max(3, item.window ?? 7);
    const forecast = forecastSeries(values, horizon, window);
    const backtest = backtestForecast(values, window);
    const trend = analyzeTrend(values.map((value, index) => ({ date: String(index), value })));
    const confidence = backtest.ready ? Math.max(0, Math.min(1, forecast.confidence * (1 - Math.min(1, (backtest.mape ?? 100) / 100)))) : 0;
    const status = forecast.insufficient ? 'INSUFFICIENT_DATA' : confidence < 0.5 ? 'LOW_CONFIDENCE' : 'READY';
    return { id: item.id, forecast, backtest, trend, confidence, status };
  });
  if (series.some(x => x.status === 'INSUFFICIENT_DATA')) warnings.push('بعض السلاسل لا تحتوي تاريخًا كافيًا لتوقع موثوق.');
  if (series.some(x => x.status === 'LOW_CONFIDENCE')) warnings.push('بعض التوقعات منخفضة الثقة؛ لا تستخدم لاتخاذ قرار تلقائي.');

  const churn = (input.customers ?? []).map(customer => {
    const score = scoreCustomer(customer);
    const riskScore = Math.max(0, Math.min(100, 100 - score.score));
    const churnRisk = riskScore >= 60 ? 'HIGH' : riskScore >= 35 ? 'MEDIUM' : 'LOW';
    const reason = score.segment === 'INACTIVE' ? 'العميل غير نشط لفترة طويلة' : score.segment === 'AT_RISK' ? 'انخفاض الحداثة/النشاط' : 'لا توجد إشارة قوية على التسرب';
    return { id: customer.id, score, churnRisk, confidence: customer.orders >= 3 ? 0.8 : 0.45, reason };
  });

  const stockout = (input.stock ?? []).map(item => {
    const onHand = Math.max(0, item.onHand); const demand = Math.max(0, item.avgDailyDemand);
    if (demand <= 0) return { id: item.id, daysToStockout: null, risk: 'UNKNOWN' as const, confidence: 0 };
    const daysToStockout = onHand / demand;
    const risk = daysToStockout <= Math.max(1, item.leadTimeDays) ? 'HIGH' : daysToStockout <= item.leadTimeDays + 7 ? 'MEDIUM' : 'LOW';
    return { id: item.id, daysToStockout, risk, confidence: demand > 0 ? 0.75 : 0 };
  });
  if (stockout.some(x => x.risk === 'UNKNOWN')) warnings.push('لا يمكن تقدير نفاد بعض الأصناف بسبب غياب أساس الطلب.');
  return { series, churn, stockout, warnings };
}
