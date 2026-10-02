import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const required = [
  'REPORT_ADVISOR_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'TEST_USER_A_EMAIL',
  'TEST_USER_A_PASSWORD',
  'TEST_USER_B_EMAIL',
  'TEST_USER_B_PASSWORD',
  'TEST_APPROVER_EMAIL',
  'TEST_APPROVER_PASSWORD',
];

for (const name of required) {
  if (!process.env[name]?.trim()) throw new Error('E2E_ACTOR_ENV_MISSING:' + name);
}

const supabase = createClient(
  process.env.REPORT_ADVISOR_SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const ACTOR_METADATA = {
  e2e_actor: 'true',
  e2e_purpose: 'full-product-browser-e2e',
};

async function findUserByEmail(email) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = (data.users ?? []).find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if ((data.users ?? []).length < 1000) return null;
  }
  return null;
}

async function ensureActor(email, password, label) {
  let user = await findUserByEmail(email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: ACTOR_METADATA,
    });
    if (error) throw error;
    user = data.user;
  } else {
    const metadata = user.user_metadata ?? {};
    if (metadata.e2e_actor !== 'true' || metadata.e2e_purpose !== ACTOR_METADATA.e2e_purpose) {
      throw new Error('E2E_EXISTING_USER_NOT_TAGGED:' + label);
    }
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { ...metadata, ...ACTOR_METADATA },
    });
    if (error) throw error;
    user = data.user;
  }
  assert.ok(user?.id, 'E2E_ACTOR_ID_REQUIRED:' + label);
  return user;
}

async function findTenantA() {
  const { data, error } = await supabase
    .from('companies')
    .select('id,name,created_at')
    .eq('name', 'RUNTIME-EVIDENCE-A-401117')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) throw new Error('E2E_TENANT_A_NOT_FOUND');
  return data;
}

async function findTenantB() {
  const { data, error } = await supabase
    .from('companies')
    .select('id,name,created_at')
    .like('name', 'Aghbari Report Corpus CI %')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  if (!data?.length) throw new Error('E2E_TENANT_B_NOT_FOUND');
  return data[0];
}

async function provisionMembership(companyId, userId, requestedRole, isDefault, label) {
  const { data: existing, error: existingError } = await supabase
    .from('company_memberships')
    .select('role,is_active,is_default')
    .eq('company_id', companyId)
    .eq('user_id', userId)
    .maybeSingle();
  if (existingError) throw existingError;

  const role = existing?.role || requestedRole;
  const { data, error } = await supabase.rpc('provision_e2e_test_membership', {
    p_company_id: companyId,
    p_user_id: userId,
    p_role: role,
    p_is_default: isDefault,
  });
  if (error) throw error;
  const membership = Array.isArray(data) ? data[0] : data;
  assert.equal(String(membership.company_id), String(companyId), 'E2E_MEMBERSHIP_TENANT_MISMATCH:' + label);
  assert.equal(String(membership.user_id), String(userId), 'E2E_MEMBERSHIP_USER_MISMATCH:' + label);
  assert.equal(membership.is_active, true, 'E2E_MEMBERSHIP_INACTIVE:' + label);
  return membership;
}

const userA = await ensureActor(process.env.TEST_USER_A_EMAIL.trim(), process.env.TEST_USER_A_PASSWORD, 'A');
const userB = await ensureActor(process.env.TEST_USER_B_EMAIL.trim(), process.env.TEST_USER_B_PASSWORD, 'B');
const approver = await ensureActor(process.env.TEST_APPROVER_EMAIL.trim(), process.env.TEST_APPROVER_PASSWORD, 'APPROVER');

assert.notEqual(userA.id, approver.id, 'APPROVER_MUST_DIFFER_FROM_REQUESTER');
assert.notEqual(userA.id, userB.id, 'USER_A_AND_USER_B_MUST_DIFFER');
assert.notEqual(userB.id, approver.id, 'USER_B_AND_APPROVER_MUST_DIFFER');

const tenantA = await findTenantA();
const tenantB = await findTenantB();
assert.notEqual(String(tenantA.id), String(tenantB.id), 'TENANT_A_AND_B_MUST_BE_DISTINCT');

const membershipA = await provisionMembership(tenantA.id, userA.id, 'sales', true, 'A');
const membershipApprover = await provisionMembership(tenantA.id, approver.id, 'manager', true, 'APPROVER');
const membershipB = await provisionMembership(tenantB.id, userB.id, 'sales', true, 'B');

const [{ data: auditA }, { data: auditApprover }, { data: auditB }] = await Promise.all([
  supabase.from('audit_logs').select('id,company_id,action,entity_type,entity_id,source').eq('company_id', tenantA.id).eq('action', 'e2e_actor_membership_provisioned').eq('entity_id', membershipA.id).limit(1),
  supabase.from('audit_logs').select('id,company_id,action,entity_type,entity_id,source').eq('company_id', tenantA.id).eq('action', 'e2e_actor_membership_provisioned').eq('entity_id', membershipApprover.id).limit(1),
  supabase.from('audit_logs').select('id,company_id,action,entity_type,entity_id,source').eq('company_id', tenantB.id).eq('action', 'e2e_actor_membership_provisioned').eq('entity_id', membershipB.id).limit(1),
]);

assert.ok(auditA?.length, 'E2E_ACTOR_A_AUDIT_MISSING');
assert.ok(auditApprover?.length, 'E2E_APPROVER_AUDIT_MISSING');
assert.ok(auditB?.length, 'E2E_ACTOR_B_AUDIT_MISSING');

const mask = (email) => email.replace(/^(.{2}).*(@.*)$/, '$1***$2');
console.log(JSON.stringify({
  status: 'PASS',
  tenantA: { id: tenantA.id, name: tenantA.name },
  tenantB: { id: tenantB.id, name: tenantB.name },
  actors: {
    A: { id: userA.id, email: mask(userA.email ?? process.env.TEST_USER_A_EMAIL) },
    APPROVER: { id: approver.id, email: mask(approver.email ?? process.env.TEST_APPROVER_EMAIL) },
    B: { id: userB.id, email: mask(userB.email ?? process.env.TEST_USER_B_EMAIL) },
  },
  memberships: {
    A: { id: membershipA.id, role: membershipA.role, active: membershipA.is_active, default: membershipA.is_default },
    APPROVER: { id: membershipApprover.id, role: membershipApprover.role, active: membershipApprover.is_active, default: membershipApprover.is_default },
    B: { id: membershipB.id, role: membershipB.role, active: membershipB.is_active, default: membershipB.is_default },
  },
  audit: { A: auditA[0].id, APPROVER: auditApprover[0].id, B: auditB[0].id },
}, null, 2));
