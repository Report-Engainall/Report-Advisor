import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { securityScan } from '../../src/lib/file-engine/security.ts';
import { detectFormat } from '../../src/lib/file-engine/detector.ts';
import { parseFile } from '../../src/lib/file-engine/adapters.ts';
import { reconcileForCanonical } from '../../src/lib/import/canonical-truth-boundary.ts';

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

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } },
    });
    let activeImportId: string | null = null;
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
    activeImportId = typeof payload.importId === 'string' ? payload.importId : null;

    const mode = payload.mode ?? 'execute';
    const genericEntity = typeof payload.entityType === 'string' && /^generic:[a-z][a-z0-9_-]{0,63}$/.test(payload.entityType);
    if (payload.entityType !== 'products' && payload.entityType !== 'customers' && payload.entityType !== 'sales_invoices' && !genericEntity) throw new Error('CANONICAL_IMPORT_ENTITY_TYPE_INVALID');
    if (!payload.importId || !payload.entityType || (mode === 'execute' && (!Array.isArray(payload.rows) || !Number.isFinite(payload.qualityScore) || typeof payload.qualityApproved !== 'boolean'))) {
      throw new Error('CANONICAL_IMPORT_REQUEST_INVALID');
    }

    const { data: job, error: jobError } = await userClient
      .from('import_jobs')
      .select('id, company_id, file_record_id, job_type, result_summary')
      .eq('id', payload.importId)
      .eq('company_id', companyId)
      .maybeSingle();
    if (jobError) throw jobError;
    if (!job?.file_record_id) throw new Error('IMPORT_JOB_SOURCE_RECORD_NOT_FOUND_OR_FORBIDDEN');
    if (job.job_type && job.job_type !== payload.entityType) throw new Error('IMPORT_JOB_ENTITY_TYPE_MISMATCH');

    const { data: fileRecord, error: fileError } = await userClient
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

    const { data: sourceBlob, error: downloadError } = await userClient.storage
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
    const authoritativeDataset = authoritativeDatasets[0];
    if (!authoritativeDataset || authoritativeDataset.rowCount === 0) throw new Error('AUTHORITATIVE_SOURCE_PARSE_EMPTY');

    const authoritativeQualityScore = Math.max(0, Math.min(100, Math.round(authoritativeDataset.qualityScore)));
    if (authoritativeQualityScore < 50) throw new Error(`CANONICAL_IMPORT_QUALITY_REJECTED:${authoritativeQualityScore}`);
    if (authoritativeQualityScore < 75 && payload.qualityApproved !== true) {
      throw new Error(`CANONICAL_IMPORT_REVIEW_APPROVAL_REQUIRED:${authoritativeQualityScore}`);
    }

    const authoritativeRows = authoritativeDataset.rows.map((data, index) => ({ rowNumber: index + 1, data }));
    const reconciled = reconcileForCanonical(
      payload.entityType,
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

    const workerResponse = await fetch(`${supabaseUrl}/functions/v1/canonical-import-worker`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        importId: job.id,
        fileName: fileRecord.file_name || payload.fileName || 'import',
        sourceHash: sourceSha,
        entityType: payload.entityType,
        rows: reconciled.rows,
        qualityScore: authoritativeQualityScore,
        qualityApproved: payload.qualityApproved === true,
        sourceStorageBucket: storageBucket,
        sourceStoragePath: storagePath,
        sourceFormat: detection.format,
        authoritativeColumns: authoritativeDataset.columns,
        authoritativePreview: authoritativeDataset.preview.slice(0, 25),
      }),
    });
    const workerBody = await workerResponse.json().catch(() => ({}));
    if (!workerResponse.ok) {
      const detail = typeof workerBody?.detail === 'string' ? workerBody.detail : `HTTP_${workerResponse.status}`;
      throw new Error(`CANONICAL_IMPORT_WORKER_FAILED:${detail}`);
    }
    const { error: finishError } = await userClient.rpc('import_finish_job', {
      p_job_id: job.id,
      p_status: 'completed',
      p_result_summary: {
        ...workerBody,
        file_name: fileRecord.file_name || payload.fileName || 'import',
        source_hash: sourceSha,
        canonical_entity_type: payload.entityType,
        specialty:
          workerBody?.specialty ??
          (typeof payload.entityType === 'string' && payload.entityType.startsWith('generic:')
            ? payload.entityType.slice('generic:'.length)
            : payload.entityType === 'sales_invoices'
              ? 'sales'
              : payload.entityType),
        committed: authoritativeRows.length,
        invalidRows: 0,
        authoritativeRowCount: authoritativeRows.length,
        authoritativeQualityScore,
        executionJobId: workerBody?.jobId ?? null,
      },
      p_error_message: null,
    });
    if (finishError) throw finishError;

    return json(200, {
      ...workerBody,
      importId: job.id,
      sourceHash: sourceSha,
      authoritativeRowCount: authoritativeRows.length,
      authoritativeQualityScore,
      authoritativeColumns: authoritativeDataset.columns,
      authoritativePreview: authoritativeDataset.preview.slice(0, 25),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED';
    if (activeImportId) {
      try {
        await userClient.rpc('import_finish_job', {
          p_job_id: activeImportId,
          p_status: 'failed',
          p_result_summary: { source_hash: null, terminalized_by: 'canonical-import-execute' },
          p_error_message: message.slice(0, 512),
        });
      } catch {
        // Preserve the original failure; terminalization is best-effort when the job identity is known.
      }
    }
    const status = message.startsWith('NETLIFY_ENV_MISSING') ? 503 : 400;
    return json(status, { error: 'CANONICAL_IMPORT_SERVER_EXECUTION_FAILED', detail: message.slice(0, 512) });
  }
};

export const config = {
  path: '/api/canonical-import-execute',
};
