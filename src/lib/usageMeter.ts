import { supabase, COMPANY_ID } from './supabase';

export type UsageDelta = Partial<{
  processedRows: number;
  documentPages: number;
  ocrPages: number;
  aiRequests: number;
  apiRequests: number;
  storageBytes: number;
}>;

/** Usage is incremented through a tenant-guarded RPC. Never write the ledger table directly. */
export async function recordUsage(delta: UsageDelta, usageDate = new Date().toISOString().slice(0, 10)) {
  if (!COMPANY_ID || COMPANY_ID.startsWith('00000000')) throw new Error('No authorized tenant selected');
  const { error } = await supabase.rpc('increment_usage', {
    p_company_id: COMPANY_ID,
    p_usage_date: usageDate,
    p_processed_rows: Math.max(0, Math.floor(delta.processedRows ?? 0)),
    p_document_pages: Math.max(0, Math.floor(delta.documentPages ?? 0)),
    p_ocr_pages: Math.max(0, Math.floor(delta.ocrPages ?? 0)),
    p_ai_requests: Math.max(0, Math.floor(delta.aiRequests ?? 0)),
    p_api_requests: Math.max(0, Math.floor(delta.apiRequests ?? 0)),
    p_storage_bytes: Math.max(0, Math.floor(delta.storageBytes ?? 0)),
  });
  if (error) throw error;
}

export async function getUsage(days = 30) {
  if (!COMPANY_ID || COMPANY_ID.startsWith('00000000')) return [];
  const start = new Date(); start.setDate(start.getDate() - Math.max(1, days));
  const { data, error } = await supabase.from('tenant_usage_daily')
    .select('usage_date,processed_rows,document_pages,ocr_pages,ai_requests,api_requests,storage_bytes')
    .eq('company_id', COMPANY_ID).gte('usage_date', start.toISOString().slice(0, 10)).order('usage_date');
  if (error) throw error;
  return data ?? [];
}
