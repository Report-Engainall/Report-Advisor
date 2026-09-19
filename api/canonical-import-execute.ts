import { createClient } from '@supabase/supabase-js';
import { runCanonicalImportThroughDurableRunner, type DurableCanonicalImportInput } from '../src/lib/import/canonical-production-adapter';
import { assertCanonicalImportProvenance } from '../src/lib/import/canonical-truth-boundary';
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

function validateInput(value: unknown): DurableCanonicalImportInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid_json');
  const body = value as Record<string, unknown>;
  const entityType = body.entityType;
  if (entityType !== 'products' && entityType !== 'customers' && entityType !== 'sales_invoices') throw new Error('entity_type_invalid');
  if (typeof body.importId !== 'string' || !body.importId.trim()) throw new Error('import_id_invalid');
  if (typeof body.fileName !== 'string' || !body.fileName.trim() || body.fileName.length > 512) throw new Error('file_name_invalid');
  if (typeof body.sourceHash !== 'string' || !/^sha256:[0-9a-fA-F]{64}$/.test(body.sourceHash)) throw new Error('source_hash_invalid');
  if (!Array.isArray(body.rows) || body.rows.length < 1 || body.rows.length > 500000) throw new Error('rows_invalid');
  if (typeof body.qualityScore !== 'number' || !Number.isFinite(body.qualityScore) || body.qualityScore < 0 || body.qualityScore > 100) throw new Error('quality_score_invalid');
  return body as unknown as DurableCanonicalImportInput;
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

    const { data: importJob, error: importJobError } = await dataClient
      .from('import_jobs')
      .select('id, company_id, status, file_name, entity_type')
      .eq('id', input.importId)
      .eq('company_id', companyId)
      .single();
    if (importJobError || !importJob) {
      json(res, 404, { status: 'failed', error: 'import_job_not_found_or_forbidden' });
      return;
    }
    if (importJob.file_name !== input.fileName || importJob.entity_type !== input.entityType) {
      json(res, 409, { status: 'failed', error: 'import_job_source_identity_mismatch' });
      return;
    }
    for (const row of input.rows) {
      assertCanonicalImportProvenance(row, {
        tenantId: companyId,
        sourceId: importJob.file_name,
        sourceHash: input.sourceHash,
        importId: input.importId,
      });
    }

    if (['completed', 'partial', 'failed', 'cancelled'].includes(importJob.status)) {
      json(res, 409, { status: 'failed', error: 'import_job_already_terminal' });
      return;
    }

    const workerClient = createClient(process.env.SUPABASE_URL!.trim(), process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(), {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });

    const result = await runCanonicalImportThroughDurableRunner(input, {
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
      message === 'request_too_large' ? 413 : /required|invalid|tenant|hash|rows|quality|business|duplicate|already_completed|already_running|not_retryable|provenance/i.test(message) ? 400 : 502;
    json(res, status, { status: 'failed', error: message.slice(0, 512) });
  }
}
