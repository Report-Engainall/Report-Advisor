import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES, MAX_ARCHIVE_ENTRIES, MAX_ARCHIVE_UNCOMPRESSED_BYTES, MAX_ARCHIVE_COMPRESSION_RATIO, MAX_IMPORT_ROW_COUNT, MAX_IMPORT_COLUMNS, MAX_TEXT_BYTES, validateFileType } from './constants';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface FileRecord {
  id: string;
  company_id: string;
  file_name: string;
  file_hash: string;
  created_at: string;
  status: string;
}

function isUnsafeArchivePath(path: string): boolean {
  const normalized = path.replaceAll('\\', '/').trim();
  return normalized.startsWith('/') || normalized.includes('../') || normalized.includes('/..') || /^[a-zA-Z]:\//.test(normalized);
}

function hasZipEntryTraversal(buffer: Buffer): boolean {
  const text = buffer.toString('latin1');
  const names = [...text.matchAll(/(?:\u0000|\n)([^\u0000\n]{1,512})/g)].map(match => match[1]);
  return names.some(name => isUnsafeArchivePath(name));
}

export function validateFileSecurity(file: { name: string; size: number; type?: string }, buffer: Buffer = Buffer.alloc(0)) {
  const issues: string[] = [];
  let isArchiveBomb = false;
  let isZipTraversal = false;
  if (file.size > MAX_FILE_SIZE) issues.push(`الملف يتجاوز الحد الأقصى للحجم (${Math.round(MAX_FILE_SIZE / 1024 / 1024)} ميجابايت)`);
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) issues.push(`نوع الملف غير مسموح: ${file.type}`);
  if (file.name.length > 255) issues.push('اسم الملف طويل جداً');
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.zip') || lower.endsWith('.jar') || lower.endsWith('.apk')) {
    if (file.size < 100 && file.name.match(/\.(zip|jar|apk)$/i)) { isArchiveBomb = true; issues.push('تحذير: قد يكون الملف قنبلة مضغوطة (حجم صغير جداً لملف مضغوط)'); }
    const decompressedEstimate = file.size * 100; if (decompressedEstimate > 500 * 1024 * 1024) issues.push(`تحذير: قد يستهلك الملف بعد فك الضغط مساحة كبيرة (~${(decompressedEstimate / 1024 / 1024).toFixed(0)} ميجابايت)`);
    if (isUnsafeArchivePath(file.name) || hasZipEntryTraversal(buffer)) { isZipTraversal = true; issues.push('تحذير: اسم الملف أو أحد إدخالات الأرشيف يحتوي على مسار غير آمن (path traversal)'); }
  }
  if (file.size === 0) issues.push('الملف فارغ');
  return { passed: issues.length === 0, issues, maxFileSize: MAX_FILE_SIZE, actualSize: file.size, isArchiveBomb, isZipTraversal };
}

export async function checkDuplicate(hash: string, _legacyCompanyId?: string, _legacySupabase?: SupabaseClient): Promise<{ isDuplicate: boolean; existing: FileRecord | null }> {
  const { resolveCurrentCompanyId, supabase } = await import('../supabase.ts');
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');

  const normalizedHash = hash.trim().toLowerCase().replace(/^sha256:/, '');
  if (!/^[0-9a-f]{64}$/.test(normalizedHash)) throw new Error('IMPORT_SOURCE_HASH_INVALID');
  const canonicalHash = `sha256:${normalizedHash}`;

  // Canonical import identity is authoritative at the successful server transaction.
  // Check it before the legacy file_records surface so a committed source can never be
  // treated as a new import merely because no auxiliary file record exists.
  const { data: canonicalCommit, error: canonicalError } = await supabase
    .from('canonical_import_commits')
    .select('id,company_id,source_hash,committed_at')
    .eq('company_id', companyId)
    .eq('source_hash', canonicalHash)
    .order('committed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (canonicalError) throw canonicalError;
  if (canonicalCommit) {
    return {
      isDuplicate: true,
      existing: {
        id: String(canonicalCommit.id),
        company_id: String(canonicalCommit.company_id),
        file_name: '',
        file_hash: canonicalHash,
        created_at: String(canonicalCommit.committed_at),
        status: 'committed',
      },
    };
  }

  // Preserve compatibility with historical file metadata that predates the canonical
  // commit ledger. This is fallback evidence only; canonical commits remain authoritative.
  const { data: fileRecord, error: fileError } = await supabase
    .from('file_records')
    .select('id,company_id,file_name,file_hash,created_at,status')
    .eq('company_id', companyId)
    .eq('file_hash', hash)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (fileError) throw fileError;
  if (fileRecord) return { isDuplicate: true, existing: fileRecord as FileRecord };

  return { isDuplicate: false, existing: null };
}
