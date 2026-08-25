import { supabase } from './supabase';
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

/** Dashboard aggregate reads are fail-closed: partial data is never presented as trustworthy. */
export async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  const { data: invoices, error: invoicesError } = await supabase
    .from('sales_invoices')
    .select('id, total, paid_amount, subtotal, tax_amount, status, invoice_date, due_date');
  if (invoicesError) throw invoicesError;

  const invArr = (invoices || []) as any[];
  const invoiceIds = invArr.map((i: any) => i.id);
  const { data: items, error: itemsError } = invoiceIds.length
    ? await supabase.from('sale_items').select('invoice_id, line_total, cost_price, quantity').in('invoice_id', invoiceIds)
    : { data: [], error: null };
  if (itemsError) throw itemsError;

  const { data: balances, error: balancesError } = await supabase
    .from('inventory_balances').select('quantity, unit_cost');
  if (balancesError) throw balancesError;

  const { count: customerCount, error: customerError } = await supabase
    .from('customers').select('id', { count: 'exact', head: true });
  if (customerError) throw customerError;

  const { count: productCount, error: productError } = await supabase
    .from('products').select('id', { count: 'exact', head: true });
  if (productError) throw productError;

  const { data: purchases, error: purchasesError } = await supabase
    .from('purchase_invoices').select('total, paid_amount');
  if (purchasesError) throw purchasesError;

  const totalSales = invArr.reduce((s: number, inv: any) => s + Number(inv.subtotal || 0), 0);
  const totalCost = ((items || []) as any[]).reduce((s: number, item: any) => s + Number(item.cost_price || 0) * Number(item.quantity || 0), 0);
  const grossProfit = totalSales - totalCost;
  const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
  const totalReceivables = invArr.reduce((s: number, inv: any) => s + Number(inv.total || 0) - Number(inv.paid_amount || 0), 0);
  const today = new Date().toISOString().split('T')[0];
  const overdueReceivables = invArr.filter((inv: any) => inv.due_date && inv.due_date < today && Number(inv.paid_amount || 0) < Number(inv.total || 0))
    .reduce((s: number, inv: any) => s + Number(inv.total || 0) - Number(inv.paid_amount || 0), 0);
  const totalPayables = ((purchases || []) as any[]).reduce((s: number, pur: any) => s + Number(pur.total || 0) - Number(pur.paid_amount || 0), 0);
  const inventoryValue = ((balances || []) as any[]).reduce((s: number, b: any) => s + Number(b.quantity || 0) * Number(b.unit_cost || 0), 0);
  const invoiceCount = invArr.length;
  const avgInvoiceValue = invoiceCount > 0 ? totalSales / invoiceCount : 0;
  const totalPaid = invArr.reduce((s: number, inv: any) => s + Number(inv.paid_amount || 0), 0);
  const totalInvAmount = invArr.reduce((s: number, inv: any) => s + Number(inv.total || 0), 0);
  const collectionRate = totalInvAmount > 0 ? (totalPaid / totalInvAmount) * 100 : 0;

  return {
    totalSales, totalCost, grossProfit, grossMargin, totalReceivables, overdueReceivables,
    totalPayables, inventoryValue, totalCustomers: customerCount || 0, activeCustomers: customerCount || 0,
    totalProducts: productCount || 0, invoiceCount, avgInvoiceValue, collectionRate,
    status: invoiceCount > 0 || (customerCount || 0) > 0 || (productCount || 0) > 0 ? 'CALCULATED' : 'INSUFFICIENT_DATA',
  };
}

export async function fetchMonthlyTrend(months = 6): Promise<MonthlyTrend[]> {
  const { data: invoices, error: invoicesError } = await supabase.from('sales_invoices')
    .select('id, subtotal, invoice_date').order('invoice_date', { ascending: true });
  if (invoicesError) throw invoicesError;
  const invoiceIds = (invoices || []).map(inv => inv.id);
  const { data: items, error: itemsError } = invoiceIds.length
    ? await supabase.from('sale_items').select('invoice_id, line_total, cost_price, quantity').in('invoice_id', invoiceIds)
    : { data: [], error: null };
  if (itemsError) throw itemsError;

  const costByInvoice = new Map<string, number>();
  for (const item of items || []) {
    const c = Number((item as SaleItem).cost_price || 0) * Number((item as SaleItem).quantity || 0);
    costByInvoice.set((item as SaleItem).invoice_id, (costByInvoice.get((item as SaleItem).invoice_id) || 0) + c);
  }
  const byMonth = new Map<string, { sales: number; cost: number; invoices: number }>();
  for (const inv of invoices || []) {
    const d = new Date(inv.invoice_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = byMonth.get(key) || { sales: 0, cost: 0, invoices: 0 };
    entry.sales += Number(inv.subtotal || 0); entry.cost += costByInvoice.get(inv.id) || 0; entry.invoices += 1;
    byMonth.set(key, entry);
  }
  const result: MonthlyTrend[] = [];
  const now = new Date();
  const labels = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const entry = byMonth.get(key) || { sales: 0, cost: 0, invoices: 0 };
    result.push({ month: key, label: labels[d.getMonth()], sales: entry.sales, cost: entry.cost, profit: entry.sales - entry.cost, invoices: entry.invoices });
  }
  return result;
}

export async function fetchTopCustomers(limit = 5): Promise<TopEntity[]> {
  const { data, error } = await supabase.from('sales_invoices').select('customer_id, subtotal, customer:customers(name)');
  if (error) throw error;
  const byCustomer = new Map<string, { name: string; value: number }>();
  for (const row of data || []) {
    const name = (row as any).customer?.name || 'غير معروف';
    const entry = byCustomer.get(row.customer_id) || { name, value: 0 };
    entry.value += Number(row.subtotal || 0); byCustomer.set(row.customer_id, entry);
  }
  return Array.from(byCustomer.entries()).map(([id, v]) => ({ id, name: v.name, value: v.value })).sort((a, b) => b.value - a.value).slice(0, limit);
}

export async function fetchTopProducts(limit = 5): Promise<TopEntity[]> {
  // sale_items is scoped indirectly through its parent invoices; it has no company_id column.
  const { data: invoices, error: invoicesError } = await supabase.from('sales_invoices').select('id');
  if (invoicesError) throw invoicesError;
  const invoiceIds = (invoices || []).map(inv => inv.id);
  if (!invoiceIds.length) return [];
  const { data, error } = await supabase.from('sale_items')
    .select('product_id, quantity, line_total, product:products(name)')
    .in('invoice_id', invoiceIds).not('product_id', 'is', null);
  if (error) throw error;

  const byProduct = new Map<string, { name: string; value: number; qty: number }>();
  for (const row of data || []) {
    if (!row.product_id) continue;
    const name = (row as any).product?.name || 'غير معروف';
    const entry = byProduct.get(row.product_id) || { name, value: 0, qty: 0 };
    entry.value += Number(row.line_total || 0); entry.qty += Number(row.quantity || 0); byProduct.set(row.product_id, entry);
  }
  return Array.from(byProduct.entries()).map(([id, v]) => ({ id, name: v.name, value: v.value, secondary: v.qty })).sort((a, b) => b.value - a.value).slice(0, limit);
}

/** Category sales are derived from canonical sale lines and their product/category relations. */
export async function fetchCategoryBreakdown(limit = 12): Promise<CategoryBreakdown[]> {
  const { data: invoices, error: invoicesError } = await supabase.from('sales_invoices').select('id');
  if (invoicesError) throw invoicesError;
  const invoiceIds = (invoices || []).map(inv => inv.id);
  if (!invoiceIds.length) return [];

  const { data, error } = await supabase.from('sale_items')
    .select('quantity, line_total, cost_price, product:products(category_id, category:categories(name))')
    .in('invoice_id', invoiceIds)
    .not('product_id', 'is', null);
  if (error) throw error;

  const byCategory = new Map<string, CategoryBreakdown>();
  for (const row of data || []) {
    const product = (row as any).product;
    const category = product?.category;
    const categoryId = product?.category_id || 'uncategorized';
    const name = category?.name || 'غير مصنف';
    const current = byCategory.get(categoryId) || { name, sales: 0, profit: 0, quantity: 0 };
    const quantity = Number((row as any).quantity || 0);
    const sales = Number((row as any).line_total || 0);
    const cost = Number((row as any).cost_price || 0) * quantity;
    current.sales += sales;
    current.profit += sales - cost;
    current.quantity += quantity;
    byCategory.set(categoryId, current);
  }
  return Array.from(byCategory.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

export async function fetchAgingBuckets(): Promise<AgingBucket[]> {
  const { data: invoices, error } = await supabase.from('sales_invoices').select('total, paid_amount, due_date, invoice_date');
  if (error) throw error;
  const today = new Date();
  const buckets: AgingBucket[] = [
    { bucket: '0-30', amount: 0, count: 0 }, { bucket: '31-60', amount: 0, count: 0 },
    { bucket: '61-90', amount: 0, count: 0 }, { bucket: '90+', amount: 0, count: 0 },
  ];
  for (const inv of invoices || []) {
    const outstanding = Number(inv.total || 0) - Number(inv.paid_amount || 0);
    if (outstanding <= 0) continue;
    const due = inv.due_date ? new Date(inv.due_date) : new Date(inv.invoice_date);
    const days = Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86400000));
    const index = days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3;
    buckets[index].amount += outstanding; buckets[index].count += 1;
  }
  return buckets;
}
