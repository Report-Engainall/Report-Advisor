import { supabase, COMPANY_ID } from './supabase';
import type {
  SalesInvoice, SaleItem, PurchaseInvoice, Customer, Product,
  InventoryBalance, Recommendation, Alert, Forecast, Payment,
} from './types';

export interface DashboardKPIs {
  totalSales: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  totalReceivables: number;
  overdueReceivables: number;
  totalPayables: number;
  inventoryValue: number;
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  invoiceCount: number;
  avgInvoiceValue: number;
  collectionRate: number;
  status: 'CONFIRMED' | 'CALCULATED' | 'INSUFFICIENT_DATA';
}

export interface MonthlyTrend {
  month: string;
  label: string;
  sales: number;
  cost: number;
  profit: number;
  invoices: number;
}

export interface TopEntity {
  id: string;
  name: string;
  value: number;
  secondary?: number;
}

export interface AgingBucket {
  bucket: string;
  amount: number;
  count: number;
}

export interface CategoryBreakdown {
  name: string;
  sales: number;
  profit: number;
  quantity: number;
}

export async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  const { data: invoices } = await supabase
    .from('sales_invoices')
    .select('id, total, paid_amount, subtotal, tax_amount, status, invoice_date, due_date')
    .eq('company_id', COMPANY_ID);

  const invArr = (invoices || []) as any[];
  const { data: items } = await supabase
    .from('sale_items')
    .select('line_total, cost_price, quantity')
    .in('invoice_id', invArr.map((i: any) => i.id));

  const { data: balances } = await supabase
    .from('inventory_balances')
    .select('quantity, unit_cost')
    .eq('company_id', COMPANY_ID);

  const { count: customerCount } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', COMPANY_ID);

  const { count: productCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', COMPANY_ID);

  const { data: purchases } = await supabase
    .from('purchase_invoices')
    .select('total, paid_amount')
    .eq('company_id', COMPANY_ID);

  const totalSales = invArr.reduce((s: number, inv: any) => s + Number(inv.subtotal), 0);
  const totalCost = ((items || []) as any[]).reduce((s: number, item: any) => s + Number(item.cost_price) * Number(item.quantity), 0);
  const grossProfit = totalSales - totalCost;
  const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
  const totalReceivables = invArr.reduce((s: number, inv: any) => s + (Number(inv.total) - Number(inv.paid_amount)), 0);
  const today = new Date().toISOString().split('T')[0];
  const overdueReceivables = invArr
    .filter((inv: any) => inv.due_date && inv.due_date < today && Number(inv.paid_amount) < Number(inv.total))
    .reduce((s: number, inv: any) => s + (Number(inv.total) - Number(inv.paid_amount)), 0);
  const totalPayables = ((purchases || []) as any[]).reduce((s: number, pur: any) => s + (Number(pur.total) - Number(pur.paid_amount)), 0);
  const inventoryValue = ((balances || []) as any[]).reduce((s: number, b: any) => s + Number(b.quantity) * Number(b.unit_cost), 0);
  const invoiceCount = invArr.length;
  const avgInvoiceValue = invoiceCount > 0 ? totalSales / invoiceCount : 0;
  const totalPaid = invArr.reduce((s: number, inv: any) => s + Number(inv.paid_amount), 0);
  const totalInvAmount = invArr.reduce((s: number, inv: any) => s + Number(inv.total), 0);
  const collectionRate = totalInvAmount > 0 ? (totalPaid / totalInvAmount) * 100 : 0;

  return {
    totalSales,
    totalCost,
    grossProfit,
    grossMargin,
    totalReceivables,
    overdueReceivables,
    totalPayables,
    inventoryValue,
    totalCustomers: customerCount || 0,
    activeCustomers: customerCount || 0,
    totalProducts: productCount || 0,
    invoiceCount,
    avgInvoiceValue,
    collectionRate,
    status: 'CALCULATED',
  };
}

export async function fetchMonthlyTrend(months = 6): Promise<MonthlyTrend[]> {
  const { data: invoices } = await supabase
    .from('sales_invoices')
    .select('id, subtotal, invoice_date')
    .eq('company_id', COMPANY_ID)
    .order('invoice_date', { ascending: true });

  const { data: items } = await supabase
    .from('sale_items')
    .select('invoice_id, line_total, cost_price, quantity');

  const costByInvoice = new Map<string, number>();
  for (const item of items || []) {
    const c = (item as SaleItem).cost_price * (item as SaleItem).quantity;
    costByInvoice.set((item as SaleItem).invoice_id, (costByInvoice.get((item as SaleItem).invoice_id) || 0) + c);
  }

  const byMonth = new Map<string, { sales: number; cost: number; invoices: number }>();
  for (const inv of invoices || []) {
    const d = new Date(inv.invoice_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = byMonth.get(key) || { sales: 0, cost: 0, invoices: 0 };
    entry.sales += Number(inv.subtotal);
    entry.cost += costByInvoice.get(inv.id) || 0;
    entry.invoices += 1;
    byMonth.set(key, entry);
  }

  const result: MonthlyTrend[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = byMonth.get(key) || { sales: 0, cost: 0, invoices: 0 };
    const labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    result.push({
      month: key,
      label: labels[d.getMonth()],
      sales: entry.sales,
      cost: entry.cost,
      profit: entry.sales - entry.cost,
      invoices: entry.invoices,
    });
  }
  return result;
}

export async function fetchTopCustomers(limit = 5): Promise<TopEntity[]> {
  const { data } = await supabase
    .from('sales_invoices')
    .select('customer_id, subtotal, customer:customers(name)')
    .eq('company_id', COMPANY_ID);

  const byCustomer = new Map<string, { name: string; value: number }>();
  for (const row of data || []) {
    const name = (row as any).customer?.name || 'غير معروف';
    const entry = byCustomer.get(row.customer_id) || { name, value: 0 };
    entry.value += Number(row.subtotal);
    byCustomer.set(row.customer_id, entry);
  }
  return Array.from(byCustomer.entries())
    .map(([id, v]) => ({ id, name: v.name, value: v.value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export async function fetchTopProducts(limit = 5): Promise<TopEntity[]> {
  const { data } = await supabase
    .from('sale_items')
    .select('product_id, quantity, line_total, product:products(name)')
    .eq('product_id', 'not.null');

  const byProduct = new Map<string, { name: string; value: number; qty: number }>();
  for (const row of data || []) {
    if (!row.product_id) continue;
    const name = (row as any).product?.name || 'غير معروف';
    const entry = byProduct.get(row.product_id) || { name, value: 0, qty: 0 };
    entry.value += Number(row.line_total);
    entry.qty += Number(row.quantity);
    byProduct.set(row.product_id, entry);
  }
  return Array.from(byProduct.entries())
    .map(([id, v]) => ({ id, name: v.name, value: v.value, secondary: v.qty }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export async function fetchAgingBuckets(): Promise<AgingBucket[]> {
  const { data: invoices } = await supabase
    .from('sales_invoices')
    .select('total, paid_amount, due_date, invoice_date')
    .eq('company_id', COMPANY_ID);

  const today = new Date();
  const buckets: AgingBucket[] = [
    { bucket: '0-30', amount: 0, count: 0 },
    { bucket: '31-60', amount: 0, count: 0 },
    { bucket: '61-90', amount: 0, count: 0 },
    { bucket: '90+', amount: 0, count: 0 },
  ];

  for (const inv of invoices || []) {
    const outstanding = Number(inv.total) - Number(inv.paid_amount);
    if (outstanding <= 0) continue;
    const due = new Date(inv.due_date || inv.invoice_date);
    const days = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 30) { buckets[0].amount += outstanding; buckets[0].count++; }
    else if (days <= 60) { buckets[1].amount += outstanding; buckets[1].count++; }
    else if (days <= 90) { buckets[2].amount += outstanding; buckets[2].count++; }
    else { buckets[3].amount += outstanding; buckets[3].count++; }
  }
  return buckets;
}

export async function fetchCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const { data } = await supabase
    .from('sale_items')
    .select('line_total, cost_price, quantity, product:products(category_id)')
    .not('product_id', 'is', null);

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('company_id', COMPANY_ID);

  const catName = new Map<string, string>();
  for (const c of categories || []) catName.set(c.id, c.name);

  const byCat = new Map<string, CategoryBreakdown>();
  for (const row of data || []) {
    const catId = (row as any).product?.category_id;
    if (!catId) continue;
    const name = catName.get(catId) || 'غير مصنف';
    const entry = byCat.get(catId) || { name, sales: 0, profit: 0, quantity: 0 };
    entry.sales += Number(row.line_total);
    entry.profit += Number(row.line_total) - Number(row.cost_price) * Number(row.quantity);
    entry.quantity += Number(row.quantity);
    byCat.set(catId, entry);
  }
  return Array.from(byCat.values()).sort((a, b) => b.sales - a.sales);
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data as Recommendation[];
}

export async function fetchAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data as Alert[];
}

export async function fetchForecasts(): Promise<Forecast[]> {
  const { data, error } = await supabase
    .from('forecasts')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('period', { ascending: true });
  if (error) return [];
  return data as Forecast[];
}

export async function updateRecommendationStatus(id: string, status: string, impactResult?: string): Promise<void> {
  const update: any = { status };
  if (impactResult) update.impact_result = impactResult;
  update.impact_measured_at = new Date().toISOString();
  await supabase.from('recommendations').update(update).eq('id', id);
}

export async function markAlertRead(id: string): Promise<void> {
  await supabase.from('alerts').update({ is_read: true }).eq('id', id);
}

export async function fetchSalesInvoices(page = 0, pageSize = 25): Promise<{ data: SalesInvoice[]; total: number }> {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase
    .from('sales_invoices')
    .select('*, customer:customers(name), branch:branches(name)', { count: 'exact' })
    .eq('company_id', COMPANY_ID)
    .order('invoice_date', { ascending: false })
    .range(from, to);
  return { data: (data || []) as SalesInvoice[], total: count || 0 };
}

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('name', { ascending: true });
  if (error) return [];
  return data as Customer[];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('name', { ascending: true });
  if (error) return [];
  return data as Product[];
}

export async function fetchInventoryBalances(): Promise<InventoryBalance[]> {
  const { data, error } = await supabase
    .from('inventory_balances')
    .select('*, product:products(name, sku, unit, cost_price, selling_price, min_stock, reorder_point), warehouse:warehouses(name)')
    .eq('company_id', COMPANY_ID)
    .order('product_id', { ascending: true });
  if (error) return [];
  return data as InventoryBalance[];
}

export async function fetchPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('payment_date', { ascending: false });
  if (error) return [];
  return data as Payment[];
}

export async function fetchPurchaseInvoices(page = 0, pageSize = 25): Promise<{ data: PurchaseInvoice[]; total: number }> {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase
    .from('purchase_invoices')
    .select('*, supplier:suppliers(name)', { count: 'exact' })
    .eq('company_id', COMPANY_ID)
    .order('invoice_date', { ascending: false })
    .range(from, to);
  return { data: (data || []) as PurchaseInvoice[], total: count || 0 };
}

export async function fetchImportRecords(): Promise<any[]> {
  const { data, error } = await supabase
    .from('imports')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function createImportRecord(record: Partial<any>): Promise<any> {
  const { data, error } = await supabase
    .from('imports')
    .insert({ ...record, company_id: COMPANY_ID })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateImportRecord(id: string, update: Partial<any>): Promise<void> {
  await supabase.from('imports').update(update).eq('id', id);
}

export async function fetchAuditLogs(limit = 50): Promise<any[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}
