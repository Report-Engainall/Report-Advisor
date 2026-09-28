import { supabase, resolveCurrentCompanyId } from './supabase';
import { fetchDashboardSnapshot, fetchDashboardIntelligence, type DashboardKPIs, type MonthlyTrend, type TopEntity, type AgingBucket, type CategoryBreakdown } from './dashboard-canonical';
import type { Recommendation, Alert, SalesInvoice, PurchaseInvoice, ImportRecord, Customer, Forecast, Product } from './types';
import { summarizeOutcomes } from './analytics/outcome-feedback-core';
import { createRuntimeDecision as createCanonicalRuntimeDecision, linkRecommendationToDecision as linkCanonicalRecommendationToDecision, requestRuntimeApproval as requestCanonicalDecisionApproval, decideRuntimeApproval as decideCanonicalApproval, createRuntimeWorkItem as createCanonicalWorkItem, startRuntimeWorkItem as startCanonicalWorkItem, completeRuntimeWorkItem as completeCanonicalWorkItem } from './decision-automation/vertical-slice-runtime';
export type { DashboardKPIs, MonthlyTrend, TopEntity, AgingBucket, CategoryBreakdown };
export type { ImportRecord } from './types';
export async function fetchDashboardKPIs(): Promise<DashboardKPIs> { return (await fetchDashboardSnapshot(6)).kpis; }
export async function fetchMonthlyTrend(months = 6): Promise<MonthlyTrend[]> { return (await fetchDashboardSnapshot(months)).trend; }
export async function fetchTopCustomers(limit = 5): Promise<TopEntity[]> { return (await fetchDashboardSnapshot(6)).topCustomers.slice(0, limit); }
export async function fetchTopProducts(limit = 5): Promise<TopEntity[]> { return (await fetchDashboardSnapshot(6)).topProducts.slice(0, limit); }
export async function fetchCategoryBreakdown(): Promise<CategoryBreakdown[]> { return (await fetchDashboardSnapshot(6)).categories; }
export async function fetchAgingBuckets(): Promise<AgingBucket[]> { return (await fetchDashboardSnapshot(6)).aging.rows; }
export async function fetchRecommendations(): Promise<Recommendation[]> { return (await fetchDashboardIntelligence()).recommendations; }
export async function fetchAlerts(): Promise<Alert[]> { return (await fetchDashboardIntelligence()).alerts; }
export type ReceivablesReportRow = { id:string; invoice_number:string; invoice_date:string; due_date:string|null; total:number|null; paid_amount:number|null; balance:number; status:string|null; customer:{id:string|null;name:string|null}|null };
export type ReceivablesReportPage = { status:'CALCULATED'|'NO_DATA'; page:number; page_size:number; total_rows:number; total_outstanding:number; rows:ReceivablesReportRow[] };
export async function fetchReceivablesReportPage(page=0,pageSize=25):Promise<ReceivablesReportPage>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const {data,error}=await supabase.rpc('get_receivables_report_page',{p_page:page,p_page_size:pageSize});if(error)throw error;if(!data||typeof data!=='object')throw new Error('REPORT_DATA_UNAVAILABLE: receivables snapshot missing');const p=data as Record<string,unknown>;if(!Array.isArray(p.rows))throw new Error('REPORT_DATA_UNAVAILABLE: receivables rows missing');return{status:p.status==='NO_DATA'?'NO_DATA':'CALCULATED',page:Number(p.page??page),page_size:Number(p.page_size??pageSize),total_rows:Number(p.total_rows??0),total_outstanding:Number(p.total_outstanding??0),rows:p.rows as ReceivablesReportRow[]};}
export type CanonicalExportRow = { [key:string]: string|number|null };
export async function fetchReceivablesExportRows():Promise<CanonicalExportRow[]>{const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const {data,error}=await supabase.rpc('get_receivables_export_rows',{p_company_id:companyId,p_max_rows:10000});if(error)throw error;const payload=(data??{}) as Record<string,unknown>;if(!Array.isArray(payload.rows))throw new Error('REPORT_DATA_UNAVAILABLE: receivables export rows missing');return payload.rows as CanonicalExportRow[];}
export async function fetchSalesInvoices(page=0,pageSize=20):Promise<{data:SalesInvoice[];count:number|null}>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>500)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const from=page*pageSize,to=from+pageSize-1,{data,count,error}=await supabase.from('sales_invoices').select('*, customer:customers(id,name)',{count:'exact'}).eq('company_id',companyId).order('invoice_date',{ascending:false}).order('created_at',{ascending:false}).order('id',{ascending:true}).range(from,to);if(error)throw error;return{data:(data??[]) as SalesInvoice[],count};}
export async function fetchPurchaseInvoices(page=0,pageSize=20):Promise<{data:PurchaseInvoice[];count:number|null}>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>500)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const from=page*pageSize,to=from+pageSize-1,{data,count,error}=await supabase.from('purchase_invoices').select('*, supplier:suppliers(id,name)',{count:'exact'}).eq('company_id',companyId).order('invoice_date',{ascending:false}).order('id',{ascending:true}).range(from,to);if(error)throw error;return{data:(data??[]) as PurchaseInvoice[],count};}
type ImportRecordInput = Omit<ImportRecord, 'id' | 'company_id' | 'created_at' | 'error_message' | 'completed_at'> & { source_object_path?: string; file_mime?: string };
type ImportRecordPatch = Partial<Pick<ImportRecord, 'status' | 'progress' | 'error_message' | 'completed_at'>> & { processed_rows?: number; valid_rows?: number; invalid_rows?: number; duplicate_rows?: number };
type ImportJobState = { total_rows: number | null; processed_rows: number | null; valid_rows: number | null; invalid_rows: number | null; duplicate_rows: number | null; progress: number | null; result_summary: Record<string, unknown> | null; };
const TERMINAL_IMPORT_STATUSES = new Set(['completed', 'partial', 'failed', 'cancelled']);
export async function createImportRecord(input: ImportRecordInput): Promise<ImportRecord> { const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); if (input.total_rows == null) throw new Error('IMPORT_TOTAL_ROWS_REQUIRED'); const { data, error } = await supabase.rpc('import_create_job', { p_company_id: companyId, p_entity_type: input.entity_type ?? 'import', p_total_rows: input.total_rows, p_source_object_path: input.source_object_path ?? null, p_file_name: input.file_name ?? null, p_file_size: input.file_size ?? null, p_file_mime: input.file_mime ?? null }); if (error) throw error; return { id: String(data), company_id: companyId, ...input, error_message: null, created_at: new Date().toISOString(), completed_at: null }; }
async function readImportJob(id: string, companyId: string): Promise<ImportJobState> { const { data, error } = await supabase.from('import_jobs').select('total_rows, processed_rows, valid_rows, invalid_rows, duplicate_rows, quarantined_rows, progress, result_summary').eq('id', id).eq('company_id', companyId).maybeSingle(); if (error) throw error; if (!data) throw new Error('IMPORT_JOB_NOT_FOUND_OR_FORBIDDEN'); return { total_rows: data.total_rows == null ? null : Number(data.total_rows), processed_rows: data.processed_rows == null ? null : Number(data.processed_rows), valid_rows: data.valid_rows == null ? null : Number(data.valid_rows), invalid_rows: data.invalid_rows == null ? null : Number(data.invalid_rows), duplicate_rows: data.duplicate_rows == null ? null : Number(data.duplicate_rows), progress: data.progress == null ? null : Number(data.progress), result_summary: (data.result_summary as Record<string, unknown> | null) ?? null }; }
export async function updateImportRecord(id: string, patch: ImportRecordPatch): Promise<void> { const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); const current = await readImportJob(id, companyId); const hasCounters = patch.processed_rows !== undefined || patch.valid_rows !== undefined || patch.invalid_rows !== undefined || patch.duplicate_rows !== undefined; if (patch.progress !== undefined || hasCounters) { if (current.total_rows == null || current.processed_rows == null || current.valid_rows == null || current.invalid_rows == null || current.duplicate_rows == null) throw new Error('IMPORT_STATE_INSUFFICIENT_DATA'); const progress = patch.progress === undefined ? current.progress ?? 0 : Math.min(100, Math.max(0, Number(patch.progress))); const processedRows = patch.processed_rows === undefined ? (current.total_rows > 0 ? Math.min(current.total_rows, Math.max(current.processed_rows, Math.round(current.total_rows * progress / 100))) : current.processed_rows) : Math.min(current.total_rows, Math.max(current.processed_rows, Math.trunc(patch.processed_rows))); const validRows = patch.valid_rows === undefined ? current.valid_rows : Math.trunc(patch.valid_rows); const invalidRows = patch.invalid_rows === undefined ? current.invalid_rows : Math.trunc(patch.invalid_rows); const duplicateRows = patch.duplicate_rows === undefined ? current.duplicate_rows : Math.trunc(patch.duplicate_rows); if (processedRows < 0 || validRows < 0 || invalidRows < 0 || duplicateRows < 0 || validRows > processedRows || invalidRows > processedRows || duplicateRows > processedRows) throw new Error('IMPORT_PROGRESS_COUNTER_INVALID'); const { error } = await supabase.rpc('import_update_job_progress', { p_job_id: id, p_processed_rows: processedRows, p_valid_rows: validRows, p_invalid_rows: invalidRows, p_duplicate_rows: duplicateRows, p_status: TERMINAL_IMPORT_STATUSES.has(patch.status ?? '') ? 'processing' : (patch.status ?? 'processing') }); if (error) throw error; } if (patch.status && TERMINAL_IMPORT_STATUSES.has(patch.status)) { const { error } = await supabase.rpc('import_finish_job', { p_job_id: id, p_status: patch.status, p_result_summary: current.result_summary ?? {}, p_error_message: patch.error_message ?? null }); if (error) throw error; } else if (patch.error_message !== undefined && patch.status === undefined) { if (current.processed_rows == null || current.valid_rows == null || current.invalid_rows == null || current.duplicate_rows == null) throw new Error('IMPORT_STATE_INSUFFICIENT_DATA'); const { error } = await supabase.rpc('import_update_job_progress', { p_job_id: id, p_processed_rows: current.processed_rows, p_valid_rows: current.valid_rows, p_invalid_rows: current.invalid_rows, p_duplicate_rows: current.duplicate_rows, p_status: 'processing' }); if (error) throw error; } }
const MAX_IMPORT_RECORD_ROWS = 500;
export async function fetchImportRecords(limit = MAX_IMPORT_RECORD_ROWS, focusJobId?: string): Promise<ImportRecord[]> { if (!Number.isInteger(limit) || limit < 1 || limit > MAX_IMPORT_RECORD_ROWS) throw new Error('REPORT_QUERY_INVALID_IMPORT_LIMIT'); const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); const { data, error } = await supabase.from('import_jobs').select('id, company_id, job_type, status, total_rows, valid_rows, invalid_rows, quarantined_rows, progress, error_message, created_at, completed_at, result_summary').eq('company_id', companyId).order('created_at', { ascending: false }).order('id', { ascending: true }).range(0, limit - 1); if (error) throw error; let rows = data ?? []; if (focusJobId && !rows.some(row => row.id === focusJobId)) { const { data: focusedRow, error: focusedError } = await supabase.from('import_jobs').select('id, company_id, job_type, status, total_rows, valid_rows, invalid_rows, quarantined_rows, progress, error_message, created_at, completed_at, result_summary').eq('company_id', companyId).eq('id', focusJobId).maybeSingle(); if (focusedError) throw focusedError; if (focusedRow) rows = [focusedRow, ...rows]; } return rows.map(row => ({ id: row.id, company_id: row.company_id, job_type: row.job_type, status: row.status, file_name: String((row.result_summary as Record<string, unknown> | null)?.file_name ?? row.job_type ?? 'import'), file_size: 0, source_type: 'import', total_rows: row.total_rows == null ? null : Number(row.total_rows), valid_rows: row.valid_rows == null ? null : Number(row.valid_rows), invalid_rows: row.invalid_rows == null ? null : Number(row.invalid_rows), quarantined_rows: row.quarantined_rows == null ? null : Number(row.quarantined_rows), entity_type: row.job_type ?? null, progress: row.progress == null ? null : Number(row.progress), error_message: row.error_message ?? null, created_at: row.created_at, completed_at: row.completed_at ?? null })); }
export async function markAlertRead(id: string): Promise<void> { if (!await resolveCurrentCompanyId()) throw new Error('TENANT_REQUIRED'); const { error } = await supabase.rpc('mark_alert_read', { p_alert_id: id }); if (error) throw error; }
export async function updateRecommendationStatus(id: string, status: string): Promise<void> { if (!await resolveCurrentCompanyId()) throw new Error('TENANT_REQUIRED'); const { error } = await supabase.rpc('update_recommendation_status', { p_recommendation_id: id, p_status: status }); if (error) throw error; }
export async function fetchForecasts(): Promise<Forecast[]> { const { data, error } = await supabase.rpc('get_forecast_snapshot', { p_limit: 500 }); if (error) throw error; if (!data || typeof data !== 'object') throw new Error('REPORT_DATA_UNAVAILABLE: forecast snapshot missing'); const payload = data as Record<string, unknown>; if (!Array.isArray(payload.rows)) throw new Error('REPORT_DATA_UNAVAILABLE: forecast rows missing'); return payload.rows as Forecast[]; }
export type CustomersPage = { data: Customer[]; count: number|null; page: number; page_size: number };
export async function fetchCustomersPage(page=0,pageSize=50,search=''):Promise<CustomersPage>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const normalized=search.trim().replace(/[,%()\\]/g,' ');const from=page*pageSize,to=from+pageSize-1;let query=supabase.from('customers').select('*',{count:'exact'}).eq('company_id',companyId);if(normalized)query=query.or(`name.ilike.%${normalized}%,code.ilike.%${normalized}%`);const {data,count,error}=await query.order('name',{ascending:true}).order('id',{ascending:true}).range(from,to);if(error)throw error;return{data:(data??[]) as Customer[],count,page,page_size:pageSize};}
export type ProductsPage = { data: Product[]; count: number|null; page: number; page_size: number };
export async function fetchProductsPage(page=0,pageSize=50,search=''):Promise<ProductsPage>{if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');if(!Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');const companyId=await resolveCurrentCompanyId();if(!companyId)throw new Error('TENANT_REQUIRED');const normalized=search.trim().replace(/[,%()\\]/g,' ');const from=page*pageSize,to=from+pageSize-1;let query=supabase.from('products').select('*',{count:'exact'}).eq('company_id',companyId);if(normalized)query=query.or(`name.ilike.%${normalized}%,sku.ilike.%${normalized}%`);const {data,count,error}=await query.order('name',{ascending:true}).order('id',{ascending:true}).range(from,to);if(error)throw error;return{data:(data??[]) as Product[],count,page,page_size:pageSize};}
const MAX_ENTITY_ROWS = 500;
export async function fetchCustomers(): Promise<Customer[]> { const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); const {data,count,error}=await supabase.from('customers').select('*',{count:'exact'}).eq('company_id',companyId).order('name',{ascending:true}).order('id',{ascending:true}).range(0,MAX_ENTITY_ROWS-1); if(error)throw error; if((count??0)>MAX_ENTITY_ROWS)throw new Error('REPORT_QUERY_LIMIT_EXCEEDED: customers require explicit pagination'); return (data??[]) as Customer[]; }
export async function fetchProducts(): Promise<Product[]> { const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED'); const {data,count,error}=await supabase.from('products').select('*',{count:'exact'}).eq('company_id',companyId).order('name',{ascending:true}).order('id',{ascending:true}).range(0,MAX_ENTITY_ROWS-1); if(error)throw error; if((count??0)>MAX_ENTITY_ROWS)throw new Error('REPORT_QUERY_LIMIT_EXCEEDED: products require explicit pagination'); return (data??[]) as Product[]; }

export type SupplierRow = {
  id:string;
  name:string;
  code:string|null;
  phone:string|null;
  email:string|null;
  address:string|null;
  tax_id:string|null;
  payment_terms_days:number|null;
  created_at:string|null;
};
export type SuppliersPage = { data:SupplierRow[]; count:number|null; page:number; page_size:number };
export async function fetchSuppliersPage(page=0,pageSize=50,search=''):Promise<SuppliersPage>{
  if(!Number.isInteger(page)||page<0)throw new Error('REPORT_QUERY_INVALID_PAGE');
  if(!Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw new Error('REPORT_QUERY_INVALID_PAGE_SIZE');
  const companyId=await resolveCurrentCompanyId();
  if(!companyId)throw new Error('TENANT_REQUIRED');
  const normalized=search.trim().replace(/[,%()\\]/g,' ');
  const from=page*pageSize,to=from+pageSize-1;
  let query=supabase.from('suppliers').select('id,name,code,phone,email,address,tax_id,payment_terms_days,created_at',{count:'exact'}).eq('company_id',companyId);
  if(normalized)query=query.or(`name.ilike.%${normalized}%,code.ilike.%${normalized}%`);
  const {data,count,error}=await query.order('name',{ascending:true}).order('id',{ascending:true}).range(from,to);
  if(error)throw error;
  return{data:(data??[]) as SupplierRow[],count,page,page_size:pageSize};
}

export type WorkerHealthSnapshot = {
  queued: number;
  active: number;
  expiredActive: number;
  activeReadComplete: boolean;
};

export async function fetchWorkerHealthSnapshot(): Promise<WorkerHealthSnapshot> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');

  const now = new Date();
  const [queuedResult, activeResult] = await Promise.all([
    supabase
      .from('report_execution_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'queued'),
    supabase
      .from('report_execution_jobs')
      .select('status,lease_expires_at', { count: 'exact' })
      .eq('company_id', companyId)
      .in('status', ['leased', 'processing'])
      .order('lease_expires_at', { ascending: true })
      .range(0, 499),
  ]);

  if (queuedResult.error) throw queuedResult.error;
  if (activeResult.error) throw activeResult.error;

  const activeRows = (activeResult.data ?? []) as Array<{ status: string; lease_expires_at: string | null }>;
  const activeTotal = activeResult.count ?? activeRows.length;
  const expiredActive = activeRows.filter((row) => {
    if (!row.lease_expires_at) return false;
    const expiresAt = new Date(row.lease_expires_at);
    return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= now.getTime();
  }).length;

  return {
    queued: queuedResult.count ?? 0,
    active: activeTotal,
    expiredActive,
    activeReadComplete: activeTotal <= activeRows.length,
  };
}

export type ReportExecutionTaskRecord = {
  id: string;
  report_execution_job_id: string;
  task_key: string;
  stage: string;
  ordinal: number;
  label: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  worker_id: string | null;
  attempt: number;
  started_at: string | null;
  completed_at: string | null;
  last_error: Record<string, unknown>;
  evidence: Record<string, unknown>;
};

export async function fetchReportExecutionTasks(jobId: string): Promise<ReportExecutionTaskRecord[]> {
  if (!jobId.trim()) throw new Error('REPORT_EXECUTION_JOB_ID_REQUIRED');
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('report_execution_tasks')
    .select('id,report_execution_job_id,task_key,stage,ordinal,label,status,worker_id,attempt,started_at,completed_at,last_error,evidence')
    .eq('company_id', companyId).eq('report_execution_job_id', jobId).order('ordinal', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id),
    report_execution_job_id: String(row.report_execution_job_id),
    task_key: String(row.task_key),
    stage: String(row.stage),
    ordinal: Number(row.ordinal),
    label: String(row.label),
    status: row.status as ReportExecutionTaskRecord['status'],
    worker_id: row.worker_id ? String(row.worker_id) : null,
    attempt: Number(row.attempt ?? 0),
    started_at: row.started_at ? String(row.started_at) : null,
    completed_at: row.completed_at ? String(row.completed_at) : null,
    last_error: row.last_error && typeof row.last_error === 'object' ? row.last_error as Record<string, unknown> : {},
    evidence: row.evidence && typeof row.evidence === 'object' ? row.evidence as Record<string, unknown> : {},
  }));
}

export type ReportExecutionJobRecord = {
  id: string;
  company_id: string;
  status: string;
  checkpoint: Record<string, unknown>;
  evidence: Record<string, unknown>;
  attempt: number;
  max_attempts: number;
  completed_at: string | null;
  updated_at: string;
};

export type RenderedReportOutput = {
  key: string;
  path: string;
  label: string;
  eligibility: string;
  rendered: boolean;
  sourceHash: string;
  importId: string;
};

export type RenderedReportManifest = {
  contractVersion: string;
  renderedAt: string;
  sourceBound: boolean;
  sourceHash: string;
  importId: string;
  entityType: string;
  sourceSpecialty: string | null;
  rowCount: number;
  qualityScore: number;
  evidenceStatus: string;
  outputs: RenderedReportOutput[];
};

export function getBoundRenderedReportManifest(
  job: ReportExecutionJobRecord | null,
  expectedImportId: string,
  expectedSourceHash: string,
): RenderedReportManifest | null {
  if (!job || !expectedImportId.trim() || !expectedSourceHash.trim()) return null;
  const raw = job.evidence?.renderedOutput;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const manifest = raw as Record<string, unknown>;
  if (
    manifest.sourceBound !== true ||
    manifest.importId !== expectedImportId ||
    manifest.sourceHash !== expectedSourceHash ||
    typeof manifest.contractVersion !== 'string' ||
    typeof manifest.renderedAt !== 'string' ||
    typeof manifest.entityType !== 'string' ||
    !Array.isArray(manifest.outputs) ||
    manifest.outputs.length === 0
  ) return null;
  const outputs: RenderedReportOutput[] = [];
  for (const value of manifest.outputs) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const output = value as Record<string, unknown>;
    if (
      typeof output.key !== 'string' ||
      typeof output.path !== 'string' ||
      typeof output.label !== 'string' ||
      typeof output.eligibility !== 'string' ||
      output.rendered !== true ||
      output.importId !== expectedImportId ||
      output.sourceHash !== expectedSourceHash
    ) return null;
    outputs.push({
      key: output.key,
      path: output.path,
      label: output.label,
      eligibility: output.eligibility,
      rendered: true,
      sourceHash: output.sourceHash,
      importId: output.importId,
    });
  }
  return {
    contractVersion: manifest.contractVersion,
    renderedAt: manifest.renderedAt,
    sourceBound: true,
    sourceHash: manifest.sourceHash,
    importId: manifest.importId,
    entityType: manifest.entityType,
    sourceSpecialty: typeof manifest.sourceSpecialty === 'string' ? manifest.sourceSpecialty : null,
    rowCount: typeof manifest.rowCount === 'number' ? manifest.rowCount : 0,
    qualityScore: typeof manifest.qualityScore === 'number' ? manifest.qualityScore : 0,
    evidenceStatus: typeof manifest.evidenceStatus === 'string' ? manifest.evidenceStatus : 'REVIEW',
    outputs,
  };
}

export async function fetchReportExecutionJob(jobId: string): Promise<ReportExecutionJobRecord | null> {
  if (!jobId.trim()) throw new Error('REPORT_EXECUTION_JOB_ID_REQUIRED');
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('report_execution_jobs')
    .select('id,company_id,status,checkpoint,evidence,attempt,max_attempts,completed_at,updated_at')
    .eq('company_id', companyId).eq('id', jobId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: String(data.id),
    company_id: String(data.company_id),
    status: String(data.status),
    checkpoint: data.checkpoint && typeof data.checkpoint === 'object' ? data.checkpoint as Record<string, unknown> : {},
    evidence: data.evidence && typeof data.evidence === 'object' ? data.evidence as Record<string, unknown> : {},
    attempt: Number(data.attempt ?? 0),
    max_attempts: Number(data.max_attempts ?? 0),
    completed_at: data.completed_at ? String(data.completed_at) : null,
    updated_at: String(data.updated_at),
  };
}

export type ImportEvidenceSnapshot = {
  id: string;
  company_id: string;
  import_job_id: string | null;
  source_hash: string;
  source_path: string;
  source_format: string;
  analysis_status: string;
  entity_type: string;
  quality_score: number | null;
  row_count: number;
  column_count: number;
  datasets: unknown[];
  canonical_text: string;
  visual_assets: unknown[];
  warnings: unknown[];
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function fetchImportEvidenceSnapshot(importJobId: string): Promise<ImportEvidenceSnapshot | null> {
  if (!importJobId.trim()) throw new Error('IMPORT_EVIDENCE_JOB_ID_REQUIRED');
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('source_analysis_snapshots')
    .select('id,company_id,import_job_id,source_hash,source_path,source_format,analysis_status,entity_type,quality_score,row_count,column_count,datasets,canonical_text,visual_assets,warnings,metadata,created_at')
    .eq('company_id', companyId)
    .eq('import_job_id', importJobId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: String(data.id),
    company_id: String(data.company_id),
    import_job_id: data.import_job_id ? String(data.import_job_id) : null,
    source_hash: String(data.source_hash),
    source_path: String(data.source_path),
    source_format: String(data.source_format),
    analysis_status: String(data.analysis_status),
    entity_type: String(data.entity_type),
    quality_score: data.quality_score == null ? null : Number(data.quality_score),
    row_count: Number(data.row_count ?? 0),
    column_count: Number(data.column_count ?? 0),
    datasets: Array.isArray(data.datasets) ? data.datasets : [],
    canonical_text: String(data.canonical_text ?? ''),
    visual_assets: Array.isArray(data.visual_assets) ? data.visual_assets : [],
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
    metadata: data.metadata && typeof data.metadata === 'object' && !Array.isArray(data.metadata)
      ? data.metadata as Record<string, unknown>
      : {},
    created_at: String(data.created_at),
  };
}

export async function fetchRecommendationsBoundToImport(input: {
  importJobId: string;
  snapshotId: string;
  sourceHash: string;
}): Promise<Recommendation[]> {
  if (!input.importJobId.trim() || !input.snapshotId.trim() || !input.sourceHash.trim()) {
    throw new Error('IMPORT_RECOMMENDATION_BINDING_REQUIRED');
  }
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('recommendations')
    .select('*')
    .eq('company_id', companyId)
    .eq('evidence_snapshot_id', input.snapshotId)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as Array<Record<string, unknown>>;
  return rows
    .filter((row) => {
      const evidence = row.evidence && typeof row.evidence === 'object' && !Array.isArray(row.evidence)
        ? row.evidence as Record<string, unknown>
        : {};
      const sourceHash = typeof evidence.sourceHash === 'string' ? evidence.sourceHash : typeof evidence.source_hash === 'string' ? evidence.source_hash : null;
      const importId = typeof evidence.importId === 'string' ? evidence.importId : typeof evidence.import_job_id === 'string' ? evidence.import_job_id : null;
      if (sourceHash && sourceHash !== input.sourceHash) return false;
      if (importId && importId !== input.importJobId) return false;
      return true;
    })
    .map((row) => row as unknown as Recommendation);
}
export type PurchaseSummary = { total: number | null; count: number; supplier_count: number; average: number | null };
function isoDate(value: Date): string { return value.toISOString().slice(0, 10); }
export async function fetchPurchaseSummary(from?: string, to?: string): Promise<PurchaseSummary> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const end = to ?? isoDate(new Date()); const startDate = new Date(); startDate.setMonth(startDate.getMonth() - 6); const start = from ?? isoDate(startDate);
  const { data, error } = await supabase.rpc('get_purchase_summary', { p_company_id: companyId, p_from: start, p_to: end });
  if (error) throw error; const payload = (data ?? {}) as Record<string, unknown>;
  return { total: payload.total == null ? null : Number(payload.total), count: Number(payload.count ?? 0), supplier_count: Number(payload.supplier_count ?? 0), average: payload.average == null ? null : Number(payload.average) };
}
export async function fetchSalesExportRows(maxRows = 10000): Promise<CanonicalExportRow[]> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.rpc('get_sales_export_rows', { p_company_id: companyId, p_max_rows: maxRows }); if (error) throw error;
  const payload = (data ?? {}) as Record<string, unknown>; if (!Array.isArray(payload.rows)) throw new Error('REPORT_DATA_UNAVAILABLE: sales export rows missing'); return payload.rows as CanonicalExportRow[];
}
export async function fetchPurchaseExportRows(maxRows = 10000): Promise<CanonicalExportRow[]> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.rpc('get_purchase_export_rows', { p_company_id: companyId, p_max_rows: maxRows }); if (error) throw error;
  const payload = (data ?? {}) as Record<string, unknown>; if (!Array.isArray(payload.rows)) throw new Error('REPORT_DATA_UNAVAILABLE: purchase export rows missing'); return payload.rows as CanonicalExportRow[];
}
export async function fetchInventoryExportRows(maxRows = 10000): Promise<CanonicalExportRow[]> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.rpc('get_inventory_export_rows', { p_company_id: companyId, p_max_rows: maxRows }); if (error) throw error;
  const payload = (data ?? {}) as Record<string, unknown>; if (!Array.isArray(payload.rows)) throw new Error('REPORT_DATA_UNAVAILABLE: inventory export rows missing'); return payload.rows as CanonicalExportRow[];
}
export type RuntimeDecisionRecord = { id:string; decision_key:string; decision_type:string; status:string; confidence:number|null; expected_impact:number|null; evidence:Record<string,unknown>; created_at:string; executed_at:string|null; recommendation_id:string|null; approved_by:string|null; approved_at:string|null; rejection_reason:string|null };
export type DecisionApprovalRecord = { id:string; decision_id:string; status:string; requested_by:string|null; decided_by:string|null; requested_at:string; decided_at:string|null; reason:string|null; evidence:Record<string,unknown> };
export type DecisionWorkItemRecord = { id:string; decision_id:string; recommendation_id:string|null; department:string; assignee_id:string|null; assignee_label:string|null; title:string; description:string|null; priority:string; status:string; due_at:string|null; started_at:string|null; completed_at:string|null; evidence_refs:Array<Record<string,unknown>>; expected_impact:number|null; actual_impact:number|null; created_at:string; updated_at:string };
export type RecommendationOutcomeRecord = { id:string; company_id:string; recommendation_key:string; decision_id:string|null; observed_at:string; expected_impact:number|null; actual_impact:number|null; outcome_quality:number|null; status:string; evidence:Record<string,unknown> };
export type BusinessReplayEvent = { kind:'SNAPSHOT'|'WORK'|'OUTCOME'; id:string; occurredAt:string; status:string|null; title:string; detail:string|null; evidencePresent:boolean; expectedImpact:number|null; actualImpact:number|null; qualityScore:number|null };
export type BusinessReplayLearning = { count:number; accuracy:number|null; coverage:number|null; impact:number|null };
export type BusinessReplaySnapshot = { snapshotCount:number; outcomeCount:number; workItemCount:number; latestSnapshotAt:string|null; latestOutcomeAt:string|null; windowLimit:number; hasMoreHistory:boolean; learning:BusinessReplayLearning; events:BusinessReplayEvent[] };
export const createRuntimeDecision = createCanonicalRuntimeDecision;
export const linkRecommendationToDecision = linkCanonicalRecommendationToDecision;
export const requestDecisionApproval = requestCanonicalDecisionApproval;
export const decideApproval = decideCanonicalApproval;
export async function createDecisionWorkItem(input:{decisionId:string;recommendationId:string|null;department:string;assigneeId?:string;assigneeLabel?:string;title:string;description?:string|null;priority:'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';dueAt?:string|null;expectedImpact:number|null;evidenceRefs:unknown[]}):Promise<string>{
  return createCanonicalWorkItem(input.decisionId,input.recommendationId,{department:input.department,assigneeId:input.assigneeId,assigneeLabel:input.assigneeLabel,title:input.title,description:input.description??undefined,priority:input.priority,dueAt:input.dueAt??undefined,expectedImpact:input.expectedImpact,evidenceRefs:input.evidenceRefs});
}
export const startDecisionWorkItem = startCanonicalWorkItem;
export async function completeDecisionWorkItem(workItemId: string, actualImpact: number, evidence: Record<string, unknown>): Promise<void> {
  await completeCanonicalWorkItem(workItemId, actualImpact, evidence);
}
export async function fetchRuntimeDecisionForRecommendation(recommendationId:string):Promise<RuntimeDecisionRecord|null>{
  if(!recommendationId.trim())throw new Error('RECOMMENDATION_ID_REQUIRED'); const companyId=await resolveCurrentCompanyId(); if(!companyId)throw new Error('TENANT_REQUIRED');
  const {data,error}=await supabase.from('business_intelligence_decisions').select('id,decision_key,decision_type,status,confidence,expected_impact,evidence,created_at,executed_at,recommendation_id,approved_by,approved_at,rejection_reason').eq('company_id',companyId).eq('recommendation_id',recommendationId).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(error)throw error; if(!data)return null; return {id:String(data.id),decision_key:String(data.decision_key),decision_type:String(data.decision_type),status:String(data.status),confidence:data.confidence==null?null:Number(data.confidence),expected_impact:data.expected_impact==null?null:Number(data.expected_impact),evidence:data.evidence&&typeof data.evidence==='object'?data.evidence as Record<string,unknown>:{},created_at:String(data.created_at),executed_at:data.executed_at?String(data.executed_at):null,recommendation_id:data.recommendation_id?String(data.recommendation_id):null,approved_by:data.approved_by?String(data.approved_by):null,approved_at:data.approved_at?String(data.approved_at):null,rejection_reason:data.rejection_reason?String(data.rejection_reason):null};
}
export async function fetchDecisionApproval(decisionId:string):Promise<DecisionApprovalRecord|null>{
  if(!decisionId.trim())throw new Error('DECISION_ID_REQUIRED'); const companyId=await resolveCurrentCompanyId(); if(!companyId)throw new Error('TENANT_REQUIRED');
  const {data,error}=await supabase.from('decision_approvals').select('id,decision_id,status,requested_by,decided_by,requested_at,decided_at,reason,evidence').eq('company_id',companyId).eq('decision_id',decisionId).order('requested_at',{ascending:false}).limit(1).maybeSingle();
  if(error)throw error; if(!data)return null; return {id:String(data.id),decision_id:String(data.decision_id),status:String(data.status),requested_by:data.requested_by?String(data.requested_by):null,decided_by:data.decided_by?String(data.decided_by):null,requested_at:String(data.requested_at),decided_at:data.decided_at?String(data.decided_at):null,reason:data.reason?String(data.reason):null,evidence:data.evidence&&typeof data.evidence==='object'?data.evidence as Record<string,unknown>:{}}; 
}
function mapDecisionWorkItem(row:Record<string,unknown>):DecisionWorkItemRecord{
 const refs=Array.isArray(row.evidence_refs)?row.evidence_refs.filter((ref):ref is Record<string,unknown>=>Boolean(ref&&typeof ref==='object'&&!Array.isArray(ref))):[];
 return {id:String(row.id),decision_id:String(row.decision_id),recommendation_id:row.recommendation_id?String(row.recommendation_id):null,department:String(row.department),assignee_id:row.assignee_id?String(row.assignee_id):null,assignee_label:row.assignee_label?String(row.assignee_label):null,title:String(row.title),description:row.description?String(row.description):null,priority:String(row.priority),status:String(row.status),due_at:row.due_at?String(row.due_at):null,started_at:row.started_at?String(row.started_at):null,completed_at:row.completed_at?String(row.completed_at):null,evidence_refs:refs,expected_impact:row.expected_impact==null?null:Number(row.expected_impact),actual_impact:row.actual_impact==null?null:Number(row.actual_impact),created_at:String(row.created_at),updated_at:String(row.updated_at)};
}
export async function fetchDecisionWorkItem(decisionId:string):Promise<DecisionWorkItemRecord|null>{
 const companyId=await resolveCurrentCompanyId(); if(!companyId)throw new Error('TENANT_REQUIRED'); const {data,error}=await supabase.from('decision_work_items').select('id,decision_id,recommendation_id,department,assignee_id,assignee_label,title,description,priority,status,due_at,started_at,completed_at,evidence_refs,expected_impact,actual_impact,created_at,updated_at').eq('company_id',companyId).eq('decision_id',decisionId).order('created_at',{ascending:false}).limit(1).maybeSingle(); if(error)throw error; return data?mapDecisionWorkItem(data as Record<string,unknown>):null;
}
export async function fetchDecisionWorkItems():Promise<DecisionWorkItemRecord[]>{
 const companyId=await resolveCurrentCompanyId(); if(!companyId)throw new Error('TENANT_REQUIRED'); const {data,error}=await supabase.from('decision_work_items').select('id,decision_id,recommendation_id,department,assignee_id,assignee_label,title,description,priority,status,due_at,started_at,completed_at,evidence_refs,expected_impact,actual_impact,created_at,updated_at').eq('company_id',companyId).order('created_at',{ascending:false}).range(0,499); if(error)throw error; return (data??[]).map(row=>mapDecisionWorkItem(row as Record<string,unknown>));
}
export async function fetchRecommendationOutcome(decisionId:string):Promise<RecommendationOutcomeRecord|null>{
 const companyId=await resolveCurrentCompanyId(); if(!companyId)throw new Error('TENANT_REQUIRED'); const {data,error}=await supabase.from('recommendation_outcomes').select('id,company_id,recommendation_key,decision_id,observed_at,expected_impact,actual_impact,outcome_quality,status,evidence').eq('company_id',companyId).eq('decision_id',decisionId).order('observed_at',{ascending:false}).limit(1).maybeSingle(); if(error)throw error; if(!data)return null;
 return {id:String(data.id),company_id:String(data.company_id),recommendation_key:String(data.recommendation_key),decision_id:data.decision_id?String(data.decision_id):null,observed_at:String(data.observed_at),expected_impact:data.expected_impact==null?null:Number(data.expected_impact),actual_impact:data.actual_impact==null?null:Number(data.actual_impact),outcome_quality:data.outcome_quality==null?null:Number(data.outcome_quality)*100,status:String(data.status),evidence:data.evidence&&typeof data.evidence==='object'?data.evidence as Record<string,unknown>:{}};
}
export async function fetchBusinessReplaySnapshot(windowLimit=200):Promise<BusinessReplaySnapshot>{
 const companyId=await resolveCurrentCompanyId(); if(!companyId)throw new Error('TENANT_REQUIRED'); if(!Number.isInteger(windowLimit)||windowLimit<1||windowLimit>500)throw new Error('REPLAY_WINDOW_INVALID');
 const [{data:snapshots,error:snapshotError},{data:workItems,error:workError},{data:outcomes,error:outcomeError}]=await Promise.all([
  supabase.from('business_state_snapshots').select('id,observed_at,source_version,evidence,quality_score').eq('company_id',companyId).order('observed_at',{ascending:false}).range(0,windowLimit-1),
  supabase.from('decision_work_items').select('id,status,title,description,evidence_refs,expected_impact,actual_impact,created_at,updated_at').eq('company_id',companyId).order('created_at',{ascending:false}).range(0,windowLimit-1),
  supabase.from('recommendation_outcomes').select('id,observed_at,status,expected_impact,actual_impact,outcome_quality,evidence,created_at').eq('company_id',companyId).order('observed_at',{ascending:false}).range(0,windowLimit-1)
 ]);
 if(snapshotError)throw snapshotError;if(workError)throw workError;if(outcomeError)throw outcomeError;
 const learningRows=(outcomes??[]).map(row=>{const evidence=row.evidence&&typeof row.evidence==='object'&&!Array.isArray(row.evidence)?row.evidence as Record<string,unknown>:{ }; return {tenantId:companyId,decisionFingerprint:String(row.id),evidenceSnapshotId:typeof evidence.evidence_snapshot_id==='string'?evidence.evidence_snapshot_id:'',actionId:row.decision_id?String(row.decision_id):undefined,observedAt:String(row.observed_at),label:row.status==='positive'?'correct':row.status==='negative'?'incorrect':row.status==='neutral'?'partial':'unknown',actualValue:row.actual_impact==null?undefined:Number(row.actual_impact),expectedValue:row.expected_impact==null?undefined:Number(row.expected_impact),impactValue:typeof evidence.impact_value==='number'?evidence.impact_value:undefined,notes:typeof evidence.notes==='string'?evidence.notes:undefined};}).filter(row=>Boolean(row.evidenceSnapshotId));
 const learning=summarizeOutcomes(learningRows,companyId);
 const events:BusinessReplayEvent[]=[
  ...(snapshots??[]).map(row=>({kind:'SNAPSHOT' as const,id:String(row.id),occurredAt:String(row.observed_at),status:null,title:'لقطة حالة تجارية محفوظة',detail:row.source_version?('source_version: '+String(row.source_version)):null,evidencePresent:Boolean(row.evidence&&typeof row.evidence==='object'&&Object.keys(row.evidence).length),expectedImpact:null,actualImpact:null,qualityScore:row.quality_score==null?null:Number(row.quality_score)})),
  ...(workItems??[]).map(row=>({kind:'WORK' as const,id:String(row.id),occurredAt:String(row.updated_at??row.created_at),status:row.status?String(row.status):null,title:String(row.title),detail:row.description?String(row.description):null,evidencePresent:Array.isArray(row.evidence_refs)&&row.evidence_refs.length>0,expectedImpact:row.expected_impact==null?null:Number(row.expected_impact),actualImpact:row.actual_impact==null?null:Number(row.actual_impact),qualityScore:null})),
  ...(outcomes??[]).map(row=>({kind:'OUTCOME' as const,id:String(row.id),occurredAt:String(row.observed_at),status:row.status?String(row.status):null,title:'نتيجة توصية محفوظة',detail:row.evidence&&typeof row.evidence==='object'&&!Array.isArray(row.evidence)?((row.evidence as Record<string,unknown>).notes as string|null)??null:null,evidencePresent:Boolean(row.evidence&&typeof row.evidence==='object'&&!Array.isArray(row.evidence)&&Object.keys(row.evidence as Record<string,unknown>).length&&typeof (row.evidence as Record<string,unknown>).evidence_snapshot_id==='string'&&String((row.evidence as Record<string,unknown>).evidence_snapshot_id).trim()),expectedImpact:row.expected_impact==null?null:Number(row.expected_impact),actualImpact:row.actual_impact==null?null:Number(row.actual_impact),qualityScore:row.outcome_quality==null?null:Number(row.outcome_quality)}))
 ].sort((a,b)=>new Date(b.occurredAt).getTime()-new Date(a.occurredAt).getTime()).slice(0,windowLimit);
 return {snapshotCount:snapshots?.length??0,outcomeCount:outcomes?.length??0,workItemCount:workItems?.length??0,latestSnapshotAt:snapshots?.[0]?.observed_at?String(snapshots[0].observed_at):null,latestOutcomeAt:outcomes?.[0]?.observed_at?String(outcomes[0].observed_at):null,windowLimit,hasMoreHistory:(snapshots?.length??0)>=windowLimit||(workItems?.length??0)>=windowLimit||(outcomes?.length??0)>=windowLimit,learning,events};
}