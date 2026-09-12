import { resolveCurrentCompanyId, supabase } from '../supabase';
import type { SecurityScanResult } from './types';
import { MAX_FILE_SIZE } from './types';
import { computeSHA256 } from './file-identity-core';
export { computeSHA256 } from './file-identity-core';

interface FileRecord { id: string; company_id: string; file_name: string; file_hash: string; created_at: string; status: string; }

export function securityScan(file: File, buffer: ArrayBuffer): SecurityScanResult {
  const issues: string[] = []; let isArchiveBomb = false; let isZipTraversal = false;
  if (file.size > MAX_FILE_SIZE) issues.push(`حجم الملف (${(file.size / 1024 / 1024).toFixed(1)} ميجابايت) يتجاوز الحد الأقصى المسموح (${MAX_FILE_SIZE / 1024 / 1024} ميجابايت)`);
  const bytes = new Uint8Array(buffer); const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B;
  if (isZip) {
    if (file.size < 100 && file.name.match(/\.(zip|jar|apk)$/i)) { isArchiveBomb = true; issues.push('تحذير: قد يكون الملف قنبلة مضغوطة (حجم صغير جداً لملف مضغوط)'); }
    const decompressedEstimate = file.size * 100; if (decompressedEstimate > 500 * 1024 * 1024) issues.push(`تحذير: قد يستهلك الملف بعد فك الضغط مساحة كبيرة (~${(decompressedEstimate / 1024 / 1024).toFixed(0)} ميجابايت)`);
    const fileNameBytes = new TextEncoder().encode(file.name); for (let i = 0; i < fileNameBytes.length - 2; i++) if (fileNameBytes[i] === 0x2E && fileNameBytes[i + 1] === 0x2E && fileNameBytes[i + 2] === 0x2F) { isZipTraversal = true; issues.push('تحذير: اسم الملف يحتوي على مسار انتقالي (path traversal)'); break; }
  }
  if (file.size === 0) issues.push('الملف فارغ');
  return { passed: issues.length === 0, issues, maxFileSize: MAX_FILE_SIZE, actualSize: file.size, isArchiveBomb, isZipTraversal };
}

export async function checkDuplicate(hash: string, _legacyCompanyId?: string, _legacySupabase?: typeof supabase): Promise<{ isDuplicate: boolean; existing: FileRecord | null }> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  const { data, error } = await supabase.from('file_records').select('id,company_id,file_name,file_hash,created_at,status').eq('company_id', companyId).eq('file_hash', hash).in('status', ['uploaded', 'processing', 'completed', 'partial']).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error; if (!data) return { isDuplicate: false, existing: null }; return { isDuplicate: true, existing: data as FileRecord };
}

export async function registerFileRecord(input: { fileName: string; fileSize: number; fileHash: string; fileExtension?: string | null; fileMime?: string | null; detectedFormat?: string | null }): Promise<FileRecord> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  const { data, error } = await supabase.from('file_records').insert({
    company_id: companyId,
    file_name: input.fileName,
    file_size: input.fileSize,
    file_hash: input.fileHash,
    file_extension: input.fileExtension ?? null,
    file_mime: input.fileMime ?? null,
    detected_format: input.detectedFormat ?? null,
    security_status: 'passed',
    is_duplicate: false,
    status: 'processing',
  }).select('id,company_id,file_name,file_hash,created_at,status').single();
  if (error) {
    if (error.code === '23505') throw new Error('IMPORT_SOURCE_ALREADY_REGISTERED');
    throw error;
  }
  if (!data) throw new Error('IMPORT_SOURCE_RECORD_NOT_CREATED');
  return data as FileRecord;
}

export async function updateFileRecordStatus(fileRecordId: string, status: 'processing' | 'completed' | 'partial' | 'failed' | 'cancelled'): Promise<void> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  const { error } = await supabase.from('file_records').update({ status }).eq('id', fileRecordId).eq('company_id', companyId);
  if (error) throw error;
}
