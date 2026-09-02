import { json, requireConfig, requireMethod, requireOperationalToken, persistIncidentEvidence, isProductionEnv, secureOutboundFetch } from '../src/server/resilience-runtime.mjs';

async function vercelRequest(path, options = {}) {
  const token = process.env.VERCEL_TOKEN.trim();
  const team = process.env.VERCEL_TEAM_ID?.trim();
  const separator = path.includes('?') ? '&' : '?';
  const scoped = team ? `${path}${separator}teamId=${encodeURIComponent(team)}` : path;
  return fetch(`https://api.vercel.com${scoped}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
}

export async function deploymentReady(id) {
  const projectId = process.env.VERCEL_PROJECT_ID?.trim();
  if (!projectId) throw new Error('vercel_project_id_required');
  if (!id?.trim()) throw new Error('deployment_id_required');

  const response = await vercelRequest(`/v13/deployments/${encodeURIComponent(id.trim())}`);
  if (!response.ok) throw new Error(`deployment_lookup_failed:${response.status}`);
  const data = await response.json();
  if (data.projectId !== projectId) throw new Error('deployment_project_mismatch');
  if (data.readyState !== 'READY') throw new Error(`deployment_not_ready:${data.readyState || 'unknown'}`);
  return data;
}

async function assignAlias(deploymentId, alias) {
  const response = await vercelRequest(`/v2/deployments/${encodeURIComponent(deploymentId)}/aliases`, {
    method: 'POST',
    body: JSON.stringify({ alias }),
  });
  if (!response.ok) throw new Error(`alias_assignment_failed:${response.status}`);
  return response.json();
}

async function verify(url) {
  const response = await secureOutboundFetch(url, 'rollback_verify_url', { headers: { Accept: 'application/json' }, cache: 'no-store' });
  return { ok: response.ok, status: response.status };
}

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;
  if (!requireOperationalToken(req, res)) return;
  if (!requireConfig(res, [
    'RESILIENCE_TARGET_ENV',
    'RESILIENCE_COMPANY_ID',
    'VERCEL_TOKEN',
    'VERCEL_PROJECT_ID',
    'RESILIENCE_ROLLBACK_DRILL_DOMAIN',
    'RESILIENCE_ROLLBACK_FROM_DEPLOYMENT',
    'RESILIENCE_ROLLBACK_FORWARD_DEPLOYMENT',
    'RESILIENCE_ROLLBACK_VERIFY_URL',
  ])) return;
  if (isProductionEnv()) return json(res, 409, { status: 'blocked', error: 'production_rollback_drill_forbidden' });

  const domain = process.env.RESILIENCE_ROLLBACK_DRILL_DOMAIN.trim().toLowerCase();
  const productionDomain = process.env.RESILIENCE_PRODUCTION_DOMAIN?.trim().toLowerCase();
  if (productionDomain && domain === productionDomain) return json(res, 409, { status: 'blocked', error: 'rollback_domain_is_production_domain' });

  const from = process.env.RESILIENCE_ROLLBACK_FROM_DEPLOYMENT.trim();
  const forward = process.env.RESILIENCE_ROLLBACK_FORWARD_DEPLOYMENT.trim();
  const verifyUrl = process.env.RESILIENCE_ROLLBACK_VERIFY_URL.trim();
  if (from === forward) return json(res, 409, { status: 'blocked', error: 'rollback_deployments_must_differ' });
  const incidentKey = `rollback-drill-${Date.now()}`;
  const started = Date.now();
  let validatedForwardDeployment;
  try {
    const [fromDeployment, forwardDeployment] = await Promise.all([deploymentReady(from), deploymentReady(forward)]);
    validatedForwardDeployment = forwardDeployment;
    const before = await verify(verifyUrl);
    if (!before.ok) return json(res, 503, { status: 'blocked', error: `forward_baseline_failed:${before.status}` });

    const rollbackStarted = Date.now();
    await assignAlias(fromDeployment.id, domain);
    const rollbackProbe = await verify(verifyUrl);
    if (!rollbackProbe.ok) {
      await assignAlias(forwardDeployment.id, domain);
      throw new Error(`rollback_probe_failed:${rollbackProbe.status}`);
    }

    await assignAlias(forwardDeployment.id, domain);
    const forwardProbe = await verify(verifyUrl);
    const rtoSeconds = (Date.now() - rollbackStarted) / 1000;
    if (!forwardProbe.ok) throw new Error(`forward_fix_probe_failed:${forwardProbe.status}`);

    await persistIncidentEvidence(process.env.RESILIENCE_COMPANY_ID.trim(), {
      incident_key: incidentKey,
      severity: 'low',
      status: 'resolved',
      detected_at: new Date(started).toISOString(),
      mitigated_at: new Date(rollbackStarted).toISOString(),
      resolved_at: new Date().toISOString(),
      root_cause: 'controlled rollback drill',
      impact: { production_touched: false, target_env: process.env.RESILIENCE_TARGET_ENV.trim(), alias: domain },
      actions: ['verified forward deployment', 'aliased rollback deployment', 'verified rollback', 'restored forward deployment', 'verified forward recovery'],
      evidence: { from_deployment: fromDeployment.id, forward_deployment: forwardDeployment.id, rollback_probe: rollbackProbe, forward_probe: forwardProbe, rto_seconds: rtoSeconds },
    });
    return json(res, 200, { status: 'passed', production_touched: false, rollback_verified: true, forward_recovery_verified: true, rto_seconds: rtoSeconds });
  } catch (error) {
    if (validatedForwardDeployment) {
      try { await assignAlias(validatedForwardDeployment.id, domain); } catch {}
    }
    return json(res, 503, { status: 'failed', production_touched: false, error: String(error) });
  }
}
