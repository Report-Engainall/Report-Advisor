import { createClient } from '@supabase/supabase-js';
import { RUNTIME_EVIDENCE_CONFIG, requireSafeRuntimeEnvironment } from './runtime-evidence-config.mjs';

const environment = requireSafeRuntimeEnvironment();
const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userAEmail = process.env.RUNTIME_EVIDENCE_USER_A_EMAIL;
const userAPassword = process.env.RUNTIME_EVIDENCE_USER_A_PASSWORD;
const userBEmail = process.env.RUNTIME_EVIDENCE_USER_B_EMAIL;
const userBPassword = process.env.RUNTIME_EVIDENCE_USER_B_PASSWORD;

if (!url || !serviceRoleKey || !userAEmail || !userAPassword || !userBEmail || !userBPassword) {
  throw new Error('NOT READY: staging/test environment requires SUPABASE_URL, service-role key, and dedicated User A/B email/password environment variables. Secrets are never committed or printed.');
}
if (environment === 'production' || environment === 'prod') throw new Error('ABORT: seed is forbidden in production.');

const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const A = RUNTIME_EVIDENCE_CONFIG.tenants.a;
const B = RUNTIME_EVIDENCE_CONFIG.tenants.b;
if (!A || !B || A === B) throw new Error('ABORT: runtime evidence tenants must be distinct and non-empty.');

async function findOrCreateUser(email, password) {
  const listed = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listed.error) throw new Error(`Seed user lookup failed: ${listed.error.message}`);
  const existing = listed.data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (existing) return existing.id;
  const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { runtime_evidence_only: true } });
  if (created.error || !created.data.user) throw new Error(`Seed user create failed: ${created.error?.message ?? 'missing user'}`);
  return created.data.user.id;
}

async function findOrCreateCompany(name) {
  const existing = await supabase.from('companies').select('id,name').eq('name', name).maybeSingle();
  if (existing.error) throw new Error(`Seed company lookup failed: ${existing.error.message}`);
  if (existing.data) return existing.data;
  const created = await supabase.from('companies').insert({ name, legal_name: name }).select('id,name').single();
  if (created.error) throw new Error(`Seed company create failed: ${created.error.message}`);
  return created.data;
}

async function assertTenantExclusivity(userAId, userBId, companyAId, companyBId) {
  if (!userAId || !userBId || userAId === userBId) throw new Error('ABORT: User A and User B must be distinct authenticated identities.');
  if (!companyAId || !companyBId || companyAId === companyBId) throw new Error('ABORT: Tenant A and Tenant B must be distinct database identities.');
  for (const [label, userId, allowedCompanyId] of [['A', userAId, companyAId], ['B', userBId, companyBId]]) {
    const memberships = await supabase.from('company_memberships').select('company_id,is_active').eq('user_id', userId);
    if (memberships.error) throw new Error(`ABORT: cannot establish User ${label} membership exclusivity: ${memberships.error.message}`);
    const unauthorized = (memberships.data ?? []).filter((row) => row.company_id !== allowedCompanyId || row.is_active === false);
    if (unauthorized.length) throw new Error(`ABORT: User ${label} has ambiguous or unauthorized tenant membership; refusing to seed. ${JSON.stringify(unauthorized)}`);
  }
}

async function ensureMembership(companyId, userId) {
  const existing = await supabase.from('company_memberships').select('id').eq('company_id', companyId).eq('user_id', userId).maybeSingle();
  if (existing.error) throw new Error(`Seed membership lookup failed: ${existing.error.message}`);
  if (existing.data) {
    const { error } = await supabase.from('company_memberships').update({ is_active: true, is_default: true }).eq('id', existing.data.id);
    if (error) throw new Error(`Seed membership update failed: ${error.message}`);
    return;
  }
  const { error } = await supabase.from('company_memberships').insert({ company_id: companyId, user_id: userId, role: 'member', is_active: true, is_default: true });
  if (error) throw new Error(`Seed membership create failed: ${error.message}`);
}

async function findOrCreateProduct(companyId, suffix) {
  const sku = `RUNTIME-${suffix}-2026`;
  const existing = await supabase.from('products').select('id,sku').eq('company_id', companyId).eq('sku', sku).maybeSingle();
  if (existing.error) throw new Error(`Seed product lookup failed: ${existing.error.message}`);
  if (existing.data) return existing.data;
  const created = await supabase.from('products').insert({ company_id: companyId, sku, name: suffix, unit: 'test', cost_price: 11, selling_price: 17, min_stock: 1, reorder_point: 2, is_active: true }).select('id,sku').single();
  if (created.error) throw new Error(`Seed product create failed: ${created.error.message}`);
  return created.data;
}

const userAId = await findOrCreateUser(userAEmail, userAPassword);
const userBId = await findOrCreateUser(userBEmail, userBPassword);
const companyA = await findOrCreateCompany(A);
const companyB = await findOrCreateCompany(B);
await assertTenantExclusivity(userAId, userBId, companyA.id, companyB.id);
await ensureMembership(companyA.id, userAId);
await ensureMembership(companyB.id, userBId);
await findOrCreateProduct(companyA.id, A);
await findOrCreateProduct(companyB.id, B);

console.log(JSON.stringify({
  status: 'SEEDED_NOT_VERIFIED',
  environment,
  tenants: { A: companyA.id, B: companyB.id },
  users: { A: userAId, B: userBId },
  sentinelProducts: ['RUNTIME-A-2026', 'RUNTIME-B-2026'],
}, null, 2));
