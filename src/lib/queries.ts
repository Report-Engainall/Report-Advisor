import { supabase } from './supabase';
import { fetchGrossProfitTruth, type GrossProfitDateRange } from './grossProfitTruth';
import type { SalesInvoice, PurchaseInvoice, Recommendation, Alert } from './types';

export interface DashboardKPIOptions extends GrossProfitDateRange {}
export interface DashboardKPIs {
  totalSales: number; totalCost: number | null; grossProfit: number | null; grossMargin: number | null;
  totalQuantity: number; totalReceivables: number; overdueReceivables: number; totalPayables: number;
  inventoryValue: number; totalCustomers: number; activeCustomers: number; totalProducts: number; invoiceCount: number;
  avgInvoiceValue: number; collectionRate: number; status: 'CONFIRMED' | 'CALCULATED' | 'INSUFFICIENT_DATA';
}
export interface MonthlyTrend { month: string; label: string; sales: number; cost: number | null; profit: number | null; invoices: number; }
export interface TopEntity { id: string; name: string; value: number; secondary?: number; }
export interface AgingBucket { bucket: string; amount: number; count: number; }
export interface CategoryBreakdown { name: string; sales: number; profit: number; quantity: number; }

/**
 * Dashboard is a real consumer of the canonical Gross Profit truth loader.
 * Revenue/cost/GP/quantity/date/status therefore cannot silently diverge from Reports/Export.
 */
export async function fetchDashboardKPIs(options: DashboardKPIOptions = {}): Promise<DashboardKPIs> {
  const truth = await fetchGrossProfitTruth(options);
  const { data: invoices, error: invoicesError } = await supabase
    .from('sales_invoices')
    .select('id, company_id, total, paid_amount, status, invoice_date, due_date')
    .in('status', ['confirmed', 'posted', 'paid'])
    .gte('invoice_date', options.startDate ?? '1900-01-01')
    .lte('invoice_date', options.endDate ?? '9999-12-31');
  if (invoicesError) throw invoicesError;
  const invArr = (invoices ?? []) as any[];
  const invoiceCount = invArr.length;
  const totalReceivables = invArr.reduce((s, inv) => s + Number(inv.total ?? 0) - Number(inv.paid_amount ?? 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const overdueReceivables = invArr.filter(inv => inv.due_date && inv.due_date < today && Number(inv.paid_amount ?? 0) < Number(inv.total ?? 0))
    .reduce((s, inv) => s + Number(inv.total ?? 0) - Number(inv.paid_amount ?? 0), 0);
  const totalPaid = invArr.reduce((s, inv) => s + Number(inv.paid_amount ?? 0), 0);
  const totalInvoiceAmount = invArr.reduce((s, inv) => s + Number(inv.total ?? 0), 0);
  const collectionRate = totalInvoiceAmount > 0 ? (totalPaid / totalInvoiceAmount) * 100 : 0;

  const { data: balances, error: balancesError } = await supabase.from('inventory_balances').select('quantity, unit_cost');
  if (balancesError) throw balancesError;
  const inventoryValue = (balances ?? []).reduce((s, b: any) => s + Number(b.quantity ?? 0) * Number(b.unit_cost ?? 0), 0);
  const { count: customerCount, error: customerError } = await supabase.from('customers').select('id', { count: 'exact', head: true });
  if (customerError) throw customerError;
  const { count: productCount, error: productError } = await supabase.from('products').select('id', { count: 'exact', head: true });
  if (productError) throw productError;
  const { data: purchases, error: purchasesError } = await supabase.from('purchase_invoices').select('total, paid_amount');
  if (purchasesError) throw purchasesError;
  const totalPayables = (purchases ?? []).reduce((s, p: any) => s + Number(p.total ?? 0) - Number(p.paid_amount ?? 0), 0);

  const grossMargin = truth.grossProfit === null ? null : truth.revenue > 0 ? (truth.grossProfit / truth.revenue) * 100 : 0;
  return {
    totalSales: truth.revenue, totalCost: truth.cost, grossProfit: truth.grossProfit, grossMargin,
    totalQuantity: truth.quantity, totalReceivables, overdueReceivables, totalPayables, inventoryValue,
    totalCustomers: customerCount ?? 0, activeCustomers: customerCount ?? 0, totalProducts: productCount ?? 0,
    invoiceCount, avgInvoiceValue: invoiceCount > 0 ? truth.revenue / invoiceCount : 0, collectionRate,
    status: truth.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED',
  };
}

export async function fetchMonthlyTrend(months = 6): Promise<MonthlyTrend[]> {
  const { data: invoices, error } = await supabase.from('sales_invoices').select('id, invoice_date, total, status').in('status', ['confirmed', 'posted', 'paid']).order('invoice_date', { ascending: true });
  if (error) throw error;
  const ids = (invoices ?? []).map(i => i.id);
  const { data: items, error: itemError } = ids.length ? await supabase.from('sale_items').select('invoice_id, line_total, cost_price, quantity').in('invoice_id', ids) : { data: [], error: null };
  if (itemError) throw itemError;
  const byInvoice = new Map<string, { sales: number; cost: number | null; quantity: number }>();
  for (const item of items ?? []) {
    const e = byInvoice.get(item.invoice_id) ?? { sales: 0, cost: 0, quantity: 0 };
    e.sales += Number(item.line_total ?? 0); e.quantity += Number(item.quantity ?? 0);
    if (item.cost_price === null || item.cost_price === undefined) e.cost = null;
    else if (e.cost !== null) e.cost += Number(item.cost_price) * Number(item.quantity ?? 0);
    byInvoice.set(item.invoice_id, e);
  }
  const byMonth = new Map<string, { sales: number; cost: number | null; invoices: number }>();
  for (const inv of invoices ?? []) {
    const key = String(inv.invoice_date).slice(0, 7); const e = byMonth.get(key) ?? { sales: 0, cost: 0, invoices: 0 }; const row = byInvoice.get(inv.id);
    e.sales += Number(inv.total ?? 0); e.cost = e.cost === null || row?.cost === null ? null : e.cost + (row?.cost ?? 0); e.invoices += 1; byMonth.set(key, e);
  }
  const labels = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']; const out: MonthlyTrend[] = []; const now = new Date();
  for (let i = months - 1; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; const e = byMonth.get(key) ?? { sales:0, cost:0, invoices:0 }; out.push({ month:key, label:labels[d.getMonth()], sales:e.sales, cost:e.cost, profit:e.cost === null ? null : e.sales-e.cost, invoices:e.invoices }); }
  return out;
}

export async function fetchTopCustomers(limit = 5): Promise<TopEntity[]> {
  const { data: invoices, error } = await supabase.from('sales_invoices').select('id, customer_id, customer:customers(name), status').in('status', ['confirmed','posted','paid']); if (error) throw error;
  const ids = (invoices ?? []).map(i => i.id); const { data: items, error: ie } = ids.length ? await supabase.from('sale_items').select('invoice_id, line_total').in('invoice_id', ids) : { data: [], error: null }; if (ie) throw ie;
  const byInvoice = new Map<string, number>(); for (const item of items ?? []) byInvoice.set(item.invoice_id, (byInvoice.get(item.invoice_id) ?? 0) + Number(item.line_total ?? 0));
  const byCustomer = new Map<string,{name:string;value:number}>(); for (const inv of invoices ?? []) { const e=byCustomer.get(inv.customer_id) ?? {name:(inv as any).customer?.name ?? 'غير معروف',value:0}; e.value += byInvoice.get(inv.id) ?? 0; byCustomer.set(inv.customer_id,e); }
  return [...byCustomer.entries()].map(([id,v])=>({id,name:v.name,value:v.value})).sort((a,b)=>b.value-a.value).slice(0,limit);
}

export async function fetchTopProducts(limit = 5): Promise<TopEntity[]> {
  const { data: invoices, error } = await supabase.from('sales_invoices').select('id, status').in('status',['confirmed','posted','paid']); if (error) throw error; const ids=(invoices??[]).map(i=>i.id); if(!ids.length)return[];
  const { data, error: ie } = await supabase.from('sale_items').select('product_id, quantity, line_total, product:products(name)').in('invoice_id',ids).not('product_id','is',null); if(ie)throw ie;
  const m=new Map<string,{name:string;value:number;qty:number}>(); for(const r of data??[]){const e=m.get(r.product_id)??{name:(r as any).product?.name??'غير معروف',value:0,qty:0};e.value+=Number(r.line_total??0);e.qty+=Number(r.quantity??0);m.set(r.product_id,e);} return [...m.entries()].map(([id,v])=>({id,name:v.name,value:v.value,secondary:v.qty})).sort((a,b)=>b.value-a.value).slice(0,limit);
}

export async function fetchCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const { data: invoices, error } = await supabase.from('sales_invoices').select('id,status').in('status',['confirmed','posted','paid']); if(error)throw error; const ids=(invoices??[]).map(i=>i.id); if(!ids.length)return[];
  const { data, error: ie } = await supabase.from('sale_items').select('quantity,line_total,cost_price,product:products(category:categories(name))').in('invoice_id',ids); if(ie)throw ie;
  const m=new Map<string,{sales:number;profit:number;quantity:number;missing:boolean}>(); for(const r of data??[]){const name=(r as any).product?.category?.name??'غير مصنف';const e=m.get(name)??{sales:0,profit:0,quantity:0,missing:false};e.sales+=Number(r.line_total??0);e.quantity+=Number(r.quantity??0);if(r.cost_price==null)e.missing=true;else e.profit+=Number(r.line_total??0)-Number(r.cost_price)*Number(r.quantity??0);m.set(name,e);} return [...m.entries()].map(([name,v])=>({name,sales:v.sales,profit:v.missing?0:v.profit,quantity:v.quantity}));
}

export async function fetchSalesInvoices(page=0,pageSize=20): Promise<{data:SalesInvoice[];count:number}> { const from=page*pageSize; const {data,error,count}=await supabase.from('sales_invoices').select('*,customer:customers(name)',{count:'exact'}).in('status',['confirmed','posted','paid']).order('invoice_date',{ascending:false}).range(from,from+pageSize-1); if(error)throw error; return {data:(data??[]) as SalesInvoice[],count:count??0}; }
export async function fetchPurchaseInvoices(page=0,pageSize=20): Promise<{data:PurchaseInvoice[];count:number}> { const from=page*pageSize; const {data,error,count}=await supabase.from('purchase_invoices').select('*,supplier:suppliers(name)',{count:'exact'}).order('invoice_date',{ascending:false}).range(from,from+pageSize-1); if(error)throw error; return {data:(data??[]) as PurchaseInvoice[],count:count??0}; }
export async function fetchInventoryBalances(): Promise<any[]> { const {data,error}=await supabase.from('inventory_balances').select('*,product:products(name,reorder_point),warehouse:warehouses(name)'); if(error)throw error; return data??[]; }

export async function fetchRecommendations(limit = 20): Promise<Recommendation[]> { const {data,error}=await supabase.from('recommendations').select('id,company_id,category,priority,title,description,expected_impact,confidence,status,owner,deadline,impact_result,created_at').order('created_at',{ascending:false}).limit(limit); if(error)throw error; return (data??[]) as Recommendation[]; }
export async function fetchAlerts(limit = 20): Promise<Alert[]> { const {data,error}=await supabase.from('alerts').select('id,company_id,severity,category,title,description,metric_value,threshold,is_read,created_at').order('created_at',{ascending:false}).limit(limit); if(error)throw error; return (data??[]) as Alert[]; }
export async function fetchAgingBuckets(): Promise<AgingBucket[]> { const {data,error}=await supabase.from('sales_invoices').select('total,paid_amount,due_date,invoice_date,status').in('status',['confirmed','posted','paid']); if(error)throw error; const today=new Date();const b:AgingBucket[]=[{bucket:'0-30',amount:0,count:0},{bucket:'31-60',amount:0,count:0},{bucket:'61-90',amount:0,count:0},{bucket:'90+',amount:0,count:0}];for(const inv of data??[]){const outstanding=Number(inv.total??0)-Number(inv.paid_amount??0);if(outstanding<=0)continue;const due=inv.due_date?new Date(inv.due_date):new Date(inv.invoice_date);const days=Math.max(0,Math.floor((today.getTime()-due.getTime())/86400000));const i=days<=30?0:days<=60?1:days<=90?2:3;b[i].amount+=outstanding;b[i].count+=1;}return b; }
