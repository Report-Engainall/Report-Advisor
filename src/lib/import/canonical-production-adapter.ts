import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import type { ReportExecutionStage } from '@/lib/report-execution/checkpoint';
import { SupabaseReportExecutionStore } from '@/lib/report-execution/durable-worker-adapter';
import { runDurableProductionLifecycle } from '@/lib/report-execution/durable-production-runner';
import type { ReconciledCanonicalImportRow } from '@/lib/import/canonical-truth-boundary';
import { commitImportBatch } from '@/lib/import/canonical-commit';

export interface DurableCanonicalImportInput {
  importId: string;
  fileName: string;
  sourceHash: string;
  entityType: 'products' | 'customers' | 'sales_invoices';
  rows: ReconciledCanonicalImportRow[];
  qualityScore: number;
}

export interface CanonicalImportExecutionOptions {
  serverExecution?: boolean;
  workerClient?: SupabaseClient;
  dataClient?: SupabaseClient;
  companyId?: string;
  requestedBy?: string;
}

interface EnqueuedJob {
  id: string;
  company_id: string;
  status: string;
  checkpoint: unknown;
  attempt: number;
  max_attempts: number;
}

function rowKey(entityType: DurableCanonicalImportInput['entityType'], row: ReconciledCanonicalImportRow): string {
  const value = entityType === 'products'
    ? row.data.sku
    : entityType === 'sales_invoices'
      ? row.data.invoice_number
      : (row.data.code ?? row.data.name);
  const key = String(value ?? '').trim();
  if (!key) throw new Error(`IMPORT_ROW_BUSINESS_KEY_REQUIRED:${row.rowNumber}`);
  return `${entityType}:${key.toLowerCase()}`;
}

function assertUniqueBusinessKeys(entityType: DurableCanonicalImportInput['entityType'], rows: ReconciledCanonicalImportRow[]): void {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = rowKey(entityType, row);
    if (seen.has(key)) throw new Error(`IMPORT_DUPLICATE_BUSINESS_KEY:${key}`);
    seen.add(key);
  }
}

function assertSourceHash(rows: ReconciledCanonicalImportRow[], sourceHash: string): void {
  if (!/^sha256:[0-9a-fA-F]{64}$/.test(sourceHash)) throw new Error('IMPORT_SOURCE_HASH_INVALID');
  for (const row of rows) {
    if (row.provenance.sourceHash !== sourceHash) throw new Error(`CANONICAL_SOURCE_HASH_MISMATCH:${row.rowNumber}`);
  }
}

async function executeThroughServerBoundary(input: DurableCanonicalImportInput): Promise<unknown> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (sessionError || !accessToken) throw new Error('AUTHENTICATED_USER_REQUIRED');

  const response = await fetch('/api/canonical-import-execute', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const text = await response.text();
  let payload: any = null;
  try { payload = text ? JSON.parse(text) : null; } catch { /* preserve sanitized transport error below */ }

  if (!response.ok) {
    const detail = typeof payload?.detail === 'string' ? payload.detail : typeof payload?.error === 'string' ? payload.error : `HTTP_${response.status}`;
    throw new Error(`CANONICAL_IMPORT_SERVER_EXECUTION_FAILED:${detail.slice(0, 512)}`);
  }
  if (!payload?.jobId || !payload?.importId) throw new Error('CANONICAL_IMPORT_SERVER_EXECUTION_RESPONSE_INVALID');
  return payload;
}

export async function runCanonicalImportThroughDurableRunner(
  input: DurableCanonicalImportInput,
  options: CanonicalImportExecutionOptions = {},
) {
  if (!input.rows.length) throw new Error('CANONICAL_IMPORT_REQUIRES_ROWS');
  if (!input.importId.trim()) throw new Error('CANONICAL_IMPORT_REQUIRES_IMPORT_ID');
  if (!input.fileName.trim()) throw new Error('CANONICAL_IMPORT_REQUIRES_SOURCE_PATH');
  if (!Number.isFinite(input.qualityScore) || input.qualityScore < 0 || input.qualityScore > 100) throw new Error('CANONICAL_IMPORT_INVALID_QUALITY');

  if (typeof window !== 'undefined' && !options.serverExecution) {
    return executeThroughServerBoundary(input);
  }

  const workerClient = options.workerClient ?? supabase;
  const dataClient = options.dataClient ?? supabase;
  const companyId = options.companyId ?? await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');

  assertSourceHash(input.rows, input.sourceHash);
  assertUniqueBusinessKeys(input.entityType, input.rows);

  let requestedBy = options.requestedBy;
  if (!requestedBy) {
    const { data: userData, error: userError } = await dataClient.auth.getUser();
    if (userError) throw userError;
    requestedBy = userData.user?.id;
  }
  if (!requestedBy) throw new Error('AUTHENTICATED_USER_REQUIRED');

  const jobKey = `canonical-import:${input.entityType}:${input.sourceHash}`;
  const { data: enqueueData, error: enqueueError } = await workerClient.rpc('enqueue_report_execution_job', {
    p_company_id: companyId,
    p_job_key: jobKey,
    p_source_path: input.fileName,
    p_source_hash: input.sourceHash,
    p_evidence_keys: [
      `source:${input.sourceHash}`,
      `import:${input.importId}`,
      `entity:${input.entityType}`,
      `rows:${input.rows.length}`,
    ],
    p_max_attempts: 3,
  });
  if (enqueueError) throw enqueueError;
  if (!enqueueData || typeof enqueueData !== 'object') throw new Error('REPORT_EXECUTION_JOB_ENQUEUE_EMPTY');

  const job = enqueueData as EnqueuedJob;
  if (!job.id || job.company_id !== companyId) throw new Error('REPORT_EXECUTION_JOB_TENANT_MISMATCH');
  if (job.status === 'succeeded' || job.status === 'completed') throw new Error('IMPORT_ALREADY_COMPLETED_FOR_SOURCE');
  if (job.status === 'cancelled' || job.status === 'dead_letter') throw new Error('IMPORT_DURABLE_JOB_NOT_RETRYABLE');
  if (job.status === 'running' || job.status === 'leased' || job.status === 'processing') throw new Error('IMPORT_DURABLE_JOB_ALREADY_RUNNING');
  const store = new SupabaseReportExecutionStore(workerClient);
  if (job.status === 'failed') await store.retry(job.id, companyId);

  const observedAt = new Date().toISOString();
  const quality = input.qualityScore / 100;
  const currentRows = input.rows.map((row) => ({
    key: rowKey(input.entityType, row),
    hash: `${input.sourceHash}:${row.rowNumber}`,
    value: row.data,
  }));
  const sourceCandidates = currentRows.map((row) => ({
    businessKey: row.key,
    sourceId: input.sourceHash,
    precedence: 0,
    observedAt,
    value: row.value,
  }));

  const result = await runDurableProductionLifecycle({
    jobId: job.id,
    workerId: `canonical-import-server:${crypto.randomUUID()}`,
    sourceHash: input.sourceHash,
    rows: input.rows.map((row) => row.data),
    request: {
      reportId: jobKey,
      tenantId: companyId,
      requestedBy,
      parameters: { entityType: input.entityType, importId: input.importId, rowCount: input.rows.length },
      formats: ['web'],
      idempotencyKey: jobKey,
    },
    lifecycle: {
      previousRows: [],
      currentRows,
      sourceCandidates,
      scenarioOptions: [{ key: jobKey, expectedImpact: input.rows.length, risk: 1, liquidityRequired: 0, serviceLevel: 1 }],
      riskBudget: { maxRisk: 1, protectedLiquidity: input.rows.length, minimumServiceLevel: 0 },
      portfolioCandidates: [{ key: jobKey, materiality: 0.5, confidence: quality, urgency: 0.5, risk: 1 }],
      autonomy: { trustHealthy: false, evidenceQuality: quality, confidence: quality, riskBudgetValid: true, criticalDrift: false, rollbackVerified: false, isolationVerified: false },
      evidence: input.rows.map((row) => ({
        key: row.provenance.evidenceId,
        source: row.provenance.sourceId,
        observedAt,
        quality,
        details: {
          tenantId: row.provenance.tenantId,
          sourceHash: row.provenance.sourceHash,
          sourceDocumentId: row.provenance.sourceDocumentId,
          lineageId: row.provenance.lineageId,
          rowNumber: row.rowNumber,
        },
      })),
    },
    executeStage: async (stage: ReportExecutionStage) => {
      if (stage === 'fingerprinted' && input.sourceHash.length !== 71) throw new Error('IMPORT_SOURCE_HASH_INVALID');
      if (stage === 'extracted' && input.rows.length === 0) throw new Error('IMPORT_EXTRACTION_EMPTY');
      if (stage === 'canonicalized') {
        for (const row of input.rows) if (!row.data || typeof row.data !== 'object') throw new Error(`IMPORT_CANONICALIZATION_INVALID_ROW:${row.rowNumber}`);
      }
      if (stage === 'validated') {
        for (const row of input.rows) if (row.rowNumber < 1) throw new Error(`IMPORT_VALIDATION_INVALID_ROW_NUMBER:${row.rowNumber}`);
      }
      if (stage === 'analyzed' && !currentRows.length) throw new Error('IMPORT_ANALYSIS_EMPTY');
      if (stage === 'decisioned' && !input.rows.length) throw new Error('IMPORT_DECISION_EMPTY');
      if (stage === 'committed') {
        await commitImportBatch(input.entityType, input.rows, input.sourceHash, { client: dataClient, companyId });
      }
    },
  }, store);

  return { ...result, jobId: job.id, importId: input.importId };
}
