import { supabase, resolveCurrentCompanyId } from '../supabase';

export type ImportEvidenceState = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';

export interface ImportEvidenceRecord {
  companyId: string;
  sourceHash: string;
  sourceName: string;
  extractionMode: 'PDF_TEXT' | 'PDF_OCR' | 'EXCEL' | 'CSV';
  dqsScore: number | null;
  state: ImportEvidenceState;
  evidence: Record<string, unknown>;
}

/**
 * Persists only an audit/evidence event through an existing tenant-aware boundary.
 * It intentionally does not create canonical business facts and never fabricates a result.
 */
export async function recordImportEvidence(record: Omit<ImportEvidenceRecord, 'companyId'>): Promise<string> {
  const companyId = await resolveCurrentCompanyId();
  if (!companyId) throw new Error('TENANT_CONTEXT_REQUIRED');
  if (!/^[a-f0-9]{64}$/i.test(record.sourceHash)) throw new Error('INVALID_SHA256');
  if (record.dqsScore !== null && (record.dqsScore < 0 || record.dqsScore > 100)) {
    throw new Error('INVALID_DQS_SCORE');
  }

  const { data, error } = await supabase.rpc('record_import_evidence', {
    p_source_hash: record.sourceHash,
    p_source_name: record.sourceName,
    p_extraction_mode: record.extractionMode,
    p_dqs_score: record.dqsScore,
    p_state: record.state,
    p_evidence: record.evidence,
  });
  if (error) throw error;
  return data as string;
}
