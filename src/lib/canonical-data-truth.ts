import { supabase, resolveCurrentCompanyId } from './supabase';
import type { DashboardKPIs } from './queries';

interface ExecutiveMetrics { status?: 'CALCULATED' | 'INSUFFICIENT_DATA'; revenue: number | null; cost: number | null; gross_profit: number | null; gross_margin_pct: number | null; profitability_status?: 'CALCULATED' | 'INSUFFICIENT_DATA'; invoice_count: number; purchases: number | null; receivables: number | null; overdue_receivables: number | null; payables: number | null; inventory_value: number | null; inventory_status?: 'CALCULATED' | 'INSUFFICIENT_DATA'; collection_rate: number | null; active_products: number; as_of: string; }
interface DimensionCounts { customer_count?: unknown; active_product_count?: unknown; as_of?: unknown; }
interface PurchaseSummary { total: number | null; count: number; supplier_count: number; as_of: string; status?: 'CALCULATED' | 'INSUFFICIENT_DATA'; }
interface InventoryValuation { status: 'CALCULATED' | 'INSUFFICIENT_DATA'; value: number | null; rows: number; missing_rows: number; low_stock: number; out_of_stock: number; }
export interface CanonicalSalesMonthlyTruth { month: string; sales: number | null; cost: number | null; profit: number | null; invoices: number; status: 'CALCULATED' | 'INSUFFICIENT_DATA'; }
function finiteOrNull(value: unknown): number | null { if (value === null || value === undefined) return null; const n = Number(value); return Number.isFinite(n) ? n : null; }
function finiteCount(value: unknown): number { const n = Number(value); return Number.isInteger(n) && n >= 0 ? n : 0; }
async function tenantId(): Promise<string> { const id = await resolveCurrentCompanyId(); if (!id) throw new Error('TENANT_REQUIRED'); return id; }
export async function fetchCanonicalDashboardKPIs(): Promise<DashboardKPIs> {
  const companyId = await tenantId();
  const [{ data, error }, { data: dimensions, error: dimensionError }] = await Promise.all([
    supabase.rpc('get_executive_metrics', { p_company_id: companyId, p_from: null, p_to: null }),
    supabase.rpc('get_executive_dimension_counts', { p_company_id: companyId }),
  ]);
  if (error) throw error; if (dimensionError) throw dimensionError;
  const m = (data ?? {}) as ExecutiveMetrics; const d = (dimensions ?? {}) as DimensionCounts;
  const totalSales = finiteOrNull(m.revenue), totalCost = finiteOrNull(m.cost), grossProfit = finiteOrNull(m.gross_profit), grossMargin = finiteOrNull(m.gross_margin_pct), totalReceivables = finiteOrNull(m.receivables), totalPayables = finiteOrNull(m.payables);
  const inventoryValue = m.inventory_status === 'INSUFFICIENT_DATA' ? null : finiteOrNull(m.inventory_value);
  const invoiceCount = finiteCount(m.invoice_count); const status = m.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED';
  return { totalSales, totalCost, grossProfit, grossMargin, totalReceivables, overdueReceivables: finiteOrNull(m.overdue_receivables), totalPayables, inventoryValue, totalCustomers: finiteCount(d.customer_count), activeCustomers: null, totalProducts: finiteCount(d.active_product_count), invoiceCount, avgInvoiceValue: totalSales !== null && invoiceCount > 0 ? totalSales / invoiceCount : null, collectionRate: finiteOrNull(m.collection_rate), status };
}
export async function fetchCanonicalPurchaseSummary(): Promise<PurchaseSummary> {
  const companyId = await tenantId(); const { data, error } = await supabase.rpc('get_purchase_summary', { p_company_id: companyId, p_from: null, p_to: null }); if (error) throw error;
  const result = (data ?? {}) as Partial<PurchaseSummary>; const status = result.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED';
  return { total: status === 'INSUFFICIENT_DATA' ? null : finiteOrNull(result.total), count: finiteCount(result.count), supplier_count: finiteCount(result.supplier_count), as_of: String(result.as_of ?? new Date().toISOString().slice(0, 10)), status };
}
export async function fetchCanonicalInventoryValuation(): Promise<InventoryValuation> { const companyId = await tenantId(); const { data, error } = await supabase.rpc('get_inventory_valuation', { p_company_id: companyId }); if (error) throw error; const result = (data ?? {}) as Partial<InventoryValuation>; const status = result.status === 'CALCULATED' ? 'CALCULATED' : 'INSUFFICIENT_DATA'; return { status, value: status === 'CALCULATED' ? finiteOrNull(result.value) : null, rows: finiteCount(result.rows), missing_rows: finiteCount(result.missing_rows), low_stock: finiteCount(result.low_stock), out_of_stock: finiteCount(result.out_of_stock) }; }
/** Canonical domain trend. Nullable cost/profit is intentional: unknown never becomes zero. */
export async function fetchCanonicalSalesMonthlyTruth(months = 6): Promise<CanonicalSalesMonthlyTruth[]> { const companyId = await tenantId(); const { data, error } = await supabase.rpc('get_sales_monthly_truth', { p_company_id: companyId, p_months: months }); if (error) throw error; const rows = Array.isArray(data) ? data as Array<{month:string;sales:number|null;cost:number|null;profit:number|null;invoices:number;status:string}> : []; return rows.map((r) => ({ month: r.month, sales: finiteOrNull(r.sales), cost: finiteOrNull(r.cost), profit: finiteOrNull(r.profit), invoices: finiteCount(r.invoices), status: r.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : 'CALCULATED' })); }
