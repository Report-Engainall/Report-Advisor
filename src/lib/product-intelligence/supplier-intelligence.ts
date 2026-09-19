export interface SupplierPeriod {
  supplierId: string;
  period: string;
  purchases: number;
  paid: number;
  balance: number;
  deliveries?: number;
  lateDeliveries?: number;
}

export interface SupplierEvent {
  supplierId: string;
  leadTimeDays: number;
  promisedDays?: number;
  orderedQty: number;
  receivedQty: number;
  onTime?: boolean;
  purchaseAmount: number;
}

export interface SupplierInsight {
  supplierId: string;
  totalPurchases: number;
  totalPaid: number;
  balance: number;
  paymentRatio: number;
  deliveryReliability: number;
  risk: number;
  priority: 'critical' | 'high' | 'normal';
}

export interface SupplierSignal {
  supplierId: string;
  reliability: number;
  avgLeadTime: number;
  fillRate: number;
  onTimeRate: number;
  recommendedSafetyMultiplier: number;
  reasons: string[];
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function analyzeSuppliers(rows: SupplierPeriod[]): SupplierInsight[] {
  const map = new Map<string, SupplierPeriod[]>();
  for (const row of rows) {
    const items = map.get(row.supplierId) ?? [];
    items.push(row);
    map.set(row.supplierId, items);
  }

  return [...map].map(([supplierId, items]) => {
    const purchases = items.reduce((sum, item) => sum + Math.max(0, item.purchases), 0);
    const paid = items.reduce((sum, item) => sum + Math.max(0, item.paid), 0);
    const balance = items.reduce((sum, item) => sum + Math.max(0, item.balance), 0);
    const deliveries = items.reduce((sum, item) => sum + Math.max(0, item.deliveries ?? 0), 0);
    const late = items.reduce((sum, item) => sum + Math.max(0, item.lateDeliveries ?? 0), 0);
    const paymentRatio = purchases ? clamp01(paid / purchases) : 0;
    const deliveryReliability = deliveries ? clamp01(1 - late / deliveries) : 1;
    const risk = Math.round(Math.max(0, Math.min(
      100,
      (balance > purchases * 0.5 ? 50 : balance > purchases * 0.25 ? 25 : 0)
        + (deliveryReliability < 0.8 ? 30 : deliveryReliability < 0.95 ? 10 : 0)
        + (paymentRatio < 0.5 ? 20 : 0),
    )));

    return {
      supplierId,
      totalPurchases: purchases,
      totalPaid: paid,
      balance,
      paymentRatio,
      deliveryReliability,
      risk,
      priority: risk >= 70 ? 'critical' : risk >= 40 ? 'high' : 'normal',
    };
  });
}

export function analyzeSupplier(supplierId: string, events: SupplierEvent[]): SupplierSignal {
  const filtered = events.filter(event => event.supplierId === supplierId);
  if (!filtered.length) {
    return {
      supplierId,
      reliability: 0,
      avgLeadTime: 0,
      fillRate: 0,
      onTimeRate: 0,
      recommendedSafetyMultiplier: 1.5,
      reasons: ['لا توجد بيانات تاريخية كافية عن المورد'],
    };
  }

  const avgLeadTime = filtered.reduce((sum, event) => sum + Math.max(0, event.leadTimeDays), 0) / filtered.length;
  const ordered = filtered.reduce((sum, event) => sum + Math.max(0, event.orderedQty), 0);
  const received = filtered.reduce((sum, event) => sum + Math.max(0, event.receivedQty), 0);
  const fillRate = ordered ? clamp01(received / ordered) : 0;
  const onTimeEvents = filtered.filter(event => event.onTime ?? (event.promisedDays !== undefined && event.leadTimeDays <= event.promisedDays)).length;
  const onTimeRate = onTimeEvents / filtered.length;
  const reliability = clamp01(0.5 * fillRate + 0.5 * onTimeRate);
  const recommendedSafetyMultiplier = 1 + (1 - reliability) * 1.5;
  const reasons: string[] = [];
  if (fillRate < 0.9) reasons.push('نسبة التوريد الفعلي أقل من المطلوب');
  if (onTimeRate < 0.8) reasons.push('التزام المواعيد منخفض');
  if (avgLeadTime > 30) reasons.push('متوسط مدة التوريد طويل');

  return { supplierId, reliability, avgLeadTime, fillRate, onTimeRate, recommendedSafetyMultiplier, reasons };
}
