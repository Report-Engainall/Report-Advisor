import { resolveCurrentCompanyId, supabase } from '../supabase.ts';
import type { SecurityScanResult } from './types.ts';
import { MAX_FILE_SIZE } from './types.ts';
import { computeSHA256 } from './file-identity-core.ts';
export { computeSHA256 } from './file-identity-core.ts';

interface FileRecord { id: string; company_id: string; file_name: string; file_hash: string; created_at: string; status: string; }

function isUnsafeArchivePath(name: string): boolean {
  const normalized = name.replaceAll('\\', '/');
  return normalized.includes('\0')
    || normalized.startsWith('/')
    || /^[A-Za-z]:\//.test(normalized)
    || normalized.split('/').some(segment => segment === '..');
}

function hasZipEntryTraversal(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const minEocd = 22;
  const maxComment = 0xffff;
  const start = Math.max(0, bytes.length - minEocd - maxComment);
  let eocd = -1;
  for (let i = bytes.length - minEocd; i >= start; i -= 1) {
    if (i >= 0 && view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) return false;

  const entryCount = view.getUint16(eocd + 10, true);
  const centralDirectorySize = view.getUint32(eocd + 12, true);
  const centralDirectoryOffset = view.getUint32(eocd + 16, true);
  if (centralDirectoryOffset + centralDirectorySize > bytes.length) return true;

  let offset = centralDirectoryOffset;
  for (let i = 0; i < entryCount; i += 1) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) return true;
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const end = offset + 46 + nameLength + extraLength + commentLength;
    if (end > bytes.length) return true;
    const nameBytes = bytes.slice(offset + 46, offset + 46 + nameLength);
    const name = new TextDecoder().decode(nameBytes);
    if (isUnsafeArchivePath(name)) return true;
    offset = end;
  }
  return false;
}

export function securityScan(file: File, buffer: ArrayBuffer): SecurityScanResult {
  const issues: string[] = []; let isArchiveBomb = false; let isZipTraversal = false;
  if (file.size > MAX_FILE_SIZE) issues.push(`حجم الملف (${(file.size / 1024 / 1024).toFixed(1)} ميجابايت) يتجاوز الحد الأقصى المسموح (${MAX_FILE_SIZE / 1024 / 1024} ميجابايت)`);
  const bytes = new Uint8Array(buffer); const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B;
  if (isZip) {
    if (file.size < 100 && file.name.match(/\.(zip|jar|apk)$/i)) { isArchiveBomb = true; issues.push('تحذير: قد يكون الملف قنبلة مضغوطة (حجم صغير جداً لملف مضغوط)'); }
    const decompressedEstimate = file.size * 100; if (decompressedEstimate > 500 * 1024 * 1024) issues.push(`تحذير: قد يستهلك الملف بعد فك الضغط مساحة كبيرة (~${(decompressedEstimate / 1024 / 1024).toFixed(0)} ميجابايت)`);
    if (isUnsafeArchivePath(file.name) || hasZipEntryTraversal(buffer)) { isZipTraversal = true; issues.push('تحذير: اسم الملف أو أحد إدخالات الأرشيف يحتوي على مسار غير آمن (path traversal)'); }
  }
  if (file.size === 0) issues.push('الملف فارغ');
  return { passed: issues.length === 0, issues, maxFileSize: MAX_FILE_SIZE, actualSize: file.size, isArchiveBomb, isZipTraversal };
}

export async function checkDuplicate(hash: string, _legacyCompanyId?: string, _legacySupabase?: typeof supabase): Promise<{ isDuplicate: boolean; existing: FileRecord | null }> {
  const companyId = await resolveCurrentCompanyId(); if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  const { data, error } = await supabase.from('file_records').select('id,company_id,file_name,file_hash,created_at,status').eq('company_id', companyId).eq('file_hash', hash).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error; if (!data) return { isDuplicate: false, existing: null }; return { isDuplicate: true, existing: data as FileRecord };
}