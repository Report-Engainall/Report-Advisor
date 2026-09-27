import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { securityScan } from '../../src/lib/file-engine/security.ts';
import { detectFormat } from '../../src/lib/file-engine/detector.ts';
import { parseFile } from '../../src/lib/file-engine/adapters.ts';
import { reconcileForCanonical } from '../../src/lib/import/canonical-truth-boundary.ts';
import { runCanonicalImportThroughDurableRunner } from '../../src/lib/import/canonical-production-adapter.ts';
import { understandCanonicalSource } from '../../src/lib/import/canonical-source-understanding.ts';

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function env(name: string): string {
  const value = Netlify.env.get(name);
  if (!value) throw new Error(`NETLIFY_ENV_MISSING:${name}`);
  return value;
}

function bearer(request: Request): string {
  const value = request.headers.get('authorization') ?? '';
  if (!/^Bearer\s+\S+$/i.test(value)) throw new Error('AUTHENTICATED_USER_REQUIRED');
  return value;
}

export default async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return json(405, { error: 'METHOD_NOT_ALLOWED' });

  try {
    const authorization = bearer(request);
    const supabaseUrl = env('VITE_SUPABASE_URL');
    const anonKey = env('VITE_SUPABASE_ANON_KEY');
    const serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY');

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } },
    });
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user?.id) throw new Error('AUTHENTICATED_USER_REQUIRED');

    const { data: companyId, error: companyError } = await userClient.rpc('current_company_id');
    if (companyError || !companyId) throw new Error('TENANT_CONTEXT_REQUIRED');

    const payload = await request.json() as {
      importId?: string;
      fileName?: string;
      sourceHash?: string;
      entityType?: 'products' | 'customers' | 'sales_invoices' | `generic:${string}`;
      rows?: unknown[];
      qualityScore?: number;
      qualityApproved?: boolean;
      mode?: 'execute' | 'finalize-source';
    };

    const mode = payload.mode ?? 'execute';
    const genericEntity = typeof payload.entityType === 'string' && /^generic:[a-z][a-z0-9_-]{0,63}$/.test(payload.entityType);
    if (payload.entityType !== 'products' && payload.entityType !== 'customers' && payload.entityType !== 'sales_invoices' && !genericEntity) throw new Error('CANONICAL_IMPORT_ENTITY_TYPE_INVALID');
    if (!payload.importId || !payload.entityType || (mode === 'execute' && (!Array.isArray(payload.rows) || !Number.isFinite(payload.qualityScore) || typeof payload.qualityApproved !== 'boolean'))) {
      throw new Error('CANONICAL_IMPORT_REQUEST_INVALID');
    }

    const { data: job, error: jobError } = await serviceClient
      .from('import_jobs')
      .select('id, company_id, file_record_id, job_type, result_summary')
      .eq('id', payload.importId)
      .eq('company_id', companyId)
      .maybeSingle();
    if (jobError) throw jobError;
    if (!job?.file_record_id) throw new Error('IMPORT_JOB_SOURCE_RECORD_NOT_FOUND_OR_FORBIDDEN');
    if (job.job_type && job.job_type !== payload.entityType) throw new Error('IMPORT_JOB_ENTITY_TYPE_MISMATCH');

    const { data: fileRecord, error: fileError } = await serviceClient
      .from('file_records')
      .select('id, company_id, file_name, file_mime, file_size, file_hash, security_status, status, metadata')
      .eq('id', job.file_record_id)
      .eq('company_id', companyId)
      .maybeSingle();
    if (fileError) throw fileError;
    if (!fileRecord) throw new Error('IMPORT_JOB_SOURCE_RECORD_NOT_FOUND_OR_FORBIDDEN');

    const metadata = (fileRecord.metadata && typeof fileRecord.metadata === 'object') ? fileRecord.metadata as Record<string, unknown> : {};
    const storageBucket = String(metadata.storage_bucket ?? 'documents');
    const storagePath = String(metadata.storage_path ?? '');
    if (storageBucket !== 'documents' || !storagePath) throw new Error('AUTHORITATIVE_SOURCE_STORAGE_BINDING_INVALID');
    if (!storagePath.startsWith(`${companyId}/imports/`)) throw new Error('AUTHORITATIVE_SOURCE_STORAGE_TENANT_MISMATCH');

    const { data: sourceBlob, error: downloadError } = await serviceClient.storage
      .from(storageBucket)
      .download(storagePath);
    if (downloadError || !sourceBlob) throw new Error(`AUTHORITATIVE_SOURCE_DOWNLOAD_FAILED:${downloadError?.message ?? 'EMPTY_SOURCE'}`);

    const bytes = new Uint8Array(await sourceBlob.arrayBuffer());
    const sourceSha = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;

    if (payload.sourceHash && payload.sourceHash !== sourceSha) {
      throw new Error('AUTHORITATIVE_SOURCE_HASH_MISMATCH');
    }

    const sourceFile = new File([bytes], fileRecord.file_name || payload.fileName || 'import', {
      type: fileRecord.file_mime || sourceBlob.type || 'application/octet-stream',
      lastModified: Date.now(),
    });
    const security = securityScan(sourceFile, bytes.buffer);
    if (!security.passed) throw new Error(`AUTHORITATIVE_SOURCE_SECURITY_REJECTED:${security.issues.join(' | ')}`);

    const detection = detectFormat(sourceFile, bytes.buffer);
    if (detection.format === 'unknown') throw new Error('AUTHORITATIVE_SOURCE_FORMAT_UNKNOWN');

    if (mode === 'finalize-source') {
      return json(200, { importId: job.id, sourceHash: sourceSha });
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

    const { error: fileUpdateError } = await serviceClient
      .from('file_records')
      .update({
        file_hash: sourceSha,
        file_size: bytes.byteLength,
        file_mime: fileRecord.file_mime || sourceBlob.type || detection.mime,
        security_status: 'passed',
        status: 'ready',
        metadata: verifiedMetadata,
      })
      .eq('id', fileRecord.id)
      .eq('company_id', companyId);
    if (fileUpdateError) throw fileUpdateError;

    const { error: jobUpdateError } = await serviceClient
      .from('import_jobs')
      .update({
        source_fingerprint: sourceSha,
        result_summary: {
          ...(job.result_summary && typeof job.result_summary === 'object' ? job.result_summary : {}),
          source_verified: true,
          source_hash: sourceSha,
          source_storage_bucket: storageBucket,
          source_storage_path: storagePath,
          server_verified_at: verifiedMetadata.server_verified_at,
        },
      })
      .eq('id', job.id)
      .eq('company_id', companyId);
    if (jobUpdateError) throw jobUpdateError;

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
      execution = {
        importId: job.id,
        sourceHash: sourceSha,
        jobId: null,
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
          rows: reconciled.rows,
          qualityScore: authoritativeQualityScore,
          qualityApproved: payload.qualityApproved === true,
        },
        {
          serverExecution: true,
          workerClient: serviceClient,
          dataClient: userClient,
          companyId: String(companyId),
          requestedBy: userData.user.id,
        },
      );
    }

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
          entity_type: 'source-data',
          quality_score: authoritativeQualityScore,
          row_count: authoritativeRows.length,
          column_count: sourceUnderstanding.columnCount,
          datasets: sourceUnderstanding.datasets.map((dataset) => ({
            ...dataset,
            sourceHash: sourceSha,
          })),
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
          },
        })
        .select('id')
        .single();
      if (snapshotError) throw snapshotError;
      snapshotId = snapshot?.id ?? null;
      if (!snapshotId) throw new Error('SOURCE_EVIDENCE_SNAPSHOT_ID_MISSING');
      evidenceStatus = 'VERIFIED';
      evidenceWarning = '';
    } catch (snapshotError) {
      console.error('[canonical-import-execute] evidence snapshot persistence failed after durable commit', snapshotError);
    }

    return json(200, {
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
      datasetCount: sourceUnderstanding.datasetCount,
      datasetSummaries: sourceUnderstanding.datasets,
      sourceWarnings: sourceUnderstanding.warnings,
      evidenceStatus,
      evidenceWarning: evidenceWarning || undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED';
    const status = message.startsWith('NETLIFY_ENV_MISSING') ? 503 : 400;
    return json(status, { error: 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED', detail: message.slice(0, 512) });
  }
};

export const config = {
  path: '/api/canonical-import-execute',
};
