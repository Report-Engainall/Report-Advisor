import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import { SupabaseReportExecutionStore } from '@/lib/report-execution/durable-worker-adapter';
import type { ReportExecutionStage } from '@/lib/report-execution/checkpoint';
import { commitImportBatch, type CanonicalImportRow } from './canonical-commit';
import { runDurableProductionLifecycle } from '@/lib/report-execution/durable-production-runner';
import { registerFileRecord, updateFileRecordStatus } from '@/lib/file-engine/security';

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
  return `${entityType}:${key.toLowerCase()}`;
}

function assertUniqueBusinessKeys(entityType: DurableCanonicalImportInput['entityType'], rows: CanonicalImportRow[]): void {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = rowKey(entityType, row);
    if (seen.has(key)) throw new Error(`IMPORT_DUPLICATE_BUSINESS_KEY:${key}`);
    seen.add(key);
  }
}

function durableJobKey(entityType: DurableCanonicalImportInput['entityType'], sourceHash: string): string {
  return `canonical-import:${entityType}:${sourceHash}`;
}

export async function runCanonicalImportThroughDurableRunner(input: DurableCanonicalImportInput) {
  if (!input.rows.length) throw new Error('CANONICAL_IMPORT_REQUIRES_ROWS');
  if (!input.sourceHash.trim()) throw new Error('CANONICAL_IMPORT_REQUIRES_SOURCE_HASH');
  if (!input.sourceHash.startsWith('sha256:')) throw new Error('IMPORT_SOURCE_HASH_NOT_SHA256');
  if (!Number.isFinite(input.qualityScore) || input.qualityScore < 0 || input.qualityScore > 100) throw new Error('CANONICAL_IMPORT_INVALID_QUALITY');
  if (input.qualityScore < 50) throw new Error('IMPORT_QUALITY_REJECTED_BELOW_50');
  if (input.qualityScore < 75 && input.qualityApproved !== true) throw new Error('IMPORT_QUALITY_APPROVAL_REQUIRED_50_74');

  assertUniqueBusinessKeys(input.entityType, input.rows);

  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const requestedBy = userData.user?.id;
  if (!requestedBy) throw new Error('AUTHENTICATED_USER_REQUIRED');

  const fileRecord = await registerFileRecord({ fileName: input.fileName, fileSize: 0, fileHash: input.sourceHash, detectedFormat: 'canonical-import' });
  const workerId = `canonical-import-ui:${crypto.randomUUID()}`;
  const now = Date.now();
  const observedAt = new Date(now).toISOString();
  const quality = input.qualityScore / 100;
  const evidenceKeys = [`source:${input.sourceHash}`, `import:${input.importId}`, `entity:${input.entityType}`, `rows:${input.rows.length}`];

  try {
    const store = new SupabaseReportExecutionStore(supabase);
    const job = await store.enqueue(companyId, durableJobKey(input.entityType, input.sourceHash), input.fileName, input.sourceHash, evidenceKeys, 3);

    if (job.status === 'completed') throw new Error('IMPORT_ALREADY_COMMITTED_FOR_SOURCE');
    if (job.status === 'dead_letter') throw new Error('IMPORT_DURABLE_JOB_DEAD_LETTER');
    if (job.status === 'failed') await store.retry(job.id);

    const currentRows = input.rows.map((row) => ({ key: rowKey(input.entityType, row), hash: `${input.sourceHash}:${row.rowNumber}`, value: row.data }));
    const sourceCandidates = currentRows.map((row) => ({ businessKey: row.key, sourceId: input.sourceHash, precedence: 0, observedAt, value: row.value }));

    const lifecycle = {
      previousRows: [], currentRows, sourceCandidates,
      scenarioOptions: [{ key: durableJobKey(input.entityType, input.sourceHash), expectedImpact: input.rows.length, risk: 1, liquidityRequired: 0, serviceLevel: 1 }],
      riskBudget: { maxRisk: 1, protectedLiquidity: input.rows.length, minimumServiceLevel: 0 },
      portfolioCandidates: [{ key: durableJobKey(input.entityType, input.sourceHash), materiality: 0.5, confidence: quality, urgency: 0.5, risk: 1 }],
      autonomy: { trustHealthy: false, evidenceQuality: quality, confidence: quality, riskBudgetValid: true, criticalDrift: false, rollbackVerified: false, isolationVerified: false },
      evidence: currentRows.map((row) => ({ key: row.key, source: 'canonical-import-source', sourceHash: input.sourceHash, observedAt, quality, value: row.value })),
    };

    const result = await runDurableProductionLifecycle({
      jobId: job.id, workerId, sourceHash: input.sourceHash,
      rows: input.rows.map((row) => row.data),
      request: { reportId: durableJobKey(input.entityType, input.sourceHash), tenantId: companyId, requestedBy, parameters: { entityType: input.entityType, importId: input.importId, rowCount: input.rows.length }, formats: ['web'], idempotencyKey: durableJobKey(input.entityType, input.sourceHash) },
      lifecycle,
      executeStage: async (stage: ReportExecutionStage) => {
        if (stage === 'fingerprinted' && !input.sourceHash.startsWith('sha256:')) throw new Error('IMPORT_SOURCE_HASH_NOT_SHA256');
        if (stage === 'extracted' && input.rows.length === 0) throw new Error('IMPORT_EXTRACTION_EMPTY');
        if (stage === 'canonicalized' && input.rows.some((row) => !row.data || typeof row.data !== 'object')) throw new Error('IMPORT_CANONICALIZATION_INVALID_ROW');
        if (stage === 'validated' && input.rows.some((row) => row.rowNumber < 1)) throw new Error('IMPORT_VALIDATION_INVALID_ROW_NUMBER');
        if (stage === 'analyzed' && !input.rows.length) throw new Error('IMPORT_ANALYSIS_EMPTY');
        if (stage === 'decisioned' && !input.rows.length) throw new Error('IMPORT_DECISION_EMPTY');
        if (stage === 'committed') await commitImportBatch(input.entityType, input.rows, input.sourceHash);
        if (stage === 'rendered') return;
      },
    }, store);

    await updateFileRecordStatus(fileRecord.id, 'completed');
    return result;
  } catch (error) {
    try { await updateFileRecordStatus(fileRecord.id, 'failed'); } catch { /* preserve original failure */ }
    throw error;
  }
}
