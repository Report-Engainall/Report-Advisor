import { supabase } from './supabase';
import type { Recommendation, Alert } from './types';

export interface DashboardKPIs { totalSales:number|null; totalCost:number|null; grossProfit:number|null; grossMargin:number|null; totalReceivables:number|null; overdueReceivables:number|null; totalPayables:number|null; inventoryValue:number|null; totalCustomers:number; activeCustomers:number|null; totalProducts:number; invoiceCount:number; avgInvoiceValue:number|null; collectionRate:number|null; status:'CONFIRMED'|'CALCULATED'|'INSUFFICIENT_DATA'; }
export interface MonthlyTrend {month:string;label:string;sales:number;cost:number;profit:number;invoices:number;}
export interface TopEntity {id:string;name:string;value:number;secondary?:number;}
export interface AgingBucket {bucket:string;amount:number;count:number;}
export interface CategoryBreakdown {name:string;sales:number;profit:number;quantity:number;}
export interface ProfitabilitySnapshot {status:'CALCULATED'|'INSUFFICIENT_DATA';currency:string|null;currency_status:'CONSISTENT'|'INSUFFICIENT_DATA';revenue:number|null;cost:number|null;gross_profit:number|null;gross_margin:number|null;invoice_count:number;bad_invoice_rows:number;bad_sale_item_rows:number;currency_mismatch_rows:number;reasons:string[];as_of:string;}
export interface InventoryReportRow {id:string;quantity:number|null;unit_cost:number|null;value:number|null;product?:{id:string;name:string|null;sku:string|null;reorder_point:number|null}|null;warehouse?:{id:string;name:string|null}|null;}
export interface InventoryReportSnapshot {rows:InventoryReportRow[];page:number;pageSize:number;filter:'all'|'low'|'out';totalRows:number;filteredRows:number;lowStock:number;outOfStock:number;unknownRows:number;totalValue:number|null;dataStatus:'NO_DATA'|'INSUFFICIENT_DATA'|'CALCULATED';}
export interface RFMSnapshotRow {customer_id:string;customer_name:string;recency:number;frequency:number;monetary:number;r_score:number;f_score:number;m_score:number;rfm_segment:string;}
export interface RFMSnapshot {rows:RFMSnapshotRow[];asOf:string;unknownRows:number;status:'INSUFFICIENT_DATA'|'CALCULATED';}
export interface ABCSnapshotRow {product_id:string;product_name:string;revenue:number;cumulative:number;cumulative_pct:number|null;class:'A'|'B'|'C'|null;}
export interface ABCSnapshot {rows:ABCSnapshotRow[];totalRevenue:number;unknownRows:number;status:'INSUFFICIENT_DATA'|'CALCULATED';}
export interface AgingSnapshotRow {name:string;amount:number;count:number;}
export interface AgingSnapshot {rows:AgingSnapshotRow[];asOf:string;unknownRows:number;status:'NO_DATA'|'INSUFFICIENT_DATA'|'CALCULATED';}
interface Snapshot { kpis:DashboardKPIs; trend:MonthlyTrend[]; topCustomers:TopEntity[]; topProducts:TopEntity[]; categories:CategoryBreakdown[]; aging:AgingBucket[]; }
function finiteOrNull(value: unknown): number|null { return typeof value === 'number' && Number.isFinite(value) ? value : null; }
function requiredArray<T>(value: unknown): T[] { return Array.isArray(value) ? value as T[] : []; }
function asOfDate(): string { return new Date().toISOString().slice(0, 10); }

export async function fetchDashboardSnapshot(months = 6): Promise<Snapshot> {
  if (!Number.isInteger(months) || months < 1 || months > 24) throw new Error('REPORT_QUERY_INVALID_MONTHS');
  const { data, error } = await supabase.rpc('get_dashboard_snapshot', { p_months: months, p_as_of: asOfDate() });
  if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: dashboard snapshot missing');
  const row = data as Record<string, unknown>;
  const kpis: DashboardKPIs = { totalSales: finiteOrNull(row.totalSales), totalCost: finiteOrNull(row.totalCost), grossProfit: finiteOrNull(row.grossProfit), grossMargin: finiteOrNull(row.grossMargin), totalReceivables: finiteOrNull(row.totalReceivables), overdueReceivables: finiteOrNull(row.overdueReceivables), totalPayables: finiteOrNull(row.totalPayables), inventoryValue: finiteOrNull(row.inventoryValue), totalCustomers: Number(row.totalCustomers ?? 0), activeCustomers: finiteOrNull(row.activeCustomers), totalProducts: Number(row.totalProducts ?? 0), invoiceCount: Number(row.invoiceCount ?? 0), avgInvoiceValue: finiteOrNull(row.avgInvoiceValue), collectionRate: finiteOrNull(row.collectionRate), status: row.status === 'CALCULATED' ? 'CALCULATED' : 'INSUFFICIENT_DATA' };
  return { kpis, trend: requiredArray<MonthlyTrend>(row.trend), topCustomers: requiredArray<TopEntity>(row.topCustomers).slice(0, 10), topProducts: requiredArray<TopEntity>(row.topProducts).slice(0, 10), categories: requiredArray<CategoryBreakdown>(row.categories), aging: requiredArray<AgingBucket>(row.aging) };
}

export async function fetchInventoryReportSnapshot(page = 0, pageSize = 25, filter: 'all'|'low'|'out' = 'all'): Promise<InventoryReportSnapshot> {
  if (!Number.isInteger(page) || page < 0) throw new Error('REPORT_QUERY_INVALID_PAGE'); if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE'); if (!['all','low','out'].includes(filter)) throw new Error('REPORT_QUERY_INVALID_FILTER');
  const { data, error } = await supabase.rpc('get_inventory_report_snapshot', { p_page: page, p_page_size: pageSize, p_filter: filter });
  if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: inventory snapshot missing'); const row = data as Record<string, unknown>;
  return { rows: requiredArray<InventoryReportRow>(row.rows), page: Number(row.page ?? page), pageSize: Number(row.pageSize ?? pageSize), filter: row.filter === 'low' || row.filter === 'out' ? row.filter : 'all', totalRows: Number(row.totalRows ?? 0), filteredRows: Number(row.filteredRows ?? 0), lowStock: Number(row.lowStock ?? 0), outOfStock: Number(row.outOfStock ?? 0), unknownRows: Number(row.unknownRows ?? 0), totalValue: finiteOrNull(row.totalValue), dataStatus: row.dataStatus === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : row.dataStatus === 'NO_DATA' ? 'NO_DATA' : 'CALCULATED' };
}

export async function fetchProfitabilitySnapshot(): Promise<ProfitabilitySnapshot> { const { data, error } = await supabase.rpc('get_profitability_snapshot', { p_as_of: asOfDate() }); if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: profitability snapshot missing'); const row=data as Record<string,unknown>; return { status: row.status==='CALCULATED'?'CALCULATED':'INSUFFICIENT_DATA', currency: typeof row.currency==='string'?row.currency:null, currency_status: row.currency_status==='CONSISTENT'?'CONSISTENT':'INSUFFICIENT_DATA', revenue:finiteOrNull(row.revenue), cost:finiteOrNull(row.cost), gross_profit:finiteOrNull(row.gross_profit), gross_margin:finiteOrNull(row.gross_margin), invoice_count:Number(row.invoice_count??0), bad_invoice_rows:Number(row.bad_invoice_rows??0), bad_sale_item_rows:Number(row.bad_sale_item_rows??0), currency_mismatch_rows:Number(row.currency_mismatch_rows??0), reasons:requiredArray<string>(row.reasons), as_of:String(row.as_of??asOfDate()) }; }

export async function fetchRFMSnapshot(limit = 500): Promise<RFMSnapshot> { if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error('REPORT_QUERY_INVALID_LIMIT'); const { data, error } = await supabase.rpc('get_rfm_snapshot', { p_as_of: asOfDate(), p_limit: limit }); if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: RFM snapshot missing'); const row = data as Record<string, unknown>; return { rows: requiredArray<RFMSnapshotRow>(row.rows), asOf: String(row.asOf ?? asOfDate()), unknownRows: Number(row.unknownRows ?? 0), status: row.status === 'CALCULATED' ? 'CALCULATED' : 'INSUFFICIENT_DATA' }; }
export async function fetchABCSnapshot(limit = 500): Promise<ABCSnapshot> { if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error('REPORT_QUERY_INVALID_LIMIT'); const { data, error } = await supabase.rpc('get_abc_snapshot', { p_limit: limit }); if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: ABC snapshot missing'); const row = data as Record<string, unknown>; return { rows: requiredArray<ABCSnapshotRow>(row.rows), totalRevenue: Number(row.totalRevenue ?? 0), unknownRows: Number(row.unknownRows ?? 0), status: row.status === 'CALCULATED' ? 'CALCULATED' : 'INSUFFICIENT_DATA' }; }
export async function fetchAgingSnapshot(): Promise<AgingSnapshot> { const { data, error } = await supabase.rpc('get_aging_snapshot', { p_as_of: asOfDate() }); if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: aging snapshot missing'); const row = data as Record<string, unknown>; return { rows: requiredArray<AgingSnapshotRow>(row.rows), asOf: String(row.asOf ?? asOfDate()), unknownRows: Number(row.unknownRows ?? 0), status: row.status === 'CALCULATED' ? 'CALCULATED' : row.status === 'NO_DATA' ? 'NO_DATA' : 'INSUFFICIENT_DATA' }; }

export async function fetchDashboardIntelligence(): Promise<{recommendations: Recommendation[]; alerts: Alert[]}> {
  const { data, error } = await supabase.rpc('get_dashboard_intelligence', { p_limit: 100 });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: dashboard intelligence missing');
  const row = data as Record<string, unknown>;
  return { recommendations: requiredArray<Recommendation>(row.recommendations), alerts: requiredArray<Alert>(row.alerts) };
}
