import { json, requireConfig, requireMethod, requireOperationalToken, supabaseRequest, persistHealth } from '../src/server/resilience-runtime.mjs';

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'GET')) return;
  if (!requireOperationalToken(req, res)) return;
  if (!requireConfig(res, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESILIENCE_COMPANY_ID'])) return;

  const started = Date.now();
  try {
    const response = await supabaseRequest('/rest/v1/operational_health_snapshots?select=id&limit=1');
    const latencyMs = Date.now() - started;
    if (!response.ok) {
      const body = await response.text();
      return json(res, 503, { status: 'critical', component: 'database', http_status: response.status, detail: body.slice(0, 300) });
    }
    await persistHealth(process.env.RESILIENCE_COMPANY_ID.trim(), 'database', 'healthy', latencyMs, { source: 'vercel-function' });
    return json(res, 200, { status: 'healthy', component: 'database', latency_ms: latencyMs, checked_at: new Date().toISOString() });
  } catch (error) {
    return json(res, 503, { status: 'critical', component: 'database', error: String(error) });
  }
}
