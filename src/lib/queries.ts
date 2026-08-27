import { supabase, resolveCurrentCompanyId } from './supabase';
import { fetchDashboardSnapshot, fetchDashboardIntelligence, type DashboardKPIs, type MonthlyTrend, type TopEntity, type AgingBucket, type CategoryBreakdown } from './dashboard-canonical';
import type { Recommendation, Alert, SalesInvoice, PurchaseInvoice, ImportRecord, Customer, Forecast, Product } from './types';

export type { DashboardKPIs, MonthlyTrend, TopEntity, AgingBucket, CategoryBreakdown };

/** Compatibility boundary only. Business aggregation lives in the authoritative dashboard RPC. */
export async function fetchDashboardKPIs(): Promise<DashboardKPIs> { return (await fetchDashboardSnapshot(6)).kpis; }
export async function fetchMonthlyTrend(months = 6): Promise<MonthlyTrend[]> { return (await fetchDashboardSnapshot(months)).trend; }
export async function fetchTopCustomers(limit = 5): Promise<TopEntity[]> { return (await fetchDashboardSnapshot(6)).topCustomers.slice(0, limit); }
export async function fetchTopProducts(limit = 5): Promise<TopEntity[]> { return (await fetchDashboardSnapshot(6)).topProducts.slice(0, limit); }
export async function fetchCategoryBreakdown(): Promise<CategoryBreakdown[]> { return (await fetchDashboardSnapshot(6)).categories; }
export async function fetchAgingBuckets(): Promise<AgingBucket[]> { return (await fetchDashboardSnapshot(6)).aging; }
export async function fetchRecommendations(): Promise<Recommendation[]> { return (await fetchDashboardIntelligence()).recommendations; }
export async function fetchAlerts(): Promise<Alert[]> { return (await fetchDashboardIntelligence()).alerts; }

export async function fetchSalesInvoices(page=0,pageSize=20):Promise<{data:SalesInvoice[];count:number|null}>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>500)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const from=page*pageSize,to=from+pageSize-1,{data,count,error}=await supabase.from('sales_invoices').select('*, customer:customers(id,name)',{count:'exact'}).eq('company_id',companyId).order('invoice_date',{ascending:false}).order('id',{ascending:true}).range(from,to);if(error)throw error;return{data:(data??[]) as SalesInvoice[],count};}
export async function fetchPurchaseInvoices(page=0,pageSize=20):Promise<{data:PurchaseInvoice[];count:number|null}>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>500)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const from=page*pageSize,to=from+pageSize-1,{data,count,error}=await supabase.from('purchase_invoices').select('*, supplier:suppliers(id,name)',{count:'exact'}).eq('company_id',companyId).order('invoice_date',{ascending:false}).order('id',{ascending:true}).range(from,to);if(error)throw error;return{data:(data??[]) as PurchaseInvoice[],count};}

type ImportRecordInput = Omit<ImportRecord, 'id' | 'company_id' | 'created_at' | 'error_message' | 'completed_at'>;
type ImportRecordPatch = Partial<Pick<ImportRecord, 'status' | 'progress' | 'error_message' | 'completed_at'>>;
type ImportRecordInput = Omit<ImportRecord, 'id' | 'company_id' | 'created_at' | 'error_message' | 'completed_at'>;
type ImportRecordPatch = Partial<Pick<ImportRecord, 'status' | 'progress' | 'error_message' | 'completed_at'>>;
type ImportJobState = { total_rows: number; processed_rows: number; valid_rows: number; invalid_rows: number; duplicate_rows: number; progress: number; result_summary: Record<string, unknown> | null; };
const TERMINAL_IMPORT_STATUSES = new Set(['completed', 'partial', 'failed', 'cancelled']);
async function readImportJob(id: string, companyId: string): Promise<ImportJobState> {
  const { data, error } = await supabase.from('import_jobs').select('total_rows, processed_rows, valid_rows, invalid_rows, duplicate_rows, progress, result_summary').eq('id', id).eq('company_id', companyId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN');
  return { total_rows: Number(data.total_rows ?? 0), processed_rows: Number(data.processed_rows ?? 0), valid_rows: Number(data.valid_rows ?? 0), invalid_rows: Number(data.invalid_rows ?? 0), duplicate_rows: Number(data.duplicate_rows ?? 0), progress: Number(data.progress ?? 0), result_summary: (data.result_summary as Record<string, unknown> | null) ?? null };
}
export async function createImportRecord(input: ImportRecordInput): Promise<ImportRecord> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.rpc('import_create_job', { p_company_id: companyId, p_entity_type: input.entity_type ?? 'import', p_total_rows: input.total_rows });
  if (error) throw error;
  return { id: String(data), company_id: companyId, ...input, error_message: null, created_at: new Date().toISOString(), completed_at: null };
}
export async function updateImportRecord(id: string, patch: ImportRecordPatch): Promise<void> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const current = await readImportJob(id, companyId);
  if (patch.progress !== undefined) {
    const progress = Math.min(100, Math.max(0, Number(patch.progress)));
    const processedRows = current.total_rows > 0 ? Math.min(current.total_rows, Math.max(current.processed_rows, Math.round(current.total_rows * progress / 100))) : current.processed_rows;
    const { error } = await supabase.rpc('import_update_job_progress', {
      p_job_id: id, p_processed_rows: processedRows, p_valid_rows: current.valid_rows, p_invalid_rows: current.invalid_rows,
      p_duplicate_rows: current.duplicate_rows, p_status: TERMINAL_IMPORT_STATUSES.has(patch.status ?? '') ? 'processing' : (patch.status ?? 'processing')
    });
    if (error) throw error;
  }
  if (patch.status && TERMINAL_IMPORT_STATUSES.has(patch.status)) {
    const { error } = await supabase.rpc('import_finish_job', { p_job_id: id, p_status: patch.status, p_result_summary: current.result_summary ?? {}, p_error_message: patch.error_message ?? null });
    if (error) throw error;
  } else if (patch.error_message !== undefined && patch.status === undefined) {
    const { error } = await supabase.rpc('import_update_job_progress', {
      p_job_id: id, p_processed_rows: current.processed_rows, p_valid_rows: current.valid_rows, p_invalid_rows: current.invalid_rows,
      p_duplicate_rows: current.duplicate_rows, p_status: 'processing'
    });
    if (error) throw error;
  }
}
export async function fetchImportRecords(): Promise<ImportRecord[]> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('import_jobs').select('id, company_id, job_type, status, total_rows, valid_rows, invalid_rows, progress, error_message, created_at, completed_at, result_summary').eq('company_id', companyId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({ id: row.id, company_id: row.company_id, file_name: String((row.result_summary as Record<string, unknown> | null)?.file_name ?? row.job_type ?? 'import'), file_size: 0, source_type: 'import', status: row.status, total_rows: row.total_rows ?? 0, valid_rows: row.valid_rows ?? 0, invalid_rows: row.invalid_rows ?? 0, quarantined_rows: 0, entity_type: row.job_type ?? null, progress: row.progress ?? 0, error_message: row.error_message ?? null, created_at: row.created_at, completed_at: row.completed_at ?? null }));
}
export async function markAlertRead(id: string): Promise<void> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { error } = await supabase.from('alerts').update({ is_read: true }).eq('id', id).eq('company_id', companyId); if (error) throw error;
}
export async function updateRecommendationStatus(id: string, status: string): Promise<void> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { error } = await supabase.from('recommendations').update({ status }).eq('id', id).eq('company_id', companyId); if (error) throw error;
}

export interface PurchaseSummary { total: number | null; count: number; supplier_count: number; average: number | null; as_of: string; data_status: 'NO_DATA' | 'CALCULATED'; }
export async function fetchPurchaseSummary(from: string | null = null, to: string | null = null): Promise<PurchaseSummary> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.rpc('get_purchase_summary', { p_company_id: companyId, p_from: from, p_to: to }); if (error) throw error;
  const row = (data ?? {}) as Record<string, unknown>;
  return { total: row.total == null ? null : Number(row.total), count: Number(row.count ?? 0), supplier_count: Number(row.supplier_count ?? 0), average: row.average == null ? null : Number(row.average), as_of: String(row.as_of ?? ''), data_status: row.data_status === 'NO_DATA' ? 'NO_DATA' : 'CALCULATED' };
}
export interface InventoryValuation { value: number | null; row_count: number; unknown_row_count: number; data_status: 'NO_DATA' | 'INSUFFICIENT_DATA' | 'CALCULATED'; }
export async function fetchInventoryValuation(): Promise<InventoryValuation> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.rpc('get_inventory_valuation', { p_company_id: companyId }); if (error) throw error;
  const row = (data ?? {}) as Record<string, unknown>;
  return { value: row.value == null ? null : Number(row.value), row_count: Number(row.row_count ?? 0), unknown_row_count: Number(row.unknown_row_count ?? 0), data_status: row.data_status === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT_DATA' : row.data_status === 'NO_DATA' ? 'NO_DATA' : 'CALCULATED' };
}
export interface CanonicalExportRow { [key: string]: string | number | null; }
async function canonicalExportRows(functionName: string): Promise<CanonicalExportRow[]> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.rpc(functionName, { p_company_id: companyId, p_max_rows: 10000 }); if (error) throw error;
  const payload = (data ?? {}) as Record<string, unknown>; if (!Array.isArray(payload.rows)) throw new Error('REPORT_DATA_UNAVAILABLE: canonical export rows missing');
  return payload.rows as CanonicalExportRow[];
}
export const fetchSalesExportRows = () => canonicalExportRows('get_sales_export_rows');
export const fetchPurchaseExportRows = () => canonicalExportRows('get_purchase_export_rows');
export const fetchInventoryExportRows = () => canonicalExportRows('get_inventory_export_rows');
export const fetchReceivablesExportRows = () => canonicalExportRows('get_receivables_export_rows');

export async function fetchForecasts(): Promise<Forecast[]> {
  const { data, error } = await supabase.rpc('get_forecast_snapshot', { p_limit: 500 });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: forecast snapshot missing');
  const payload = data as Record<string, unknown>;
  if (!Array.isArray(payload.rows)) throw new Error('REPORT_DATA_UNAVAILABLE: forecast rows missing');
  return payload.rows as Forecast[];
}

const MAX_ENTITY_ROWS = 500;
export async function fetchCustomers(): Promise<Customer[]> { const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); const {data,count,error}=await supabase.from('customers').select('*',{count:'exact'}).eq('company_id',companyId).order('name',{ascending:true}).order('id',{ascending:true}).range(0,MAX_ENTITY_ROWS-1); if(error)throw error; if((count??0)>MAX_ENTITY_ROWS)throw new Error('REPORT_QUERY_LIMIT_EXCEEDED: customers require explicit pagination'); return (data??[]) as Customer[]; }
export async function fetchProducts(): Promise<Product[]> { const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); const {data,count,error}=await supabase.from('products').select('*',{count:'exact'}).eq('company_id',companyId).order('name',{ascending:true}).order('id',{ascending:true}).range(0,MAX_ENTITY_ROWS-1); if(error)throw error; if((count??0)>MAX_ENTITY_ROWS)throw new Error('REPORT_QUERY_LIMIT_EXCEEDED: products require explicit pagination'); return (data??[]) as Product[]; }
