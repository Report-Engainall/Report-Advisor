import { supabase, resolveCurrentCompanyId } from '@/lib/supabase';
import type { ReconciledCanonicalImportRow } from '@/lib/import/canonical-truth-boundary';

export interface DurableCanonicalImportInput {
  importId: string;
  fileName: string;
  sourceHash: string;
  entityType: 'products' | 'customers' | 'sales_invoices';
  rows: ReconciledCanonicalImportRow[];
  qualityScore: number;
}

const STAGE_CHUNK_SIZE = 100;

async function stageRows(input: DurableCanonicalImportInput, companyId: string): Promise<void> {
  const { error: deleteError } = await supabase
    .from('import_job_rows')
    .delete()
    .eq('job_id', input.importId)
    .eq('company_id', companyId);
  if (deleteError) throw deleteError;

  for (let offset = 0; offset < input.rows.length; offset += STAGE_CHUNK_SIZE) {
    const page = input.rows.slice(offset, offset + STAGE_CHUNK_SIZE).map((row) => ({
      company_id: companyId,
      job_id: input.importId,
      row_number: row.rowNumber,
      status: 'valid',
      source_data: row.data,
      mapped_data: row.data,
      target_table: input.entityType,
      lineage: row.provenance,
    }));
    const { error } = await supabase.from('import_job_rows').insert(page);
    if (error) throw error;
  }
}

export async function finishCanonicalImportFailure(importId: string, message: string): Promise<void> {
  const { error } = await supabase.rpc('import_finish_job', {
    p_job_id: importId,
    p_status: 'failed',
    p_result_summary: {},
    p_error_message: message,
  });
  if (error) throw error;
}

async function runServerBoundary(input: DurableCanonicalImportInput): Promise<Record<string, unknown>> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.access_token) throw new Error('AUTHENTICATED_USER_REQUIRED');
  const response = await fetch('/api/canonical-import-run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
    body: JSON.stringify({
      importId: input.importId,
      fileName: input.fileName,
      sourceHash: input.sourceHash,
      entityType: input.entityType,
      qualityScore: input.qualityScore,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof payload?.error === 'string' ? payload.error : `CANONICAL_IMPORT_SERVER_FAILED:${response.status}`);
  if (!payload || payload.status !== 'completed' || typeof payload.jobId !== 'string') throw new Error('CANONICAL_IMPORT_SERVER_INCOMPLETE');
  return payload as Record<string, unknown>;
}

export async function runCanonicalImportThroughDurableRunner(input: DurableCanonicalImportInput) {
  if (!input.rows.length) throw new Error('CANONICAL_IMPORT_REQUIRES_ROWS');
  if (!input.importId.trim()) throw new Error('CANONICAL_IMPORT_REQUIRES_IMPORT_ID');
  if (!input.fileName.trim()) throw new Error('CANONICAL_IMPORT_REQUIRES_SOURCE_PATH');
  if (!Number.isFinite(input.qualityScore) || input.qualityScore < 0 || input.qualityScore > 100) throw new Error('CANONICAL_IMPORT_INVALID_QUALITY');

  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  if (!/^sha256:[0-9a-fA-F]{64}$/.test(input.sourceHash)) throw new Error('IMPORT_SOURCE_HASH_INVALID');
  for (const row of input.rows) {
    if (row.provenance.tenantId !== companyId) throw new Error(`CANONICAL_TENANT_MISMATCH:${row.rowNumber}`);
    if (row.provenance.sourceHash !== input.sourceHash) throw new Error(`CANONICAL_SOURCE_HASH_MISMATCH:${row.rowNumber}`);
  }
  try {
    await stageRows(input, companyId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      await finishCanonicalImportFailure(input.importId, message);
    } catch {
      // Preserve the primary staging failure; server-side lifecycle remains fail-closed.
    }
    throw error;
  }
  try {
    const serverResult = await runServerBoundary(input);

    return {
      jobId: String(serverResult.jobId),
      importId: input.importId,
      ...serverResult,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      await finishCanonicalImportFailure(input.importId, message);
    } catch {
      // Preserve the primary server-boundary failure; terminal ownership stays canonical.
    }
    throw error;
  }
}
