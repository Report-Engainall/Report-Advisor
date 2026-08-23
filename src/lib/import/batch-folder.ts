import { supabase, COMPANY_ID } from '@/lib/supabase';
import { detectFormat } from '@/lib/file-engine/detector';
import { securityScan, computeSHA256, checkDuplicate } from '@/lib/file-engine/security';
import { parseFile } from '@/lib/file-engine/adapters';
import { commitImportBatch, type CanonicalImportRow } from '@/lib/import/canonical-commit';
import { createImportRecord, updateImportRecord } from '@/lib/queries';
import type { FileFormat } from '@/lib/file-engine/types';

export type BatchEntityType = 'sales_invoices' | 'products' | 'customers';
export interface FolderScanFile { file: File; format: FileFormat | 'unknown'; relativePath: string; }
export interface BatchFileResult { name: string; path: string; status: 'completed' | 'skipped' | 'failed'; format: string; rows: number; committed: number; error?: string; duplicate?: boolean; }
export interface BatchProgress { processed: number; total: number; current: string; results: BatchFileResult[]; }

const EXTENSIONS = new Set(['xlsx','xls','xlsm','csv','tsv','ods','json','jsonl','xml','txt','md','markdown','pdf','docx','doc','rtf','jpg','jpeg','png','webp','tiff','bmp']);

export async function scanDirectory(handle: any): Promise<FolderScanFile[]> {
  if (!handle || typeof handle.values !== 'function') throw new Error('لم يتم اختيار مجلد صالح.');
  const files: FolderScanFile[] = [];
  for await (const entry of handle.values()) {
    if (entry.kind !== 'file') continue;
    const file = await entry.getFile();
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (EXTENSIONS.has(ext)) files.push({ file, format: 'unknown', relativePath: file.name });
  }
  return files.sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true }));
}

function requiredFields(entityType: BatchEntityType): string[] {
  return entityType === 'products' ? ['sku', 'name', 'cost_price', 'selling_price'] : entityType === 'customers' ? ['name'] : ['invoice_number', 'invoice_date', 'customer_name', 'total'];
}

export async function processFolderFiles(files: FolderScanFile[], entityType: BatchEntityType, onProgress?: (progress: BatchProgress) => void): Promise<BatchProgress> {
  const results: BatchFileResult[] = [];
  for (let index = 0; index < files.length; index++) {
    const item = files[index];
    const base = { processed: index, total: files.length, current: item.file.name, results: [...results] };
    onProgress?.(base);
    try {
      const buffer = await item.file.arrayBuffer();
      const security = securityScan(item.file, buffer);
      if (!security.passed) throw new Error(security.issues.join(' — '));
      const detection = detectFormat(item.file, buffer);
      if (detection.format === 'unknown') throw new Error('صيغة غير مدعومة أو غير معروفة');
      const hash = await computeSHA256(buffer);
      const duplicate = await checkDuplicate(hash, COMPANY_ID, supabase);
      if (duplicate.isDuplicate) {
        results.push({ name: item.file.name, path: item.relativePath, status: 'skipped', format: detection.format, rows: 0, committed: 0, duplicate: true, error: 'تم استيراد الملف سابقاً.' });
        continue;
      }
      const datasets = await parseFile(buffer, item.file.name, detection.format);
      const dataset = datasets[0];
      if (!dataset || dataset.rowCount === 0) throw new Error('الملف فارغ أو لا يحتوي على بيانات قابلة للقراءة');
      const required = requiredFields(entityType);
      const validRows: CanonicalImportRow[] = [];
      for (let rowIndex = 0; rowIndex < dataset.rows.length; rowIndex++) {
        const data = dataset.rows[rowIndex];
        const missing = required.filter(field => { const key = Object.keys(data).find(k => k === field) ?? Object.keys(data).find(k => k.toLowerCase().includes(field.toLowerCase())); const value = key ? data[key] : undefined; return value == null || String(value).trim() === ''; });
        if (!missing.length) validRows.push({ rowNumber: rowIndex + 1, data });
      }
      if (!validRows.length) throw new Error('لم توجد صفوف صالحة بعد التحقق من الحقول المطلوبة');
      const rec = await createImportRecord({ file_name: item.file.name, file_size: item.file.size, source_type: detection.format, status: 'processing', total_rows: dataset.rowCount, valid_rows: validRows.length, invalid_rows: dataset.rowCount - validRows.length, quarantined_rows: dataset.rowCount - validRows.length, entity_type: entityType, progress: 0 });
      let committed = 0;
      const batchSize = 50;
      for (let offset = 0; offset < validRows.length; offset += batchSize) {
        const batch = validRows.slice(offset, offset + batchSize);
        await commitImportBatch(entityType, batch);
        committed += batch.length;
        await updateImportRecord(rec.id, { progress: Math.round((committed / validRows.length) * 100) });
      }
      await updateImportRecord(rec.id, { status: 'completed', progress: 100, completed_at: new Date().toISOString() });
      results.push({ name: item.file.name, path: item.relativePath, status: 'completed', format: detection.format, rows: dataset.rowCount, committed });
    } catch (error: any) {
      results.push({ name: item.file.name, path: item.relativePath, status: 'failed', format: item.format, rows: 0, committed: 0, error: error?.message || 'خطأ غير معروف' });
    }
  }
  const final = { processed: files.length, total: files.length, current: '', results };
  onProgress?.(final);
  return final;
}
