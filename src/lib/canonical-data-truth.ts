import { supabase, resolveCurrentCompanyId } from './supabase';
import type { DashboardKPIs } from './queries';

interface ExecutiveMetrics {
  status?: 'CALCULATED' | 'INSUFFICIENT_DATA';
  revenue: number | null; cost: number | null; gross_profit: number | null; gross_margin_pct: number | null;
  profitability_status?: 'CALCULATED' | 'INSUFFICIENT_DATA'; invoice_count: number; purchases: number | null;
  receivables: number | null; overdue_receivables: number | null; payables: number | null;
  inventory_value: number | null; inventory_status?: 'CALCULATED' | 'INSUFFICIENT_DATA';
  collection_rate: number | null; active_products: number; as_of: string;
}
interface PurchaseSummary { total: number | null; count: number; supplier_count: number; as_of: string; status?: 'CALCULATED' | 'INSUFFICIENT_DATA'; }
interface InventoryValuation { status: 'CALCULATED' | 'INSUFFICIENT_DATA'; value: number | null; rows: number; missing_rows: number; low_stock: number; out_of_stock: number; }
export interface CanonicalSalesMonthlyTruth { month: string; sales: number | null; cost: number | null; profit: number | null; invoices: number; status: 'CALCULATED' | 'INSUFFICIENT_DATA'; }

function finiteOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
async function tenantId(): Promise<string> {
  const id = await resolveCurrentCompanyId();
  if (!id) throw new Error('TENANT_REQUIRED');
  return id;
}

export async function fetchCanonicalDashboardKPIs(): Promise<DashboardKPIs> {
  const companyId = await tenantId();
  const { data, error } = await supabase.rpc('get_executive_metrics', { p_company_id: companyId, p_from: null, p_to: null });
  if (error) throw error;
  const m = (data ?? {}) as ExecutiveMetrics;
  const totalSales = finiteOrNull(m.revenue);
  const totalCost = finiteOrNull(m.cost);
  const grossProfit = finiteOrNull(m.gross_profit);
  const grossMargin = finiteOrNull(m.gross_margin_pct);
  const totalReceivables = finiteOrNull(m.receivables);
  const totalPayables = finiteOrNull(m.payables);
  const inventoryValue = m.inventory_status === 'INSUFFICIENT_DATA' ? null : finiteOrNull(m.inventory_value);
  const invoiceCount = Number.isFinite(Number(m.invoice_count)) ? Number(m.invoice_count) : 0;
  const customerResult = await supabase.from('customers').select('id', { count: 'exact', head: true });
  const productResult = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true);
  if (customerResult.error) throw customerResult.error;
  if (productResult.error) throw productResult.error;
  const status = m.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED';
  return {
    totalSales, totalCost, grossProfit, grossMargin, totalReceivables,
    overdueReceivables: finiteOrNull(m.overdue_receivables), totalPayables, inventoryValue,
    totalCustomers: customerResult.count ?? 0, activeCustomers: null, totalProducts: productResult.count ?? 0,
    invoiceCount, avgInvoiceValue: totalSales !== null && invoiceCount > 0 ? totalSales / invoiceCount : null,
    collectionRate: finiteOrNull(m.collection_rate), status,
  };
}

export async function fetchCanonicalPurchaseSummary(): Promise<PurchaseSummary> {
  const companyId = await tenantId();
  const { data, error } = await supabase.rpc('get_purchase_summary', { p_company_id: companyId, p_from: null, p_to: null });
  if (error) throw error;
  const result = (data ?? {}) as Partial<PurchaseSummary>;
  const status = result.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED';
  return {
    total: status === 'INSUFFICIENT_DATA' ? null : finiteOrNull(result.total),
    count: Number.isFinite(Number(result.count)) ? Number(result.count) : 0,
    supplier_count: Number.isFinite(Number(result.supplier_count)) ? Number(result.supplier_count) : 0,
    as_of: String(result.as_of ?? new Date().toISOString().slice(0, 10)),
    status,
  };
}

export async function fetchCanonicalInventoryValuation(): Promise<InventoryValuation> {
  const companyId = await tenantId();
  const { data, error } = await supabase.rpc('get_inventory_valuation', { p_company_id: companyId });
  if (error) throw error;
  const result = (data ?? {}) as Partial<InventoryValuation>;
  const status = result.status === 'CALCULATED' ? 'CALCULATED' : 'INSUFFICIENT_DATA';
  return { status, value: status === 'CALCULATED' ? finiteOrNull(result.value) : null, rows: Number(result.rows ?? 0), missing_rows: Number(result.missing_rows ?? 0), low_stock: Number(result.low_stock ?? 0), out_of_stock: Number(result.out_of_stock ?? 0) };
}

/** Canonical domain trend. Nullable cost/profit is intentional: unknown never becomes zero. */
export async function fetchCanonicalSalesMonthlyTruth(months = 6): Promise<CanonicalSalesMonthlyTruth[]> {
  const companyId = await tenantId();
  const { data, error } = await supabase.rpc('get_sales_monthly_truth', { p_company_id: companyId, p_months: months });
  if (error) throw error;
  const rows = Array.isArray(data) ? data as Array<{month:string;sales:number|null;cost:number|null;profit:number|null;invoices:number;status:string}> : [];
  return rows.map((r) => ({
    month: r.month,
    sales: finiteOrNull(r.sales),
    cost: finiteOrNull(r.cost),
    profit: finiteOrNull(r.profit),
    invoices: Number(r.invoices ?? 0),
    status: r.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED',
  }));
}
