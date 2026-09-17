import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import { assertCanonicalBoundary, type ReconciledCanonicalImportRow } from './canonical-truth-boundary';
import { commitImportBatch } from './canonical-commit';
import { SupabaseReportExecutionStore } from '@/lib/report-execution/durable-worker-adapter';
import { runDurableProductionLifecycle } from '@/lib/report-execution/durable-production-runner';
import type { ReportExecutionRequest } from '@/lib/report-execution/report-execution-contract';
import type { RowVersion, SourceCandidate } from '@/lib/production-intelligence';
import type { RuntimeEvidence } from '@/lib/phase-kl-runtime';

export type CanonicalEntityType = 'sales_invoices' | 'products' | 'customers';

export interface CanonicalProductionImportInput {
  importJobId: string;
  entityType: CanonicalEntityType;
  companyId: string;
  fileName: string;
  sourceHash: string;
  rows: ReconciledCanonicalImportRow[];
  totalRows?: number;
  invalidRows?: number;
}

function normalizeSourceHash(value: string): string {
  const raw = value.trim().toLowerCase().replace(/^sha256:/, '');
  if (!/^[0-9a-f]{64}$/.test(raw)) throw new Error('IMPORT_SOURCE_HASH_INVALID');
  return `sha256:${raw}`;
}

function rowKey(row: ReconciledCanonicalImportRow): string { return row.provenance.lineageId; }

function rowVersions(rows: ReconciledCanonicalImportRow[], sourceHash: string): RowVersion<Record<string, unknown>>[] {
  return rows.map((row) => ({ key: rowKey(row), hash: `${sourceHash}:${row.rowNumber}`, value: row.data }));
}

function sourceCandidates(rows: ReconciledCanonicalImportRow[]): SourceCandidate<Record<string, unknown>>[] {
  const observedAt = new Date().toISOString();
  return rows.map((row) => ({ businessKey: rowKey(row), sourceId: row.provenance.sourceId, precedence: 0, observedAt, value: row.data }));
}

function evidence(rows: ReconciledCanonicalImportRow[], sourceHash: string): RuntimeEvidence[] {
  const observedAt = new Date().toISOString();
  return [
    { key: `canonical-import:${sourceHash}:source`, source: 'CanonicalImportPage/file-engine', observedAt, quality: 1, details: { rowCount: rows.length, sourceHash } },
    { key: `canonical-import:${sourceHash}:reconciliation`, source: 'canonical-truth-boundary.reconcileForCanonical', observedAt, quality: 1, details: { rowCount: rows.length, reconciled: true } },
  ];
}

export async function runCanonicalProductionImport(input: CanonicalProductionImportInput) {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId || companyId !== input.companyId) throw new Error('TENANT_CONTEXT_MISMATCH');
  if (!input.importJobId.trim()) throw new Error('IMPORT_JOB_ID_REQUIRED');
  if (!input.rows.length) throw new Error('IMPORT_ROWS_REQUIRED');

  const { data: importJob, error: importJobError } = await supabase
    .from('import_jobs')
    .select('total_rows,invalid_rows')
    .eq('id', input.importJobId)
    .eq('company_id', companyId)
    .single();
  if (importJobError) throw importJobError;
  const totalRows = Number(input.totalRows ?? importJob.total_rows ?? 0);
  const persistedInvalidRows = Number(importJob.invalid_rows ?? 0);
  const invalidRows = Number(input.invalidRows ?? (persistedInvalidRows > 0 ? persistedInvalidRows : Math.max(0, totalRows - input.rows.length)));
  if (!Number.isInteger(totalRows) || totalRows < input.rows.length) throw new Error('IMPORT_TOTAL_ROWS_INVALID');
  if (!Number.isInteger(invalidRows) || invalidRows < 0 || input.rows.length + invalidRows !== totalRows) throw new Error('IMPORT_ROW_COUNTER_MISMATCH');

  const sourceHash = normalizeSourceHash(input.sourceHash);
  input.rows.forEach((row) => assertCanonicalBoundary(row, companyId));

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('AUTHENTICATED_USER_REQUIRED');

  const request: ReportExecutionRequest = {
    reportId: `canonical-import:${input.importJobId}`,
    tenantId: companyId,
    requestedBy: userData.user.id,
    parameters: { entityType: input.entityType, importJobId: input.importJobId, sourceFile: input.fileName },
    formats: ['web'],
    idempotencyKey: `canonical-import:${input.entityType}:${sourceHash}`,
  };

  const { data: enqueueData, error: enqueueError } = await supabase.rpc('enqueue_report_execution_job', {
    p_company_id: companyId,
    p_job_key: request.idempotencyKey,
    p_source_path: input.fileName,
    p_source_hash: sourceHash,
    p_evidence_keys: evidence(input.rows, sourceHash).map((item) => item.key),
    p_max_attempts: 3,
  });
  if (enqueueError) throw enqueueError;
  const jobId = String((enqueueData as { id?: unknown } | null)?.id ?? '');
  if (!jobId) throw new Error('REPORT_EXECUTION_JOB_ID_MISSING');

  const currentRows = rowVersions(input.rows, sourceHash);
  const runtimeEvidence = evidence(input.rows, sourceHash);
  const candidates = sourceCandidates(input.rows);
  const store = new SupabaseReportExecutionStore(supabase);

  try {
    const lifecycle = await runDurableProductionLifecycle({
      jobId,
      request,
      workerId: `canonical-import:${userData.user.id}`,
      sourceHash,
      rows: input.rows.map((row) => row.data),
      lifecycle: {
        previousRows: [],
        currentRows,
        sourceCandidates: candidates,
        scenarioOptions: [],
        riskBudget: { maxRisk: 0, protectedLiquidity: 0, minimumServiceLevel: 0 },
        portfolioCandidates: [],
        autonomy: { trustHealthy: false, evidenceQuality: 1, confidence: 0, riskBudgetValid: true, criticalDrift: false, rollbackVerified: false, isolationVerified: true },
        evidence: runtimeEvidence,
      },
      executeStage: async (stage, stageInput) => {
        if (stage === 'fingerprinted' && stageInput.rows.length === 0) throw new Error('IMPORT_ROWS_REQUIRED');
        if (stage === 'extracted' && stageInput.rows.length === 0) throw new Error('IMPORT_EXTRACTION_EMPTY');
        if (stage === 'canonicalized' || stage === 'validated') input.rows.forEach((row) => assertCanonicalBoundary(row, companyId));
        if (stage === 'committed') {
          const result = await commitImportBatch(input.entityType, input.rows, sourceHash);
          if (result.committed !== input.rows.length || result.ids.length !== input.rows.length) throw new Error('IMPORT_COMMIT_RESULT_MISMATCH');
          const { error } = await supabase.rpc('import_update_job_progress', {
            p_job_id: input.importJobId,
            p_processed_rows: totalRows,
            p_valid_rows: input.rows.length,
            p_invalid_rows: invalidRows,
            p_duplicate_rows: 0,
            p_status: 'processing',
          });
          if (error) {
            // Progress is telemetry only after the canonical transaction succeeds.
            // Terminal completion below is authoritative and rehydrates counters atomically.
          }
        }
      },
    }, store);

    const { error: finishError } = await supabase.rpc('import_finish_job', {
      p_job_id: input.importJobId,
      p_status: 'completed',
      p_result_summary: {
        sourceHash,
        durableExecutionJobId: jobId,
        committed: input.rows.length,
        invalidRows,
        lifecycleCompleted: true,
      },
      p_error_message: null,
    });
    if (finishError) throw finishError;

    return { jobId, sourceHash, committed: input.rows.length, lifecycle };
  } catch (error) {
    try {
      await supabase.rpc('import_finish_job', {
        p_job_id: input.importJobId,
        p_status: 'failed',
        p_result_summary: { sourceHash, durableExecutionJobId: jobId },
        p_error_message: error instanceof Error ? error.message : String(error),
      });
    } catch {
      // Preserve the primary lifecycle failure; finalization is best effort only.
    }
    throw error;
  }
}
