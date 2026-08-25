import { supabase, resolveCurrentCompanyId } from './supabase';
import type { Customer, Forecast, ImportRecord, Product } from './types';

export * from './queries';

export async function markAlertRead(id: string): Promise<void> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { error } = await supabase.from('alerts').update({ is_read: true }).eq('id', id).eq('company_id', companyId);
  if (error) throw error;
}

export async function updateRecommendationStatus(id: string, status: string): Promise<void> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { error } = await supabase.from('recommendations').update({ status }).eq('id', id).eq('company_id', companyId);
  if (error) throw error;
}

export async function fetchForecasts(): Promise<Forecast[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('forecasts').select('*').eq('company_id', companyId).order('period', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Forecast[];
}

export async function fetchCustomers(): Promise<Customer[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('customers').select('*').eq('company_id', companyId).order('name');
  if (error) throw error;
  return (data ?? []) as Customer[];
}

export async function fetchProducts(): Promise<Product[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('products').select('*').eq('company_id', companyId).order('name');
  if (error) throw error;
  return (data ?? []) as Product[];
}

type ImportRecordInput = Omit<ImportRecord, 'id' | 'company_id' | 'created_at' | 'error_message' | 'completed_at'>;
type ImportRecordPatch = Partial<Pick<ImportRecord, 'status' | 'progress' | 'error_message' | 'completed_at'>>;

export async function createImportRecord(input: ImportRecordInput): Promise<ImportRecord> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.rpc('import_create_job', { p_company_id: companyId, p_entity_type: input.entity_type ?? 'import', p_total_rows: input.total_rows });
  if (error) throw error;
  const id = String(data);
  return { id, company_id: companyId, ...input, error_message: null, created_at: new Date().toISOString(), completed_at: null };
}

export async function updateImportRecord(id: string, patch: ImportRecordPatch): Promise<void> {
  if (!await resolveCurrentCompanyId()) throw new Error('TENANT_REQUIRED');
  if (patch.progress !== undefined) {
    const { error } = await supabase.rpc('import_update_job_progress', { p_job_id: id, p_processed_rows: Math.max(0, Math.round(patch.progress)), p_valid_rows: Math.max(0, Math.round(patch.progress)), p_invalid_rows: 0, p_duplicate_rows: 0, p_status: patch.status ?? 'processing' });
    if (error) throw error;
  }
  if (patch.status || patch.error_message !== undefined) {
    const { error } = await supabase.rpc('import_finish_job', { p_job_id: id, p_status: patch.status ?? 'failed', p_result_summary: {}, p_error_message: patch.error_message ?? null });
    if (error) throw error;
  }
}

export async function fetchImportRecords(): Promise<ImportRecord[]> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED');
  const { data, error } = await supabase.from('import_jobs').select('id, company_id, job_type, status, total_rows, valid_rows, invalid_rows, progress, error_message, created_at, completed_at, result_summary').eq('company_id', companyId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({ id: row.id, company_id: row.company_id, file_name: String((row.result_summary as Record<string, unknown> | null)?.file_name ?? row.job_type ?? 'import'), file_size: 0, source_type: 'import', status: row.status, total_rows: row.total_rows ?? 0, valid_rows: row.valid_rows ?? 0, invalid_rows: row.invalid_rows ?? 0, quarantined_rows: 0, entity_type: row.job_type ?? null, progress: row.progress ?? 0, error_message: row.error_message ?? null, created_at: row.created_at, completed_at: row.completed_at ?? null }));
}
