import type { InventoryBalance, Product, SalesInvoice, SaleItem } from './types';

export type LiquidityClass = 'متحرك' | 'متوسط' | 'راكد' | 'نفد';

export interface InventoryInsight {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  stock: number;
  inventoryValue: number;
  soldQty90d: number;
  dailyVelocity: number;
  weeklyVelocity: number;
  monthlyVelocity: number;
  daysOfStock: number | null;
  stockoutDate: string | null;
  minStock: number;
  reorderPoint: number;
  suggestedOrder: number;
  liquidity: LiquidityClass;
  priority: 'حرج' | 'مرتفع' | 'متوسط' | 'طبيعي';
  action: string;
}

const DAY_MS = 86_400_000;

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function buildInventoryInsights(
  balances: InventoryBalance[],
  invoices: SalesInvoice[],
  items: SaleItem[],
  asOf = new Date(),
): InventoryInsight[] {
  const cutoff = asOf.getTime() - 90 * DAY_MS;
  const invoiceDates = new Map<string, number>();
  for (const invoice of invoices) {
    const time = new Date(invoice.invoice_date).getTime();
    if (time >= cutoff && time <= asOf.getTime()) invoiceDates.set(invoice.id, time);
  }

  const soldByProduct = new Map<string, number>();
  for (const item of items) {
    if (!item.product_id || !invoiceDates.has(item.invoice_id)) continue;
    soldByProduct.set(item.product_id, (soldByProduct.get(item.product_id) || 0) + Number(item.quantity || 0));
  }

  const stockByProduct = new Map<string, InventoryBalance>();
  for (const balance of balances) {
    const current = stockByProduct.get(balance.product_id);
    if (!current || Number(balance.quantity) > Number(current.quantity)) stockByProduct.set(balance.product_id, balance);
  }

  return Array.from(stockByProduct.values()).map((balance) => {
    const product = balance.product as Product | undefined;
    const stock = Number(balance.quantity || 0);
    const soldQty90d = soldByProduct.get(balance.product_id) || 0;
    const dailyVelocity = soldQty90d / 90;
    const weeklyVelocity = dailyVelocity * 7;
    const monthlyVelocity = dailyVelocity * 30;
    const daysOfStock = dailyVelocity > 0 ? stock / dailyVelocity : null;
    const stockoutDate = daysOfStock !== null
      ? new Date(asOf.getTime() + daysOfStock * DAY_MS).toISOString().slice(0, 10)
      : null;
    const minStock = Number(product?.min_stock || 0);
    const reorderPoint = Number(product?.reorder_point || minStock || 0);
    const targetStock = Math.max(reorderPoint * 2, monthlyVelocity + minStock);
    const suggestedOrder = Math.max(0, Math.ceil(targetStock - stock));

    let liquidity: LiquidityClass = 'متوسط';
    if (stock <= 0) liquidity = 'نفد';
    else if (dailyVelocity <= 0) liquidity = 'راكد';
    else if (daysOfStock !== null && daysOfStock <= 60) liquidity = 'متحرك';

    let priority: InventoryInsight['priority'] = 'طبيعي';
    if (stock <= 0) priority = 'حرج';
    else if (reorderPoint > 0 && stock <= reorderPoint) priority = 'حرج';
    else if (daysOfStock !== null && daysOfStock <= 14) priority = 'مرتفع';
    else if (liquidity === 'راكد') priority = 'متوسط';

    let action = 'مراقبة';
    if (priority === 'حرج') action = suggestedOrder > 0 ? 'إعادة طلب عاجلة' : 'تحقق من التوريد';
    else if (priority === 'مرتفع') action = 'خطط لإعادة الطلب';
    else if (liquidity === 'راكد') action = 'خطة تصريف / عرض / مراجعة شراء';

    return {
      productId: balance.product_id,
      sku: product?.sku || '—',
      name: product?.name || 'صنف غير معروف',
      unit: product?.unit || '—',
      stock: round(stock),
      inventoryValue: round(stock * Number(balance.unit_cost || product?.cost_price || 0)),
      soldQty90d: round(soldQty90d),
      dailyVelocity: round(dailyVelocity),
      weeklyVelocity: round(weeklyVelocity),
      monthlyVelocity: round(monthlyVelocity),
      daysOfStock: daysOfStock === null ? null : round(daysOfStock),
      stockoutDate,
      minStock,
      reorderPoint,
      suggestedOrder,
      liquidity,
      priority,
      action,
    };
  }).sort((a, b) => {
    const priority = { حرج: 0, مرتفع: 1, متوسط: 2, طبيعي: 3 };
    return priority[a.priority] - priority[b.priority] || (b.dailyVelocity - a.dailyVelocity);
  });
}
