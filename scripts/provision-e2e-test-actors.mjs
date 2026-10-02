import assert from 'node:assert/strict';

const supabaseUrl = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const actors = [
  { name: 'TEST_USER_A', email: process.env.TEST_USER_A_EMAIL?.trim(), password: process.env.TEST_USER_A_PASSWORD, role: 'admin' },
  { name: 'TEST_USER_B', email: process.env.TEST_USER_B_EMAIL?.trim(), password: process.env.TEST_USER_B_PASSWORD, role: 'sales' },
  { name: 'TEST_APPROVER', email: process.env.TEST_APPROVER_EMAIL?.trim(), password: process.env.TEST_APPROVER_PASSWORD, role: 'manager' },
];

for (const actor of actors) {
  if (!actor.email || !actor.password) throw new Error(`E2E_ACTOR_ENV_MISSING:${actor.name}`);
}
if (!supabaseUrl || !serviceRoleKey) throw new Error('E2E_ACTOR_SERVICE_ENV_MISSING');

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
};

async function request(path, options = {}) {
  const response = await fetch(supabaseUrl + path, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const body = await response.text();
  let parsed = null;
  try { parsed = body ? JSON.parse(body) : null; } catch {}
  if (!response.ok) {
    const detail = parsed?.msg || parsed?.message || parsed?.error_description || parsed?.error || body.slice(0, 400);
    throw new Error(`SUPABASE_ADMIN_HTTP_${response.status}:${detail}`);
  }
  return parsed;
}

async function listAllUsers() {
  const users = [];
  for (let page = 1; page <= 20; page += 1) {
    const payload = await request(`/auth/v1/admin/users?page=${page}&per_page=1000`);
    const batch = Array.isArray(payload?.users) ? payload.users : [];
    users.push(...batch);
    if (batch.length < 1000) break;
  }
  return users;
}

async function ensureActorUser(actor) {
  const users = await listAllUsers();
  const existing = users.find(user => String(user.email || '').toLowerCase() === actor.email.toLowerCase());
  const userMetadata = {
    ...(existing?.user_metadata && typeof existing.user_metadata === 'object' ? existing.user_metadata : {}),
    e2e_actor: 'true',
    e2e_purpose: 'full-product-browser-e2e',
  };

  if (!existing) {
    const created = await request('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: actor.email,
        password: actor.password,
        email_confirm: true,
        user_metadata: userMetadata,
      }),
    });
    assert.ok(created?.id, `${actor.name}:AUTH_USER_CREATE_MISSING_ID`);
    return String(created.id);
  }

  const updated = await request(`/auth/v1/admin/users/${existing.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      password: actor.password,
      email_confirm: true,
      user_metadata: userMetadata,
    }),
  });
  assert.equal(String(updated?.id), String(existing.id), `${actor.name}:AUTH_USER_UPDATE_ID_MISMATCH`);
  return String(existing.id);
}

async function resolveAllowedCompanies() {
  const rows = await request('/rest/v1/companies?select=id,name&order=name.asc&limit=1000');
  const allowed = Array.isArray(rows)
    ? rows.filter(row => row?.name === 'RUNTIME-EVIDENCE-A-401117' || String(row?.name || '').startsWith('Aghbari Report Corpus CI '))
    : [];
  const companyA = allowed.find(row => row.name === 'RUNTIME-EVIDENCE-A-401117');
  const companyB = [...allowed]
    .filter(row => row.name !== 'RUNTIME-EVIDENCE-A-401117')
    .sort((a, b) => String(b.name).localeCompare(String(a.name)))[0];
  assert.ok(companyA?.id, 'E2E_COMPANY_A_NOT_FOUND');
  assert.ok(companyB?.id, 'E2E_COMPANY_B_NOT_FOUND');
  assert.notEqual(companyA.id, companyB.id, 'E2E_COMPANY_A_AND_B_MUST_DIFFER');
  return { companyA, companyB };
}

async function provisionMembership(userId, companyId, role) {
  return request('/rest/v1/rpc/provision_e2e_test_membership', {
    method: 'POST',
    body: JSON.stringify({
      p_company_id: companyId,
      p_user_id: userId,
      p_role: role,
      p_is_default: true,
    }),
  });
}

async function verifyMembership(userId, companyId, role) {
  const rows = await request(
    `/rest/v1/company_memberships?select=id,company_id,user_id,role,is_active,is_default&user_id=eq.${encodeURIComponent(userId)}&company_id=eq.${encodeURIComponent(companyId)}&limit=5`,
  );
  assert.ok(Array.isArray(rows) && rows.length === 1, 'E2E_MEMBERSHIP_READBACK_MISSING');
  assert.equal(rows[0].user_id, userId);
  assert.equal(rows[0].company_id, companyId);
  assert.equal(rows[0].role, role);
  assert.equal(rows[0].is_active, true);
  assert.equal(rows[0].is_default, true);
  return rows[0];
}

const { companyA, companyB } = await resolveAllowedCompanies();
const userAId = await ensureActorUser(actors[0]);
const userBId = await ensureActorUser(actors[1]);
const approverId = await ensureActorUser(actors[2]);

await provisionMembership(userAId, companyA.id, actors[0].role);
await provisionMembership(userBId, companyB.id, actors[1].role);
await provisionMembership(approverId, companyA.id, actors[2].role);

const readbackA = await verifyMembership(userAId, companyA.id, actors[0].role);
const readbackB = await verifyMembership(userBId, companyB.id, actors[1].role);
const readbackApprover = await verifyMembership(approverId, companyA.id, actors[2].role);

console.log(JSON.stringify({
  status: 'PASS',
  actors: {
    TEST_USER_A: { provisioned: true, company: companyA.name, role: readbackA.role },
    TEST_USER_B: { provisioned: true, company: companyB.name, role: readbackB.role },
    TEST_APPROVER: { provisioned: true, company: companyA.name, role: readbackApprover.role },
  },
  separationOfDuties: { distinct: userAId !== approverId },
  provisioning: 'provision_e2e_test_membership',
}, null, 2));
