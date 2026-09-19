import type { DashboardKPIs } from '@/lib/dashboard-canonical';

export type MoneyRecoveryKind = 'COLLECTIONS' | 'INVENTORY_EXPOSURE' | 'MARGIN_PRESSURE';

export interface MoneyRecoverySignal {
  id: string;
  kind: MoneyRecoveryKind;
  title: string;
  amount: number | null;
  percent: number | null;
  state: 'ACTIONABLE' | 'WATCH' | 'INSUFFICIENT_DATA';
  path: string;
  evidence: string[];
}

export function buildMoneyRecoverySignals(kpis: DashboardKPIs | null): MoneyRecoverySignal[] {
  if (!kpis) return [];

  const signals: MoneyRecoverySignal[] = [];
  const totalReceivables = Number.isFinite(kpis.totalReceivables) ? kpis.totalReceivables : null;
  const overdue = Number.isFinite(kpis.overdueReceivables) ? kpis.overdueReceivables : null;
  if (totalReceivables != null && overdue != null && overdue > 0) {
    const ratio = totalReceivables === 0 ? null : overdue / totalReceivables * 100;
    signals.push({
      id: 'cash-collection',
      kind: 'COLLECTIONS',
      title: 'نقد متأخر يمكن تحويله إلى تحصيل',
      amount: overdue,
      percent: ratio,
      state: ratio != null && ratio >= 20 ? 'ACTIONABLE' : 'WATCH',
      path: '/reports/receivables',
      evidence: ['get_dashboard_snapshot', `overdueReceivables=${overdue}`, `totalReceivables=${totalReceivables}`],
    });
  }

  const inventory = Number.isFinite(kpis.inventoryValue) ? kpis.inventoryValue : null;
  const sales = Number.isFinite(kpis.totalSales) ? kpis.totalSales : null;
  if (inventory != null && inventory > 0) {
    const ratio = sales != null && sales > 0 ? inventory / sales * 100 : null;
    signals.push({
      id: 'inventory-exposure',
      kind: 'INVENTORY_EXPOSURE',
      title: 'رأس مال داخل المخزون يحتاج قراءة تشغيلية',
      amount: inventory,
      percent: ratio,
      state: ratio != null && ratio >= 40 ? 'ACTIONABLE' : 'WATCH',
      path: '/reports/inventory-intelligence',
      evidence: ['get_dashboard_snapshot', `inventoryValue=${inventory}`],
    });
  }

  const margin = typeof kpis.grossMargin === 'number' && Number.isFinite(kpis.grossMargin) ? kpis.grossMargin : null
  if (margin != null) {
    if (margin < 20) {
      signals.push({
        id: 'margin-pressure',
        kind: 'MARGIN_PRESSURE',
        title: 'ضغط على هامش الربح يحتاج فحصًا',
        amount: null,
        percent: margin,
        state: margin < 10 ? 'ACTIONABLE' : 'WATCH',
        path: '/reports/profitability',
        evidence: ['get_dashboard_snapshot', `grossMargin=${margin}`],
      });
    }
  }

  return signals;
}
