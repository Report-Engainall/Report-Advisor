import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { parseFile } from '../src/lib/file-engine/adapters.ts';
import { detectFormat } from '../src/lib/file-engine/detector.ts';
import { securityScan } from '../src/lib/file-engine/security.ts';
import { reconcileForCanonical } from '../src/lib/import/canonical-truth-boundary.ts';
import { runCanonicalImportThroughDurableRunner } from '../src/lib/import/canonical-production-adapter.ts';

const url = process.env.REPORT_ADVISOR_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRole) throw new Error('LEGACY_CORPUS_REHYDRATION_ENV_MISSING');

const service = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: files, error: filesError } = await service
  .from('file_records')
  .select('id,company_id,file_name,file_size,file_mime,file_hash,status,metadata')
  .eq('status', 'uploaded')
  .eq('metadata->>report_corpus', 'true')
  .order('created_at', { ascending: true });

if (filesError) throw filesError;

mkdirSync('artifacts/legacy-corpus', { recursive: true });

const results = [];

for (const fileRecord of files ?? []) {
  const startedAt = new Date().toISOString();
  let claimMetadata = null;
  let claimAcquired = false;
  const result = {
    fileRecordId: fileRecord.id,
    companyId: fileRecord.company_id,
    fileName: fileRecord.file_name,
    sourcePath: fileRecord.metadata?.source_path ?? null,
    status: 'STARTED',
    startedAt,
  };

  try {
    const metadata = (fileRecord.metadata && typeof fileRecord.metadata === 'object')
      ? fileRecord.metadata
      : {};
    const claimRun = String(process.env.GITHUB_RUN_ID ?? 'local') + ':' + String(process.env.GITHUB_RUN_ATTEMPT ?? '0') + ':' + String(process.pid);
    claimMetadata = {
      ...metadata,
      rehydrationClaimRun: claimRun,
      rehydrationClaimedAt: new Date().toISOString(),
    };
    const { data: claimedRow, error: claimError } = await service
      .from('file_records')
      .update({ metadata: claimMetadata })
      .eq('id', fileRecord.id)
      .eq('company_id', fileRecord.company_id)
      .eq('status', 'uploaded')
      .is('metadata->>rehydrationClaimRun', null)
      .select('id')
      .maybeSingle();
    if (claimError) throw new Error('LEGACY_CORPUS_FILE_CLAIM_FAILED:' + claimError.message);
    if (!claimedRow) {
      result.status = 'SKIPPED_CONCURRENT_CLAIM';
      result.error = 'LEGACY_CORPUS_FILE_ALREADY_CLAIMED';
      results.push({ ...result, finishedAt: new Date().toISOString() });
      continue;
    }
    claimAcquired = true;

    const { data: previousImportJob, error: previousImportError } = await service
      .from('import_jobs')
      .select('job_type')
      .eq('file_record_id', fileRecord.id)
      .eq('company_id', fileRecord.company_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (previousImportError) throw new Error('LEGACY_CORPUS_PREVIOUS_JOB_LOOKUP_FAILED:' + previousImportError.message);

    const { data: importJobId, error: rehydrateError } = await service.rpc('rehydrate_legacy_import_job', {
      p_company_id: fileRecord.company_id,
      p_file_record_id: fileRecord.id,
    });
    if (rehydrateError || !importJobId) {
      throw new Error('LEGACY_CORPUS_REHYDRATION_JOB_CREATE_FAILED:' + (rehydrateError?.message ?? 'EMPTY_JOB_ID'));
    }

    const importJob = {
      id: String(importJobId),
      company_id: fileRecord.company_id,
      file_record_id: fileRecord.id,
      job_type: typeof previousImportJob?.job_type === 'string' && previousImportJob.job_type.trim()
        ? previousImportJob.job_type.trim()
        : 'generic:report',
    };

    const entityType = importJob.job_type;

    const bucket = String(claimMetadata?.storage_bucket ?? 'documents');
    const storagePath = String(metadata.storage_path ?? '');
    if (bucket !== 'documents' || !storagePath.startsWith(fileRecord.company_id + '/imports/') || storagePath.includes('..')) {
      throw new Error('LEGACY_CORPUS_STORAGE_BINDING_INVALID');
    }

    const { data: blob, error: downloadError } = await service.storage.from(bucket).download(storagePath);
    if (downloadError || !blob) throw new Error('LEGACY_CORPUS_SOURCE_DOWNLOAD_FAILED');

    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (!bytes.byteLength) throw new Error('LEGACY_CORPUS_SOURCE_EMPTY');

    const sourceHash = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
    result.sourceHash = sourceHash;
    result.byteLength = bytes.byteLength;

    const fileLike = new File([bytes], fileRecord.file_name, {
      type: fileRecord.file_mime ?? 'application/octet-stream',
    });
    const security = securityScan(fileLike, bytes.buffer);
    if (!security.passed) throw new Error('LEGACY_CORPUS_SECURITY_REJECTED:' + security.issues.join('|').slice(0, 600));

    const detection = detectFormat(fileLike, bytes.buffer);
    result.detectedFormat = detection.format;
    if (detection.format === 'unknown') throw new Error('LEGACY_CORPUS_FORMAT_UNKNOWN');

    const datasets = await parseFile(bytes.buffer, fileRecord.file_name, detection.format);
    const dataset = datasets?.[0];
    if (!dataset || dataset.rowCount <= 0) throw new Error('LEGACY_CORPUS_EXTRACTION_EMPTY');

    const qualityScore = Math.max(0, Math.min(100, Math.round(dataset.qualityScore)));
    result.qualityScore = qualityScore;
    result.rowCount = dataset.rowCount;
    result.columnCount = dataset.columnCount;

    const qualityDisposition =
      qualityScore < 50 ? 'BLOCKED' :
      qualityScore < 75 ? 'REVIEW' :
      'TRUSTED';

    result.qualityDisposition = qualityDisposition;

    if (qualityScore < 50) {
      if (claimAcquired && claimMetadata) {
        const cleanupMetadata = { ...claimMetadata };
        delete cleanupMetadata.rehydrationClaimRun;
        delete cleanupMetadata.rehydrationClaimedAt;
        await service.from('file_records').update({ metadata: cleanupMetadata }).eq('id', fileRecord.id).eq('company_id', fileRecord.company_id).eq('status', 'uploaded');
      }
      result.status = 'BLOCKED';
      result.error = 'LEGACY_CORPUS_QUALITY_REJECTED';
      results.push({ ...result, finishedAt: new Date().toISOString() });
      continue;
    }

    if (qualityScore < 75) {
      if (claimAcquired && claimMetadata) {
        const cleanupMetadata = { ...claimMetadata };
        delete cleanupMetadata.rehydrationClaimRun;
        delete cleanupMetadata.rehydrationClaimedAt;
        await service.from('file_records').update({ metadata: cleanupMetadata }).eq('id', fileRecord.id).eq('company_id', fileRecord.company_id).eq('status', 'uploaded');
      }
      result.status = 'REVIEW';
      result.error = 'LEGACY_CORPUS_REVIEW_REQUIRED';
      results.push({ ...result, finishedAt: new Date().toISOString() });
      continue;
    }

    const reconciled = reconcileForCanonical(
      entityType,
      fileRecord.company_id,
      fileRecord.file_name,
      sourceHash,
      importJob.id,
      (row, rowNumber) => sourceHash + ':' + rowNumber + ':' + JSON.stringify(row),
      dataset.rows.map((data, index) => ({ rowNumber: index + 1, data })),
    );
    if (!reconciled.rows.length) throw new Error('LEGACY_CORPUS_NO_RECONCILED_ROWS');
    if (reconciled.rejected.length) throw new Error('LEGACY_CORPUS_RECONCILIATION_REJECTED:' + reconciled.rejected.length);

    const requestedBy = typeof claimMetadata?.uploaded_by === 'string' ? claimMetadata.uploaded_by : null;
    if (!requestedBy) throw new Error('LEGACY_CORPUS_REQUESTED_BY_MISSING');

    const execution = await runCanonicalImportThroughDurableRunner(
      {
        importId: importJob.id,
        fileName: fileRecord.file_name,
        sourceHash,
        entityType,
        rows: reconciled.rows,
        qualityScore,
        qualityApproved: true,
      },
      {
        serverExecution: true,
        workerClient: service,
        dataClient: service,
        companyId: fileRecord.company_id,
        requestedBy,
      },
    );

    await service.from('file_records')
      .update({
        file_hash: sourceHash,
        security_status: 'passed',
        status: 'ready',
        detected_format: detection.format,
        metadata: {
          ...claimMetadata,
          raw_bytes_sha256: sourceHash,
          server_rehydrated_at: new Date().toISOString(),
          server_rehydrated: true,
        },
      })
      .eq('id', fileRecord.id)
      .eq('company_id', fileRecord.company_id);

    result.status = 'COMPLETED';
    result.execution = execution;
  } catch (error) {
    if (claimAcquired && claimMetadata) {
      const cleanupMetadata = { ...claimMetadata };
      delete cleanupMetadata.rehydrationClaimRun;
      delete cleanupMetadata.rehydrationClaimedAt;
      await service
        .from('file_records')
        .update({ metadata: cleanupMetadata })
        .eq('id', fileRecord.id)
        .eq('company_id', fileRecord.company_id)
        .eq('status', 'uploaded');
    }
    result.status = 'FAILED';
    result.error = error instanceof Error ? error.message : String(error);
  }

  results.push({ ...result, finishedAt: new Date().toISOString() });
}

const summary = {
  startedAt: new Date().toISOString(),
  discovered: results.length,
  completed: results.filter((item) => item.status === 'COMPLETED').length,
  review: results.filter((item) => item.status === 'REVIEW').length,
  blocked: results.filter((item) => item.status === 'BLOCKED').length,
  failed: results.filter((item) => item.status === 'FAILED').length,
  records: results,
};

writeFileSync('artifacts/legacy-corpus/rehydration-summary.json', JSON.stringify(summary, null, 2));
const failureGroups = results
  .filter((item) => item.status === 'FAILED')
  .reduce((groups, item) => {
    const key = String(item.error ?? 'UNKNOWN');
    groups[key] = (groups[key] ?? 0) + 1;
    return groups;
  }, {});

console.log(JSON.stringify({
  LEGACY_CORPUS_DISCOVERED: summary.discovered,
  LEGACY_CORPUS_COMPLETED: summary.completed,
  LEGACY_CORPUS_REVIEW: summary.review,
  LEGACY_CORPUS_BLOCKED: summary.blocked,
  LEGACY_CORPUS_FAILED: summary.failed,
  LEGACY_CORPUS_FAILURE_GROUPS: failureGroups,
}, null, 2));

if (summary.failed > 0) process.exitCode = 1;
