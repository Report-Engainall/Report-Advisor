import { json, requireMethod, requireConfig, supabaseRequest, supabaseUserRequest } from '../src/server/resilience-runtime.mjs';

const MAX_BODY_BYTES = 32 * 1024;
const MAX_EVIDENCE_KEYS = 32;
const MAX_TEXT = 512;

function bearerToken(req) {
  const value = req.headers.authorization;
  if (typeof value !== 'string' || !value.startsWith('Bearer ')) return null;
  const token = value.slice(7).trim();
  return token || null;
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > MAX_BODY_BYTES) throw new Error('request_body_too_large');
    chunks.push(chunk);
  }
  if (size === 0) throw new Error('request_body_required');
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new Error('invalid_json');
  }
}

function requiredText(value, name) {
  if (typeof value !== 'string' || !value.trim() || value.length > MAX_TEXT) throw new Error(`${name}_invalid`);
  return value.trim();
}

function boundedAttempts(value) {
  if (value === undefined) return 3;
  if (!Number.isInteger(value) || value < 1 || value > 10) throw new Error('max_attempts_invalid');
  return value;
}

function evidenceKeys(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_EVIDENCE_KEYS) throw new Error('evidence_keys_invalid');
  return value.map((item) => requiredText(item, 'evidence_key'));
}

async function resolveAuthenticatedUser(token) {
  const response = await supabaseUserRequest('/auth/v1/user', token, { method: 'GET' });
  if (!response.ok) return null;
  const user = await response.json();
  return user && typeof user.id === 'string' ? user : null;
}

async function resolveCurrentCompany(token) {
  const response = await supabaseUserRequest('/rest/v1/rpc/current_company_id', token, {
    method: 'POST',
    body: '{}',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) return null;
  const value = await response.json();
  return typeof value === 'string' && value ? value : null;
}

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;
  if (!requireConfig(res, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'VITE_SUPABASE_ANON_KEY'])) return;

  const token = bearerToken(req);
  if (!token) return json(res, 401, { status: 'failed', error: 'authenticated_user_token_required' });

  try {
    const user = await resolveAuthenticatedUser(token);
    if (!user) return json(res, 401, { status: 'failed', error: 'invalid_or_expired_user_token' });

    const companyId = await resolveCurrentCompany(token);
    if (!companyId) return json(res, 403, { status: 'failed', error: 'authenticated_tenant_context_missing' });

    const body = await readJson(req);
    const reportId = requiredText(body.reportId, 'report_id');
    const idempotencyKey = requiredText(body.idempotencyKey, 'idempotency_key');
    const sourcePath = requiredText(body.sourcePath, 'source_path');
    const sourceHash = requiredText(body.sourceHash, 'source_hash');
    const keys = evidenceKeys(body.evidenceKeys);
    const maxAttempts = boundedAttempts(body.maxAttempts);
    const jobKey = `report:${reportId}:${idempotencyKey}`;

    const response = await supabaseRequest('/rest/v1/rpc/enqueue_report_execution_job', {
      method: 'POST',
      body: JSON.stringify({
        p_company_id: companyId,
        p_job_key: jobKey,
        p_source_path: sourcePath,
        p_source_hash: sourceHash,
        p_evidence_keys: keys,
        p_max_attempts: maxAttempts,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return json(res, response.status >= 400 && response.status < 500 ? response.status : 502, {
        status: 'failed',
        error: 'durable_enqueue_rejected',
        detail: detail.slice(0, 512),
      });
    }

    const job = await response.json();
    if (!job || job.company_id !== companyId) {
      return json(res, 502, { status: 'failed', error: 'durable_enqueue_tenant_mismatch' });
    }

    return json(res, 202, {
      status: job.status || 'queued',
      run_id: job.id,
      report_id: reportId,
      tenant_id: companyId,
      requested_by: user.id,
      job_key: job.job_key,
      source_hash: job.source_hash,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const clientError = /_invalid$|^request_|^invalid_json$/.test(message);
    return json(res, clientError ? 400 : 503, { status: 'failed', error: message });
  }
}
