import { timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate',
    },
  });
}

function safeEqual(expected: string, supplied: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

function loadProvenance(): Record<string, string | null> {
  try {
    const file = path.join(process.cwd(), 'netlify', 'functions', 'runtime-provenance.json');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function identity() {
  const provenance = loadProvenance();
  return {
    source_sha: provenance.source_sha || process.env.COMMIT_REF || process.env.GITHUB_SHA || null,
    deployment_sha: provenance.deployment_sha || process.env.COMMIT_REF || process.env.GITHUB_SHA || null,
    deployment_id: provenance.deployment_id || process.env.NETLIFY_DEPLOY_ID || process.env.DEPLOY_ID || null,
    target_env: provenance.target_env || process.env.RESILIENCE_TARGET_ENV || process.env.CONTEXT || null,
    runtime_environment: 'netlify-function',
  };
}

function supabaseHeaders(key: string, token = key) {
  return {
    apikey: key,
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

async function persistHealth(companyId: string, status: 'healthy' | 'critical', latencyMs: number, metadata: Record<string, unknown>) {
  const base = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!base || !serviceKey) throw new Error('missing_supabase_server_configuration');
  const response = await fetch(`${base}/rest/v1/operational_health_snapshots`, {
    method: 'POST',
    headers: { ...supabaseHeaders(serviceKey), Prefer: 'return=minimal' },
    body: JSON.stringify({ company_id: companyId, component: 'tenant-isolation-canary', status, latency_ms: latencyMs, metadata }),
  });
  if (!response.ok) throw new Error(`health_evidence_persist_failed:${response.status}`);
}

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ status: 'failed', error: 'method_not_allowed' }, 405);

  const expectedOperationalToken = (process.env.RESILIENCE_OPERATIONAL_TOKEN || '').trim();
  const suppliedOperationalToken = (request.headers.get('x-resilience-token') || '').trim();
  if (!expectedOperationalToken) return json({ status: 'blocked', error: 'operational_token_not_configured' }, 503);
  if (!suppliedOperationalToken || !safeEqual(expectedOperationalToken, suppliedOperationalToken)) {
    return json({ status: 'failed', error: 'invalid_operational_token' }, 401);
  }

  const config = {
    base: (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, ''),
    serviceKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
    anonKey: (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim(),
    ownCompany: (process.env.RESILIENCE_COMPANY_ID || '').trim(),
    foreignCompany: (process.env.RESILIENCE_CANARY_FOREIGN_COMPANY_ID || '').trim(),
  };
  const missing = Object.entries(config).filter(([key, value]) => !value && key !== 'anonKey').map(([key]) => key);
  if (!config.anonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  if (missing.length) return json({ status: 'blocked', error: 'missing_runtime_configuration', missing }, 503);

  const bearer = (request.headers.get('authorization') || '').trim();
  if (!bearer.startsWith('Bearer ') || !bearer.slice(7).trim()) {
    return json({ status: 'failed', error: 'authenticated_canary_token_required' }, 401);
  }
  const userToken = bearer.slice(7).trim();
  const started = Date.now();

  try {
    const foreignSeed = await fetch(
      `${config.base}/rest/v1/operational_health_snapshots?company_id=eq.${encodeURIComponent(config.foreignCompany)}&select=id&limit=1`,
      { headers: supabaseHeaders(config.serviceKey) },
    );
    if (!foreignSeed.ok) return json({ status: 'blocked', error: `foreign_canary_seed_check:${foreignSeed.status}` }, 503);
    const foreignSeedRows = await foreignSeed.json();
    if (!Array.isArray(foreignSeedRows) || foreignSeedRows.length === 0) {
      return json({ status: 'blocked', error: 'foreign_canary_seed_missing' }, 503);
    }

    const ownRead = await fetch(
      `${config.base}/rest/v1/operational_health_snapshots?company_id=eq.${encodeURIComponent(config.ownCompany)}&select=id&limit=1`,
      { headers: supabaseHeaders(config.anonKey, userToken) },
    );
    if (!ownRead.ok) return json({ status: 'blocked', error: `own_tenant_read_failed:${ownRead.status}` }, 503);
    const ownRows = await ownRead.json();
    if (!Array.isArray(ownRows) || ownRows.length === 0) {
      return json({ status: 'failed', error: 'authenticated_tenant_context_missing' }, 503);
    }

    const foreignRead = await fetch(
      `${config.base}/rest/v1/operational_health_snapshots?company_id=eq.${encodeURIComponent(config.foreignCompany)}&select=id&limit=1`,
      { headers: supabaseHeaders(config.anonKey, userToken) },
    );
    if (!foreignRead.ok) return json({ status: 'blocked', error: `foreign_tenant_probe_failed:${foreignRead.status}` }, 503);
    const foreignRows = await foreignRead.json();
    const isolated = Array.isArray(foreignRows) && foreignRows.length === 0;
    const latencyMs = Date.now() - started;
    await persistHealth(config.ownCompany, isolated ? 'healthy' : 'critical', latencyMs, {
      own_rows_visible: ownRows.length,
      foreign_rows_visible: Array.isArray(foreignRows) ? foreignRows.length : -1,
      foreign_seed_verified: true,
      source: 'netlify-function',
      ...identity(),
    });
    if (!isolated) return json({ status: 'critical', isolated: false, error: 'cross_tenant_data_visible', ...identity() }, 500);
    return json({ status: 'healthy', isolated: true, latency_ms: latencyMs, checked_at: new Date().toISOString(), ...identity() }, 200);
  } catch (error) {
    return json({ status: 'blocked', error: String(error), ...identity() }, 503);
  }
}
