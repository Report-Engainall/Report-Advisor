import type { InventoryBalance, SaleItem, SalesInvoice } from '@/lib/types';

export interface DemandForecastRow {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  stock: number;
  avgDaily30: number;
  avgDaily90: number;
  weightedDailyDemand: number;
  trendPct: number;
  minStock: number;
  reorderPoint: number;
  safetyStock: number;
  leadTimeDays: number;
  stockoutDate: string | null;
  daysCover: number | null;
  order7d: number;
  order15d: number;
  order30d: number;
  priority: 'critical' | 'high' | 'medium' | 'normal';
  recommendation: string;
}

function dayKey(value: string) { return value.slice(0, 10); }
function daysAgo(n: number) { return new Date(Date.now() - n * 86400000).toISOString().slice(0, 10); }

export function buildDemandForecast(
  balances: InventoryBalance[],
  invoices: SalesInvoice[],
  items: SaleItem[],
  leadTimeDays = 7,
): DemandForecastRow[] {
  const invoiceDate = new Map(invoices.map(i => [i.id, dayKey(i.invoice_date)]));
  const demand = new Map<string, { d30: number; d90: number }>();
  const cutoff30 = daysAgo(30);
  const cutoff90 = daysAgo(90);

  for (const item of items) {
    if (!item.product_id) continue;
    const date = invoiceDate.get(item.invoice_id);
    if (!date) continue;
    const q = Math.max(0, Number(item.quantity) || 0);
    const e = demand.get(item.product_id) || { d30: 0, d90: 0 };
    if (date >= cutoff90) e.d90 += q;
    if (date >= cutoff30) e.d30 += q;
    demand.set(item.product_id, e);
  }

  const today = new Date();
  return balances.map(balance => {
    const product = balance.product;
    const stock = Math.max(0, Number(balance.quantity) || 0);
    const d = demand.get(balance.product_id) || { d30: 0, d90: 0 };
    const avg30 = d.d30 / 30;
    const avg90 = d.d90 / 90;
    const weighted = avg30 * 0.65 + avg90 * 0.35;
    const trendPct = avg90 > 0 ? ((avg30 / avg90) - 1) * 100 : (avg30 > 0 ? 100 : 0);
    const safetyStock = Math.max(Number(product?.min_stock) || 0, weighted * Math.min(14, leadTimeDays));
    const reorderPoint = Math.max(Number(product?.reorder_point) || 0, weighted * leadTimeDays + safetyStock * 0.35);
    const daysCover = weighted > 0 ? stock / weighted : null;
    const stockoutDate = daysCover !== null ? new Date(today.getTime() + Math.max(0, daysCover) * 86400000).toISOString().slice(0, 10) : null;
    const order = (days: number) => Math.max(0, Math.ceil(weighted * days + safetyStock - stock));
    const priority: DemandForecastRow['priority'] = stock <= 0 ? 'critical' : (daysCover !== null && daysCover <= leadTimeDays ? 'critical' : daysCover !== null && daysCover <= leadTimeDays * 2 ? 'high' : stock <= reorderPoint ? 'medium' : 'normal');
    const recommendation = priority === 'critical' ? 'إعادة طلب عاجلة ومراجعة التوريد اليوم' : priority === 'high' ? 'إدراج الصنف في طلب الشراء القادم' : priority === 'medium' ? 'مراقبة يومية وتجهيز طلب قريب' : trendPct > 15 ? 'الطلب يتسارع؛ راقب التغطية' : 'المخزون ضمن النطاق الطبيعي';
    return {
      productId: balance.product_id, sku: product?.sku || '—', name: product?.name || 'صنف غير معروف', unit: product?.unit || '',
      stock, avgDaily30: avg30, avgDaily90: avg90, weightedDailyDemand: weighted, trendPct,
      minStock: Number(product?.min_stock) || 0, reorderPoint, safetyStock, leadTimeDays,
      stockoutDate, daysCover, order7d: order(7), order15d: order(15), order30d: order(30), priority, recommendation,
    };
  }).sort((a, b) => ({ critical: 0, high: 1, medium: 2, normal: 3 }[a.priority] - { critical: 0, high: 1, medium: 2, normal: 3 }[b.priority]) || (b.weightedDailyDemand - a.weightedDailyDemand));
}
