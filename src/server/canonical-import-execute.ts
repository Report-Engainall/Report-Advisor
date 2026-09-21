import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { securityScan } from '../lib/file-engine/security.ts';
import { detectFormat } from '../lib/file-engine/detector.ts';
import { parseFile } from '../lib/file-engine/adapters.ts';
import { reconcileForCanonical, type CanonicalImportEntityType } from '../lib/import/canonical-truth-boundary.ts';
import { runCanonicalImportThroughDurableRunner } from '../lib/import/canonical-production-adapter.ts';

type CanonicalImportBody = {
  importId?: string;
  fileName?: string;
  sourceHash?: string;
  entityType?: CanonicalImportEntityType;
  qualityApproved?: boolean;
  mode?: 'execute' | 'finalize-source';
};

export interface CanonicalImportServerConfig {
  supabaseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
}

export interface CanonicalImportServerResponse {
  status: number;
  body: Record<string, unknown>;
}

type HttpError = Error & { httpStatus: number };

function httpError(status: number, code: string): HttpError {
  const error = new Error(code) as HttpError;
  error.httpStatus = status;
  return error;
}

function validateEntityType(value: unknown): CanonicalImportEntityType {
  const genericEntity = typeof value === 'string' && /^generic:[a-z][a-z0-9_-]{0,63}$/.test(value);
  if (value === 'products' || value === 'customers' || value === 'sales_invoices' || genericEntity) {
    return value as CanonicalImportEntityType;
  }
  throw httpError(400, 'CANONICAL_IMPORT_ENTITY_TYPE_INVALID');
}

function validateBody(value: unknown): Required<Pick<CanonicalImportBody, 'importId' | 'entityType'>> & CanonicalImportBody {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw httpError(400, 'CANONICAL_IMPORT_REQUEST_INVALID');
  }
  const body = value as CanonicalImportBody;
  if (typeof body.importId !== 'string' || !body.importId.trim()) {
    throw httpError(400, 'CANONICAL_IMPORT_REQUEST_INVALID');
  }
  const entityType = validateEntityType(body.entityType);
  const mode = body.mode ?? 'execute';
  if (mode !== 'execute' && mode !== 'finalize-source') {
    throw httpError(400, 'CANONICAL_IMPORT_MODE_INVALID');
  }
  if (mode === 'execute' && typeof body.qualityApproved !== 'boolean') {
    throw httpError(400, 'CANONICAL_IMPORT_QUALITY_APPROVAL_REQUIRED');
  }
  return { ...body, importId: body.importId.trim(), entityType, mode };
}

function bearerToken(authorization: string | null | undefined): string {
  if (typeof authorization !== 'string' || !/^Bearer\s+\S+$/i.test(authorization)) {
    throw httpError(401, 'AUTHENTICATED_USER_REQUIRED');
  }
  return authorization;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED';
  return message.slice(0, 512);
}

function responseFromError(error: unknown): CanonicalImportServerResponse {
  const message = sanitizeError(error);
  const explicit = typeof error === 'object' && error !== null && 'httpStatus' in error
    ? Number((error as HttpError).httpStatus)
    : 0;
  const status = explicit >= 400 && explicit < 600
    ? explicit
    : /^(CANONICAL_IMPORT_|AUTHORITATIVE_SOURCE_|IMPORT_|AUTHENTICATED_|TENANT_CONTEXT_REQUIRED|REPORT_EXECUTION_JOB_TENANT_MISMATCH)/.test(message)
      ? 400
      : 502;
  return {
    status,
    body: {
      status: 'failed',
      error: 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED',
      detail: message,
    },
  };
}

export async function executeCanonicalImportServer(
  authorization: string | null | undefined,
  bodyValue: unknown,
  rawConfig: CanonicalImportServerConfig,
): Promise<CanonicalImportServerResponse> {
  try {
    const supabaseUrl = rawConfig.supabaseUrl.trim();
    const anonKey = rawConfig.anonKey.trim();
    const serviceRoleKey = rawConfig.serviceRoleKey.trim();
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw httpError(503, 'CANONICAL_IMPORT_SERVER_CONFIGURATION_MISSING');
    }

    const authorizationHeader = bearerToken(authorization);
    const body = validateBody(bodyValue);
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: authorizationHeader } },
    });
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user?.id) throw httpError(401, 'AUTHENTICATED_USER_REQUIRED');

    const { data: companyId, error: companyError } = await userClient.rpc('current_company_id');
    if (companyError || !companyId) throw httpError(403, 'TENANT_CONTEXT_REQUIRED');

    const { data: job, error: jobError } = await serviceClient
      .from('import_jobs')
      .select('id, company_id, file_record_id, job_type, status, result_summary')
      .eq('id', body.importId)
      .eq('company_id', companyId)
      .maybeSingle();
    if (jobError) throw jobError;
    if (!job?.file_record_id) throw httpError(404, 'IMPORT_JOB_SOURCE_RECORD_NOT_FOUND_OR_FORBIDDEN');
    if (job.job_type && job.job_type !== body.entityType) throw httpError(409, 'IMPORT_JOB_ENTITY_TYPE_MISMATCH');
    if (['completed', 'partial', 'failed', 'cancelled'].includes(String(job.status))) {
      throw httpError(409, 'IMPORT_JOB_ALREADY_TERMINAL');
    }

    const { data: fileRecord, error: fileError } = await serviceClient
      .from('file_records')
      .select('id, company_id, file_name, file_mime, file_size, file_hash, security_status, status, metadata')
      .eq('id', job.file_record_id)
      .eq('company_id', companyId)
      .maybeSingle();
    if (fileError) throw fileError;
    if (!fileRecord) throw httpError(404, 'IMPORT_JOB_SOURCE_RECORD_NOT_FOUND_OR_FORBIDDEN');
    if (body.fileName && body.fileName !== fileRecord.file_name) {
      throw httpError(409, 'IMPORT_JOB_SOURCE_IDENTITY_MISMATCH');
    }

    const metadata = asRecord(fileRecord.metadata);
    const storageBucket = String(metadata.storage_bucket ?? 'documents');
    const storagePath = String(metadata.storage_path ?? '');
    if (storageBucket !== 'documents' || !storagePath) throw new Error('AUTHORITATIVE_SOURCE_STORAGE_BINDING_INVALID');
    if (!storagePath.startsWith(`${companyId}/imports/`)) throw new Error('AUTHORITATIVE_SOURCE_STORAGE_TENANT_MISMATCH');

    const { data: sourceBlob, error: downloadError } = await serviceClient.storage
      .from(storageBucket)
      .download(storagePath);
    if (downloadError || !sourceBlob) {
      throw new Error(`AUTHORITATIVE_SOURCE_DOWNLOAD_FAILED:${downloadError?.message ?? 'EMPTY_SOURCE'}`);
    }

    const bytes = new Uint8Array(await sourceBlob.arrayBuffer());
    const sourceSha = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
    if (body.sourceHash && body.sourceHash !== sourceSha) throw new Error('AUTHORITATIVE_SOURCE_HASH_MISMATCH');

    const fileName = fileRecord.file_name || body.fileName || 'import';
    const sourceFile = new File([bytes], fileName, {
      type: fileRecord.file_mime || sourceBlob.type || 'application/octet-stream',
      lastModified: Date.now(),
    });
    const security = securityScan(sourceFile, bytes.buffer);
    if (!security.passed) throw new Error(`AUTHORITATIVE_SOURCE_SECURITY_REJECTED:${security.issues.join(' | ')}`);

    const detection = detectFormat(sourceFile, bytes.buffer);
    if (detection.format === 'unknown') throw new Error('AUTHORITATIVE_SOURCE_FORMAT_UNKNOWN');

    if (body.mode === 'finalize-source') {
      return { status: 200, body: { importId: job.id, sourceHash: sourceSha } };
    }

    const authoritativeDatasets = await parseFile(bytes.buffer, fileName, detection.format);
    const authoritativeDataset = authoritativeDatasets[0];
    if (!authoritativeDataset || authoritativeDataset.rowCount === 0) {
      throw new Error('AUTHORITATIVE_SOURCE_PARSE_EMPTY');
    }

    const authoritativeQualityScore = Math.max(0, Math.min(100, Math.round(authoritativeDataset.qualityScore)));
    if (authoritativeQualityScore < 50) throw new Error(`CANONICAL_IMPORT_QUALITY_REJECTED:${authoritativeQualityScore}`);
    if (authoritativeQualityScore < 75 && body.qualityApproved !== true) {
      throw new Error(`CANONICAL_IMPORT_REVIEW_APPROVAL_REQUIRED:${authoritativeQualityScore}`);
    }

    const authoritativeRows = authoritativeDataset.rows.map((data, index) => ({ rowNumber: index + 1, data }));
    const reconciled = reconcileForCanonical(
      body.entityType,
      String(companyId),
      fileName,
      sourceSha,
      job.id,
      (_data, rowNumber) => `${sourceSha}:${rowNumber}`,
      authoritativeRows,
    );
    if (reconciled.rejected.length > 0) {
      throw new Error(`CANONICAL_RECONCILIATION_REJECTED:${reconciled.rejected.map(item => `${item.rowNumber}:${item.reason}`).join(',')}`);
    }
    if (reconciled.rows.length !== authoritativeRows.length) {
      throw new Error('AUTHORITATIVE_SOURCE_RECONCILIATION_COUNT_MISMATCH');
    }

    const verifiedAt = new Date().toISOString();
    const verifiedMetadata = {
      ...metadata,
      storage_bucket: storageBucket,
      storage_path: storagePath,
      raw_bytes_sha256: sourceSha,
      detected_format: detection.format,
      server_verified_at: verifiedAt,
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

    const existingSummary = asRecord(job.result_summary);
    const { error: jobUpdateError } = await serviceClient
      .from('import_jobs')
      .update({
        source_fingerprint: sourceSha,
        result_summary: {
          ...existingSummary,
          source_verified: true,
          source_hash: sourceSha,
          source_storage_bucket: storageBucket,
          source_storage_path: storagePath,
          server_verified_at: verifiedAt,
        },
      })
      .eq('id', job.id)
      .eq('company_id', companyId);
    if (jobUpdateError) throw jobUpdateError;

    const execution = await runCanonicalImportThroughDurableRunner(
      {
        importId: job.id,
        fileName,
        sourceHash: sourceSha,
        entityType: body.entityType,
        rows: reconciled.rows,
        qualityScore: authoritativeQualityScore,
        qualityApproved: body.qualityApproved === true,
      },
      {
        serverExecution: true,
        workerClient: serviceClient,
        dataClient: userClient,
        companyId: String(companyId),
        requestedBy: userData.user.id,
      },
    );

    let snapshotId: string | null = null;
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
          column_count: Array.isArray(authoritativeDataset.columns) ? authoritativeDataset.columns.length : 0,
          datasets: [{
            name: fileName,
            rowCount: authoritativeRows.length,
            columnCount: Array.isArray(authoritativeDataset.columns) ? authoritativeDataset.columns.length : 0,
            columns: authoritativeDataset.columns,
            preview: authoritativeDataset.preview.slice(0, 25),
          }],
          canonical_text: [
            `source=${fileName}`,
            `server_authoritative_quality=${authoritativeQualityScore}%`,
            `source_sha=${sourceSha}`,
          ].join(' | '),
          visual_assets: [],
          warnings: [],
          metadata: {
            fileName,
            sourceFormat: detection.format,
            serverAuthoritativeSource: true,
            serverAuthoritativeQualityScore: authoritativeQualityScore,
            committed: authoritativeRows.length,
            jobId: execution.jobId,
            sourceStoragePath: storagePath,
          },
        })
        .select('id')
        .single();
      if (!snapshotError) snapshotId = snapshot?.id ?? null;
    } catch (snapshotError) {
      console.error('[canonical-import-execute] non-fatal snapshot persistence failure', snapshotError);
    }

    return {
      status: 200,
      body: {
        ...execution,
        importId: job.id,
        sourceHash: sourceSha,
        snapshotId,
        authoritativeRowCount: authoritativeRows.length,
        authoritativeQualityScore,
        authoritativeColumns: authoritativeDataset.columns,
        authoritativePreview: authoritativeDataset.preview.slice(0, 25),
      },
    };
  } catch (error) {
    return responseFromError(error);
  }
}
