import { supabase, COMPANY_ID } from './supabase';
import { evaluateMetric, type MetricEvaluation } from './metricEngine';

export interface CanonicalDashboard {
  metrics: MetricEvaluation[];
  trend: Array<{ month: string; label: string; sales: number; cost: number; profit: number; invoices: number }>;
  alerts: Array<{ id: string; title: string; severity: string; reason: string; created_at: string }>;
  recommendations: Array<{ id: string; title: string; action: string; confidence: number; status: string }>;
  generatedAt: string;
}

function monthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function fetchCanonicalDashboard(months = 6): Promise<CanonicalDashboard> {
  if (!COMPANY_ID || COMPANY_ID === '00000000-0000-0000-0000-000000000000') {
    throw new Error('لا توجد شركة نشطة لهذا المستخدم.');
  }

  const [salesResult, inventoryResult, purchaseResult, customerResult, productResult, alertResult, recommendationResult] = await Promise.all([
    supabase.from('sales_invoices').select('id,total,subtotal,paid_amount,invoice_date,due_date').eq('company_id', COMPANY_ID),
    supabase.from('inventory_balances').select('quantity,unit_cost').eq('company_id', COMPANY_ID),
    supabase.from('purchase_invoices').select('total,paid_amount').eq('company_id', COMPANY_ID),
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('company_id', COMPANY_ID),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('company_id', COMPANY_ID),
    supabase.from('alerts').select('id,title,severity,reason,created_at').eq('company_id', COMPANY_ID).order('created_at', { ascending: false }).limit(5),
    supabase.from('recommendations').select('id,title,action,confidence,status').eq('company_id', COMPANY_ID).order('created_at', { ascending: false }).limit(5),
  ]);

  const results = [salesResult, inventoryResult, purchaseResult, customerResult, productResult, alertResult, recommendationResult];
  const failed = results.find(result => result.error);
  if (failed?.error) throw failed.error;

  const invoices = salesResult.data ?? [];
  const invoiceIds = invoices.map(invoice => invoice.id);
  const itemsResult = invoiceIds.length
    ? await supabase.from('sale_items').select('invoice_id,line_total,cost_price,quantity').in('invoice_id', invoiceIds)
    : { data: [], error: null };
  if (itemsResult.error) throw itemsResult.error;

  const totalSales = invoices.reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0);
  const totalCost = (itemsResult.data ?? []).reduce((sum, item) => sum + Number(item.cost_price ?? 0) * Number(item.quantity ?? 0), 0);
  const inventoryValue = (inventoryResult.data ?? []).reduce((sum, row) => sum + Number(row.quantity ?? 0) * Number(row.unit_cost ?? 0), 0);
  const receivables = invoices.reduce((sum, invoice) => sum + Math.max(0, Number(invoice.total ?? 0) - Number(invoice.paid_amount ?? 0)), 0);
  const payables = (purchaseResult.data ?? []).reduce((sum, invoice) => sum + Math.max(0, Number(invoice.total ?? 0) - Number(invoice.paid_amount ?? 0)), 0);
  const grossProfit = totalSales - totalCost;
  const rowCount = invoices.length + (itemsResult.data?.length ?? 0);
  const confidence = rowCount > 0 ? 1 : 0;

  const metrics = [
    evaluateMetric({ key: 'net_sales', value: totalSales, confidence, sourceRows: invoices.length }),
    evaluateMetric({ key: 'gross_profit', value: grossProfit, confidence, sourceRows: itemsResult.data?.length ?? 0 }),
    evaluateMetric({ key: 'receivables', value: receivables, confidence, sourceRows: invoices.length }),
    evaluateMetric({ key: 'payables', value: payables, confidence, sourceRows: purchaseResult.data?.length ?? 0 }),
    evaluateMetric({ key: 'inventory_value', value: inventoryValue, confidence, sourceRows: inventoryResult.data?.length ?? 0 }),
  ];

  const monthly = new Map<string, { sales: number; cost: number; invoices: number }>();
  const costByInvoice = new Map<string, number>();
  for (const item of itemsResult.data ?? []) {
    costByInvoice.set(item.invoice_id, (costByInvoice.get(item.invoice_id) ?? 0) + Number(item.cost_price ?? 0) * Number(item.quantity ?? 0));
  }
  for (const invoice of invoices) {
    const key = monthKey(invoice.invoice_date);
    const current = monthly.get(key) ?? { sales: 0, cost: 0, invoices: 0 };
    current.sales += Number(invoice.total ?? 0);
    current.cost += costByInvoice.get(invoice.id) ?? 0;
    current.invoices += 1;
    monthly.set(key, current);
  }

  const labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const now = new Date();
  const trend = Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
    const key = monthKey(date.toISOString());
    const current = monthly.get(key) ?? { sales: 0, cost: 0, invoices: 0 };
    return { month: key, label: labels[date.getMonth()], ...current, profit: current.sales - current.cost };
  });

  return {
    metrics,
    trend,
    alerts: (alertResult.data ?? []).map(row => ({ ...row, severity: String(row.severity ?? ''), reason: String(row.reason ?? '') })),
    recommendations: (recommendationResult.data ?? []).map(row => ({ ...row, action: String(row.action ?? ''), confidence: Number(row.confidence ?? 0), status: String(row.status ?? '') })),
    generatedAt: new Date().toISOString(),
  };
}
