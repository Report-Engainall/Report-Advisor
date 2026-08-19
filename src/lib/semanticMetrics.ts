export type MetricStatus = 'CONFIRMED' | 'CALCULATED' | 'ESTIMATED' | 'FORECAST' | 'INSUFFICIENT_DATA' | 'UNAVAILABLE';

export interface MetricDefinition {
  key: string;
  label: string;
  description: string;
  formula: string;
  source: string[];
  status: MetricStatus;
  unit: 'currency' | 'number' | 'percent' | 'days';
}

export const BUSINESS_METRICS: MetricDefinition[] = [
  { key: 'net_sales', label: 'صافي المبيعات', description: 'إجمالي قيمة فواتير البيع بعد الخصومات والضرائب حسب إعدادات النظام.', formula: 'SUM(sales_invoices.total)', source: ['sales_invoices'], status: 'CALCULATED', unit: 'currency' },
  { key: 'gross_profit', label: 'مجمل الربح', description: 'المبيعات ناقص تكلفة البضاعة المباعة.', formula: 'SUM(sale_items.line_total - sale_items.cost_price * sale_items.quantity)', source: ['sales_invoices', 'sale_items'], status: 'CALCULATED', unit: 'currency' },
  { key: 'receivables', label: 'الذمم المدينة', description: 'إجمالي المبالغ المستحقة من العملاء.', formula: 'SUM(invoice.total - invoice.paid_amount)', source: ['sales_invoices'], status: 'CALCULATED', unit: 'currency' },
  { key: 'payables', label: 'التزامات الموردين', description: 'إجمالي المبالغ المستحقة للموردين.', formula: 'SUM(purchase.total - purchase.paid_amount)', source: ['purchase_invoices'], status: 'CALCULATED', unit: 'currency' },
  { key: 'inventory_value', label: 'قيمة المخزون', description: 'الكمية الحالية مضروبة في تكلفة الوحدة لكل رصيد مخزني.', formula: 'SUM(inventory.quantity * inventory.unit_cost)', source: ['inventory_balances'], status: 'CALCULATED', unit: 'currency' },
  { key: 'stock_coverage', label: 'تغطية المخزون', description: 'عدد الأيام التقريبي التي يغطيها المخزون وفق متوسط الحركة.', formula: 'stock_quantity / average_daily_demand', source: ['inventory_balances', 'sale_items'], status: 'FORECAST', unit: 'days' },
  { key: 'customer_activity', label: 'نشاط العملاء', description: 'مؤشر مشتق من حداثة وتكرار وقيمة المشتريات.', formula: 'RFM-derived activity score', source: ['sales_invoices'], status: 'CALCULATED', unit: 'percent' },
];

export function getMetricDefinition(key: string) {
  return BUSINESS_METRICS.find(metric => metric.key === key);
}

export function freshnessLabel(updatedAt?: string | null) {
  if (!updatedAt) return { label: 'غير متوفر', tone: 'neutral' as const };
  const ageMinutes = Math.max(0, (Date.now() - new Date(updatedAt).getTime()) / 60000);
  if (ageMinutes <= 15) return { label: 'محدث الآن', tone: 'good' as const };
  if (ageMinutes <= 120) return { label: `محدث منذ ${Math.round(ageMinutes)} دقيقة`, tone: 'good' as const };
  if (ageMinutes <= 1440) return { label: `محدث منذ ${Math.round(ageMinutes / 60)} ساعة`, tone: 'warning' as const };
  return { label: 'بيانات قديمة', tone: 'danger' as const };
}
