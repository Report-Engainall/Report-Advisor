import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { securityScan } from '../lib/file-engine/security';
import { detectFormat } from '../lib/file-engine/detector';
import { parseFile } from '../lib/file-engine/adapters';
import { reconcileForCanonical, type CanonicalImportEntityType } from '../lib/import/canonical-truth-boundary';
import { buildRenderedReportOutput, runCanonicalImportThroughDurableRunner } from '../lib/import/canonical-production-adapter';
import { understandCanonicalSource } from '../lib/import/canonical-source-understanding';

export interface CanonicalImportServerEnv {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
}

type CanonicalImportRequest = {
  importId?: string;
  fileName?: string;
  sourceHash?: string;
  entityType?: CanonicalImportEntityType;
  rows?: unknown[];
  qualityScore?: number;
  qualityApproved?: boolean;
  durableJobId?: string;
  mode?: 'execute' | 'enqueue' | 'finalize-source';
};

function assertRequest(value: unknown): CanonicalImportRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('CANONICAL_IMPORT_REQUEST_INVALID');
  const body = value as CanonicalImportRequest;
  const genericEntity = typeof body.entityType === 'string' && /^generic:[a-z][a-z0-9_-]{0,63}$/.test(body.entityType);
  if (body.entityType !== 'products' && body.entityType !== 'customers' && body.entityType !== 'sales_invoices' && body.entityType !== 'purchase_invoices' && body.entityType !== 'suppliers' && body.entityType !== 'inventory_balances' && body.entityType !== 'payments' && !genericEntity) {
    throw new Error('CANONICAL_IMPORT_ENTITY_TYPE_INVALID');
  }
  if (!body.importId || !body.importId.trim()) throw new Error('CANONICAL_IMPORT_IMPORT_ID_INVALID');
  if (body.fileName !== undefined && (typeof body.fileName !== 'string' || body.fileName.length > 512)) throw new Error('CANONICAL_IMPORT_FILE_NAME_INVALID');
  if (body.sourceHash !== undefined && (!/^sha256:[0-9a-fA-F]{64}$/.test(body.sourceHash))) throw new Error('CANONICAL_IMPORT_SOURCE_HASH_INVALID');
  if (body.qualityApproved !== undefined && typeof body.qualityApproved !== 'boolean') throw new Error('CANONICAL_IMPORT_QUALITY_APPROVAL_INVALID');
  if (body.durableJobId !== undefined && (typeof body.durableJobId !== 'string' || !body.durableJobId.trim())) throw new Error('CANONICAL_IMPORT_DURABLE_JOB_ID_INVALID');
  return body;
}

function metadataRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function executeCanonicalImport(value: unknown, authorization: string, serverEnv: CanonicalImportServerEnv): Promise<Record<string, unknown>> {
  const payload = assertRequest(value);
  const mode = payload.mode ?? 'execute';
  const userClient = createClient(serverEnv.supabaseUrl, serverEnv.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${authorization}` } },
  });
  const serviceClient = createClient(serverEnv.supabaseUrl, serverEnv.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user?.id) throw new Error('AUTHENTICATED_USER_REQUIRED');

  const { data: companyId, error: companyError } = await userClient.rpc('current_company_id');
  if (companyError || !companyId) throw new Error('TENANT_CONTEXT_REQUIRED');

  const { data: job, error: jobError } = await serviceClient
    .from('import_jobs')
    .select('id, company_id, file_record_id, job_type, result_summary')
    .eq('id', payload.importId)
    .eq('company_id', companyId)
    .maybeSingle();
  if (jobError) throw jobError;
  if (!job?.file_record_id) throw new Error('IMPORT_JOB_SOURCE_RECORD_NOT_FOUND_OR_FORBIDDEN');
  if (job.job_type && job.job_type !== payload.entityType) throw new Error('CANONICAL_IMPORT_ENTITY_TYPE_MISMATCH');

  const { data: fileRecord, error: fileError } = await serviceClient
    .from('file_records')
    .select('id, company_id, file_name, file_mime, file_size, file_hash, security_status, status, metadata')
    .eq('id', job.file_record_id)
    .eq('company_id', companyId)
    .maybeSingle();
  if (fileError) throw fileError;
  if (!fileRecord) throw new Error('IMPORT_JOB_SOURCE_RECORD_NOT_FOUND_OR_FORBIDDEN');

  const metadata = metadataRecord(fileRecord.metadata);
  const storageBucket = String(metadata.storage_bucket ?? 'documents');
  const storagePath = String(metadata.storage_path ?? '');
  if (storageBucket !== 'documents' || !storagePath) throw new Error('AUTHORITATIVE_SOURCE_STORAGE_BINDING_INVALID');
  if (!storagePath.startsWith(`${companyId}/imports/`)) throw new Error('AUTHORITATIVE_SOURCE_STORAGE_TENANT_MISMATCH');

  const { data: sourceBlob, error: downloadError } = await serviceClient.storage.from(storageBucket).download(storagePath);
  if (downloadError || !sourceBlob) throw new Error(`AUTHORITATIVE_SOURCE_DOWNLOAD_FAILED:${downloadError?.message ?? 'EMPTY_SOURCE'}`);

  const bytes = new Uint8Array(await sourceBlob.arrayBuffer());
  const sourceSha = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
  if (payload.sourceHash && payload.sourceHash !== sourceSha) throw new Error('AUTHORITATIVE_SOURCE_HASH_MISMATCH');

  const sourceFile = new File([bytes], fileRecord.file_name || payload.fileName || 'import', {
    type: fileRecord.file_mime || sourceBlob.type || 'application/octet-stream',
    lastModified: Date.now(),
  });
  const security = securityScan(sourceFile, bytes.buffer);
  if (!security.passed) throw new Error(`AUTHORITATIVE_SOURCE_SECURITY_REJECTED:${security.issues.join(' | ')}`);

  const detection = detectFormat(sourceFile, bytes.buffer);
  if (detection.format === 'unknown') throw new Error('AUTHORITATIVE_SOURCE_FORMAT_UNKNOWN');

  if (mode === 'finalize-source') {
    return { importId: job.id, sourceHash: sourceSha, jobId: job.id, finalizedSource: true };
  }

  const authoritativeDatasets = await parseFile(bytes.buffer, fileRecord.file_name || payload.fileName || 'import', detection.format);
  const sourceUnderstanding = understandCanonicalSource(authoritativeDatasets);
  if (sourceUnderstanding.rowCount === 0) throw new Error('AUTHORITATIVE_SOURCE_PARSE_EMPTY');

  const authoritativeEntityType = sourceUnderstanding.entityType;
  const authoritativeQualityScore = Math.max(0, Math.min(100, Math.round(sourceUnderstanding.qualityScore)));
  if (authoritativeQualityScore < 50) throw new Error(`CANONICAL_IMPORT_QUALITY_REJECTED:${authoritativeQualityScore}`);
  if (authoritativeQualityScore < 75 && payload.qualityApproved !== true) {
    throw new Error(`CANONICAL_IMPORT_REVIEW_APPROVAL_REQUIRED:${authoritativeQualityScore}`);
  }
  if (payload.entityType !== authoritativeEntityType && payload.entityType !== 'generic:source-data') {
    throw new Error('CANONICAL_IMPORT_ENTITY_TYPE_MISMATCH');
  }

  const authoritativeRows = sourceUnderstanding.rows.map((data, index) => ({ rowNumber: index + 1, data }));
  const reconciled = reconcileForCanonical(
    authoritativeEntityType,
    String(companyId),
    fileRecord.file_name || payload.fileName || 'import',
    sourceSha,
    job.id,
    (_data, rowNumber) => `${sourceSha}:${rowNumber}`,
    authoritativeRows,
  );
  if (reconciled.rejected.length > 0) {
    throw new Error(`CANONICAL_RECONCILIATION_REJECTED:${reconciled.rejected.map(item => `${item.rowNumber}:${item.reason}`).join(',')}`);
  }
  if (reconciled.rows.length !== authoritativeRows.length) throw new Error('AUTHORITATIVE_SOURCE_RECONCILIATION_COUNT_MISMATCH');

  const verifiedMetadata = {
    ...metadata,
    storage_bucket: storageBucket,
    storage_path: storagePath,
    raw_bytes_sha256: sourceSha,
    detected_format: detection.format,
    server_verified_at: new Date().toISOString(),
    server_verified_by: userData.user.id,
  };

  const { error: fileUpdateError } = await serviceClient.from('file_records').update({
    file_hash: sourceSha,
    file_size: bytes.byteLength,
    file_mime: fileRecord.file_mime || sourceBlob.type || detection.mime,
    security_status: 'passed',
    status: 'ready',
    metadata: verifiedMetadata,
  }).eq('id', fileRecord.id).eq('company_id', companyId);
  if (fileUpdateError) throw fileUpdateError;

  const { error: jobUpdateError } = await serviceClient.from('import_jobs').update({
    source_fingerprint: sourceSha,
    result_summary: {
      ...(job.result_summary && typeof job.result_summary === 'object' ? job.result_summary : {}),
      source_verified: true,
      source_hash: sourceSha,
      source_storage_bucket: storageBucket,
      source_storage_path: storagePath,
      server_verified_at: verifiedMetadata.server_verified_at,
    },
  }).eq('id', job.id).eq('company_id', companyId);
  if (jobUpdateError) throw jobUpdateError;

  const durableJobKey = `canonical-import:${authoritativeEntityType}:${sourceSha}:${job.id}`;
  if (mode === 'enqueue') {
    const { data: queuedJob, error: queueError } = await serviceClient.rpc('enqueue_report_execution_job', {
      p_company_id: companyId,
      p_job_key: durableJobKey,
      p_source_path: fileRecord.file_name || payload.fileName || 'import',
      p_source_hash: sourceSha,
      p_evidence_keys: [`source:${sourceSha}`, `import:${job.id}`, `entity:${authoritativeEntityType}`, `rows:${authoritativeRows.length}`],
      p_max_attempts: 3,
    });
    if (queueError) throw queueError;
    if (!queuedJob || typeof queuedJob !== 'object' || typeof queuedJob.id !== 'string') throw new Error('REPORT_EXECUTION_JOB_ENQUEUE_EMPTY');
    return { importId: job.id, sourceHash: sourceSha, jobId: String(queuedJob.id), queued: true,
      authoritativeRowCount: authoritativeRows.length, authoritativeQualityScore,
      sourceSpecialty: sourceUnderstanding.specialty, sourceSpecialtyConfidence: sourceUnderstanding.specialtyConfidence,
      authoritativeEntityType, datasetCount: sourceUnderstanding.datasetCount, datasetSummaries: sourceUnderstanding.datasets,
      sourceWarnings: sourceUnderstanding.warnings };
  }

  if (mode === 'execute' && payload.durableJobId) {
    const { data: durableJob, error: durableJobError } = await serviceClient
      .from('report_execution_jobs').select('id,company_id,status,source_hash')
      .eq('id', payload.durableJobId).eq('company_id', companyId).maybeSingle();
    if (durableJobError) throw durableJobError;
    if (!durableJob) throw new Error('REPORT_EXECUTION_JOB_NOT_FOUND_OR_FORBIDDEN');
    if (durableJob.source_hash !== sourceSha) throw new Error('REPORT_EXECUTION_JOB_SOURCE_HASH_MISMATCH');
  }

  const { data: existingCommit, error: existingCommitError } = await serviceClient
    .from('canonical_import_commits')
    .select('id, entity_type, source_hash, committed_count, committed_at')
    .eq('company_id', companyId)
    .eq('entity_type', authoritativeEntityType)
    .eq('source_hash', sourceSha)
    .order('committed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingCommitError) throw existingCommitError;

  let execution: Record<string, unknown>;
  if (existingCommit) {
    if (Number(existingCommit.committed_count) !== authoritativeRows.length) {
      throw new Error('CANONICAL_EXISTING_COMMIT_COUNT_MISMATCH');
    }

    const { data: durableQueueJob, error: durableQueueError } = await serviceClient.rpc('enqueue_report_execution_job', {
      p_company_id: companyId,
      p_job_key: durableJobKey,
      p_source_path: fileRecord.file_name || payload.fileName || 'import',
      p_source_hash: sourceSha,
      p_evidence_keys: [
        `source:${sourceSha}`,
        `import:${job.id}`,
        `entity:${authoritativeEntityType}`,
        `rows:${authoritativeRows.length}`,
      ],
      p_max_attempts: 3,
    });
    if (durableQueueError) throw durableQueueError;
    if (!durableQueueJob || typeof durableQueueJob !== 'object' || typeof durableQueueJob.id !== 'string') {
      throw new Error('REPORT_EXECUTION_JOB_ENQUEUE_EMPTY');
    }

    const renderedInput = {
      importId: job.id,
      fileName: fileRecord.file_name || payload.fileName || 'import',
      sourceHash: sourceSha,
      entityType: authoritativeEntityType,
      sourceSpecialty: sourceUnderstanding.specialty,
      rows: reconciled.rows,
      qualityScore: authoritativeQualityScore,
      qualityApproved: payload.qualityApproved === true,
    } as Parameters<typeof buildRenderedReportOutput>[0];

    const renderedOutput = buildRenderedReportOutput(renderedInput);
    const durableJobId = String(durableQueueJob.id);
    const { data: existingDurableJob, error: existingDurableJobError } = await serviceClient
      .from('report_execution_jobs')
      .select('id,status,evidence')
      .eq('id', durableJobId)
      .eq('company_id', companyId)
      .single();
    if (existingDurableJobError) throw existingDurableJobError;
    if (existingDurableJob.status !== 'completed') {
      throw new Error(`CANONICAL_EXISTING_COMMIT_DURABLE_JOB_NOT_COMPLETED:${existingDurableJob.status}`);
    }

    const mergedEvidence = {
      ...metadataRecord(existingDurableJob.evidence),
      renderedOutput: snapshotId && evidenceStatus === 'VERIFIED' ? { ...metadataRecord(renderedOutput), evidenceStatus, snapshotId } : renderedOutput,
    };
    const { error: durableEvidenceError } = await serviceClient
      .from('report_execution_jobs')
      .update({ evidence: mergedEvidence })
      .eq('id', durableJobId)
      .eq('company_id', companyId)
      .eq('status', 'completed');
    if (durableEvidenceError) throw durableEvidenceError;

    const { error: renderedTaskError } = await serviceClient
      .from('report_execution_tasks')
      .update({ evidence: { ...metadataRecord((await serviceClient.from('report_execution_tasks').select('evidence').eq('company_id', companyId).eq('report_execution_job_id', durableJobId).eq('stage', 'rendered').single()).data?.evidence), renderedOutput } })
      .eq('company_id', companyId)
      .eq('report_execution_job_id', durableJobId)
      .eq('stage', 'rendered')
      .eq('status', 'completed');
    if (renderedTaskError) throw renderedTaskError;

    execution = {
      importId: job.id,
      sourceHash: sourceSha,
      jobId: durableJobId,
      executionJobId: durableJobId,
      renderedOutput,
      reusedExistingCommit: true,
      existingCommitId: String(existingCommit.id),
      existingCommitAt: existingCommit.committed_at,
    };
  } else {
    execution = await runCanonicalImportThroughDurableRunner(
      {
        importId: job.id,
        fileName: fileRecord.file_name || payload.fileName || 'import',
        sourceHash: sourceSha,
        entityType: authoritativeEntityType,
        sourceSpecialty: sourceUnderstanding.specialty,
        rows: reconciled.rows,
        qualityScore: authoritativeQualityScore,
        qualityApproved: payload.qualityApproved === true,
        durableJobId: payload.durableJobId,
      },
      {
        serverExecution: true,
        workerClient: serviceClient,
        dataClient: userClient,
        companyId: String(companyId),
        requestedBy: userData.user.id,
        durableJobId: payload.durableJobId,
      },
    );
  }

  const renderedOutput = execution.renderedOutput && typeof execution.renderedOutput === 'object'
    ? execution.renderedOutput
    : buildRenderedReportOutput({
        importId: job.id,
        fileName: fileRecord.file_name || payload.fileName || 'import',
        sourceHash: sourceSha,
        entityType: authoritativeEntityType,
        sourceSpecialty: sourceUnderstanding.specialty,
        rows: reconciled.rows,
        qualityScore: authoritativeQualityScore,
        qualityApproved: payload.qualityApproved === true,
      });

  const { error: resultSummaryError } = await serviceClient.from('import_jobs').update({
    result_summary: {
      ...(job.result_summary && typeof job.result_summary === 'object' ? job.result_summary : {}),
      execution_job_id: typeof execution.executionJobId === 'string'
        ? execution.executionJobId
        : (typeof execution.jobId === 'string' ? execution.jobId : null),
      rendered_output: renderedOutput,
      source_specialty: sourceUnderstanding.specialty,
      source_entity_type: authoritativeEntityType,
      committed: authoritativeRows.length,
      quality_score: authoritativeQualityScore,
    },
  }).eq('id', job.id).eq('company_id', companyId);
  if (resultSummaryError) throw resultSummaryError;

  let snapshotId: string | null = null;
  let evidenceStatus: 'VERIFIED' | 'PARTIAL' = 'PARTIAL';
  let evidenceWarning = 'تم تنفيذ الاستيراد الكانوني، لكن لقطة الدليل لم تُثبت؛ الحالة بقيت PARTIAL ولم يتم الادعاء باكتمال الدليل.';
  try {
    const { data: snapshot, error: snapshotError } = await serviceClient
      .from('source_analysis_snapshots')
      .insert({
        company_id: companyId,
        import_job_id: job.id,
        source_hash: sourceSha,
        source_path: storagePath,
        source_format: detection.format,
        analysis_status: 'analyzed',
        entity_type: authoritativeEntityType,
        quality_score: authoritativeQualityScore,
        row_count: authoritativeRows.length,
        column_count: sourceUnderstanding.columnCount,
        datasets: sourceUnderstanding.datasets.map((dataset) => ({ ...dataset, sourceHash: sourceSha })),
        canonical_text: [
          `source=${fileRecord.file_name || payload.fileName || 'import'}`,
          `server_authoritative_quality=${authoritativeQualityScore}%`,
          `source_specialty=${sourceUnderstanding.specialty}`,
          `dataset_count=${sourceUnderstanding.datasetCount}`,
          `source_sha=${sourceSha}`,
        ].join(' | '),
        visual_assets: [],
        warnings: [],
        metadata: {
          fileName: fileRecord.file_name || payload.fileName || 'import',
          sourceFormat: detection.format,
          serverAuthoritativeSource: true,
          serverAuthoritativeQualityScore: authoritativeQualityScore,
          committed: authoritativeRows.length,
          reusedExistingCommit: execution.reusedExistingCommit === true,
          existingCommitId: typeof execution.existingCommitId === 'string' ? execution.existingCommitId : null,
          jobId: typeof execution.jobId === 'string' ? execution.jobId : null,
          sourceStoragePath: storagePath,
          sourceSpecialty: sourceUnderstanding.specialty,
          sourceSpecialtyConfidence: sourceUnderstanding.specialtyConfidence,
          datasetCount: sourceUnderstanding.datasetCount,
          datasetWarnings: sourceUnderstanding.warnings,
          renderedOutput,
        },
      })
      .select('id')
      .single();
    if (snapshotError) throw snapshotError;
    snapshotId = snapshot?.id ?? null;
    if (!snapshotId) throw new Error('SOURCE_EVIDENCE_SNAPSHOT_ID_MISSING');
    evidenceStatus = 'VERIFIED';
    evidenceWarning = '';

    const verifiedRenderedOutput = {
      ...metadataRecord(renderedOutput),
      evidenceStatus: 'VERIFIED',
      snapshotId,
    };
    const durableExecutionJobId = typeof execution.executionJobId === 'string'
      ? execution.executionJobId
      : (typeof execution.jobId === 'string' && execution.jobId !== job.id ? execution.jobId : null);

    if (durableExecutionJobId) {
      const { data: durableJobRow, error: durableJobReadError } = await serviceClient
        .from('report_execution_jobs')
        .select('evidence')
        .eq('id', durableExecutionJobId)
        .eq('company_id', companyId)
        .maybeSingle();
      if (durableJobReadError) throw durableJobReadError;
      if (durableJobRow) {
        const mergedEvidence = {
          ...metadataRecord(durableJobRow.evidence),
          renderedOutput: verifiedRenderedOutput,
        };
        const { error: durableJobUpdateError } = await serviceClient
          .from('report_execution_jobs')
          .update({ evidence: mergedEvidence })
          .eq('id', durableExecutionJobId)
          .eq('company_id', companyId)
          .eq('status', 'completed');
        if (durableJobUpdateError) throw durableJobUpdateError;

        const { data: renderedTaskRow, error: renderedTaskReadError } = await serviceClient
          .from('report_execution_tasks')
          .select('evidence')
          .eq('report_execution_job_id', durableExecutionJobId)
          .eq('company_id', companyId)
          .eq('stage', 'rendered')
          .maybeSingle();
        if (renderedTaskReadError) throw renderedTaskReadError;
        if (renderedTaskRow) {
          const { error: renderedTaskUpdateError } = await serviceClient
            .from('report_execution_tasks')
            .update({
              evidence: {
                ...metadataRecord(renderedTaskRow.evidence),
                renderedOutput: verifiedRenderedOutput,
              },
            })
            .eq('report_execution_job_id', durableExecutionJobId)
            .eq('company_id', companyId)
            .eq('stage', 'rendered')
            .eq('status', 'completed');
          if (renderedTaskUpdateError) throw renderedTaskUpdateError;
        }
      }
    }

    const { data: refreshedImportJob, error: refreshedImportJobReadError } = await serviceClient
      .from('import_jobs')
      .select('result_summary')
      .eq('id', job.id)
      .eq('company_id', companyId)
      .maybeSingle();
    if (refreshedImportJobReadError) throw refreshedImportJobReadError;
    if (refreshedImportJob) {
      const { error: refreshedImportJobUpdateError } = await serviceClient
        .from('import_jobs')
        .update({
          result_summary: {
            ...metadataRecord(refreshedImportJob.result_summary),
            evidence_status: 'VERIFIED',
            snapshot_id: snapshotId,
            rendered_output: verifiedRenderedOutput,
          },
        })
        .eq('id', job.id)
        .eq('company_id', companyId);
      if (refreshedImportJobUpdateError) throw refreshedImportJobUpdateError;
    }

    const { error: snapshotMetadataUpdateError } = await serviceClient
      .from('source_analysis_snapshots')
      .update({
        metadata: {
          ...metadataRecord(snapshot?.metadata),
          renderedOutput: verifiedRenderedOutput,
          evidenceStatus: 'VERIFIED',
        },
      })
      .eq('id', snapshotId)
      .eq('company_id', companyId);
    if (snapshotMetadataUpdateError) throw snapshotMetadataUpdateError;
  } catch (snapshotError) {
    console.error('[canonical-import-executor] evidence snapshot persistence failed after durable commit', snapshotError);
  }

  return {
    ...execution,
    importId: job.id,
    sourceHash: sourceSha,
    snapshotId,
    authoritativeRowCount: authoritativeRows.length,
    authoritativeQualityScore,
    authoritativeColumns: sourceUnderstanding.columns,
    authoritativePreview: sourceUnderstanding.rows.slice(0, 25),
    sourceSpecialty: sourceUnderstanding.specialty,
    sourceSpecialtyConfidence: sourceUnderstanding.specialtyConfidence,
    authoritativeEntityType,
    datasetCount: sourceUnderstanding.datasetCount,
    datasetSummaries: sourceUnderstanding.datasets,
    sourceWarnings: sourceUnderstanding.warnings,
    evidenceStatus,
    evidenceWarning: evidenceWarning || undefined,
    renderedOutput,
    executionJobId: typeof execution.executionJobId === 'string' ? execution.executionJobId : (typeof execution.jobId === 'string' && execution.jobId !== job.id ? execution.jobId : null),
  };
}