import { resolveCurrentCompanyId } from '@/lib/supabase';
import { detectFormat } from '@/lib/file-engine/detector';
import { securityScan, computeSHA256, checkDuplicate } from '@/lib/file-engine/security';
import { parseFile } from '@/lib/file-engine/adapters';
import { commitImportBatch } from '@/lib/import/canonical-commit';
import { reconcileForCanonical, type ReconciledCanonicalImportRow } from '@/lib/import/canonical-truth-boundary';
import { createImportRecord, updateImportRecord } from '@/lib/queries';
import { finalizeExtraction } from '@/lib/import-pipeline/canonical-text-orchestrator';
import type { Dataset, FileFormat } from '@/lib/file-engine/types';
import type { FolderScanFile } from './batch-folder';

export type UniversalFolderEntity = 'sales_invoices' | 'products' | 'customers' | 'document_analysis';
export interface UniversalFolderResult { name: string; path: string; status: 'completed' | 'analyzed' | 'skipped' | 'failed'; format: string; rows: number; committed: number; datasets: number; entityType: UniversalFolderEntity; qualityScore: number; warning?: string; error?: string; duplicate?: boolean; }
export interface UniversalFolderProgress { processed: number; total: number; current: string; results: UniversalFolderResult[]; startedAt: string; updatedAt: string; }
type Row = Record<string, unknown>;

function canonicalTextFromRows(rows: Row[]): string { return rows.map((row, i) => `ROW ${i + 1}\n${Object.entries(row).map(([k, v]) => `${k}: ${String(v ?? '')}`).join('\n')}`).join('\n\n'); }

function inferEntity(dataset: Dataset): UniversalFolderEntity {
  const fields = new Set(dataset.columns.map((column) => column.mappedField).filter(Boolean) as string[]);
  const has = (...names: string[]) => names.some((name) => fields.has(name));
  if (has('invoice_number') && (has('invoice_date') || has('total'))) return 'sales_invoices';
  if (has('sku') && has('name')) return 'products';
  if (has('customer_id', 'customer_name', 'segment', 'credit_limit') || (has('name') && has('phone', 'email', 'code'))) return 'customers';
  return 'document_analysis';
}

function requiredFields(entityType: Exclude<UniversalFolderEntity, 'document_analysis'>): string[] { if (entityType === 'products') return ['sku', 'name']; if (entityType === 'customers') return ['name']; return ['invoice_number', 'invoice_date']; }
function normalizeRequiredFields(data: Row, required: string[]): Row { const normalized = { ...data }; for (const field of required) { if (normalized[field] != null && String(normalized[field]).trim() !== '') continue; const key = Object.keys(data).find((candidate) => candidate.toLowerCase() === field.toLowerCase()) ?? Object.keys(data).find((candidate) => candidate.toLowerCase().includes(field.toLowerCase())); if (key) normalized[field] = data[key]; } return normalized; }
function classifyValidRows(dataset: Dataset, entityType: Exclude<UniversalFolderEntity, 'document_analysis'>) { const required = requiredFields(entityType); const validRows: Array<{ rowNumber: number; data: Row }> = []; let rejected = 0; dataset.rows.forEach((sourceData, index) => { const data = normalizeRequiredFields(sourceData, required); if (required.every((field) => data[field] != null && String(data[field]).trim() !== '')) validRows.push({ rowNumber: index + 1, data }); else rejected += 1; }); return { validRows, rejected }; }

async function processDataset(companyId: string, item: FolderScanFile, hash: string, dataset: Dataset, entityType: UniversalFolderEntity, format: FileFormat): Promise<{ committed: number; warning?: string; importRecordId?: string }> {
  if (entityType === 'document_analysis') return { committed: 0, warning: '已完成结构/字段分析；没有强行创建业务实体，也没有丢弃未识别字段。可在分析工作区继续映射。' };
  const extraction = await finalizeExtraction(hash, format, canonicalTextFromRows(dataset.rows));
  if (extraction.status !== 'succeeded') return { committed: 0, warning: `تم التحليل دون كتابة: مرحلة الاستخراج لم تكتمل (${extraction.status}).` };
  const { validRows, rejected } = classifyValidRows(dataset, entityType);
  if (!validRows.length) return { committed: 0, warning: `تم تحليل الملف لكن لا توجد صفوف مكتملة لمفتاح ${entityType}. الحقول الأصلية محفوظة ولم تُحذف.` };
  const reconciliation = reconcileForCanonical(entityType, companyId, item.relativePath, hash, hash, (data, rowNumber) => `evidence:${hash}:${rowNumber}:${JSON.stringify(data)}`, validRows);
  if (reconciliation.rejected.length) return { committed: 0, warning: `تم التحليل دون كتابة بسبب تعارضات في ${reconciliation.rejected.length} صف؛ لم يتم تجاوز التعارض تلقائيًا.` };
  if (reconciliation.rows.length !== validRows.length) throw new Error('CANONICAL_RECONCILIATION_INCOMPLETE');
  const canonicalRows: ReconciledCanonicalImportRow[] = reconciliation.rows;
  const rec = await createImportRecord({ file_name: item.file.name, file_size: item.file.size, source_type: entityType, status: 'processing', total_rows: dataset.rowCount, valid_rows: canonicalRows.length, invalid_rows: rejected, quarantined_rows: rejected, entity_type: entityType, progress: 0 });
  for (let offset = 0; offset < canonicalRows.length; offset += 500) { const batch = canonicalRows.slice(offset, offset + 500); await commitImportBatch(entityType, batch, { jobId: rec.id }); await updateImportRecord(rec.id, { progress: Math.round(((offset + batch.length) / canonicalRows.length) * 100) }); }
  await updateImportRecord(rec.id, { status: 'completed', progress: 100, completed_at: new Date().toISOString() });
  return { committed: canonicalRows.length, importRecordId: rec.id, warning: rejected ? `استوردنا ${canonicalRows.length} صفًا صالحًا، وبقي ${rejected} صفًا يحتاج مراجعة.` : undefined };
}

export async function processFolderFilesUniversal(files: FolderScanFile[], onProgress?: (progress: UniversalFolderProgress) => void): Promise<UniversalFolderProgress> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_REQUIRED: لا يمكن تشغيل مزامنة المؤسسة بدون جلسة مصادق عليها.');
  const startedAt = new Date().toISOString();
  const results: UniversalFolderResult[] = [];
  const emit = (processed: number, current: string) => onProgress?.({ processed, total: files.length, current, results: [...results], startedAt, updatedAt: new Date().toISOString() });
  for (let index = 0; index < files.length; index += 1) {
    const item = files[index]; emit(index, item.relativePath);
    try {
      const buffer = await item.file.arrayBuffer(); const security = securityScan(item.file, buffer); if (!security.passed) throw new Error(security.issues.join(' — '));
      const detection = detectFormat(item.file, buffer); if (detection.format === 'unknown') throw new Error('صيغة غير مدعومة أو غير معروفة');
      const hash = await computeSHA256(buffer); const duplicate = await checkDuplicate(hash);
      if (duplicate.isDuplicate) { results.push({ name: item.file.name, path: item.relativePath, status: 'skipped', format: detection.format, rows: 0, committed: 0, datasets: 0, entityType: 'document_analysis', qualityScore: 100, duplicate: true, warning: 'نفس البصمة موجودة سابقًا؛ تم تجاوز الملف دون إعادة الكتابة.' }); continue; }
      const datasets = await parseFile(buffer, item.file.name, detection.format); if (!datasets.length || datasets.every((dataset) => dataset.rowCount === 0)) throw new Error('الملف قابل للوصول لكن لم ينتج أي مجموعة بيانات قابلة للتحليل.');
      let committed = 0; const entityTypes = new Set<UniversalFolderEntity>(); const warnings: string[] = []; let qualityScore = 0;
      for (const dataset of datasets) { const entityType = inferEntity(dataset); entityTypes.add(entityType); qualityScore += dataset.qualityScore; const outcome = await processDataset(companyId, item, hash, dataset, entityType, detection.format); committed += outcome.committed; if (outcome.warning) warnings.push(`${dataset.name}: ${outcome.warning}`); }
      qualityScore = Math.round(qualityScore / Math.max(1, datasets.length)); const entityType = entityTypes.size === 1 ? [...entityTypes][0] : 'document_analysis';
      results.push({ name: item.file.name, path: item.relativePath, status: committed > 0 ? 'completed' : 'analyzed', format: detection.format, rows: datasets.reduce((sum, dataset) => sum + dataset.rowCount, 0), committed, datasets: datasets.length, entityType, qualityScore, warning: warnings.length ? warnings.join(' | ') : undefined });
    } catch (error: unknown) { results.push({ name: item.file.name, path: item.relativePath, status: 'failed', format: item.format, rows: 0, committed: 0, datasets: 0, entityType: 'document_analysis', qualityScore: 0, error: error instanceof Error ? error.message : 'فشل غير معروف أثناء تحليل الملف' }); }
    emit(index + 1, index + 1 === files.length ? '' : files[index + 1].relativePath);
  }
  const final: UniversalFolderProgress = { processed: files.length, total: files.length, current: '', results, startedAt, updatedAt: new Date().toISOString() }; onProgress?.(final); return final;
}
