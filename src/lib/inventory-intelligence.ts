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
const ANALYSIS_DAYS = 90;

function round(value: number, digits = 2) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function nonNegative(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function buildInventoryInsights(
  balances: InventoryBalance[],
  invoices: SalesInvoice[],
  items: SaleItem[],
  asOf = new Date(),
): InventoryInsight[] {
  const asOfTime = asOf.getTime();
  const cutoff = asOfTime - ANALYSIS_DAYS * DAY_MS;
  const validInvoiceIds = new Set<string>();

  for (const invoice of invoices) {
    const time = Date.parse(invoice.invoice_date);
    if (Number.isFinite(time) && time >= cutoff && time <= asOfTime) validInvoiceIds.add(invoice.id);
  }

  const soldByProduct = new Map<string, number>();
  for (const item of items) {
    if (!item.product_id || !validInvoiceIds.has(item.invoice_id)) continue;
    const quantity = nonNegative(item.quantity);
    soldByProduct.set(item.product_id, (soldByProduct.get(item.product_id) || 0) + quantity);
  }

  // Inventory is additive across warehouses. Never select the largest warehouse balance as the company balance.
  const aggregateByProduct = new Map<string, { balance: InventoryBalance; stock: number; value: number }>();
  for (const balance of balances) {
    const stock = nonNegative(balance.quantity);
    const unitCost = nonNegative(balance.unit_cost);
    const current = aggregateByProduct.get(balance.product_id);
    if (!current) {
      aggregateByProduct.set(balance.product_id, { balance, stock, value: stock * unitCost });
    } else {
      current.stock += stock;
      current.value += stock * unitCost;
      // Prefer the first non-empty product payload while keeping the aggregate balance.
      if (!current.balance.product && balance.product) current.balance = balance;
    }
  }

  return Array.from(aggregateByProduct.values()).map(({ balance, stock, value }) => {
    const product = balance.product as Product | undefined;
    const soldQty90d = soldByProduct.get(balance.product_id) || 0;
    const dailyVelocity = soldQty90d / ANALYSIS_DAYS;
    const weeklyVelocity = dailyVelocity * 7;
    const monthlyVelocity = dailyVelocity * 30;
    const daysOfStock = dailyVelocity > 0 ? stock / dailyVelocity : null;
    const stockoutDate = daysOfStock !== null
      ? new Date(asOfTime + daysOfStock * DAY_MS).toISOString().slice(0, 10)
      : null;
    const minStock = nonNegative(product?.min_stock);
    const reorderPoint = nonNegative(product?.reorder_point) || minStock;
    const targetStock = Math.max(reorderPoint * 2, monthlyVelocity + minStock);
    const suggestedOrder = Math.max(0, Math.ceil(targetStock - stock));

    let liquidity: LiquidityClass = 'متوسط';
    if (stock <= 0) liquidity = 'نفد';
    else if (dailyVelocity <= 0) liquidity = 'راكد';
    else if (daysOfStock <= 60) liquidity = 'متحرك';

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
      inventoryValue: round(value),
      soldQty90d: round(soldQty90d),
      dailyVelocity: round(dailyVelocity),
      weeklyVelocity: round(weeklyVelocity),
      monthlyVelocity: round(monthlyVelocity),
      daysOfStock: daysOfStock === null ? null : round(daysOfStock),
      stockoutDate,
      minStock: round(minStock),
      reorderPoint: round(reorderPoint),
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
