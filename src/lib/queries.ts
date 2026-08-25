import { supabase } from './supabase';
import type { Recommendation, Alert } from './types';

interface InvoiceRow { id: string; total: number | null; paid_amount: number | null; subtotal: number | null; tax_amount: number | null; status: string | null; invoice_date: string; due_date: string | null; }
interface SaleItemRow { invoice_id: string; line_total: number | null; cost_price: number | null; quantity: number | null; product_id?: string | null; product?: { name: string | null; category_id: string | null } | null; }
interface BalanceRow { quantity: number | null; unit_cost: number | null; }
interface PurchaseRow { total: number | null; paid_amount: number | null; }
interface CustomerAggregateRow { customer_id: string; subtotal: number | null; customer?: { name: string | null } | null; }
interface ProductAggregateRow { product_id: string | null; quantity: number | null; line_total: number | null; product?: { name: string | null } | null; }
interface CategoryRow { id: string; name: string; }

export interface DashboardKPIs {
  totalSales: number | null;
  totalCost: number | null;
  grossProfit: number | null;
  grossMargin: number | null;
  totalReceivables: number | null;
  overdueReceivables: number | null;
  totalPayables: number | null;
  inventoryValue: number | null;
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  invoiceCount: number;
  avgInvoiceValue: number | null;
  collectionRate: number | null;
  status: 'CONFIRMED' | 'CALCULATED' | 'INSUFFICIENT_DATA';
}

export interface MonthlyTrend { month: string; label: string; sales: number; cost: number; profit: number; invoices: number; }
export interface TopEntity { id: string; name: string; value: number; secondary?: number; }
export interface AgingBucket { bucket: string; amount: number; count: number; }
export interface CategoryBreakdown { name: string; sales: number; profit: number; quantity: number; }

export async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  const { data: invoices, error: invoicesError } = await supabase
    .from('sales_invoices').select('id, total, paid_amount, subtotal, tax_amount, status, invoice_date, due_date');
  if (invoicesError) throw invoicesError;
  const invArr = (invoices ?? []) as InvoiceRow[];
  const invoiceIds = invArr.map(i => i.id);

  const { data: items, error: itemsError } = invoiceIds.length
    ? await supabase.from('sale_items').select('invoice_id, line_total, cost_price, quantity').in('invoice_id', invoiceIds)
    : { data: [], error: null };
  if (itemsError) throw itemsError;
  const itemRows = (items ?? []) as SaleItemRow[];

  const { data: balances, error: balancesError } = await supabase.from('inventory_balances').select('quantity, unit_cost');
  if (balancesError) throw balancesError;
  const balanceRows = (balances ?? []) as BalanceRow[];

  const { count: customerCount, error: customerError } = await supabase.from('customers').select('id', { count: 'exact', head: true });
  if (customerError) throw customerError;
  const { count: productCount, error: productError } = await supabase.from('products').select('id', { count: 'exact', head: true });
  if (productError) throw productError;

  const { data: purchases, error: purchasesError } = await supabase.from('purchase_invoices').select('total, paid_amount');
  if (purchasesError) throw purchasesError;
  const purchaseRows = (purchases ?? []) as PurchaseRow[];

  const totalCustomers = customerCount ?? 0;
  const totalProducts = productCount ?? 0;
  const hasTransactionalData = invArr.length > 0 || purchaseRows.length > 0 || balanceRows.length > 0;
  if (!hasTransactionalData) {
    return {
      totalSales: null, totalCost: null, grossProfit: null, grossMargin: null,
      totalReceivables: null, overdueReceivables: null, totalPayables: null, inventoryValue: null,
      totalCustomers, activeCustomers: totalCustomers, totalProducts, invoiceCount: 0,
      avgInvoiceValue: null, collectionRate: null, status: 'INSUFFICIENT_DATA',
    };
  }

  const totalSales = invArr.reduce((s, inv) => s + Number(inv.subtotal ?? 0), 0);
  const totalCost = itemRows.reduce((s, item) => s + Number(item.cost_price ?? 0) * Number(item.quantity ?? 0), 0);
  const grossProfit = totalSales - totalCost;
  const grossMargin = totalSales !== 0 ? (grossProfit / totalSales) * 100 : null;
  const totalReceivables = invArr.reduce((s, inv) => s + Number(inv.total ?? 0) - Number(inv.paid_amount ?? 0), 0);
  const today = new Date().toISOString().split('T')[0];
  const overdueReceivables = invArr.filter(inv => inv.due_date && inv.due_date < today && Number(inv.paid_amount ?? 0) < Number(inv.total ?? 0))
    .reduce((s, inv) => s + Number(inv.total ?? 0) - Number(inv.paid_amount ?? 0), 0);
  const totalPayables = purchaseRows.reduce((s, pur) => s + Number(pur.total ?? 0) - Number(pur.paid_amount ?? 0), 0);
  const inventoryValue = balanceRows.reduce((s, b) => s + Number(b.quantity ?? 0) * Number(b.unit_cost ?? 0), 0);
  const invoiceCount = invArr.length;
  const avgInvoiceValue = invoiceCount > 0 ? totalSales / invoiceCount : null;
  const totalPaid = invArr.reduce((s, inv) => s + Number(inv.paid_amount ?? 0), 0);
  const totalInvAmount = invArr.reduce((s, inv) => s + Number(inv.total ?? 0), 0);
  const collectionRate = totalInvAmount !== 0 ? (totalPaid / totalInvAmount) * 100 : null;

  return {
    totalSales, totalCost, grossProfit, grossMargin, totalReceivables, overdueReceivables,
    totalPayables, inventoryValue, totalCustomers, activeCustomers: totalCustomers,
    totalProducts, invoiceCount, avgInvoiceValue, collectionRate,
    status: 'CALCULATED',
  };
}

export async function fetchMonthlyTrend(months = 6): Promise<MonthlyTrend[]> {
  const { data: invoices, error: invoicesError } = await supabase.from('sales_invoices').select('id, subtotal, invoice_date').order('invoice_date', { ascending: true });
  if (invoicesError) throw invoicesError;
  const invoiceRows = (invoices ?? []) as Array<Pick<InvoiceRow, 'id' | 'subtotal' | 'invoice_date'>>;
  const invoiceIds = invoiceRows.map(inv => inv.id);
  const { data: items, error: itemsError } = invoiceIds.length
    ? await supabase.from('sale_items').select('invoice_id, line_total, cost_price, quantity').in('invoice_id', invoiceIds)
    : { data: [], error: null };
  if (itemsError) throw itemsError;
  const costByInvoice = new Map<string, number>();
  for (const item of (items ?? []) as SaleItemRow[]) {
    const cost = Number(item.cost_price ?? 0) * Number(item.quantity ?? 0);
    costByInvoice.set(item.invoice_id, (costByInvoice.get(item.invoice_id) ?? 0) + cost);
  }
  const byMonth = new Map<string, { sales: number; cost: number; invoices: number }>();
  for (const inv of invoiceRows) {
    const d = new Date(inv.invoice_date);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = byMonth.get(key) ?? { sales: 0, cost: 0, invoices: 0 };
    entry.sales += Number(inv.subtotal ?? 0); entry.cost += costByInvoice.get(inv.id) ?? 0; entry.invoices += 1;
    byMonth.set(key, entry);
  }
  const result: MonthlyTrend[] = [];
  const now = new Date();
  const labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = byMonth.get(key) ?? { sales: 0, cost: 0, invoices: 0 };
    result.push({ month: key, label: labels[d.getMonth()], sales: entry.sales, cost: entry.cost, profit: entry.sales - entry.cost, invoices: entry.invoices });
  }
  return result;
}

export async function fetchTopCustomers(limit = 5): Promise<TopEntity[]> {
  const { data, error } = await supabase.from('sales_invoices').select('customer_id, subtotal, customer:customers(name)');
  if (error) throw error;
  const byCustomer = new Map<string, { name: string; value: number }>();
  for (const row of (data ?? []) as CustomerAggregateRow[]) {
    const name = row.customer?.name ?? 'غير معروف';
    const entry = byCustomer.get(row.customer_id) ?? { name, value: 0 };
    entry.value += Number(row.subtotal ?? 0); byCustomer.set(row.customer_id, entry);
  }
  return Array.from(byCustomer.entries()).map(([id, v]) => ({ id, name: v.name, value: v.value })).sort((a, b) => b.value - a.value).slice(0, limit);
}

export async function fetchTopProducts(limit = 5): Promise<TopEntity[]> {
  const { data: invoices, error: invoicesError } = await supabase.from('sales_invoices').select('id');
  if (invoicesError) throw invoicesError;
  const invoiceIds = (invoices ?? []).map(inv => inv.id as string);
  if (!invoiceIds.length) return [];
  const { data, error } = await supabase.from('sale_items').select('product_id, quantity, line_total, product:products(name)').in('invoice_id', invoiceIds).not('product_id', 'is', null);
  if (error) throw error;
  const byProduct = new Map<string, { name: string; value: number; qty: number }>();
  for (const row of (data ?? []) as ProductAggregateRow[]) {
    if (!row.product_id) continue;
    const name = row.product?.name ?? 'غير معروف';
    const entry = byProduct.get(row.product_id) ?? { name, value: 0, qty: 0 };
    entry.value += Number(row.line_total ?? 0); entry.qty += Number(row.quantity ?? 0); byProduct.set(row.product_id, entry);
  }
  return Array.from(byProduct.entries()).map(([id, v]) => ({ id, name: v.name, value: v.value, secondary: v.qty })).sort((a, b) => b.value - a.value).slice(0, limit);
}

export async function fetchCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const { data: invoices, error: invoiceError } = await supabase.from('sales_invoices').select('id');
  if (invoiceError) throw invoiceError;
  const invoiceIds = (invoices ?? []).map(invoice => invoice.id as string);
  if (!invoiceIds.length) return [];
  const { data: items, error: itemError } = await supabase.from('sale_items').select('product_id, quantity, line_total, cost_price, product:products(category_id)').in('invoice_id', invoiceIds).not('product_id', 'is', null);
  if (itemError) throw itemError;
  const itemRows = (items ?? []) as SaleItemRow[];
  const categoryIds = Array.from(new Set(itemRows.map(item => item.product?.category_id).filter((id): id is string => Boolean(id))));
  const categoryNames = new Map<string, string>();
  if (categoryIds.length) {
    const { data: categories, error: categoryError } = await supabase.from('categories').select('id, name').in('id', categoryIds);
    if (categoryError) throw categoryError;
    for (const category of (categories ?? []) as CategoryRow[]) categoryNames.set(category.id, category.name);
  }
  const byCategory = new Map<string, CategoryBreakdown>();
  for (const item of itemRows) {
    const categoryId = item.product?.category_id ?? null;
    const key = categoryId ?? '__uncategorized__';
    const current = byCategory.get(key) ?? { name: categoryId ? (categoryNames.get(categoryId) ?? 'غير معروف') : 'غير مصنف', sales: 0, profit: 0, quantity: 0 };
    const sales = Number(item.line_total ?? 0);
    const cost = Number(item.cost_price ?? 0) * Number(item.quantity ?? 0);
    current.sales += sales; current.profit += sales - cost; current.quantity += Number(item.quantity ?? 0);
    byCategory.set(key, current);
  }
  return Array.from(byCategory.values()).sort((a, b) => b.sales - a.sales);
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  const { data, error } = await supabase.from('recommendations').select('id, company_id, category, priority, title, description, expected_impact, confidence, status, owner, deadline, impact_result, created_at').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Recommendation[];
}

export async function fetchAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase.from('alerts').select('id, company_id, severity, category, title, description, metric_value, threshold, is_read, created_at').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Alert[];
}

export async function fetchAgingBuckets(): Promise<AgingBucket[]> {
  const { data: invoices, error } = await supabase.from('sales_invoices').select('total, paid_amount, due_date, invoice_date');
  if (error) throw error;
  const buckets: AgingBucket[] = [
    { bucket: '0-30', amount: 0, count: 0 }, { bucket: '31-60', amount: 0, count: 0 },
    { bucket: '61-90', amount: 0, count: 0 }, { bucket: '90+', amount: 0, count: 0 },
  ];
  const today = new Date();
  for (const inv of (invoices ?? []) as Array<Pick<InvoiceRow, 'total' | 'paid_amount' | 'due_date' | 'invoice_date'>>) {
    const outstanding = Number(inv.total ?? 0) - Number(inv.paid_amount ?? 0);
    if (outstanding <= 0) continue;
    const due = inv.due_date ? new Date(inv.due_date) : new Date(inv.invoice_date);
    if (Number.isNaN(due.getTime())) continue;
    const days = Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86400000));
    const index = days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3;
    buckets[index].amount += outstanding; buckets[index].count += 1;
  }
  return buckets;
}
