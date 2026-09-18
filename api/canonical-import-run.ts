import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { commitImportBatchWithClient } from '../src/lib/import/canonical-commit-core';
import type { ImportEvidenceProvenance, ReconciledCanonicalImportRow } from '../src/lib/import/canonical-truth-boundary';
import { runDurableProductionLifecycle } from '../src/lib/report-execution/durable-production-runner';
import type { ReportExecutionStage } from '../src/lib/report-execution/checkpoint';
import { json, requireConfig, requireMethod, supabaseUserRequest } from '../src/server/resilience-runtime.mjs';

const MAX_BODY_BYTES = 16 * 1024;
const ROW_PAGE_SIZE = 500;
const ENTITY_TYPES = new Set(['products', 'customers', 'sales_invoices']);

function bearerToken(req: any): string | null {
  const value = req.headers?.authorization;
  if (typeof value !== 'string' || !value.startsWith('Bearer ')) return null;
  const token = value.slice(7).trim();
  return token || null;
}

async function readJson(req: any): Promise<Record<string, unknown>> {
  let size = 0;
  const chunks: any[] = [];
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > MAX_BODY_BYTES) throw new Error('request_body_too_large');
    chunks.push(chunk);
  }
  if (!size) throw new Error('request_body_required');
  const value = JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('request_body_invalid');
  return value as Record<string, unknown>;
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field}_invalid`);
  return value.trim();
}

function requiredEntityType(value: unknown): 'products' | 'customers' | 'sales_invoices' {
  const entityType = requiredText(value, 'entity_type');
  if (!ENTITY_TYPES.has(entityType)) throw new Error('entity_type_invalid');
  return entityType as 'products' | 'customers' | 'sales_invoices';
}

function requiredQuality(value: unknown): number {
  const quality = Number(value);
  if (!Number.isFinite(quality) || quality < 0 || quality > 100) throw new Error('quality_invalid');
  return quality;
}

async function resolveAuthenticatedUser(token: string): Promise<{ id: string } | null> {
  const response = await supabaseUserRequest('/auth/v1/user', token, { method: 'GET' });
  if (!response.ok) return null;
  const user = await response.json();
  return user && typeof user.id === 'string' ? { id: user.id } : null;
}

async function resolveCurrentCompany(token: string): Promise<string | null> {
  const response = await supabaseUserRequest('/rest/v1/rpc/current_company_id', token, {
    method: 'POST',
    body: '{}',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) return null;
  const value = await response.json();
  return typeof value === 'string' && value ? value : null;
}

function serviceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error('missing_supabase_server_configuration');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function loadImportJob(client: SupabaseClient, importId: string, companyId: string) {
  const { data, error } = await client
    .from('import_jobs')
    .select('id,company_id,status,total_rows,processed_rows,valid_rows,invalid_rows,job_type')
    .eq('id', importId)
    .eq('company_id', companyId)
    .single();
  if (error) throw error;
  return data;
}

async function loadStagedRows(client: SupabaseClient, importId: string, companyId: string, entityType: string): Promise<ReconciledCanonicalImportRow[]> {
  const rows: ReconciledCanonicalImportRow[] = [];
  for (let offset = 0; ; offset += ROW_PAGE_SIZE) {
    const { data, error } = await client
      .from('import_job_rows')
      .select('row_number,status,mapped_data,lineage,target_table')
      .eq('job_id', importId)
      .eq('company_id', companyId)
      .order('row_number', { ascending: true })
      .range(offset, offset + ROW_PAGE_SIZE - 1);
    if (error) throw error;
    const page = data ?? [];
    for (const row of page) {
      if (row.status !== 'valid') throw new Error(`STAGED_IMPORT_ROW_NOT_VALID:${row.row_number}`);
      if (row.target_table !== entityType) throw new Error(`STAGED_IMPORT_ENTITY_MISMATCH:${row.row_number}`);
      if (!row.mapped_data || typeof row.mapped_data !== 'object' || Array.isArray(row.mapped_data)) {
        throw new Error(`STAGED_IMPORT_DATA_INVALID:${row.row_number}`);
      }
      const provenance = row.lineage as Partial<ImportEvidenceProvenance> | null;
      if (!provenance || typeof provenance !== 'object') throw new Error(`STAGED_IMPORT_PROVENANCE_MISSING:${row.row_number}`);
      const required = ['tenantId', 'sourceId', 'sourceHash', 'sourceDocumentId', 'evidenceId', 'lineageId'] as const;
      for (const key of required) {
        if (typeof provenance[key] !== 'string' || !provenance[key]?.trim()) {
          throw new Error(`STAGED_IMPORT_PROVENANCE_INVALID:${row.row_number}:${key}`);
        }
      }
      if (provenance.tenantId !== companyId || provenance.sourceDocumentId !== importId) {
        throw new Error(`STAGED_IMPORT_PROVENANCE_BOUNDARY:${row.row_number}`);
      }
      rows.push({
        rowNumber: Number(row.row_number),
        data: row.mapped_data as Record<string, unknown>,
        provenance: provenance as ImportEvidenceProvenance,
        reconciliation: 'RECONCILED',
      });
    }
    if (page.length < ROW_PAGE_SIZE) break;
  }
  return rows;
}

async function finishImport(token: string, importId: string, status: 'completed' | 'failed', summary: Record<string, unknown>, errorMessage?: string) {
  const response = await supabaseUserRequest('/rest/v1/rpc/import_finish_job', token, {
    method: 'POST',
    body: JSON.stringify({
      p_job_id: importId,
      p_status: status,
      p_result_summary: summary,
      ...(errorMessage ? { p_error_message: errorMessage } : {}),
    }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`IMPORT_FINISH_FAILED:${detail.slice(0, 512)}`);
  }
}

async function enqueueOrLoad(client: SupabaseClient, companyId: string, jobKey: string, fileName: string, sourceHash: string) {
  const { data, error } = await client.rpc('enqueue_report_execution_job', {
    p_company_id: companyId,
    p_job_key: jobKey,
    p_source_path: fileName,
    p_source_hash: sourceHash,
    p_evidence_keys: [`import:${jobKey}`, `source:${sourceHash}`],
    p_max_attempts: 3,
  });
  if (error) throw error;
  if (!data || typeof data !== 'object') throw new Error('REPORT_EXECUTION_JOB_ENQUEUE_EMPTY');
  return data as {
    id: string;
    company_id: string;
    status: string;
    attempt?: number;
    max_attempts?: number;
    checkpoint?: Record<string, unknown>;
    lease_token?: string | null;
  };
}

async function retryIfNeeded(client: SupabaseClient, jobId: string, companyId: string, status: string): Promise<string> {
  if (status !== 'failed') return status;
  const { data, error } = await client.rpc('retry_report_execution_job', { p_job_id: jobId, p_company_id: companyId });
  if (error) throw error;
  if (data !== true) throw new Error('REPORT_EXECUTION_RETRY_REJECTED');
  return 'queued';
}

export default async function handler(req: any, res: any) {
  if (!requireMethod(req, res, 'POST')) return;
  if (!requireConfig(res, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_ANON_KEY'])) return;

  const token = bearerToken(req);
  if (!token) return json(res, 401, { status: 'failed', error: 'authenticated_user_token_required' });

  let importId = '';
  try {
    const user = await resolveAuthenticatedUser(token);
    if (!user) return json(res, 401, { status: 'failed', error: 'invalid_or_expired_user_token' });
    const companyId = await resolveCurrentCompany(token);
    if (!companyId) return json(res, 403, { status: 'failed', error: 'authenticated_tenant_context_missing' });

    const body = await readJson(req);
    importId = requiredText(body.importId, 'import_id');
    const fileName = requiredText(body.fileName, 'file_name');
    const sourceHash = requiredText(body.sourceHash, 'source_hash');
    if (!/^sha256:[0-9a-fA-F]{64}$/.test(sourceHash)) throw new Error('source_hash_invalid');
    const entityType = requiredEntityType(body.entityType);
    const qualityScore = requiredQuality(body.qualityScore);
    const client = serviceClient();

    const importJob = await loadImportJob(client, importId, companyId);
    if (importJob.status !== 'processing' && importJob.status !== 'queued') {
      throw new Error(`IMPORT_JOB_NOT_EXECUTABLE:${importJob.status}`);
    }

    const rows = await loadStagedRows(client, importId, companyId, entityType);
    if (!rows.length) throw new Error('CANONICAL_IMPORT_REQUIRES_STAGED_ROWS');
    if (Number(importJob.valid_rows ?? 0) !== rows.length) throw new Error('STAGED_ROW_COUNT_MISMATCH');
    for (const row of rows) {
      if (row.provenance.sourceHash !== sourceHash) throw new Error(`CANONICAL_SOURCE_HASH_MISMATCH:${row.rowNumber}`);
    }

    const requestedBy = user.id;
    const jobKey = `canonical-import:${entityType}:${sourceHash}`;
    let job = await enqueueOrLoad(client, companyId, jobKey, fileName, sourceHash);
    if (job.company_id !== companyId) throw new Error('REPORT_EXECUTION_JOB_TENANT_MISMATCH');
    job.status = await retryIfNeeded(client, job.id, companyId, job.status);

    if (job.status === 'completed') {
      const summary = {
        total_rows: Number(importJob.total_rows ?? rows.length),
        committed: rows.length,
        invalidRows: Number(importJob.invalid_rows ?? 0),
        jobId: job.id,
        sourceHash,
        requestedBy,
        qualityScore,
      };
      try {
        await finishImport(token, importId, 'completed', summary);
      } catch (finishError) {
        return json(res, 502, { status: 'failed', error: finishError instanceof Error ? finishError.message : String(finishError), jobId: job.id });
      }
      return json(res, 200, { status: 'completed', ...summary });
    }

    if (job.status === 'dead_letter') throw new Error('REPORT_EXECUTION_JOB_DEAD_LETTER');
    if (!['queued', 'leased', 'processing'].includes(job.status)) throw new Error(`REPORT_EXECUTION_JOB_NOT_EXECUTABLE:${job.status}`);

    const quality = qualityScore / 100;
    const currentRows = rows.map((row) => ({
      key: entityType === 'products' ? `products:${String(row.data.sku).trim().toLowerCase()}` : entityType === 'sales_invoices' ? `sales_invoices:${String(row.data.invoice_number).trim().toLowerCase()}` : `customers:${String(row.data.code ?? row.data.name).trim().toLowerCase()}`,
      hash: `${sourceHash}:${row.rowNumber}`,
      value: row.data,
    }));
    const observedAt = new Date().toISOString();
    const sourceCandidates = currentRows.map((row) => ({
      businessKey: row.key,
      sourceId: sourceHash,
      precedence: 0,
      observedAt,
      value: row.value,
    }));

    const result = await runDurableProductionLifecycle({
      jobId: job.id,
      workerId: `canonical-import-server:${crypto.randomUUID()}`,
      sourceHash,
      rows: rows.map((row) => row.data),
      request: {
        reportId: jobKey,
        tenantId: companyId,
        requestedBy,
        parameters: { entityType, importId, rowCount: rows.length },
        formats: ['web'],
        idempotencyKey: jobKey,
        sourceSnapshotId: importId,
      },
      lifecycle: {
        previousRows: [],
        currentRows,
        sourceCandidates,
        scenarioOptions: [{ key: jobKey, expectedImpact: rows.length, risk: 1, liquidityRequired: 0, serviceLevel: 1 }],
        riskBudget: { maxRisk: 1, protectedLiquidity: rows.length, minimumServiceLevel: 0 },
        portfolioCandidates: [{ key: jobKey, materiality: 0.5, confidence: quality, urgency: 0.5, risk: 1 }],
        autonomy: { trustHealthy: false, evidenceQuality: quality, confidence: quality, riskBudgetValid: true, criticalDrift: false, rollbackVerified: false, isolationVerified: false },
        evidence: rows.map((row) => ({
          key: row.provenance.evidenceId,
          source: row.provenance.sourceId,
          observedAt,
          quality,
          details: row.provenance,
        })),
      },
      executeStage: async (stage: ReportExecutionStage) => {
        if (stage === 'fingerprinted' && sourceHash.length !== 71) throw new Error('IMPORT_SOURCE_HASH_INVALID');
        if (stage === 'extracted' && rows.length === 0) throw new Error('IMPORT_EXTRACTION_EMPTY');
        if (stage === 'canonicalized' && rows.some((row) => !row.data || typeof row.data !== 'object')) throw new Error('IMPORT_CANONICALIZATION_INVALID_ROW');
        if (stage === 'validated' && rows.some((row) => row.rowNumber < 1)) throw new Error('IMPORT_VALIDATION_INVALID_ROW_NUMBER');
        if (stage === 'analyzed' && !currentRows.length) throw new Error('IMPORT_ANALYSIS_EMPTY');
        if (stage === 'decisioned' && !rows.length) throw new Error('IMPORT_DECISION_EMPTY');
        if (stage === 'committed') {
          await commitImportBatchWithClient(client, companyId, entityType, rows, sourceHash);
        }
      },
    }, new (await import('../src/lib/report-execution/durable-worker-adapter')).SupabaseReportExecutionStore(client));

    const summary = {
      total_rows: Number(importJob.total_rows ?? rows.length),
      committed: rows.length,
      invalidRows: Number(importJob.invalid_rows ?? 0),
      jobId: job.id,
      sourceHash,
      requestedBy,
      qualityScore,
      idempotentReplay: result.lineage.length === 0,
    };

    try {
      await finishImport(token, importId, 'completed', summary);
    } catch (finishError) {
      return json(res, 502, { status: 'failed', error: finishError instanceof Error ? finishError.message : String(finishError), jobId: job.id });
    }

    return json(res, 200, { status: 'completed', ...summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (importId) {
      try { await finishImport(token, importId, 'failed', {}, message); } catch { /* preserve primary error */ }
    }
    const status = /_invalid$|^request_|^invalid_json$/.test(message) ? 400 : /AUTHENTICATED_USER_REQUIRED|TENANT_CONTEXT/.test(message) ? 403 : 502;
    return json(res, status, { status: 'failed', error: message });
  }
}
