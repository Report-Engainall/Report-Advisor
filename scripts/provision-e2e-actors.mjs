import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const required = [
  'REPORT_ADVISOR_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
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

function runId() {
  return String(process.env.GITHUB_RUN_ID || process.env.E2E_ACTOR_RUN_ID || Date.now()).replace(/[^0-9]/g, '');
}

function actorCredentials(label) {
  const normalized = label.toLowerCase();
  const suffix = runId();
  const email = 'e2e-' + normalized + '-' + suffix + '@e2e.report-advisor.invalid';
  const password = 'E2e-' + normalized + '-' + randomBytes(24).toString('base64url') + '!';
  return { email, password, generated: true };
}

function persistActorCredentials(label, email, password) {
  const fields = label === 'A'
    ? { email: 'TEST_USER_A_EMAIL', password: 'TEST_USER_A_PASSWORD' }
    : label === 'B'
      ? { email: 'TEST_USER_B_EMAIL', password: 'TEST_USER_B_PASSWORD' }
      : { email: 'TEST_APPROVER_EMAIL', password: 'TEST_APPROVER_PASSWORD' };

  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, fields.email + '=' + email + '\n' + fields.password + '=' + password + '\n');
  }
  process.env[fields.email] = email;
  process.env[fields.password] = password;
}

async function createActor(email, password) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: ACTOR_METADATA,
  });
  if (error) throw error;
  assert.ok(data.user?.id, 'E2E_ACTOR_ID_REQUIRED');
  return data.user;
}

async function ensureActor(email, password, label) {
  let resolvedEmail = email?.trim();
  let resolvedPassword = password;
  let generated = false;

  if (!resolvedEmail || !resolvedPassword) {
    const generatedCredentials = actorCredentials(label);
    resolvedEmail = generatedCredentials.email;
    resolvedPassword = generatedCredentials.password;
    generated = true;
  }

  let user = await findUserByEmail(resolvedEmail);
  if (!user) {
    user = await createActor(resolvedEmail, resolvedPassword);
    generated = true;
  } else {
    const metadata = user.user_metadata ?? {};
    const tagged = metadata.e2e_actor === 'true' && metadata.e2e_purpose === ACTOR_METADATA.e2e_purpose;
    if (!tagged) {
      const generatedCredentials = actorCredentials(label);
      resolvedEmail = generatedCredentials.email;
      resolvedPassword = generatedCredentials.password;
      user = await createActor(resolvedEmail, resolvedPassword);
      generated = true;
    }
  }

  if (generated) persistActorCredentials(label, resolvedEmail, resolvedPassword);
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

function ensureApproverCredentials() {
  const existingEmail = process.env.TEST_APPROVER_EMAIL?.trim();
  const existingPassword = process.env.TEST_APPROVER_PASSWORD;
  if (existingEmail && existingPassword) return { email: existingEmail, password: existingPassword, generated: false };

  const runId = String(process.env.GITHUB_RUN_ID || process.env.E2E_APPROVER_RUN_ID || Date.now()).replace(/[^0-9]/g, '');
  const email = 'e2e-approver-' + runId + '@e2e.report-advisor.invalid';
  const password = 'E2e-AppR0ver-' + runId.slice(-12) + '-Ra7!';
  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, 'TEST_APPROVER_EMAIL=' + email + '\nTEST_APPROVER_PASSWORD=' + password + '\n');
  }
  return { email, password, generated: true };
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

async function prepareTransactionalFixture(companyId, actorId) {
  const fixtureKey = 'E2E-ORDER-B-001';
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id,company_id,status,warehouse_id,order_number,idempotency_key')
    .eq('company_id', companyId)
    .eq('idempotency_key', fixtureKey)
    .maybeSingle();
  if (orderError) throw orderError;
  if (!order) throw new Error('E2E_ORDER_FIXTURE_MISSING');

  if (order.status === 'pending') {
    if (process.env.GITHUB_ENV) fs.appendFileSync(process.env.GITHUB_ENV, 'E2E_TRANSACTION_ORDER_IDEMPOTENCY_KEY=' + fixtureKey + '\n');
    return order;
  }

  const { data: items, error: itemError } = await supabase
    .from('order_items')
    .select('product_id,quantity')
    .eq('company_id', companyId)
    .eq('order_id', order.id);
  if (itemError) throw itemError;

  for (const item of items ?? []) {
    const { data: balance, error: balanceError } = await supabase
      .from('inventory_balances')
      .select('id,quantity')
      .eq('company_id', companyId)
      .eq('warehouse_id', order.warehouse_id)
      .eq('product_id', item.product_id)
      .maybeSingle();
    if (balanceError) throw balanceError;
    if (!balance) throw new Error('E2E_RESET_INVENTORY_BALANCE_MISSING');

    const nextQuantity = Number(balance.quantity) + Number(item.quantity);
    const { error: updateBalanceError } = await supabase
      .from('inventory_balances')
      .update({ quantity: nextQuantity, last_movement_date: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() })
      .eq('id', balance.id)
      .eq('company_id', companyId);
    if (updateBalanceError) throw updateBalanceError;

    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        company_id: companyId,
        warehouse_id: order.warehouse_id,
        product_id: item.product_id,
        movement_type: 'return',
        quantity: item.quantity,
        reference_type: 'e2e_order_reset',
        reference_id: order.id,
        movement_date: new Date().toISOString().slice(0, 10),
        notes: 'Repeatable browser E2E reset',
      });
    if (movementError) throw movementError;
  }

  const { data: invoices, error: invoiceError } = await supabase
    .from('sales_invoices')
    .select('id,created_at')
    .eq('company_id', companyId)
    .eq('order_id', order.id)
    .order('created_at', { ascending: false });
  if (invoiceError) throw invoiceError;

  for (const invoice of invoices ?? []) {
    const { error: paymentDeleteError } = await supabase
      .from('payments')
      .delete()
      .eq('company_id', companyId)
      .eq('invoice_id', invoice.id);
    if (paymentDeleteError) throw paymentDeleteError;

    const { error: invoiceDeleteError } = await supabase
      .from('sales_invoices')
      .delete()
      .eq('company_id', companyId)
      .eq('id', invoice.id);
    if (invoiceDeleteError) throw invoiceDeleteError;
  }

  const { error: historyError } = await supabase.from('order_status_history').insert({
    company_id: companyId,
    order_id: order.id,
    from_status: order.status,
    to_status: 'pending',
    actor_id: actorId,
  });
  if (historyError) throw historyError;

  const { data: preparedOrder, error: updateOrderError } = await supabase
    .from('orders')
    .update({ status: 'pending', updated_at: new Date().toISOString() })
    .eq('company_id', companyId)
    .eq('id', order.id)
    .select('id,company_id,status,warehouse_id,customer_id,order_number,total,currency,idempotency_key')
    .single();
  if (updateOrderError) throw updateOrderError;

  const { error: outboxError } = await supabase.from('order_outbox_events').insert({
    company_id: companyId,
    order_id: order.id,
    event_type: 'order.e2e_reset',
    payload: { order_id: order.id, order_number: order.order_number },
  });
  if (outboxError) throw outboxError;

  const { error: auditError } = await supabase.from('audit_logs').insert({
    company_id: companyId,
    action: 'order_e2e_reset',
    entity_type: 'order',
    entity_id: order.id,
    old_value: { status: order.status },
    new_value: { status: 'pending' },
    source: 'e2e-provisioning',
  });
  if (auditError) throw auditError;

  if (process.env.GITHUB_ENV) fs.appendFileSync(process.env.GITHUB_ENV, 'E2E_TRANSACTION_ORDER_IDEMPOTENCY_KEY=' + fixtureKey + '\n');
  return preparedOrder;
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

const approverCredentials = ensureApproverCredentials();
const userA = await ensureActor(process.env.TEST_USER_A_EMAIL, process.env.TEST_USER_A_PASSWORD, 'A');
const userB = await ensureActor(process.env.TEST_USER_B_EMAIL, process.env.TEST_USER_B_PASSWORD, 'B');
const approver = await ensureActor(approverCredentials.email, approverCredentials.password, 'APPROVER');

assert.notEqual(userA.id, approver.id, 'APPROVER_MUST_DIFFER_FROM_REQUESTER');
assert.notEqual(userA.id, userB.id, 'USER_A_AND_USER_B_MUST_DIFFER');
assert.notEqual(userB.id, approver.id, 'USER_B_AND_APPROVER_MUST_DIFFER');

const tenantA = await findTenantA();
const tenantB = await findTenantB();
assert.notEqual(String(tenantA.id), String(tenantB.id), 'TENANT_A_AND_B_MUST_BE_DISTINCT');

const membershipA = await provisionMembership(tenantA.id, userA.id, 'sales', true, 'A');
const membershipApprover = await provisionMembership(tenantA.id, approver.id, 'manager', true, 'APPROVER');
const membershipB = await provisionMembership(tenantB.id, userB.id, 'sales', true, 'B');
const transactionFixture = await prepareTransactionalFixture(tenantA.id, userA.id);

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
  approverCredentials: { generated: approverCredentials.generated },
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
