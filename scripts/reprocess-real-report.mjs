import { createClient } from '@supabase/supabase-js';
import { computeSHA256 } from '../src/lib/file-engine/file-identity-core.ts';
import { detectFormat } from '../src/lib/file-engine/detector.ts';
import { securityScan } from '../src/lib/file-engine/security.ts';
import { parseFile } from '../src/lib/file-engine/adapters.ts';
import { reconcileForCanonical } from '../src/lib/import/canonical-truth-boundary.ts';
import { runCanonicalImportThroughDurableRunner } from '../src/lib/import/canonical-production-adapter.ts';

const projectUrl = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!projectUrl || !serviceKey) throw new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY missing');

const client = createClient(projectUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

const companyId = 'f68a7e91-3c7e-46fb-97a8-e339bec04e13';
const importId = '415b0d00-ce62-4ded-8d15-630aca1095f5';
const reportExecutionJobId = 'c4b8e005-3d39-4304-8bc0-a4f13db6338b';
const sourceHash = 'sha256:b7de36e1059354dd44e89020cbc434e86a5118b0978c05831140d986e6e65f30';
const fileName = 'الصراف المنتاب.pdf';
const entityType = 'generic:payments';

const { data: fileRecord, error: fileError } = await client
  .from('file_records')
  .select('id,company_id,file_name,file_size,file_mime,file_hash,detected_format,security_status,status,metadata')
  .eq('id', '66b453f8-90a2-4010-bf16-72b96f311afd')
  .eq('company_id', companyId)
  .single();
if (fileError || !fileRecord) throw fileError ?? new Error('source file record not found');
if (fileRecord.file_name !== fileName) throw new Error('source file name mismatch');
const metadata = fileRecord.metadata ?? {};
const bucket = String(metadata.storage_bucket ?? 'documents');
const storagePath = String(metadata.storage_path ?? '');
if (!storagePath.startsWith(companyId + '/') || storagePath.includes('..')) throw new Error('invalid authoritative storage path');

const { data: blob, error: downloadError } = await client.storage.from(bucket).download(storagePath);
if (downloadError || !blob) throw downloadError ?? new Error('authoritative source download failed');
const bytes = await blob.arrayBuffer();
const actualHash = 'sha256:' + await computeSHA256(bytes);
if (actualHash !== sourceHash) throw new Error('SOURCE_HASH_MISMATCH:' + actualHash);

const fileLike = { name: fileName, size: bytes.byteLength, type: String(fileRecord.file_mime ?? '') };
const security = securityScan(fileLike, bytes);
if (!security.passed) throw new Error('SOURCE_SECURITY_REJECTED:' + security.issues.join('|'));
const detection = detectFormat(fileLike, bytes);
if (detection.format === 'unknown') throw new Error('SOURCE_FORMAT_UNKNOWN');

const datasets = await parseFile(bytes, fileName, detection.format);
const dataset = datasets[0];
if (!dataset || dataset.rowCount <= 0) throw new Error('SOURCE_EXTRACTION_EMPTY');
const qualityScore = Math.max(0, Math.min(100, Math.round(dataset.qualityScore)));

const reconciled = reconcileForCanonical(
  entityType,
  companyId,
  fileName,
  sourceHash,
  importId,
  (data, rowNumber) => sourceHash + ':' + rowNumber + ':' + JSON.stringify(data),
  dataset.rows.map((data, index) => ({ rowNumber: index + 1, data })),
);
if (reconciled.rejected.length) throw new Error('SOURCE_RECONCILIATION_REJECTED:' + reconciled.rejected.length);
if (!reconciled.rows.length) throw new Error('SOURCE_RECONCILIATION_EMPTY');

const datasetForAnalysis = {
  id: dataset.id,
  name: dataset.name,
  source: dataset.source,
  sheet: dataset.sheet ?? null,
  rowCount: dataset.rowCount,
  columnCount: dataset.columnCount,
  columns: dataset.columns,
  preview: Array.isArray(dataset.preview) ? dataset.preview.slice(0, 100) : [],
  qualityScore: dataset.qualityScore,
};

const { data: existingAnalysis, error: analysisLookupError } = await client
  .from('source_analysis_snapshots')
  .select('id')
  .eq('company_id', companyId)
  .eq('import_job_id', importId)
  .eq('source_hash', sourceHash)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();
if (analysisLookupError) throw analysisLookupError;

const analysisPayload = {
  company_id: companyId,
  import_job_id: importId,
  source_hash: sourceHash,
  source_path: fileName,
  source_format: detection.format,
  analysis_status: 'analyzed',
  entity_type: entityType,
  quality_score: qualityScore,
  row_count: dataset.rowCount,
  column_count: dataset.columnCount,
  datasets: [datasetForAnalysis],
  canonical_text: null,
  visual_assets: [],
  warnings: dataset.columns.flatMap((column) => Array.isArray(column.qualityIssues) ? column.qualityIssues : []),
  metadata: {
    authoritativeServerRead: true,
    reportExecutionJobId,
    sourceStorageBucket: bucket,
    sourceStoragePath: storagePath,
    repairPass: true,
    repairParserVersion: '2026-10-04-customer-report-ui-and-parser-repair',
  },
};

const analysisWrite = existingAnalysis?.id
  ? await client.from('source_analysis_snapshots').update(analysisPayload).eq('id', existingAnalysis.id).eq('company_id', companyId)
  : await client.from('source_analysis_snapshots').insert(analysisPayload);
if (analysisWrite.error) throw analysisWrite.error;

const fileWrite = await client.from('file_records').update({
  file_hash: sourceHash,
  magic_bytes: detection.magicBytes,
  detected_format: detection.format,
  security_status: 'passed',
  status: 'ready',
}).eq('id', fileRecord.id).eq('company_id', companyId);
if (fileWrite.error) throw fileWrite.error;

const requestedBy = String(metadata.uploaded_by ?? '');
if (!requestedBy) throw new Error('SOURCE_REQUESTED_BY_MISSING');

const result = await runCanonicalImportThroughDurableRunner({
  importId,
  fileName,
  sourceHash,
  entityType,
  rows: reconciled.rows,
  qualityScore,
  qualityApproved: qualityScore >= 75,
  repairExistingSource: true,
}, {
  serverExecution: true,
  workerClient: client,
  dataClient: client,
  companyId,
  requestedBy,
});

const sample = reconciled.rows.slice(0, 12).map((row) => row.data);
const { data: canonicalReadback, error: readbackError } = await client
  .from('canonical_dataset_records')
  .select('row_number,data')
  .eq('company_id', companyId)
  .eq('import_job_id', importId)
  .eq('source_hash', sourceHash)
  .order('row_number', { ascending: true })
  .limit(20);
if (readbackError) throw readbackError;
const badDate = (canonicalReadback ?? []).filter((row) => Object.prototype.hasOwnProperty.call(row.data ?? {}, 'التاريخ 2026-')).length;
const malformedAmount = (canonicalReadback ?? []).filter((row) => /,\d{2}$/.test(String(row.data?.credit ?? row.data?.دائن ?? ''))).length;

console.log(JSON.stringify({
  status:'reprocessed',
  reportExecutionJobId,
  importId,
  sourceHash,
  detection:detection.format,
  qualityScore,
  parserRows:reconciled.rows.length,
  result,
  firstRows:sample,
  canonicalReadbackCount:(canonicalReadback ?? []).length,
  badDateHeaderRowsInReadback:badDate,
  malformedAmountRowsInReadback:malformedAmount,
},null,2));
