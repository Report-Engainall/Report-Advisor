import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import { commitImportBatch, type CanonicalImportRow } from './canonical-commit';
import { SupabaseReportExecutionStore } from '@/lib/report-execution/durable-worker-adapter';
import { runDurableProductionLifecycle } from '@/lib/report-execution/durable-production-runner';
import type { ReportExecutionStage } from '@/lib/report-execution/checkpoint';

export interface DurableCanonicalImportInput {
  importId: string;
  fileName: string;
  sourceHash: string;
  entityType: 'products' | 'customers' | 'sales_invoices';
  rows: CanonicalImportRow[];
}

function rowKey(entityType: DurableCanonicalImportInput['entityType'], row: CanonicalImportRow): string {
  const value = row.data[entityType === 'products' ? 'sku' : entityType === 'sales_invoices' ? 'invoice_number' : 'name'];
  const key = String(value ?? '').trim();
  if (!key) throw new Error(`IMPORT_ROW_BUSINESS_KEY_REQUIRED:${row.rowNumber}`);
  return `${entityType}:${key}`;
}

/**
 * Adapter only: the durable runner remains the execution engine and the canonical
 * commit RPC remains the sole write boundary. This adapter owns UI-job creation and
 * maps already-observed import facts onto the existing lifecycle.
 */
export async function runCanonicalImportThroughDurableRunner(input: DurableCanonicalImportInput) {
  if (!input.rows.length) throw new Error('CANONICAL_IMPORT_REQUIRES_ROWS');
  if (!input.sourceHash.trim()) throw new Error('CANONICAL_IMPORT_REQUIRES_SOURCE_HASH');

  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const requestedBy = userData.user?.id;
  if (!requestedBy) throw new Error('AUTHENTICATED_USER_REQUIRED');

  const jobId = crypto.randomUUID();
  const workerId = `canonical-import-ui:${jobId}`;
  const now = Date.now();
  const evidenceKeys = [
    `import:${input.importId}`,
    `source:${input.sourceHash}`,
    `rows:${input.rows.length}`,
  ];

  const { error: createError } = await supabase.from('report_execution_jobs').insert({
    id: jobId,
    company_id: companyId,
    job_key: `canonical-import:${input.importId}`,
    source_path: input.fileName,
    source_hash: input.sourceHash,
    status: 'queued',
    checkpoint: { stage: 'queued', sourceHash: input.sourceHash, evidenceKeys, updatedAt: now },
    attempt: 0,
    max_attempts: 3,
  });
  if (createError) throw createError;

  const currentRows = input.rows.map((row) => ({
    key: rowKey(input.entityType, row),
    hash: `${input.sourceHash}:${row.rowNumber}`,
    value: row.data,
  }));
  const observedAt = new Date(now).toISOString();
  const sourceCandidates = currentRows.map((row) => ({
    businessKey: row.key,
    sourceId: input.sourceHash,
    precedence: 0,
    observedAt,
    value: row.value,
  }));

  const lifecycle = {
    previousRows: [],
    currentRows,
    sourceCandidates,
    scenarioOptions: [{ key: `canonical-import:${input.importId}`, expectedImpact: input.rows.length, risk: 0, liquidityRequired: 0, serviceLevel: 1 }],
    riskBudget: { maxRisk: 1, protectedLiquidity: input.rows.length, minimumServiceLevel: 0 },
    portfolioCandidates: [{ key: `canonical-import:${input.importId}`, materiality: 0.5, confidence: 1, urgency: 0.5, risk: 0 }],
    autonomy: {
      trustHealthy: true,
      evidenceQuality: 1,
      confidence: 1,
      riskBudgetValid: true,
      criticalDrift: false,
      rollbackVerified: true,
      // Browser tenant isolation remains a separate E2E gate; do not claim it here.
      isolationVerified: false,
    },
    evidence: [
      { key: `import:${input.importId}`, source: 'canonical-import-ui', observedAt, quality: 1 },
      { key: `source:${input.sourceHash}`, source: 'canonical-import-ui', observedAt, quality: 1 },
      { key: `rows:${input.rows.length}`, source: 'canonical-import-ui', observedAt, quality: 1 },
    ],
  };

  const store = new SupabaseReportExecutionStore(supabase);
  return runDurableProductionLifecycle({
    jobId,
    workerId,
    sourceHash: input.sourceHash,
    rows: input.rows.map((row) => row.data),
    request: {
      reportId: `canonical-import:${input.importId}`,
      tenantId: companyId,
      requestedBy,
      parameters: { entityType: input.entityType, importId: input.importId, rowCount: input.rows.length },
      formats: ['web'],
      idempotencyKey: `canonical-import:${input.importId}:${input.sourceHash}`,
    },
    lifecycle,
    executeStage: async (stage: ReportExecutionStage) => {
      if (stage === 'fingerprinted' && !input.sourceHash.startsWith('sha256:')) throw new Error('IMPORT_SOURCE_HASH_NOT_SHA256');
      if (stage === 'extracted' && input.rows.length === 0) throw new Error('IMPORT_EXTRACTION_EMPTY');
      if (stage === 'canonicalized' && input.rows.some((row) => !row.data || typeof row.data !== 'object')) throw new Error('IMPORT_CANONICALIZATION_INVALID_ROW');
      if (stage === 'validated' && input.rows.some((row) => row.rowNumber < 1)) throw new Error('IMPORT_VALIDATION_INVALID_ROW_NUMBER');
      if (stage === 'analyzed' && !input.rows.length) throw new Error('IMPORT_ANALYSIS_EMPTY');
      if (stage === 'decisioned' && !input.rows.length) throw new Error('IMPORT_DECISION_EMPTY');
      if (stage === 'committed') {
        // The existing canonical RPC is the only mutation. The durable checkpoint
        // advances only after this call returns successfully.
        await commitImportBatch(input.entityType, input.rows);
      }
      if (stage === 'rendered') return;
    },
  }, store);
}
