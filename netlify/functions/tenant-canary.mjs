import { timingSafeEqual } from 'node:crypto';
import {
  persistHealth,
  supabaseRequest,
  supabaseUserRequest,
} from '../../src/server/resilience-runtime.mjs';

const headers = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store, no-cache, must-revalidate',
};

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers });
}

function requireOperationalToken(request) {
  const expected = process.env.RESILIENCE_OPERATIONAL_TOKEN?.trim() || '';
  const supplied = request.headers.get('x-resilience-token')?.trim() || '';

  if (!expected) {
    return json({ status: 'blocked', error: 'operational_token_not_configured' }, 503);
  }

  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  if (
    expectedBytes.length !== suppliedBytes.length
    || !timingSafeEqual(expectedBytes, suppliedBytes)
  ) {
    return json({ status: 'failed', error: 'invalid_operational_token' }, 401);
  }

  return null;
}

function missingConfiguration() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESILIENCE_COMPANY_ID',
    'RESILIENCE_CANARY_FOREIGN_COMPANY_ID',
  ];
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (!process.env.VITE_SUPABASE_ANON_KEY?.trim() && !process.env.SUPABASE_ANON_KEY?.trim()) {
    missing.push('SUPABASE_ANON_KEY');
  }
  return missing;
}

export default async function handler(request) {
  if (request.method !== 'GET') {
    return json({ status: 'failed', error: 'method_not_allowed', allowed: ['GET'] }, 405);
  }

  const authFailure = requireOperationalToken(request);
  if (authFailure) return authFailure;

  const missing = missingConfiguration();
  if (missing.length) {
    return json({ status: 'blocked', error: 'missing_runtime_configuration', missing }, 503);
  }

  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ') || !authorization.slice(7).trim()) {
    return json({ status: 'failed', error: 'authenticated_canary_token_required' }, 401);
  }

  const token = authorization.slice(7).trim();
  const own = process.env.RESILIENCE_COMPANY_ID.trim();
  const foreign = process.env.RESILIENCE_CANARY_FOREIGN_COMPANY_ID.trim();
  const started = Date.now();

  try {
    const foreignSeed = await supabaseRequest(
      `/rest/v1/operational_health_snapshots?company_id=eq.${encodeURIComponent(foreign)}&select=id&limit=1`,
    );
    if (!foreignSeed.ok) {
      return json({ status: 'blocked', error: `foreign_canary_seed_check:${foreignSeed.status}` }, 503);
    }
    const foreignSeedRows = await foreignSeed.json();
    if (!Array.isArray(foreignSeedRows) || foreignSeedRows.length === 0) {
      return json({ status: 'blocked', error: 'foreign_canary_seed_missing' }, 503);
    }

    const ownResponse = await supabaseUserRequest(
      `/rest/v1/operational_health_snapshots?company_id=eq.${encodeURIComponent(own)}&select=id&limit=1`,
      token,
    );
    if (!ownResponse.ok) {
      return json({ status: 'blocked', error: `own_tenant_read_failed:${ownResponse.status}` }, 503);
    }
    const ownRows = await ownResponse.json();
    if (!Array.isArray(ownRows) || ownRows.length === 0) {
      return json({ status: 'failed', error: 'authenticated_tenant_context_missing' }, 503);
    }

    const foreignResponse = await supabaseUserRequest(
      `/rest/v1/operational_health_snapshots?company_id=eq.${encodeURIComponent(foreign)}&select=id&limit=1`,
      token,
    );
    if (!foreignResponse.ok) {
      return json({ status: 'blocked', error: `foreign_tenant_probe_failed:${foreignResponse.status}` }, 503);
    }

    const foreignRows = await foreignResponse.json();
    const foreignRowsVisible = Array.isArray(foreignRows) ? foreignRows.length : -1;
    const isolated = Array.isArray(foreignRows) && foreignRows.length === 0;
    const latencyMs = Date.now() - started;

    await persistHealth(own, 'tenant-isolation-canary', isolated ? 'healthy' : 'critical', latencyMs, {
      own_rows_visible: ownRows.length,
      foreign_rows_visible: foreignRowsVisible,
      foreign_seed_verified: true,
      source: 'netlify-function',
    });

    if (!isolated) {
      return json({ status: 'critical', isolated: false, error: 'cross_tenant_data_visible' }, 500);
    }

    return json({
      status: 'healthy',
      isolated: true,
      latency_ms: latencyMs,
      checked_at: new Date().toISOString(),
    }, 200);
  } catch {
    // Fail closed without exposing database URLs, credentials, or upstream error bodies.
    return json({ status: 'blocked', error: 'tenant_canary_probe_failed' }, 503);
  }
}
