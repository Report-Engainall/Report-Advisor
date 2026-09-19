import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { runCanonicalImportThroughDurableRunner, type DurableCanonicalImportInput } from '../src/lib/import/canonical-production-adapter';
import { assertCanonicalImportProvenance, type ImportEvidenceProvenance, type ReconciledCanonicalImportRow } from '../src/lib/import/canonical-truth-boundary';
import { json, requireConfig, requireMethod, supabaseUserRequest } from '../src/server/resilience-runtime.mjs';

const MAX_REQUEST_BYTES = Number(process.env.CANONICAL_IMPORT_MAX_REQUEST_BYTES ?? 25 * 1024 * 1024);

function assertRequestSize(req: any): void {
  const raw = req.headers?.['content-length'] ?? req.headers?.['Content-Length'];
  if (raw != null) {
    const size = Number(raw);
    if (Number.isFinite(size) && size > MAX_REQUEST_BYTES) throw new Error('request_too_large');
  }
}

function bearerToken(req: any): string | null {
  const value = req.headers?.authorization;
  if (typeof value !== 'string' || !value.startsWith('Bearer ')) return null;
  const token = value.slice(7).trim();
  return token || null;
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

async function parseBody(req: any): Promise<unknown> {
  assertRequestSize(req);
  if (req.body && typeof req.body === 'object') {
    const serialized = JSON.stringify(req.body);
    if (Buffer.byteLength(serialized, 'utf8') > MAX_REQUEST_BYTES) throw new Error('request_too_large');
    return req.body;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    if (Buffer.byteLength(req.body, 'utf8') > MAX_REQUEST_BYTES) throw new Error('request_too_large');
    return JSON.parse(req.body);
  }
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;
    if (totalBytes > MAX_REQUEST_BYTES) throw new Error('request_too_large');
    chunks.push(buffer);
  }
  if (!chunks.length) throw new Error('request_body_required');
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

interface UntrustedCanonicalImportRow {
  rowNumber: number;
  data: Record<string, unknown>;
  provenance?: Partial<ImportEvidenceProvenance>;
  reconciliation?: string;
}

interface UntrustedCanonicalImportRequest {
  entityType: 'products' | 'customers' | 'sales_invoices';
  importId: string;
  fileName?: string;
  sourceHash?: string;
  rows: UntrustedCanonicalImportRow[];
  qualityScore: number;
}

function validateInput(value: unknown): UntrustedCanonicalImportRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid_json');
  const body = value as Record<string, unknown>;
  for (const field of ['tenantId', 'companyId', 'sourceId', 'sourceDocumentId', 'fileRecordId', 'lineageId', 'evidenceId']) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      throw new Error(`CLIENT_PROVENANCE_FORBIDDEN:${field}`);
    }
  }
  const entityType = body.entityType;
  if (entityType !== 'products' && entityType !== 'customers' && entityType !== 'sales_invoices') throw new Error('entity_type_invalid');
  if (typeof body.importId !== 'string' || !body.importId.trim()) throw new Error('import_id_invalid');
  if (body.fileName !== undefined && (typeof body.fileName !== 'string' || body.fileName.length > 512)) throw new Error('file_name_invalid');
  if (body.sourceHash !== undefined && (typeof body.sourceHash !== 'string' || !/^sha256:[0-9a-fA-F]{64}$/.test(body.sourceHash))) throw new Error('source_hash_invalid');
  if (!Array.isArray(body.rows) || body.rows.length < 1 || body.rows.length > 500000) throw new Error('rows_invalid');
  if (typeof body.qualityScore !== 'number' || !Number.isFinite(body.qualityScore) || body.qualityScore < 0 || body.qualityScore > 100) throw new Error('quality_score_invalid');

  const rows = body.rows.map((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`row_invalid:${index + 1}`);
    const candidate = row as Record<string, unknown>;
    if (!Number.isInteger(candidate.rowNumber) || Number(candidate.rowNumber) < 1) throw new Error(`row_number_invalid:${index + 1}`);
    if (!candidate.data || typeof candidate.data !== 'object' || Array.isArray(candidate.data)) throw new Error(`row_data_invalid:${candidate.rowNumber}`);
    if (candidate.reconciliation !== undefined && candidate.reconciliation !== 'RECONCILED') throw new Error(`row_reconciliation_not_reconciled:${candidate.rowNumber}`);
    if (candidate.provenance !== undefined && (!candidate.provenance || typeof candidate.provenance !== 'object' || Array.isArray(candidate.provenance))) {
      throw new Error(`row_provenance_invalid:${candidate.rowNumber}`);
    }
    return {
      rowNumber: Number(candidate.rowNumber),
      data: candidate.data as Record<string, unknown>,
      provenance: candidate.provenance as Partial<ImportEvidenceProvenance> | undefined,
      reconciliation: candidate.reconciliation as string | undefined,
    };
  });

  const seenRows = new Set<number>();
  for (const row of rows) {
    if (seenRows.has(row.rowNumber)) throw new Error(`duplicate_row_number:${row.rowNumber}`);
    seenRows.add(row.rowNumber);
  }

  return {
    entityType: entityType as UntrustedCanonicalImportRequest['entityType'],
    importId: body.importId as string,
    fileName: body.fileName as string | undefined,
    sourceHash: body.sourceHash as string | undefined,
    rows,
    qualityScore: Number(body.qualityScore),
  };
}

function assertClaim(name: string, actual: unknown, expected: string, rowNumber?: number): void {
  if (actual === undefined) return;
  if (typeof actual !== 'string' || actual.trim() !== expected) {
    throw new Error(`${name}_MISMATCH${rowNumber ? `:${rowNumber}` : ''}`);
  }
}

function materializeAuthoritativeRows(
  inputRows: UntrustedCanonicalImportRow[],
  expected: { tenantId: string; sourceId: string; sourceHash: string; sourceDocumentId: string },
): ReconciledCanonicalImportRow[] {
  return inputRows.map((row) => {
    const candidate = row.provenance ?? {};
    assertClaim('CANONICAL_TENANT_ID', candidate.tenantId, expected.tenantId, row.rowNumber);
    assertClaim('CANONICAL_SOURCE_ID', candidate.sourceId, expected.sourceId, row.rowNumber);
    assertClaim('CANONICAL_SOURCE_HASH', candidate.sourceHash, expected.sourceHash, row.rowNumber);
    assertClaim('CANONICAL_SOURCE_DOCUMENT_ID', candidate.sourceDocumentId, expected.sourceDocumentId, row.rowNumber);

    const evidenceId = `${expected.sourceId}:${row.rowNumber}`;
    const lineageId = `${expected.tenantId}:${expected.sourceDocumentId}:${row.rowNumber}`;
    assertClaim('CANONICAL_EVIDENCE_ID', candidate.evidenceId, evidenceId, row.rowNumber);
    assertClaim('CANONICAL_LINEAGE_ID', candidate.lineageId, lineageId, row.rowNumber);

    return {
      rowNumber: row.rowNumber,
      data: row.data,
      reconciliation: 'RECONCILED',
      provenance: {
        tenantId: expected.tenantId,
        sourceId: expected.sourceId,
        sourceHash: expected.sourceHash,
        sourceDocumentId: expected.sourceDocumentId,
        evidenceId,
        lineageId,
      },
    };
  });
}

export default async function handler(req: any, res: any) {
  if (!requireMethod(req, res, 'POST')) return;
  if (!requireConfig(res, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_ANON_KEY'])) return;

  const token = bearerToken(req);
  if (!token) {
    json(res, 401, { status: 'failed', error: 'authenticated_user_token_required' });
    return;
  }

  try {
    const user = await resolveAuthenticatedUser(token);
    if (!user) {
      json(res, 401, { status: 'failed', error: 'invalid_or_expired_user_token' });
      return;
    }

    const companyId = await resolveCurrentCompany(token);
    if (!companyId) {
      json(res, 403, { status: 'failed', error: 'authenticated_tenant_context_missing' });
      return;
    }

    const input = validateInput(await parseBody(req));
    const dataClient = createClient(process.env.SUPABASE_URL!.trim(), process.env.VITE_SUPABASE_ANON_KEY!.trim(), {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const workerClient = createClient(process.env.SUPABASE_URL!.trim(), process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(), {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });

    const { data: importJob, error: importJobError } = await dataClient
      .from('import_jobs')
      .select('id, company_id, file_record_id, status, job_type, source_fingerprint')
      .eq('id', input.importId)
      .eq('company_id', companyId)
      .single();
    if (importJobError || !importJob || !importJob.file_record_id) {
      json(res, 404, { status: 'failed', error: 'import_job_not_found_or_forbidden' });
      return;
    }

    const { data: fileRecord, error: fileRecordError } = await workerClient
      .from('file_records')
      .select('id, company_id, file_name, file_size, file_mime, file_hash, security_status, status, metadata')
      .eq('id', importJob.file_record_id)
      .eq('company_id', companyId)
      .single();
    if (fileRecordError || !fileRecord) {
      json(res, 409, { status: 'failed', error: 'authoritative_source_record_not_found' });
      return;
    }

    const sourceMetadata = fileRecord.metadata && typeof fileRecord.metadata === 'object'
      ? fileRecord.metadata as Record<string, unknown>
      : {};
    const persistedFileHash = typeof fileRecord.file_hash === 'string' && fileRecord.file_hash.trim()
      ? fileRecord.file_hash.trim()
      : null;
    const persistedRawHash = typeof sourceMetadata.raw_bytes_sha256 === 'string' && sourceMetadata.raw_bytes_sha256.trim()
      ? String(sourceMetadata.raw_bytes_sha256).trim()
      : null;
    const persistedJobHash = typeof importJob.source_fingerprint === 'string' && importJob.source_fingerprint.trim()
      ? importJob.source_fingerprint.trim()
      : null;
    const hasPersistedProvenance = Boolean(persistedFileHash || persistedRawHash || persistedJobHash);

    if (hasPersistedProvenance) {
      if (fileRecord.status !== 'ready' || fileRecord.security_status !== 'passed') {
        throw new Error('AUTHORITATIVE_SOURCE_NOT_VERIFIED');
      }
      if (!persistedFileHash || !persistedRawHash || !persistedJobHash) {
        throw new Error('AUTHORITATIVE_SOURCE_PROVENANCE_INCOMPLETE');
      }
    } else if (fileRecord.status !== 'uploaded' || fileRecord.security_status !== 'pending') {
      throw new Error('AUTHORITATIVE_SOURCE_STATE_INVALID');
    }

    const bucket = sourceMetadata.storage_bucket;
    const objectPath = sourceMetadata.storage_path;
    if (bucket !== 'documents' || typeof objectPath !== 'string' || !objectPath.startsWith(`${companyId}/imports/`)) {
      throw new Error('AUTHORITATIVE_SOURCE_STORAGE_BINDING_INVALID');
    }
    if (objectPath.includes('..') || objectPath.startsWith('/') || objectPath.includes('\\0')) {
      throw new Error('AUTHORITATIVE_SOURCE_STORAGE_PATH_INVALID');
    }

    const { data: rawObject, error: storageError } = await workerClient.storage.from('documents').download(objectPath);
    if (storageError || !rawObject) throw new Error(`AUTHORITATIVE_SOURCE_BYTES_UNAVAILABLE:${storageError?.message ?? 'empty'}`);
    const rawBytes = Buffer.from(await rawObject.arrayBuffer());
    if (!Number.isInteger(fileRecord.file_size) && typeof fileRecord.file_size !== 'number') {
      throw new Error('AUTHORITATIVE_SOURCE_SIZE_MISSING');
    }
    if (Number(fileRecord.file_size) !== rawBytes.byteLength) {
      throw new Error('AUTHORITATIVE_SOURCE_SIZE_MISMATCH');
    }

    const sourceHash = `sha256:${createHash('sha256').update(rawBytes).digest('hex')}`;
    if (typeof input.sourceHash === 'string' && input.sourceHash !== sourceHash) {
      throw new Error('CANONICAL_SOURCE_HASH_MISMATCH');
    }
    if (persistedJobHash && persistedJobHash !== sourceHash) {
      throw new Error('AUTHORITATIVE_SOURCE_HASH_DRIFT');
    }
    if (persistedFileHash && persistedFileHash !== sourceHash) {
      throw new Error('PERSISTED_SOURCE_HASH_TAMPERED');
    }
    if (persistedRawHash && persistedRawHash !== sourceHash) {
      throw new Error('AUTHORITATIVE_SOURCE_RAW_HASH_TAMPERED');
    }

    const verifiedMetadata = {
      ...sourceMetadata,
      storage_bucket: 'documents',
      storage_path: objectPath,
      raw_bytes_sha256: sourceHash,
      verified_at: new Date().toISOString(),
    };
    if (!hasPersistedProvenance) {
      const { error: fileUpdateError } = await workerClient
        .from('file_records')
        .update({
          file_hash: sourceHash,
          security_status: 'passed',
          status: 'ready',
          metadata: verifiedMetadata,
        })
        .eq('id', fileRecord.id)
        .eq('company_id', companyId);
      if (fileUpdateError) throw new Error(`AUTHORITATIVE_SOURCE_RECORD_UPDATE_FAILED:${fileUpdateError.message}`);

      const { error: jobSourceUpdateError } = await workerClient
        .from('import_jobs')
        .update({ source_fingerprint: sourceHash })
        .eq('id', importJob.id)
        .eq('company_id', companyId);
      if (jobSourceUpdateError) throw new Error(`AUTHORITATIVE_IMPORT_SOURCE_UPDATE_FAILED:${jobSourceUpdateError.message}`);
    }

    fileRecord.file_hash = sourceHash;
    fileRecord.metadata = hasPersistedProvenance ? sourceMetadata : verifiedMetadata;

    if (['products', 'customers', 'sales_invoices'].includes(importJob.job_type) && importJob.job_type !== input.entityType) {
      json(res, 409, { status: 'failed', error: 'import_job_entity_type_mismatch' });
      return;
    }

    const trustedRows = materializeAuthoritativeRows(input.rows, {
      tenantId: companyId,
      sourceId: fileRecord.id,
      sourceHash,
      sourceDocumentId: fileRecord.id,
    });

    for (const row of trustedRows) {
      assertCanonicalImportProvenance(row, {
        tenantId: companyId,
        sourceId: fileRecord.id,
        sourceHash,
        importId: fileRecord.id,
      });
    }

    if (['completed', 'partial', 'failed', 'cancelled'].includes(importJob.status)) {
      json(res, 409, { status: 'failed', error: 'import_job_already_terminal' });
      return;
    }

    const serverInput: DurableCanonicalImportInput = {
      importId: input.importId,
      fileName: fileRecord.file_name,
      sourceHash,
      entityType: input.entityType,
      rows: trustedRows,
      qualityScore: input.qualityScore,
    };

    const result = await runCanonicalImportThroughDurableRunner(serverInput, {
      serverExecution: true,
      workerClient,
      dataClient,
      companyId,
      requestedBy: user.id,
    });

    json(res, 200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status =
      message === 'request_too_large' ? 413 : /required|invalid|tenant|hash|rows|quality|business|duplicate|already_completed|already_running|not_retryable|provenance|authoritative_source|client_provenance/i.test(message) ? 400 : 502;
    json(res, status, { status: 'failed', error: message.slice(0, 512) });
  }
}
