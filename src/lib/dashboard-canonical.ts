import { supabase } from './supabase';
import type { Recommendation, Alert } from './types';

export interface DashboardKPIs {
  totalSales:number|null; totalCost:number|null; grossProfit:number|null; grossMargin:number|null;
  totalReceivables:number|null; overdueReceivables:number|null; totalPayables:number|null; inventoryValue:number|null;
  totalCustomers:number|null; activeCustomers:number|null; totalProducts:number|null; invoiceCount:number|null;
  avgInvoiceValue:number|null; collectionRate:number|null; status:'CONFIRMED'|'CALCULATED'|'INSUFFICIENT_DATA';
}
export interface MonthlyTrend {month:string;label:string;sales:number|null;cost:number|null;profit:number|null;invoices:number;status:'CALCULATED'|'NO_DATA'|'INSUFFICIENT_DATA';}
export interface TopEntity {id:string;name:string;value:number;secondary?:number;}
export interface AgingBucket {bucket:string;amount:number|null;count:number;}
export interface AgingDashboard {rows:AgingBucket[];totalAmount:number|null;unknownRows:number|null;status:'NO_DATA'|'CALCULATED'|'INSUFFICIENT_DATA';}
export interface CategoryBreakdown {name:string|null;sales:number;profit:number;quantity:number;categoryStatus:'CALCULATED'|'UNKNOWN';}
export interface ProfitabilitySnapshot {status:'CALCULATED'|'INSUFFICIENT_DATA';currency:string|null;currency_status:'CONSISTENT'|'INSUFFICIENT_DATA';revenue:number|null;cost:number|null;gross_profit:number|null;gross_margin:number|null;invoice_count:number|null;bad_invoice_rows:number|null;bad_sale_item_rows:number|null;currency_mismatch_rows:number|null;reasons:string[];as_of:string;}
export interface InventoryReportRow {id:string;quantity:number|null;unit_cost:number|null;value:number|null;product?:{id:string|null;name:string|null;sku:string|null;reorder_point:number|null}|null;warehouse?:{id:string|null;name:string|null}|null;}
export interface InventoryReportSnapshot {rows:InventoryReportRow[];page:number;pageSize:number;filter:'all'|'low'|'out';totalRows:number|null;filteredRows:number|null;lowStock:number|null;outOfStock:number|null;unknownRows:number|null;totalValue:number|null;dataStatus:'NO_DATA'|'INSUFFICIENT_DATA'|'CALCULATED';}
export interface RFMSnapshotRow {customer_id:string;customer_name:string;recency:number;frequency:number;monetary:number;r_score:number;f_score:number;m_score:number;rfm_segment:string;}
export interface RFMSnapshot {rows:RFMSnapshotRow[];asOf:string;unknownRows:number|null;status:'INSUFFICIENT_DATA'|'CALCULATED';}
export interface ABCSnapshotRow {product_id:string;product_name:string;revenue:number;cumulative:number;cumulative_pct:number|null;class:'A'|'B'|'C'|null;}
export interface ABCSnapshot {rows:ABCSnapshotRow[];totalRevenue:number|null;unknownRows:number|null;status:'INSUFFICIENT_DATA'|'CALCULATED';}
export interface AgingSnapshotRow {name:string;amount:number;count:number;}
export interface AgingSnapshot {rows:AgingSnapshotRow[];asOf:string;unknownRows:number|null;status:'NO_DATA'|'INSUFFICIENT_DATA'|'CALCULATED';}
interface Snapshot { kpis:DashboardKPIs; trend:MonthlyTrend[]; topCustomers:TopEntity[]; topProducts:TopEntity[]; categories:CategoryBreakdown[]; aging:AgingDashboard; asOf:string; months:number; }
function finiteOrNull(value: unknown): number|null { return typeof value === 'number' && Number.isFinite(value) ? value : null; }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function isNonBlankString(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function isFiniteNumberOrNull(value: unknown): boolean { return value === null || finiteOrNull(value) !== null; }
function requiredInteger(value: unknown, field: string, minimum = 0): number {
  if (!Number.isInteger(value) || Number(value) < minimum) throw new Error(`REPORT_DATA_MALFORMED:${field}`);
  return Number(value);
}
function requiredAsOf(value: unknown, field: string): string {
  if (!isNonBlankString(value)) throw new Error(`REPORT_DATA_MALFORMED:${field}`);
  return value;
}
function requiredEnum<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) throw new Error(`REPORT_DATA_MALFORMED:${field}`);
  return value as T;
}
function requiredArray<T>(value: unknown, field: string, predicate?: (item: unknown) => boolean): T[] {
  if (!Array.isArray(value)) throw new Error(`REPORT_DATA_MALFORMED:${field}`);
  if (predicate && value.some((item) => !predicate(item))) throw new Error(`REPORT_DATA_MALFORMED:${field}`);
  return value as T[];
}
function isNullableString(value: unknown): boolean { return value === null || value === undefined || isNonBlankString(value); }
export function isInventoryReportRow(value: unknown): boolean {
  if (!isRecord(value) || !isNonBlankString(value.id)) return false;
  if (![value.quantity, value.unit_cost, value.value].every(isFiniteNumberOrNull)) return false;
  const validProduct = value.product === undefined || value.product === null || (
    isRecord(value.product) &&
    isNullableString(value.product.id) &&
    isNullableString(value.product.name) &&
    isNullableString(value.product.sku) &&
    isFiniteNumberOrNull(value.product.reorder_point)
  );
  const validWarehouse = value.warehouse === undefined || value.warehouse === null || (
    isRecord(value.warehouse) &&
    isNullableString(value.warehouse.id) &&
    isNullableString(value.warehouse.name)
  );
  return validProduct && validWarehouse;
}

export function normalizeAgingDashboard(value: unknown): AgingDashboard {
  const rows = requiredArray<AgingBucket>(value, 'aging.rows', isAgingBucket);
  const totalRows = rows.reduce((sum, row) => sum + row.count, 0);
  const unknownRows = rows.filter((row) => row.bucket === 'UNKNOWN').reduce((sum, row) => sum + row.count, 0);
  const countedAmounts = rows.filter((row) => row.count > 0).map((row) => row.amount);
  const totalAmount = countedAmounts.length > 0 && countedAmounts.every((amount) => amount !== null)
    ? countedAmounts.reduce((sum, amount) => sum + Number(amount), 0)
    : countedAmounts.length === 0 ? null : null;
  return {
    rows,
    totalAmount,
    unknownRows,
    status: totalRows === 0 ? 'NO_DATA' : unknownRows > 0 ? 'INSUFFICIENT_DATA' : 'CALCULATED',
  };
}
function isMonthlyTrend(value: unknown): boolean {
  if (!isRecord(value) || !isNonBlankString(value.month) || !isNonBlankString(value.label)) return false;
  if (![value.sales, value.cost, value.profit].every(isFiniteNumberOrNull)) return false;
  if (typeof value.invoices !== 'number' || !Number.isInteger(value.invoices) || value.invoices < 0) return false;
  return value.status === undefined || value.status === 'CALCULATED' || value.status === 'NO_DATA' || value.status === 'INSUFFICIENT_DATA';
}
export function normalizeMonthlyTrend(value: unknown): MonthlyTrend {
  if (!isMonthlyTrend(value)) throw new Error('REPORT_DATA_MALFORMED:trend');
  const row = value as Record<string, unknown>;
  const derivedStatus: MonthlyTrend['status'] = row.invoices === 0
    ? 'NO_DATA'
    : row.sales === null || row.cost === null || row.profit === null
      ? 'INSUFFICIENT_DATA'
      : 'CALCULATED';
  return {
    month: String(row.month),
    label: String(row.label),
    sales: row.sales as number | null,
    cost: row.cost as number | null,
    profit: row.profit as number | null,
    invoices: Number(row.invoices),
    status: row.status === undefined ? derivedStatus : row.status as MonthlyTrend['status'],
  };
}
function isTopEntity(value: unknown): boolean {
  if (!isRecord(value) || !isNonBlankString(value.id) || !isNonBlankString(value.name) || finiteOrNull(value.value) === null) return false;
  return value.secondary === undefined || finiteOrNull(value.secondary) !== null;
}
function isCategoryBreakdown(value: unknown): boolean {
  if (!isRecord(value) || (value.name !== null && !isNonBlankString(value.name))) return false;
  return finiteOrNull(value.sales) !== null && finiteOrNull(value.profit) !== null && finiteOrNull(value.quantity) !== null &&
    (value.categoryStatus === undefined || value.categoryStatus === 'CALCULATED' || value.categoryStatus === 'UNKNOWN');
}
export function normalizeCategoryBreakdown(value: unknown): CategoryBreakdown {
  if (!isCategoryBreakdown(value)) throw new Error('REPORT_DATA_MALFORMED:categories');
  const row = value as Record<string, unknown>;
  return {
    name: row.name === null ? null : String(row.name),
    sales: Number(row.sales),
    profit: Number(row.profit),
    quantity: Number(row.quantity),
    categoryStatus: row.categoryStatus === undefined
      ? (row.name === null ? 'UNKNOWN' : 'CALCULATED')
      : row.categoryStatus as CategoryBreakdown['categoryStatus'],
  };
}
function isAgingBucket(value: unknown): boolean {
  return isRecord(value) && isNonBlankString(value.bucket) && isFiniteNumberOrNull(value.amount) &&
    typeof value.count === 'number' && Number.isInteger(value.count) && value.count >= 0;
}

function isRecommendation(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return isNonBlankString(value.id) && isNonBlankString(value.company_id) && isNonBlankString(value.category) &&
    isNonBlankString(value.priority) && isNonBlankString(value.title) &&
    (value.description === null || value.description === undefined || typeof value.description === 'string') &&
    isFiniteNumberOrNull(value.expected_impact) && isNonBlankString(value.confidence) &&
    isNonBlankString(value.status) && (value.owner === null || value.owner === undefined || typeof value.owner === 'string') &&
    (value.deadline === null || value.deadline === undefined || typeof value.deadline === 'string') &&
    (value.impact_result === null || value.impact_result === undefined || typeof value.impact_result === 'string') &&
    isNonBlankString(value.created_at);
}

function isAlert(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return isNonBlankString(value.id) && isNonBlankString(value.company_id) && isNonBlankString(value.severity) &&
    isNonBlankString(value.category) && isNonBlankString(value.title) &&
    (value.description === null || value.description === undefined || typeof value.description === 'string') &&
    isFiniteNumberOrNull(value.metric_value) && isFiniteNumberOrNull(value.threshold) &&
    typeof value.is_read === 'boolean' && isNonBlankString(value.created_at);
}
function asOfDate(): string { return new Date().toISOString().slice(0, 10); }

export async function fetchDashboardSnapshot(months = 6): Promise<Snapshot> {
  if (!Number.isInteger(months) || months < 1 || months > 24) throw new Error('REPORT_QUERY_INVALID_MONTHS');
  const { data, error } = await supabase.rpc('get_dashboard_snapshot', { p_months: months, p_as_of: asOfDate() });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: dashboard snapshot missing');
  const row = data as Record<string, unknown>;

  const rawStatus = row.status;
  const evidence = row.evidence;
  const hasEvidence = evidence !== null && evidence !== undefined;
  const status: DashboardKPIs['status'] = rawStatus === 'CONFIRMED' && !hasEvidence
    ? 'INSUFFICIENT_DATA'
    : rawStatus === 'CONFIRMED'
      ? 'CONFIRMED'
      : rawStatus === 'CALCULATED'
        ? 'CALCULATED'
        : 'INSUFFICIENT_DATA';
  const valueOrNull = (value: unknown): number | null => status === 'INSUFFICIENT_DATA' ? null : finiteOrNull(value);

  const kpis: DashboardKPIs = {
    totalSales:valueOrNull(row.totalSales),
    totalCost:valueOrNull(row.totalCost),
    grossProfit:valueOrNull(row.grossProfit),
    grossMargin:valueOrNull(row.grossMargin),
    totalReceivables:valueOrNull(row.totalReceivables),
    overdueReceivables:valueOrNull(row.overdueReceivables),
    totalPayables:valueOrNull(row.totalPayables),
    inventoryValue:valueOrNull(row.inventoryValue),
    totalCustomers:valueOrNull(row.totalCustomers),
    activeCustomers:valueOrNull(row.activeCustomers),
    totalProducts:valueOrNull(row.totalProducts),
    invoiceCount:valueOrNull(row.invoiceCount),
    avgInvoiceValue:valueOrNull(row.avgInvoiceValue),
    collectionRate:valueOrNull(row.collectionRate),
    status,
  };

  if (requiredInteger(row.months, 'months', 1) > 24) throw new Error('REPORT_DATA_MALFORMED:months');
  return {
    kpis,
    trend: requiredArray<unknown>(row.trend, 'trend', isMonthlyTrend).map(normalizeMonthlyTrend),
    topCustomers: requiredArray<TopEntity>(row.topCustomers, 'topCustomers', isTopEntity).slice(0,10),
    topProducts: requiredArray<TopEntity>(row.topProducts, 'topProducts', isTopEntity).slice(0,10),
    categories: requiredArray<unknown>(row.categories, 'categories', isCategoryBreakdown).map(normalizeCategoryBreakdown),
    asOf: requiredAsOf(row.asOf, 'asOf'),
    months: requiredInteger(row.months, 'months', 1),
    aging: normalizeAgingDashboard(row.aging),
  };
}

export async function fetchInventoryReportSnapshot(page = 0, pageSize = 25, filter: 'all'|'low'|'out' = 'all'): Promise<InventoryReportSnapshot> {
  if (!Number.isInteger(page) || page < 0) throw new Error('REPORT_QUERY_INVALID_PAGE');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');
  if (!['all','low','out'].includes(filter)) throw new Error('REPORT_QUERY_INVALID_FILTER');
  const { data, error } = await supabase.rpc('get_inventory_report_snapshot', { p_page: page, p_page_size: pageSize, p_filter: filter });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: inventory snapshot missing');
  const row = data as Record<string, unknown>;
  const responsePage = requiredInteger(row.page, 'inventory.page');
  const responsePageSize = requiredInteger(row.pageSize, 'inventory.pageSize', 1);
  if (responsePageSize > 100) throw new Error('REPORT_DATA_MALFORMED:inventory.pageSize');
  const responseFilter = requiredEnum(row.filter, 'inventory.filter', ['all', 'low', 'out'] as const);
  if (responseFilter !== filter) throw new Error('REPORT_DATA_MALFORMED:inventory.filter_mismatch');
  const responseStatus = requiredEnum(row.dataStatus, 'inventory.dataStatus', ['CALCULATED', 'INSUFFICIENT_DATA', 'NO_DATA'] as const);
  const integerOrNull = (value: unknown, field: string) => value === null ? null : requiredInteger(value, field);
  return {
    rows: requiredArray<InventoryReportRow>(row.rows, 'inventory.rows', isInventoryReportRow),
    page: responsePage,
    pageSize: responsePageSize,
    filter: responseFilter,
    totalRows: integerOrNull(row.totalRows, 'inventory.totalRows'),
    filteredRows: integerOrNull(row.filteredRows, 'inventory.filteredRows'),
    lowStock: integerOrNull(row.lowStock, 'inventory.lowStock'),
    outOfStock: integerOrNull(row.outOfStock, 'inventory.outOfStock'),
    unknownRows: integerOrNull(row.unknownRows, 'inventory.unknownRows'),
    totalValue: finiteOrNull(row.totalValue),
    dataStatus: responseStatus
  };
}

export async function fetchProfitabilitySnapshot(): Promise<ProfitabilitySnapshot> {
  const { data, error } = await supabase.rpc('get_profitability_snapshot', { p_as_of: asOfDate() });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: profitability snapshot missing');
  const row=data as Record<string,unknown>;
  return {
    status: requiredEnum(row.status, 'profitability.status', ['CALCULATED', 'INSUFFICIENT_DATA'] as const),
    currency: typeof row.currency === 'string' ? row.currency : row.currency === null ? null : (() => { throw new Error('REPORT_DATA_MALFORMED:profitability.currency'); })(),
    currency_status: requiredEnum(row.currency_status, 'profitability.currency_status', ['CONSISTENT', 'INSUFFICIENT_DATA'] as const),
    revenue: finiteOrNull(row.revenue),
    cost: finiteOrNull(row.cost),
    gross_profit: finiteOrNull(row.gross_profit),
    gross_margin: finiteOrNull(row.gross_margin),
    invoice_count: row.invoice_count === null ? null : requiredInteger(row.invoice_count, 'profitability.invoice_count'),
    bad_invoice_rows: row.bad_invoice_rows === null ? null : requiredInteger(row.bad_invoice_rows, 'profitability.bad_invoice_rows'),
    bad_sale_item_rows: row.bad_sale_item_rows === null ? null : requiredInteger(row.bad_sale_item_rows, 'profitability.bad_sale_item_rows'),
    currency_mismatch_rows: row.currency_mismatch_rows === null ? null : requiredInteger(row.currency_mismatch_rows, 'profitability.currency_mismatch_rows'),
    reasons: requiredArray<string>(row.reasons, 'profitability.reasons', isNonBlankString),
    as_of: requiredAsOf(row.as_of, 'profitability.as_of'),
  };
}

export async function fetchRFMSnapshot(limit = 500): Promise<RFMSnapshot> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error('REPORT_QUERY_INVALID_LIMIT');
  const { data, error } = await supabase.rpc('get_rfm_snapshot', { p_as_of: asOfDate(), p_limit: limit });
  if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: RFM snapshot missing');
  const row = data as Record<string, unknown>;
  return {
    rows: requiredArray<RFMSnapshotRow>(row.rows, 'rfm.rows', (item) => isRecord(item) && isNonBlankString(item.customer_id) && isNonBlankString(item.customer_name) && [item.recency, item.frequency, item.monetary, item.r_score, item.f_score, item.m_score].every((value) => finiteOrNull(value) !== null) && isNonBlankString(item.rfm_segment)),
    asOf: requiredAsOf(row.asOf, 'rfm.asOf'),
    unknownRows: row.unknownRows === null ? null : requiredInteger(row.unknownRows, 'rfm.unknownRows'),
    status: requiredEnum(row.status, 'rfm.status', ['CALCULATED', 'INSUFFICIENT_DATA'] as const),
  };
}
export async function fetchABCSnapshot(limit = 500): Promise<ABCSnapshot> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error('REPORT_QUERY_INVALID_LIMIT');
  const { data, error } = await supabase.rpc('get_abc_snapshot', { p_limit: limit });
  if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: ABC snapshot missing');
  const row = data as Record<string, unknown>;
  return {
    rows: requiredArray<ABCSnapshotRow>(row.rows, 'abc.rows', (item) => isRecord(item) && isNonBlankString(item.product_id) && isNonBlankString(item.product_name) && finiteOrNull(item.revenue) !== null && finiteOrNull(item.cumulative) !== null && isFiniteNumberOrNull(item.cumulative_pct) && (item.class === null || item.class === undefined || item.class === 'A' || item.class === 'B' || item.class === 'C')),
    totalRevenue: finiteOrNull(row.totalRevenue),
    unknownRows: row.unknownRows === null ? null : requiredInteger(row.unknownRows, 'abc.unknownRows'),
    status: requiredEnum(row.status, 'abc.status', ['CALCULATED', 'INSUFFICIENT_DATA'] as const),
  };
}
export async function fetchAgingSnapshot(): Promise<AgingSnapshot> {
  const { data, error } = await supabase.rpc('get_aging_snapshot', { p_as_of: asOfDate() });
  if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: aging snapshot missing');
  const row = data as Record<string, unknown>;
  return {
    rows: requiredArray<AgingSnapshotRow>(row.rows, 'aging.rows', (item) => isRecord(item) && isNonBlankString(item.name) && finiteOrNull(item.amount) !== null && typeof item.count === 'number' && Number.isInteger(item.count) && item.count >= 0),
    asOf: requiredAsOf(row.asOf, 'aging.asOf'),
    unknownRows: row.unknownRows === null ? null : requiredInteger(row.unknownRows, 'aging.unknownRows'),
    status: requiredEnum(row.status, 'aging.status', ['CALCULATED', 'NO_DATA', 'INSUFFICIENT_DATA'] as const),
  };
}

export async function fetchDashboardIntelligence(): Promise<{recommendations: Recommendation[]; alerts: Alert[]}> {
  const maxAttempts = 3;
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_intelligence', { p_limit: 100 });
      if (error) throw error;
      if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: dashboard intelligence missing');
      const row = data as Record<string, unknown>;
      return { recommendations: requiredArray<Recommendation>(row.recommendations, 'recommendations', isRecommendation), alerts: requiredArray<Alert>(row.alerts, 'alerts', isAlert) };
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 250 * attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error('REPORT_DATA_UNAVAILABLE: dashboard intelligence fetch failed');
}
