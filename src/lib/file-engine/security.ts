import type { SecurityScanResult } from './types';
import { MAX_FILE_SIZE } from './types';

export async function computeSHA256(buffer: ArrayBuffer): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
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

  if (file.size === 0) {
    issues.push('الملف فارغ');
  }

  const bytes = new Uint8Array(buffer);
  const isZipSignature = bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4B;
  const isExplicitArchive = /\.(zip|jar|apk)$/i.test(file.name);

  // XLSX/XLSM/ODS/DOCX are ZIP containers internally, but they are supported
  // document formats, not arbitrary archives. Never apply the archive-bomb
  // heuristic to them or normal spreadsheet/document files can be rejected.
  if (isZipSignature && isExplicitArchive) {
    if (file.size < 100) {
      isArchiveBomb = true;
      issues.push('الملف المضغوط صغير بشكل غير طبيعي وقد يكون ملفًا ضارًا');
    }

    const decompressedEstimate = file.size * 100;
    if (decompressedEstimate > 500 * 1024 * 1024) {
      isArchiveBomb = true;
      issues.push(`قد يستهلك الملف بعد فك الضغط مساحة كبيرة (~${(decompressedEstimate / 1024 / 1024).toFixed(0)} ميجابايت)`);
    }

    // This is a filename-level guard only. Actual archive-entry traversal is
    // intentionally left to a ZIP-aware parser before extraction.
    if (/\.\.([/\\]|$)/.test(file.name)) {
      isZipTraversal = true;
      issues.push('اسم الملف يحتوي على مسار انتقالي (path traversal)');
    }
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

export async function checkDuplicate(hash: string, companyId: string, supabase: any): Promise<{ isDuplicate: boolean; existing: any | null }> {
  const { data } = await supabase
    .from('file_records')
    .select('*')
    .eq('company_id', companyId)
    .eq('file_hash', hash)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data) {
    return { isDuplicate: true, existing: data };
  }
  return { isDuplicate: false, existing: null };
}
