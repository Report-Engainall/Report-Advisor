import { json, requireConfig, requireMethod, requireOperationalToken, supabaseRequest, supabaseUserRequest, persistHealth } from '../src/server/resilience-runtime.mjs';

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'GET')) return;
  if (!requireOperationalToken(req, res)) return;
  if (!requireConfig(res, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESILIENCE_COMPANY_ID', 'RESILIENCE_CANARY_FOREIGN_COMPANY_ID'])) return;

  const auth = req.headers.authorization;
  if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
    return json(res, 401, { status: 'failed', error: 'authenticated_canary_token_required' });
  }
  const token = auth.slice(7).trim();
  if (!token) return json(res, 401, { status: 'failed', error: 'authenticated_canary_token_required' });

  const own = process.env.RESILIENCE_COMPANY_ID.trim();
  const foreign = process.env.RESILIENCE_CANARY_FOREIGN_COMPANY_ID.trim();
  const started = Date.now();
  try {
    const foreignExists = await supabaseRequest(`/rest/v1/operational_health_snapshots?company_id=eq.${encodeURIComponent(foreign)}&select=id&limit=1`);
    if (!foreignExists.ok) return json(res, 503, { status: 'blocked', error: `foreign_canary_seed_check:${foreignExists.status}` });
    const foreignRows = await foreignExists.json();
    if (!Array.isArray(foreignRows) || foreignRows.length === 0) {
      return json(res, 503, { status: 'blocked', error: 'foreign_canary_seed_missing' });
    }

    const ownResponse = await supabaseUserRequest(`/rest/v1/operational_health_snapshots?company_id=eq.${encodeURIComponent(own)}&select=id&limit=1`, token);
    if (!ownResponse.ok) return json(res, 503, { status: 'blocked', error: `own_tenant_read_failed:${ownResponse.status}` });
    const ownRows = await ownResponse.json();
    if (!Array.isArray(ownRows) || ownRows.length === 0) {
      return json(res, 503, { status: 'failed', error: 'authenticated_tenant_context_missing' });
    }

    const foreignResponse = await supabaseUserRequest(`/rest/v1/operational_health_snapshots?company_id=eq.${encodeURIComponent(foreign)}&select=id&limit=1`, token);
    if (!foreignResponse.ok) return json(res, 503, { status: 'blocked', error: `foreign_tenant_probe_failed:${foreignResponse.status}` });
    const leakedRows = await foreignResponse.json();
    const isolated = Array.isArray(leakedRows) && leakedRows.length === 0;
    const latencyMs = Date.now() - started;
    await persistHealth(own, 'tenant-isolation-canary', isolated ? 'healthy' : 'critical', latencyMs, {
      own_rows_visible: ownRows.length,
      foreign_rows_visible: Array.isArray(leakedRows) ? leakedRows.length : -1,
      foreign_seed_verified: true,
      source: 'vercel-function',
    });
    if (!isolated) return json(res, 500, { status: 'critical', isolated: false, error: 'cross_tenant_data_visible' });
    return json(res, 200, { status: 'healthy', isolated: true, latency_ms: latencyMs, checked_at: new Date().toISOString() });
  } catch (error) {
    return json(res, 503, { status: 'blocked', error: String(error) });
  }
}
