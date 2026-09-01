import { resolveCurrentCompanyId, supabase } from '../supabase.ts';
import type { SecurityScanResult } from './types.ts';
import { MAX_FILE_SIZE } from './types.ts';
import { computeSHA256 } from './file-identity-core';
export { computeSHA256 } from './file-identity-core';

interface FileRecord { id: string; company_id: string; file_name: string; file_hash: string; created_at: string; status: string; }

function isUnsafeArchivePath(name: string): boolean {
  const normalized = name.replaceAll('\\', '/');
  return normalized.includes('\0')
    || normalized.startsWith('/')
    || /^[A-Za-z]:\//.test(normalized)
    || normalized.split('/').some(segment => segment === '..');
}
