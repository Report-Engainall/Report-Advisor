import { resolveCurrentCompanyId, supabase } from '../supabase.ts';
import type { SecurityScanResult } from './types.ts';
import { computeSHA256 } from './file-identity-core.ts';
import { securityScan } from './security-scan.ts';
export { computeSHA256 } from './file-identity-core.ts';
export { securityScan } from './security-scan.ts';

interface FileRecord { id: string; company_id: string; file_name: string; file_hash: string; created_at: string; status: string; }

export async function checkDuplicate(hash: string, _legacyCompanyId?: string, _legacySupabase?: typeof supabase): Promise<{ isDuplicate: boolean; existing: FileRecord | null }> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  const { data, error } = await supabase.from('file_records').select('id,company_id,file_name,file_hash,created_at,status').eq('company_id', companyId).eq('file_hash', hash).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error; if (!data) return { isDuplicate: false, existing: null }; return { isDuplicate: true, existing: data as FileRecord };
}
