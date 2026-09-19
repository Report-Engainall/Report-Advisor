import { json, requireConfig, requireMethod, supabaseUserRequest } from '../src/server/resilience-runtime.mjs';

const TOOLS = new Set([
  'get_dashboard_snapshot',
  'get_metric_definition',
  'get_evidence_passport',
  'get_decision_record',
  'get_decision_outcome',
]);

function bearerToken(req) {
  const value = req.headers.authorization;
  if (typeof value !== 'string' || !value.startsWith('Bearer ')) return null;
  return value.slice(7).trim() || null;
}

function queryText(req, key, max = 200) {
  const value = req.query?.[key];
  if (value == null) return null;
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(key + '_invalid');
  return value.trim();
}

async function currentCompany(token) {
  const response = await supabaseUserRequest('/rest/v1/rpc/current_company_id', token, {
    method: 'POST',
    body: '{}',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) return null;
  const value = await response.json();
  return typeof value === 'string' && value ? value : null;
}

async function rpc(token, name, body) {
  const response = await supabaseUserRequest('/rest/v1/rpc/' + name, token, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  const bodyText = await response.text();
  if (!response.ok) {
    return { error: response.status, detail: bodyText.slice(0, 512) };
  }
  try { return JSON.parse(bodyText); } catch { return null; }
}

async function table(token, name, query) {
  const response = await supabaseUserRequest('/rest/v1/' + name + query, token, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const bodyText = await response.text();
  if (!response.ok) return { error: response.status, detail: bodyText.slice(0, 512) };
  try { return JSON.parse(bodyText); } catch { return []; }
}

function responseBase(tool, tenantId) {
  return {
    protocolVersion: '1.0',
    tool,
    tenantId,
  };
}

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'GET')) return;
  if (!requireConfig(res, ['SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'])) return;

  const token = bearerToken(req);
  if (!token) return json(res, 401, { status: 'blocked', error: 'authenticated_user_token_required' });

  try {
    const tool = queryText(req, 'tool') || 'get_evidence_passport';
    if (!TOOLS.has(tool)) return json(res, 400, { status: 'failed', error: 'unsupported_evidence_tool' });

    const tenantId = await currentCompany(token);
    if (!tenantId) return json(res, 403, { status: 'blocked', error: 'authenticated_tenant_context_missing' });

    const months = Number(req.query?.months ?? 6);
    if (!Number.isInteger(months) || months < 1 || months > 24) {
      return json(res, 400, { status: 'failed', error: 'months_invalid' });
    }

    const metricId = queryText(req, 'metricId');
    const decisionId = queryText(req, 'decisionId', 120);

    if (tool === 'get_dashboard_snapshot' || tool === 'get_evidence_passport') {
      const snapshot = await rpc(token, 'get_dashboard_snapshot', {
        p_months: months,
        p_as_of: new Date().toISOString().slice(0, 10),
      });
      if (snapshot && snapshot.error) return json(res, 502, { ...responseBase(tool, tenantId), status: 'failed', error: 'source_rpc_rejected', detail: snapshot.detail });

      const truthState = snapshot?.status === 'CONFIRMED' || snapshot?.status === 'CALCULATED' ? snapshot.status : 'INSUFFICIENT_DATA';
      return json(res, 200, {
        ...responseBase(tool, tenantId),
        truthState,
        source: 'get_dashboard_snapshot',
        period: months + (months === 1 ? ' شهر' : ' أشهر'),
        asOf: snapshot?.asOf ?? null,
        evidenceRefs: ['rpc:get_dashboard_snapshot', 'tenant:' + tenantId],
        result: metricId && tool === 'get_evidence_passport'
          ? { metricId, snapshot }
          : snapshot,
        missingEvidence: truthState === 'INSUFFICIENT_DATA' ? ['canonical snapshot is insufficient for a fully trusted decision'] : [],
      });
    }

    if (tool === 'get_metric_definition') {
      if (!metricId) return json(res, 400, { status: 'failed', error: 'metricId_required' });
      const rows = await table(token, 'metric_governance', '?select=*&metric_id=eq.' + encodeURIComponent(metricId) + '&limit=1');
      if (rows && rows.error) return json(res, 502, { ...responseBase(tool, tenantId), status: 'failed', error: 'source_table_rejected', detail: rows.detail });
      const found = Array.isArray(rows) ? rows[0] : null;
      return json(res, found ? 200 : 404, {
        ...responseBase(tool, tenantId),
        truthState: found ? 'CONFIRMED' : 'INSUFFICIENT_DATA',
        source: 'metric_governance',
        evidenceRefs: ['table:metric_governance', 'metric:' + metricId],
        result: found ?? {},
        missingEvidence: found ? [] : ['metric definition not found'],
      });
    }

    if (!decisionId) return json(res, 400, { status: 'failed', error: 'decisionId_required' });

    if (tool === 'get_decision_record') {
      const rows = await table(token, 'business_intelligence_decisions', '?select=*&id=eq.' + encodeURIComponent(decisionId) + '&limit=1');
      if (rows && rows.error) return json(res, 502, { ...responseBase(tool, tenantId), status: 'failed', error: 'source_table_rejected', detail: rows.detail });
      const found = Array.isArray(rows) ? rows[0] : null;
      return json(res, found ? 200 : 404, {
        ...responseBase(tool, tenantId),
        truthState: found ? 'CONFIRMED' : 'INSUFFICIENT_DATA',
        source: 'business_intelligence_decisions',
        evidenceRefs: ['table:business_intelligence_decisions', 'decision:' + decisionId],
        result: found ?? {},
        missingEvidence: found ? [] : ['decision record not found'],
      });
    }

    const outcomes = await table(token, 'recommendation_outcomes', '?select=*&decision_id=eq.' + encodeURIComponent(decisionId) + '&limit=20');
    if (outcomes && outcomes.error) return json(res, 502, { ...responseBase(tool, tenantId), status: 'failed', error: 'source_table_rejected', detail: outcomes.detail });
    const list = Array.isArray(outcomes) ? outcomes : [];
    return json(res, 200, {
      ...responseBase(tool, tenantId),
      truthState: list.length ? 'CONFIRMED' : 'INSUFFICIENT_DATA',
      source: 'recommendation_outcomes',
      evidenceRefs: ['table:recommendation_outcomes', 'decision:' + decisionId],
      result: list,
      missingEvidence: list.length ? [] : ['no persisted outcome is available for this decision'],
    });
  } catch (error) {
    return json(res, 503, {
      protocolVersion: '1.0',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
