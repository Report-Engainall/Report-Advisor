import { resolveCurrentCompanyId, supabase } from '@/lib/supabase';
import type { SecurityScanResult } from './types';
import { MAX_FILE_SIZE } from './types';

interface FileRecord {
  id: string;
  company_id: string;
  file_name: string;
  file_hash: string;
  created_at: string;
  status: string;
}

export async function computeSHA256(buffer: ArrayBuffer): Promise<string> {
  if (crypto?.subtle) {
    const hash = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0x811c9dc5;
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function securityScan(file: File, buffer: ArrayBuffer): SecurityScanResult {
  const issues: string[] = [];
  let isArchiveBomb = false;
  let isZipTraversal = false;

  if (file.size > MAX_FILE_SIZE) {
    issues.push(`حجم الملف (${(file.size / 1024 / 1024).toFixed(1)} ميجابايت) يتجاوز الحد الأقصى المسموح (${MAX_FILE_SIZE / 1024 / 1024} ميجابايت)`);
  }

  const bytes = new Uint8Array(buffer);
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B;

  if (isZip) {
    if (file.size < 100 && file.name.match(/\.(zip|jar|apk)$/i)) {
      isArchiveBomb = true;
      issues.push('تحذير: قد يكون الملف قنبلة مضغوطة (حجم صغير جداً لملف مضغوط)');
    }

    const decompressedEstimate = file.size * 100;
    if (decompressedEstimate > 500 * 1024 * 1024) {
      issues.push(`تحذير: قد يستهلك الملف بعد فك الضغط مساحة كبيرة (~${(decompressedEstimate / 1024 / 1024).toFixed(0)} ميجابايت)`);
    }

    const fileNameBytes = new TextEncoder().encode(file.name);
    for (let i = 0; i < fileNameBytes.length - 2; i++) {
      if (fileNameBytes[i] === 0x2E && fileNameBytes[i + 1] === 0x2E && fileNameBytes[i + 2] === 0x2F) {
        isZipTraversal = true;
        issues.push('تحذير: اسم الملف يحتوي على مسار انتقالي (path traversal)');
        break;
      }
    }
  }

  if (file.size === 0) {
    issues.push('الملف فارغ');
  }

  return {
    passed: issues.length === 0,
    issues,
    maxFileSize: MAX_FILE_SIZE,
    actualSize: file.size,
    isArchiveBomb,
    isZipTraversal,
  };
}

/**
 * Duplicate detection is tenant-authoritative. The optional legacy arguments
 * remain accepted only to avoid breaking older callers during convergence;
 * they are deliberately ignored and can never select the tenant.
 */
export async function checkDuplicate(
  hash: string,
  _legacyCompanyId?: string,
  _legacySupabase?: typeof supabase,
): Promise<{ isDuplicate: boolean; existing: FileRecord | null }> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');

  const { data, error } = await supabase
    .from('file_records')
    .select('id,company_id,file_name,file_hash,created_at,status')
    .eq('company_id', companyId)
    .eq('file_hash', hash)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { isDuplicate: false, existing: null };

  return { isDuplicate: true, existing: data as FileRecord };
}
