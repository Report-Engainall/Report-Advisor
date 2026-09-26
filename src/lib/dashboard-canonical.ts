import { supabase } from './supabase';
import type { Recommendation, Alert } from './types';

export interface DashboardKPIs {
  totalSales:number|null; totalCost:number|null; grossProfit:number|null; grossMargin:number|null;
  totalReceivables:number|null; overdueReceivables:number|null; totalPayables:number|null; inventoryValue:number|null;
  totalCustomers:number|null; activeCustomers:number|null; totalProducts:number|null; invoiceCount:number|null;
  avgInvoiceValue:number|null; collectionRate:number|null; status:'CONFIRMED'|'CALCULATED'|'INSUFFICIENT_DATA';
}
export interface DashboardQuality {
  badInvoiceRows:number|null;
  badSaleItemRows:number|null;
  badPurchaseRows:number|null;
  badInventoryRows:number|null;
  salesCurrencyMismatchRows:number|null;
  purchaseCurrencyMismatchRows:number|null;
}
export interface MonthlyTrend {month:string;label:string;sales:number|null;cost:number|null;profit:number|null;invoices:number;status:'CALCULATED'|'NO_DATA'|'INSUFFICIENT_DATA';}
export interface TopEntity {id:string;name:string;value:number;secondary?:number;}
export interface AgingBucket {bucket:string;amount:number|null;count:number;}
export interface AgingDashboard {rows:AgingBucket[];totalAmount:number|null;unknownRows:number|null;status:'NO_DATA'|'CALCULATED'|'INSUFFICIENT_DATA';}
export interface CategoryBreakdown {name:string|null;sales:number;profit:number;quantity:number;categoryStatus:'CALCULATED'|'UNKNOWN';}
export interface ProfitabilitySnapshot {status:'CALCULATED'|'INSUFFICIENT_DATA';currency:string|null;currency_status:'CONSISTENT'|'INSUFFICIENT_DATA';revenue:number|null;cost:number|null;gross_profit:number|null;gross_margin:number|null;invoice_count:number|null;bad_invoice_rows:number|null;bad_sale_item_rows:number|null;currency_mismatch_rows:number|null;reasons:string[];as_of:string;}
export interface InventoryReportRow {id:string;quantity:number|null;unit_cost:number|null;value:number|null;product?:{id:string;name:string|null;sku:string|null;reorder_point:number|null}|null;warehouse?:{id:string;name:string|null}|null;}
export interface InventoryReportSnapshot {rows:InventoryReportRow[];page:number;pageSize:number;filter:'all'|'low'|'out';totalRows:number|null;filteredRows:number|null;lowStock:number|null;outOfStock:number|null;unknownRows:number|null;totalValue:number|null;dataStatus:'NO_DATA'|'INSUFFICIENT_DATA'|'CALCULATED';}
export interface RFMSnapshotRow {customer_id:string;customer_name:string;recency:number;frequency:number;monetary:number;r_score:number;f_score:number;m_score:number;rfm_segment:string;}
export interface RFMSnapshot {rows:RFMSnapshotRow[];asOf:string;unknownRows:number|null;status:'INSUFFICIENT_DATA'|'CALCULATED';}
export interface ABCSnapshotRow {product_id:string;product_name:string;revenue:number;cumulative:number;cumulative_pct:number|null;class:'A'|'B'|'C'|null;}
export interface ABCSnapshot {rows:ABCSnapshotRow[];totalRevenue:number|null;unknownRows:number|null;status:'INSUFFICIENT_DATA'|'CALCULATED';}
export interface AgingSnapshotRow {name:string;amount:number;count:number;}
export interface AgingSnapshot {rows:AgingSnapshotRow[];asOf:string;unknownRows:number|null;status:'NO_DATA'|'INSUFFICIENT_DATA'|'CALCULATED';}
interface Snapshot { kpis:DashboardKPIs; trend:MonthlyTrend[]; topCustomers:TopEntity[]; topProducts:TopEntity[]; categories:CategoryBreakdown[]; aging:AgingDashboard; quality:DashboardQuality; asOf:string; months:number; }
function finiteOrNull(value: unknown): number|null { return typeof value === 'number' && Number.isFinite(value) ? value : null; }
function qualityCountOrNull(value: unknown, field: string): number|null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value;
  throw new Error('REPORT_DATA_INVALID: ' + field + ' must be a non-negative integer or null');
}
function nonNegativeIntegerOrNull(value: unknown, field: string): number|null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value;
  throw new Error('REPORT_DATA_INVALID: ' + field + ' must be a non-negative integer or null');
}
function requiredArray<T>(value: unknown, field: string): T[] {
  if (!Array.isArray(value)) throw new Error('REPORT_DATA_INVALID: ' + field + ' must be an array');
  return value as T[];
}
function validateDashboardRows(row: Record<string, unknown>): void {
  const trend = requiredArray<unknown>(row.trend, 'trend');
  trend.forEach((item, index) => {
    if (!item || typeof item !== 'object') throw new Error('REPORT_DATA_INVALID: trend[' + index + '] must be an object');
    const value = item as Record<string, unknown>;
    if (typeof value.month !== 'string' || typeof value.label !== 'string' || !Number.isInteger(value.invoices) || value.invoices < 0) throw new Error('REPORT_DATA_INVALID: trend[' + index + '] shape is invalid');
    if (!['CALCULATED', 'NO_DATA', 'INSUFFICIENT_DATA'].includes(value.status as string)) throw new Error('REPORT_DATA_INVALID: trend[' + index + '].status is invalid');
    for (const field of ['sales', 'cost', 'profit']) {
      if (value[field] !== null && (typeof value[field] !== 'number' || !Number.isFinite(value[field] as number))) throw new Error('REPORT_DATA_INVALID: trend[' + index + '].' + field + ' is invalid');
    }
  });
  for (const [field, max] of [['topCustomers', 10], ['topProducts', 10]] as const) {
    const items = requiredArray<unknown>(row[field], field);
    if (items.length > max) throw new Error('REPORT_DATA_INVALID: ' + field + ' exceeds canonical row limit');
    items.forEach((item, index) => {
      if (!item || typeof item !== 'object') throw new Error('REPORT_DATA_INVALID: ' + field + '[' + index + '] must be an object');
      const value = item as Record<string, unknown>;
      if (typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.value !== 'number' || !Number.isFinite(value.value as number)) throw new Error('REPORT_DATA_INVALID: ' + field + '[' + index + '] shape is invalid');
      if (value.secondary !== undefined && (typeof value.secondary !== 'number' || !Number.isFinite(value.secondary as number))) throw new Error('REPORT_DATA_INVALID: ' + field + '[' + index + '].secondary is invalid');
    });
  }
  const categories = requiredArray<unknown>(row.categories, 'categories');
  categories.forEach((item, index) => {
    if (!item || typeof item !== 'object') throw new Error('REPORT_DATA_INVALID: categories[' + index + '] must be an object');
    const value = item as Record<string, unknown>;
    if ((value.name !== null && typeof value.name !== 'string') || ['sales', 'profit', 'quantity'].some((field) => typeof value[field] !== 'number' || !Number.isFinite(value[field] as number)) || !['CALCULATED', 'UNKNOWN'].includes(value.categoryStatus as string)) {
      throw new Error('REPORT_DATA_INVALID: categories[' + index + '] shape is invalid');
    }
  });
}
function requiredAsOf(value: unknown, field: string): string {
  if (typeof value !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) throw new Error('REPORT_DATA_INVALID: ' + field + ' as-of must be YYYY-MM-DD');
  const parsed = new Date(value + 'T00:00:00.000Z');
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new Error('REPORT_DATA_INVALID: ' + field + ' as-of is not a valid calendar date');
  return value;
}
function asOfDate(): string { return new Date().toISOString().slice(0, 10); }

export async function fetchDashboardSnapshot(months = 6): Promise<Snapshot> {
  if (!Number.isInteger(months) || months < 1 || months > 24) throw new Error('REPORT_QUERY_INVALID_MONTHS');
  const { data, error } = await supabase.rpc('get_dashboard_snapshot', { p_months: months, p_as_of: asOfDate() });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: dashboard snapshot missing');
  const row = data as Record<string, unknown>;

  validateDashboardRows(row);
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

  const agingRow=(row.aging&&typeof row.aging==='object' && !Array.isArray(row.aging)?row.aging:{}) as Record<string,unknown>;
  const rawQuality = row.quality;
  if (rawQuality !== undefined && rawQuality !== null && (typeof rawQuality !== 'object' || Array.isArray(rawQuality))) {
    throw new Error('REPORT_DATA_INVALID: quality must be an object when provided');
  }
  const qualityRow=(rawQuality && typeof rawQuality==='object'?rawQuality:{}) as Record<string,unknown>;
  return {
    kpis,
    trend: requiredArray<MonthlyTrend>(row.trend, 'trend'),
    topCustomers: requiredArray<TopEntity>(row.topCustomers, 'topCustomers').slice(0,10),
    topProducts: requiredArray<TopEntity>(row.topProducts, 'topProducts').slice(0,10),
    categories: requiredArray<CategoryBreakdown>(row.categories, 'categories'),
    asOf: requiredAsOf(row.asOf, 'dashboard'),
    months: typeof row.months === 'number' && Number.isInteger(row.months) && row.months >= 1 && row.months <= 24 ? row.months : (() => { throw new Error('REPORT_DATA_INVALID: dashboard months is invalid'); })(),
    aging:{
      rows:requiredArray<AgingBucket>(agingRow.rows, 'aging.rows').map((item, index) => {
        if (!item || typeof item !== 'object') throw new Error('REPORT_DATA_INVALID: aging.rows[' + index + '] must be an object');
        const value = item as Record<string, unknown>;
        if (typeof value.bucket !== 'string' || !Number.isInteger(value.count) || value.count < 0 || (value.amount !== null && (typeof value.amount !== 'number' || !Number.isFinite(value.amount as number)))) {
          throw new Error('REPORT_DATA_INVALID: aging.rows[' + index + '] shape is invalid');
        }
        return value as AgingBucket;
      }),
      totalAmount:finiteOrNull(agingRow.totalAmount),
      unknownRows:nonNegativeIntegerOrNull(agingRow.unknownRows, 'aging.unknownRows'),
      status:agingRow.status==='CALCULATED'?'CALCULATED':agingRow.status==='NO_DATA'?'NO_DATA':agingRow.status==='INSUFFICIENT_DATA'?'INSUFFICIENT_DATA':(() => { throw new Error('REPORT_DATA_INVALID: aging.status is invalid'); })()
    },
    quality:{
      badInvoiceRows:qualityCountOrNull(qualityRow.badInvoiceRows, 'quality.badInvoiceRows'),
      badSaleItemRows:qualityCountOrNull(qualityRow.badSaleItemRows, 'quality.badSaleItemRows'),
      badPurchaseRows:qualityCountOrNull(qualityRow.badPurchaseRows, 'quality.badPurchaseRows'),
      badInventoryRows:qualityCountOrNull(qualityRow.badInventoryRows, 'quality.badInventoryRows'),
      salesCurrencyMismatchRows:qualityCountOrNull(qualityRow.salesCurrencyMismatchRows, 'quality.salesCurrencyMismatchRows'),
      purchaseCurrencyMismatchRows:qualityCountOrNull(qualityRow.purchaseCurrencyMismatchRows, 'quality.purchaseCurrencyMismatchRows'),
    }
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
  return {
    rows: requiredArray<InventoryReportRow>(row.rows, 'inventory.rows'), page: typeof row.page === 'number' && Number.isInteger(row.page) ? row.page : (() => { throw new Error('REPORT_DATA_INVALID: inventory.page is missing'); })(),
    pageSize: typeof row.pageSize === 'number' && Number.isInteger(row.pageSize) ? row.pageSize : (() => { throw new Error('REPORT_DATA_INVALID: inventory.pageSize is missing'); })(),
    filter: row.filter === 'all' || row.filter === 'low' || row.filter === 'out' ? row.filter : (() => { throw new Error('REPORT_DATA_INVALID: inventory.filter is invalid'); })(), totalRows: finiteOrNull(row.totalRows),
    filteredRows: nonNegativeIntegerOrNull(row.filteredRows, 'inventory.filteredRows'), lowStock: nonNegativeIntegerOrNull(row.lowStock, 'inventory.lowStock'), outOfStock: nonNegativeIntegerOrNull(row.outOfStock, 'inventory.outOfStock'),
    unknownRows: nonNegativeIntegerOrNull(row.unknownRows, 'inventory.unknownRows'), totalValue: finiteOrNull(row.totalValue),
    dataStatus: row.dataStatus === 'CALCULATED' || row.dataStatus === 'INSUFFICIENT_DATA' || row.dataStatus === 'NO_DATA' ? row.dataStatus : (() => { throw new Error('REPORT_DATA_INVALID: inventory.dataStatus is invalid'); })()
  };
}

export async function fetchProfitabilitySnapshot(): Promise<ProfitabilitySnapshot> {
  const { data, error } = await supabase.rpc('get_profitability_snapshot', { p_as_of: asOfDate() });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: profitability snapshot missing');
  const row=data as Record<string,unknown>;
  if (row.status !== 'CALCULATED' && row.status !== 'INSUFFICIENT_DATA') throw new Error('REPORT_DATA_INVALID: profitability.status is invalid');
  const reasons = requiredArray<unknown>(row.reasons, 'profitability.reasons');
  if (reasons.some((reason) => typeof reason !== 'string')) throw new Error('REPORT_DATA_INVALID: profitability.reasons must contain only strings');
  const nonNegativeIntegerMetric = (value: unknown, field: string): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value;
    throw new Error('REPORT_DATA_INVALID: ' + field + ' must be a non-negative integer or null');
  };
  return {
    status: row.status,
    currency: typeof row.currency === 'string' ? row.currency : null,
    currency_status: row.currency_status === 'CONSISTENT' ? 'CONSISTENT' : 'INSUFFICIENT_DATA',
    revenue: finiteOrNull(row.revenue),
    cost: finiteOrNull(row.cost),
    gross_profit: finiteOrNull(row.gross_profit),
    gross_margin: finiteOrNull(row.gross_margin),
    invoice_count: nonNegativeIntegerMetric(row.invoice_count, 'profitability.invoice_count'),
    bad_invoice_rows: nonNegativeIntegerMetric(row.bad_invoice_rows, 'profitability.bad_invoice_rows'),
    bad_sale_item_rows: nonNegativeIntegerMetric(row.bad_sale_item_rows, 'profitability.bad_sale_item_rows'),
    currency_mismatch_rows: nonNegativeIntegerMetric(row.currency_mismatch_rows, 'profitability.currency_mismatch_rows'),
    reasons: reasons as string[],
    as_of: requiredAsOf(row.as_of, 'profitability'),
  };
}

function validateRFMRows(rows: unknown[]): RFMSnapshotRow[] {
  rows.forEach((item, index) => {
    if (!item || typeof item !== 'object') throw new Error('REPORT_DATA_INVALID: rfm.rows[' + index + '] must be an object');
    const value = item as Record<string, unknown>;
    const finiteNumber = (field: string) => typeof value[field] === 'number' && Number.isFinite(value[field] as number);
    if (
      typeof value.customer_id !== 'string' ||
      typeof value.customer_name !== 'string' ||
      !finiteNumber('recency') ||
      !finiteNumber('frequency') ||
      !finiteNumber('monetary') ||
      !finiteNumber('r_score') ||
      !finiteNumber('f_score') ||
      !finiteNumber('m_score') ||
      typeof value.rfm_segment !== 'string'
    ) throw new Error('REPORT_DATA_INVALID: rfm.rows[' + index + '] shape is invalid');
  });
  return rows as RFMSnapshotRow[];
}

function validateABCRows(rows: unknown[]): ABCSnapshotRow[] {
  rows.forEach((item, index) => {
    if (!item || typeof item !== 'object') throw new Error('REPORT_DATA_INVALID: abc.rows[' + index + '] must be an object');
    const value = item as Record<string, unknown>;
    if (
      typeof value.product_id !== 'string' ||
      typeof value.product_name !== 'string' ||
      typeof value.revenue !== 'number' || !Number.isFinite(value.revenue) ||
      typeof value.cumulative !== 'number' || !Number.isFinite(value.cumulative) ||
      (value.cumulative_pct !== null && (typeof value.cumulative_pct !== 'number' || !Number.isFinite(value.cumulative_pct))) ||
      (value.class !== null && value.class !== 'A' && value.class !== 'B' && value.class !== 'C')
    ) throw new Error('REPORT_DATA_INVALID: abc.rows[' + index + '] shape is invalid');
  });
  return rows as ABCSnapshotRow[];
}

function validateAgingRows(rows: unknown[]): AgingSnapshotRow[] {
  rows.forEach((item, index) => {
    if (!item || typeof item !== 'object') throw new Error('REPORT_DATA_INVALID: aging.rows[' + index + '] must be an object');
    const value = item as Record<string, unknown>;
    if (
      typeof value.name !== 'string' ||
      typeof value.amount !== 'number' || !Number.isFinite(value.amount) ||
      typeof value.count !== 'number' || !Number.isInteger(value.count) || value.count < 0
    ) throw new Error('REPORT_DATA_INVALID: aging.rows[' + index + '] shape is invalid');
  });
  return rows as AgingSnapshotRow[];
}

export async function fetchRFMSnapshot(limit = 500): Promise<RFMSnapshot> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error('REPORT_QUERY_INVALID_LIMIT');
  const { data, error } = await supabase.rpc('get_rfm_snapshot', { p_as_of: asOfDate(), p_limit: limit });
  if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: RFM snapshot missing');
  const row = data as Record<string, unknown>; return { rows: validateRFMRows(requiredArray<unknown>(row.rows, 'rfm.rows')), asOf: requiredAsOf(row.asOf, 'rfm'), unknownRows: nonNegativeIntegerOrNull(row.unknownRows, 'rfm.unknownRows'), status: row.status === 'CALCULATED' ? 'CALCULATED' : row.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : (() => { throw new Error('REPORT_DATA_INVALID: rfm.status is invalid'); })() };
}
export async function fetchABCSnapshot(limit = 500): Promise<ABCSnapshot> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error('REPORT_QUERY_INVALID_LIMIT');
  const { data, error } = await supabase.rpc('get_abc_snapshot', { p_limit: limit });
  if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: ABC snapshot missing');
  const row = data as Record<string, unknown>; return { rows: validateABCRows(requiredArray<unknown>(row.rows, 'abc.rows')), totalRevenue: finiteOrNull(row.totalRevenue), unknownRows: nonNegativeIntegerOrNull(row.unknownRows, 'abc.unknownRows'), status: row.status === 'CALCULATED' ? 'CALCULATED' : row.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : (() => { throw new Error('REPORT_DATA_INVALID: abc.status is invalid'); })() };
}
export async function fetchAgingSnapshot(): Promise<AgingSnapshot> {
  const { data, error } = await supabase.rpc('get_aging_snapshot', { p_as_of: asOfDate() });
  if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: aging snapshot missing');
  const row = data as Record<string, unknown>; return { rows: validateAgingRows(requiredArray<unknown>(row.rows, 'aging.rows')), asOf: requiredAsOf(row.asOf, 'aging'), unknownRows: nonNegativeIntegerOrNull(row.unknownRows, 'aging.unknownRows'), status: row.status === 'CALCULATED' ? 'CALCULATED' : row.status === 'NO_DATA' ? 'NO_DATA' : row.status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : (() => { throw new Error('REPORT_DATA_INVALID: aging.status is invalid'); })() };
}

function validateDashboardIntelligence(row: Record<string, unknown>): { recommendations: Recommendation[]; alerts: Alert[] } {
  const recommendations = requiredArray<unknown>(row.recommendations, 'intelligence.recommendations');
  const alerts = requiredArray<unknown>(row.alerts, 'intelligence.alerts');

  recommendations.forEach((item, index) => {
    if (!item || typeof item !== 'object') throw new Error('REPORT_DATA_INVALID: intelligence.recommendations[' + index + '] must be an object');
    const value = item as Record<string, unknown>;
    if (
      typeof value.id !== 'string' ||
      typeof value.company_id !== 'string' ||
      typeof value.category !== 'string' ||
      typeof value.priority !== 'string' ||
      typeof value.title !== 'string' ||
      typeof value.status !== 'string' ||
      typeof value.confidence !== 'string' ||
      (value.expected_impact !== null && typeof value.expected_impact !== 'number' && value.expected_impact !== undefined) ||
      (value.owner !== null && typeof value.owner !== 'string' && value.owner !== undefined) ||
      (value.deadline !== null && typeof value.deadline !== 'string' && value.deadline !== undefined) ||
      (value.impact_result !== null && typeof value.impact_result !== 'string' && value.impact_result !== undefined) ||
      typeof value.created_at !== 'string'
    ) {
      throw new Error('REPORT_DATA_INVALID: intelligence.recommendations[' + index + '] shape is invalid');
    }
  });

  alerts.forEach((item, index) => {
    if (!item || typeof item !== 'object') throw new Error('REPORT_DATA_INVALID: intelligence.alerts[' + index + '] must be an object');
    const value = item as Record<string, unknown>;
    if (
      typeof value.id !== 'string' ||
      typeof value.company_id !== 'string' ||
      typeof value.severity !== 'string' ||
      typeof value.category !== 'string' ||
      typeof value.title !== 'string' ||
      typeof value.is_read !== 'boolean' ||
      (value.description !== null && typeof value.description !== 'string' && value.description !== undefined) ||
      (value.metric_value !== null && typeof value.metric_value !== 'number' && value.metric_value !== undefined) ||
      (value.threshold !== null && typeof value.threshold !== 'number' && value.threshold !== undefined) ||
      typeof value.created_at !== 'string'
    ) {
      throw new Error('REPORT_DATA_INVALID: intelligence.alerts[' + index + '] shape is invalid');
    }
  });

  return {
    recommendations: recommendations as Recommendation[],
    alerts: alerts as Alert[],
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
      return validateDashboardIntelligence(row);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('REPORT_DATA_INVALID:')) throw error;
      lastError = error;
      if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, 250 * attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error('REPORT_DATA_UNAVAILABLE: dashboard intelligence fetch failed');
}
