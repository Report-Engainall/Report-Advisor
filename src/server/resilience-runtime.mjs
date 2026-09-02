import { createHash, timingSafeEqual } from 'node:crypto';

export const json = (res, status, body) => {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
};

export function requireMethod(req, res, method) {
  if (req.method !== method) {
    json(res, 405, { status: 'failed', error: 'method_not_allowed' });
    return false;
  }
  return true;
}

export function requireOperationalToken(req, res) {
  const expected = process.env.RESILIENCE_OPERATIONAL_TOKEN?.trim();
  const supplied = req.headers['x-resilience-token'];
  if (!expected || typeof supplied !== 'string') {
    json(res, 503, { status: 'blocked', error: 'operational_token_not_configured' });
    return false;
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    json(res, 401, { status: 'failed', error: 'invalid_operational_token' });
    return false;
  }
  return true;
}

export function requireConfig(res, keys) {
  const missing = keys.filter((key) => !process.env[key]?.trim());
  if (missing.length) {
    json(res, 503, { status: 'blocked', error: 'missing_runtime_configuration', missing });
    return false;
  }
  return true;
}

export async function supabaseRequest(path, options = {}) {
  const base = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!base || !key) throw new Error('missing_supabase_server_configuration');
  return fetch(`${base.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

export async function supabaseUserRequest(path, token, options = {}) {
  const base = process.env.SUPABASE_URL?.trim();
  if (!base) throw new Error('missing_supabase_url');
  return fetch(`${base.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      apikey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });
}

export async function managementRequest(path, options = {}) {
  const token = process.env.SUPABASE_MANAGEMENT_TOKEN?.trim();
  if (!token) throw new Error('missing_supabase_management_token');
  return fetch(`https://api.supabase.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

export function parseSecureOutboundUrl(value, configName) {
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(`invalid_${configName}`);
  }
  if (url.protocol !== 'https:') throw new Error(`insecure_${configName}`);
  if (url.username || url.password) throw new Error(`credentialed_${configName}`);
  return url;
}

export async function secureOutboundFetch(value, configName, options = {}) {
  const url = parseSecureOutboundUrl(value, configName);
  const controller = new AbortController();
  const timeoutMs = Number(process.env.RESILIENCE_OUTBOUND_TIMEOUT_MS || 15000);
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1000 || timeoutMs > 60000) {
    throw new Error('invalid_resilience_outbound_timeout_ms');
  }
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, redirect: 'error', signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function persistHealth(companyId, component, status, latencyMs, metadata = {}) {
  const r = await supabaseRequest('/rest/v1/operational_health_snapshots', {
    method: 'POST',
    body: JSON.stringify({ company_id: companyId, component, status, latency_ms: latencyMs, metadata }),
  });
  if (!r.ok) throw new Error(`health_evidence_persist_failed:${r.status}`);
}

export async function persistBackupEvidence(companyId, evidence) {
  const r = await supabaseRequest('/rest/v1/backup_verification_runs', {
    method: 'POST',
    body: JSON.stringify({ company_id: companyId, ...evidence }),
  });
  if (!r.ok) throw new Error(`backup_evidence_persist_failed:${r.status}`);
}

export async function persistIncidentEvidence(companyId, evidence) {
  const r = await supabaseRequest('/rest/v1/incident_evidence', {
    method: 'POST',
    body: JSON.stringify({ company_id: companyId, ...evidence }),
  });
  if (!r.ok) throw new Error(`incident_evidence_persist_failed:${r.status}`);
}

export async function sha256ResponseBody(response) {
  const buffer = Buffer.from(await response.arrayBuffer());
  return { sha256: createHash('sha256').update(buffer).digest('hex'), bytes: buffer.length };
}

export function isProductionEnv() {
  return /^(prod|production)$/i.test(process.env.RESILIENCE_TARGET_ENV?.trim() || '');
}

export function isSafeRestoreTargetEnv() {
  const target = process.env.RESILIENCE_TARGET_ENV?.trim() || '';
  return /^(staging|preview|test|testing|qa|development|dev|recovery|dr)([-_].*)?$/i.test(target);
}
