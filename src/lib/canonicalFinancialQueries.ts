import { supabase } from './supabase';
import type { DashboardKPIs, MonthlyTrend, TopEntity } from './queries';

interface InvoiceRow { id:string; total:number|null; paid_amount:number|null; status:string|null; invoice_date:string; due_date:string|null; }
interface SaleItemRow { invoice_id:string|null; line_total:number|null; cost_price:number|null; quantity:number|null; product_id:string|null; product?:{name:string|null}|Array<{name:string|null}>|null; }

function required(value:number|null|undefined, field:string):number {
  if (value === null || value === undefined || !Number.isFinite(value)) throw new Error(`REPORT_DATA_UNAVAILABLE: required numeric field '${field}' is missing or invalid`);
  return value;
}

function validDate(value:string|null|undefined, field:string):Date {
  if (!value) throw new Error(`REPORT_DATA_UNAVAILABLE: required date field '${field}' is missing`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`REPORT_DATA_UNAVAILABLE: required date field '${field}' is invalid`);
  return date;
}

async function loadSalesTruth() {
  const { data: invoices, error: invoiceError } = await supabase
    .from('sales_invoices')
    .select('id,total,paid_amount,status,invoice_date,due_date');
  if (invoiceError) throw invoiceError;
  const rows = (invoices ?? []) as InvoiceRow[];
  const ids = rows.map(row => row.id);
  const { data: items, error: itemError } = ids.length
    ? await supabase.from('sale_items').select('invoice_id,line_total,cost_price,quantity,product_id,product:products(name)').in('invoice_id', ids)
    : { data: [], error: null };
  if (itemError) throw itemError;
  return { invoices: rows, items: (items ?? []) as SaleItemRow[] };
}

/** Canonical dashboard financial truth: line-item revenue and line-item COGS. */
export async function fetchCanonicalDashboardKPIs(): Promise<DashboardKPIs> {
  const { invoices, items } = await loadSalesTruth();
  const { data: balances, error: balanceError } = await supabase.from('inventory_balances').select('quantity,unit_cost');
  if (balanceError) throw balanceError;
  const { count: customerCount, error: customerError } = await supabase.from('customers').select('id', { count:'exact', head:true });
  if (customerError) throw customerError;
  const { count: productCount, error: productError } = await supabase.from('products').select('id', { count:'exact', head:true });
  if (productError) throw productError;
  const { data: purchases, error: purchaseError } = await supabase.from('purchase_invoices').select('total,paid_amount');
  if (purchaseError) throw purchaseError;

  const totalSales = items.reduce((sum, row) => sum + required(row.line_total, 'sale_items.line_total'), 0);
  const totalCost = items.reduce((sum, row) => sum + required(row.cost_price, 'sale_items.cost_price') * required(row.quantity, 'sale_items.quantity'), 0);
  const grossProfit = totalSales - totalCost;
  const hasTransactionalData = invoices.length > 0 || (purchases ?? []).length > 0 || (balances ?? []).length > 0;
  if (!hasTransactionalData) return {
    totalSales:null,totalCost:null,grossProfit:null,grossMargin:null,totalReceivables:null,overdueReceivables:null,
    totalPayables:null,inventoryValue:null,totalCustomers:customerCount??0,activeCustomers:null,totalProducts:productCount??0,
    invoiceCount:0,avgInvoiceValue:null,collectionRate:null,status:'INSUFFICIENT_DATA'
  };

  const totalReceivables = invoices.reduce((sum, row) => sum + required(row.total,'sales_invoices.total') - required(row.paid_amount,'sales_invoices.paid_amount'), 0);
  const today = new Date().toISOString().split('T')[0];
  const overdueReceivables = invoices.filter(row => row.due_date && row.due_date < today && required(row.paid_amount,'sales_invoices.paid_amount') < required(row.total,'sales_invoices.total'))
    .reduce((sum,row) => sum + required(row.total,'sales_invoices.total') - required(row.paid_amount,'sales_invoices.paid_amount'), 0);
  const totalPayables = (purchases ?? []).reduce((sum,row) => sum + required(row.total,'purchase_invoices.total') - required(row.paid_amount,'purchase_invoices.paid_amount'), 0);
  const inventoryValue = (balances ?? []).reduce((sum,row) => sum + required(row.quantity,'inventory_balances.quantity') * required(row.unit_cost,'inventory_balances.unit_cost'), 0);
  const invoiceCount = invoices.length;
  const avgInvoiceValue = invoiceCount ? totalSales / invoiceCount : null;
  const totalPaid = invoices.reduce((sum,row) => sum + required(row.paid_amount,'sales_invoices.paid_amount'), 0);
  const totalInvoiceAmount = invoices.reduce((sum,row) => sum + required(row.total,'sales_invoices.total'), 0);
  const collectionRate = totalInvoiceAmount ? (totalPaid / totalInvoiceAmount) * 100 : null;
  return { totalSales,totalCost,grossProfit,grossMargin:totalSales !== 0 ? (grossProfit/totalSales)*100 : null,totalReceivables,overdueReceivables,totalPayables,inventoryValue,totalCustomers:customerCount??0,activeCustomers:null,totalProducts:productCount??0,invoiceCount,avgInvoiceValue,collectionRate,status:'CALCULATED' };
}

export async function fetchCanonicalMonthlyTrend(months=6): Promise<MonthlyTrend[]> {
  const { invoices, items } = await loadSalesTruth();
  if (!invoices.length) return [];
  const costByInvoice = new Map<string,number>();
  const salesByInvoice = new Map<string,number>();
  for (const item of items) {
    if (!item.invoice_id) continue;
    salesByInvoice.set(item.invoice_id, (salesByInvoice.get(item.invoice_id) ?? 0) + required(item.line_total,'sale_items.line_total'));
    costByInvoice.set(item.invoice_id, (costByInvoice.get(item.invoice_id) ?? 0) + required(item.cost_price,'sale_items.cost_price') * required(item.quantity,'sale_items.quantity'));
  }
  const byMonth = new Map<string,{sales:number;cost:number;invoices:number}>();
  for (const invoice of invoices) {
    const date = validDate(invoice.invoice_date,'sales_invoices.invoice_date');
    const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
    const entry = byMonth.get(key) ?? {sales:0,cost:0,invoices:0};
    entry.sales += salesByInvoice.get(invoice.id) ?? 0;
    entry.cost += costByInvoice.get(invoice.id) ?? 0;
    entry.invoices += 1;
    byMonth.set(key,entry);
  }
  const labels=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const out:MonthlyTrend[]=[]; const now=new Date();
  for(let i=months-1;i>=0;i--){const date=new Date(now.getFullYear(),now.getMonth()-i,1);const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;const e=byMonth.get(key)??{sales:0,cost:0,invoices:0};out.push({month:key,label:labels[date.getMonth()],sales:e.sales,cost:e.cost,profit:e.sales-e.cost,invoices:e.invoices});}
  return out;
}

export async function fetchCanonicalTopCustomers(limit=5): Promise<TopEntity[]> {
  const { invoices, items } = await loadSalesTruth();
  const names = new Map<string,string>();
  const { data: customers, error } = await supabase.from('customers').select('id,name');
  if (error) throw error;
  for (const customer of customers ?? []) names.set(customer.id, customer.name ?? customer.id);
  const byInvoice = new Map<string,number>();
  for (const item of items) { if (!item.invoice_id) continue; byInvoice.set(item.invoice_id,(byInvoice.get(item.invoice_id)??0)+required(item.line_total,'sale_items.line_total')); }
  const totals = new Map<string,{name:string;value:number}>();
  const { data: invoiceCustomers, error: relationError } = await supabase.from('sales_invoices').select('id,customer_id');
  if (relationError) throw relationError;
  for (const invoice of invoiceCustomers ?? []) { const customerId = invoice.customer_id as string; if (!customerId) continue; const entry=totals.get(customerId)??{name:names.get(customerId)??customerId,value:0}; entry.value += byInvoice.get(invoice.id as string)??0; totals.set(customerId,entry); }
  return [...totals.entries()].map(([id,v])=>({id,name:v.name,value:v.value})).sort((a,b)=>b.value-a.value).slice(0,limit);
}
