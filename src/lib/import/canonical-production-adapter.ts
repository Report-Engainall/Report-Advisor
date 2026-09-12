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
  qualityScore: number;
  qualityApproved?: boolean;
}

function rowKey(entityType: DurableCanonicalImportInput['entityType'], row: CanonicalImportRow): string {
  const value = row.data[entityType === 'products' ? 'sku' : entityType === 'sales_invoices' ? 'invoice_number' : 'name'];
  const key = String(value ?? '').trim();
  if (!key) throw new Error(`IMPORT_ROW_BUSINESS_KEY_REQUIRED:${row.rowNumber}`);
  return `${entityType}:${key}`;
}

export async function runCanonicalImportThroughDurableRunner(input: DurableCanonicalImportInput) {
  if (!input.rows.length) throw new Error('CANONICAL_IMPORT_REQUIRES_ROWS');
  if (!input.sourceHash.trim()) throw new Error('CANONICAL_IMPORT_REQUIRES_SOURCE_HASH');
  if (!Number.isFinite(input.qualityScore) || input.qualityScore < 0 || input.qualityScore > 100) throw new Error('CANONICAL_IMPORT_INVALID_QUALITY');
  if (input.qualityScore < 50) throw new Error('IMPORT_QUALITY_REJECTED_BELOW_50');
  if (input.qualityScore < 75 && input.qualityApproved !== true) throw new Error('IMPORT_QUALITY_APPROVAL_REQUIRED_50_74');

  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const requestedBy = userData.user?.id;
  if (!requestedBy) throw new Error('AUTHENTICATED_USER_REQUIRED');

  const jobId = crypto.randomUUID();
  const workerId = `canonical-import-ui:${jobId}`;
  const now = Date.now();
  const evidenceKeys = [`import:${input.importId}`, `source:${input.sourceHash}`, `rows:${input.rows.length}`, `quality:${input.qualityScore}`];

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

  const quality = input.qualityScore / 100;
  const lifecycle = {
    previousRows: [],
    currentRows,
    sourceCandidates,
    scenarioOptions: [{ key: `canonical-import:${input.importId}`, expectedImpact: input.rows.length, risk: 1, liquidityRequired: 0, serviceLevel: 1 }],
    riskBudget: { maxRisk: 1, protectedLiquidity: input.rows.length, minimumServiceLevel: 0 },
    portfolioCandidates: [{ key: `canonical-import:${input.importId}`, materiality: 0.5, confidence: quality, urgency: 0.5, risk: 1 }],
    autonomy: {
      trustHealthy: false,
      evidenceQuality: quality,
      confidence: quality,
      riskBudgetValid: true,
      criticalDrift: false,
      rollbackVerified: false,
      isolationVerified: false,
    },
    evidence: [
      { key: `import:${input.importId}`, source: 'canonical-import-ui', observedAt, quality },
      { key: `source:${input.sourceHash}`, source: 'canonical-import-ui', observedAt, quality },
      { key: `rows:${input.rows.length}`, source: 'canonical-import-ui', observedAt, quality },
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
      if (stage === 'committed') await commitImportBatch(input.entityType, input.rows);
      if (stage === 'rendered') return;
    },
  }, store);
}
