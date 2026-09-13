import { test, expect } from '@playwright/test';

const BASE = () => {
  const baseUrl = process.env.E2E_BASE_URL;
  const supabaseUrl = process.env.E2E_SUPABASE_URL;
  const anonKey = process.env.E2E_SUPABASE_ANON_KEY;
  if (!baseUrl || !supabaseUrl || !anonKey) throw new Error('AUTHENTICATED_CERTIFICATION_ENV_MISSING');
  return { baseUrl: baseUrl.replace(/\/$/, ''), apiBase: supabaseUrl.replace(/\/$/, ''), anonKey };
};

async function login(page: any, email: string | undefined, password: string | undefined) {
  if (!email || !password) throw new Error('AUTHENTICATED_CERTIFICATION_USER_MISSING');
  const { baseUrl } = BASE();
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (!bypass) throw new Error('VERCEL_AUTOMATION_BYPASS_SECRET_MISSING');
  await page.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': bypass });
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/email|البريد الإلكتروني/i).fill(email);
  await page.getByLabel(/password|كلمة المرور/i).fill(password);
  await page.getByRole('button', { name: /sign in|login|دخول|تسجيل/i }).click();
  await page.waitForFunction(() => Object.keys(localStorage).some((key) => key.includes('-auth-token')), undefined, { timeout: 15_000 });
}

async function rest(page: any, pathname: string, init: RequestInit = {}) {
  const { apiBase, anonKey } = BASE();
  return page.evaluate(async ({ apiBase, anonKey, pathname, init }) => {
    const authEntry = Object.entries(localStorage).find(([key]) => key.includes('-auth-token'))?.[1];
    if (!authEntry) throw new Error('AUTH_SESSION_NOT_FOUND');
    const session = JSON.parse(authEntry);
    if (!session?.access_token) throw new Error('ACCESS_TOKEN_NOT_FOUND');
    const response = await fetch(`${apiBase}${pathname}`, {
      ...init,
      headers: { apikey: anonKey, Authorization: `Bearer ${session.access_token}`, ...(init.headers ?? {}) },
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`REST_${response.status}: ${text}`);
    return text ? JSON.parse(text) : null;
  }, { apiBase, anonKey, pathname, init });
}

async function rpc(page: any, name: string, args: Record<string, unknown>) {
  return rest(page, `/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
}

async function currentTenant(page: any) {
  const user = await rest(page, '/auth/v1/user');
  const memberships = await rest(page, `/rest/v1/company_memberships?select=company_id,user_id,is_active&user_id=eq.${encodeURIComponent(user.id)}`);
  expect(memberships).toHaveLength(1);
  expect(memberships[0].is_active).toBe(true);
  const tenant = String(await rpc(page, 'current_company_id', {}));
  expect(tenant).toBe(String(memberships[0].company_id));
  return { userId: String(user.id), tenantId: tenant };
}

test('real Evidence -> Recommendation -> Decision -> Approval -> Work -> Outcome', async ({ browser }) => {
  const a = await browser.newPage();
  const b = await browser.newPage();

  await login(a, process.env.E2E_EMAIL, process.env.E2E_PASSWORD);
  const actorA = await currentTenant(a);

  const evidenceRows = await rest(a, `/rest/v1/kpi_evidence_snapshots?select=id,company_id,kpi_key,value,quality,source_evidence,created_at&company_id=eq.${actorA.tenantId}&kpi_key=eq.dashboard.total_sales&order=created_at.desc&limit=1`);
  expect(evidenceRows).toHaveLength(1);
  const evidence = evidenceRows[0];
  expect(evidence.company_id).toBe(actorA.tenantId);
  expect(evidence.id).toBeTruthy();
  expect(evidence.source_evidence?.source_rpc).toBe('get_dashboard_snapshot');
  expect(Number(evidence.value)).toBeGreaterThanOrEqual(0);

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const recommendationId = await rpc(a, 'create_runtime_recommendation', {
    p_category: 'runtime-certification', p_priority: 'medium',
    p_title: `Certification recommendation ${suffix}`,
    p_description: 'Real runtime certification recommendation bound to a persisted KPI evidence snapshot.',
    p_evidence: { evidence_snapshot_id: evidence.id, kpi_key: evidence.kpi_key, value: evidence.value },
    p_expected_impact: 1, p_evidence_snapshot_id: evidence.id,
    p_metric_versions: { certification: 'runtime-real-evidence' },
  });
  expect(recommendationId).toBeTruthy();

  const recommendationRows = await rest(a, `/rest/v1/recommendations?select=id,company_id,status,evidence_snapshot_id&company_id=eq.${actorA.tenantId}&id=eq.${encodeURIComponent(recommendationId)}`);
  expect(recommendationRows).toHaveLength(1);
  expect(recommendationRows[0].evidence_snapshot_id).toBe(evidence.id);

  const decisionKey = `runtime-certification-${suffix}`;
  const decisionId = await rpc(a, 'create_runtime_decision', {
    p_decision_key: decisionKey, p_decision_type: 'runtime-certification', p_confidence: 1, p_expected_impact: 1,
    p_evidence: { evidence_snapshot_id: evidence.id, recommendation_id: recommendationId, kpi_key: evidence.kpi_key },
  });
  expect(decisionId).toBeTruthy();

  const link = await rest(a, `/rest/v1/recommendations?id=eq.${encodeURIComponent(recommendationId)}&company_id=eq.${actorA.tenantId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ decision_id: decisionId }),
  });
  expect(link).toHaveLength(1);
  expect(link[0].decision_id).toBe(decisionId);

  const decisionRows = await rest(a, `/rest/v1/business_intelligence_decisions?select=id,company_id,decision_key,status,recommendation_id&company_id=eq.${actorA.tenantId}&id=eq.${encodeURIComponent(decisionId)}`);
  expect(decisionRows).toHaveLength(1);
  expect(decisionRows[0].status).toBe('PROPOSED');

  const approvalId = await rpc(a, 'request_decision_approval', { p_decision_id: decisionId, p_reason: 'runtime certification' });
  expect(approvalId).toBeTruthy();

  // The policy guard must reject the requester attempting to approve their own decision.
  const selfApproval = await a.evaluate(async ({ apiBase, anonKey, approvalId }) => {
    const authEntry = Object.entries(localStorage).find(([key]) => key.includes('-auth-token'))?.[1];
    const session = JSON.parse(String(authEntry));
    const response = await fetch(`${apiBase}/rest/v1/rpc/decide_approval`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_approval_id: approvalId, p_approve: true, p_reason: 'self-approval probe' }),
    });
    return { status: response.status, body: await response.text() };
  }, { apiBase: BASE().apiBase, anonKey: BASE().anonKey, approvalId });
  expect(selfApproval.status).not.toBe(200);
  expect(selfApproval.body).toContain('SELF_APPROVAL_FORBIDDEN');

  await login(b, process.env.E2E_APPROVER_EMAIL, process.env.E2E_APPROVER_PASSWORD);
  const actorB = await currentTenant(b);
  expect(actorB.userId).not.toBe(actorA.userId);
  // Approval is tenant-scoped; do not bypass that boundary. If B is not a member of A's tenant,
  // the runtime must fail closed rather than mutating cross-tenant state.
  expect(actorB.tenantId).toBe(actorA.tenantId);

  expect(await rpc(b, 'decide_approval', { p_approval_id: approvalId, p_approve: true, p_reason: 'Independent authenticated approval' })).toBe(true);

  const approvalRows = await rest(b, `/rest/v1/decision_approvals?select=id,company_id,decision_id,status,decided_by&company_id=eq.${actorB.tenantId}&id=eq.${encodeURIComponent(approvalId)}`);
  expect(approvalRows).toHaveLength(1);
  expect(approvalRows[0].status).toBe('APPROVED');
  expect(approvalRows[0].decided_by).toBe(actorB.userId);

  const approvedDecision = await rest(b, `/rest/v1/business_intelligence_decisions?select=id,company_id,status,approved_by&company_id=eq.${actorB.tenantId}&id=eq.${encodeURIComponent(decisionId)}`);
  expect(approvedDecision).toHaveLength(1);
  expect(approvedDecision[0].status).toBe('APPROVED');
  expect(approvedDecision[0].approved_by).toBe(actorB.userId);

  const workItemId = await rpc(b, 'create_decision_work_item', {
    p_decision_id: decisionId, p_recommendation_id: recommendationId, p_department: 'certification', p_assignee_id: actorA.userId,
    p_assignee_label: 'Authenticated certification assignee', p_title: `Runtime certification work ${suffix}`,
    p_description: 'Real persisted lifecycle work item created from the approved real-evidence decision.', p_priority: 'MEDIUM', p_due_at: null,
    p_expected_impact: 1, p_evidence_refs: [{ id: evidence.id, type: 'kpi_evidence_snapshot', kpi_key: evidence.kpi_key }],
  });
  expect(workItemId).toBeTruthy();

  const open = await rest(a, `/rest/v1/decision_work_items?select=id,company_id,decision_id,recommendation_id,assignee_id,status&company_id=eq.${actorA.tenantId}&id=eq.${encodeURIComponent(workItemId)}`);
  expect(open).toHaveLength(1);
  expect(open[0].status).toBe('OPEN');
  expect(open[0].assignee_id).toBe(actorA.userId);

  const started = await rest(a, `/rest/v1/decision_work_items?id=eq.${encodeURIComponent(workItemId)}&company_id=eq.${actorA.tenantId}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ status: 'IN_PROGRESS', started_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
  });
  expect(started).toHaveLength(1);
  expect(started[0].status).toBe('IN_PROGRESS');

  const completed = await rpc(a, 'complete_decision_work_item', { p_work_item_id: workItemId, p_actual_impact: 1, p_evidence: { evidence_snapshot_id: evidence.id } });
  expect(completed).toBe(true);

  const finalEvidence = await rpc(a, 'capture_kpi_evidence_snapshot', { p_kpi_key: 'dashboard.total_sales', p_as_of: '2026-09-13', p_months: 6 });
  expect(finalEvidence.company_id).toBe(actorA.tenantId);
  expect(finalEvidence.id).toBeTruthy();
  expect(finalEvidence.source_evidence?.source_rpc).toBe('get_dashboard_snapshot');

  const outcomeId = await rpc(a, 'record_decision_outcome', {
    p_decision_fingerprint: decisionKey, p_evidence_snapshot_id: String(finalEvidence.id), p_action_id: String(workItemId),
    p_observed_at: new Date().toISOString(), p_label: 'correct', p_actual_value: Number(finalEvidence.value), p_expected_value: Number(evidence.value),
    p_impact_value: 1, p_notes: 'Real final evidence persisted after completed work item.',
  });
  expect(outcomeId).toBeTruthy();

  const outcomeRows = await rest(a, `/rest/v1/decision_outcomes?select=id,company_id,decision_fingerprint,evidence_snapshot_id,action_id,label&company_id=eq.${actorA.tenantId}&id=eq.${encodeURIComponent(outcomeId)}`);
  expect(outcomeRows).toHaveLength(1);
  expect(outcomeRows[0].decision_fingerprint).toBe(decisionKey);
  expect(outcomeRows[0].evidence_snapshot_id).toBe(String(finalEvidence.id));
  expect(outcomeRows[0].action_id).toBe(String(workItemId));
  expect(outcomeRows[0].label).toBe('correct');
});
