import { createClient } from '@supabase/supabase-js';
import { RUNTIME_EVIDENCE_CONFIG, requireSafeRuntimeEnvironment } from './runtime-evidence-config.mjs';

const environment = requireSafeRuntimeEnvironment();
const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userAId = process.env.RUNTIME_EVIDENCE_USER_A_ID;
const userBId = process.env.RUNTIME_EVIDENCE_USER_B_ID;

if (!url || !serviceRoleKey || !userAId || !userBId) {
  throw new Error('NOT READY: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RUNTIME_EVIDENCE_USER_A_ID, and RUNTIME_EVIDENCE_USER_B_ID are required in the staging/test environment.');
}

if (environment === 'production' || environment === 'prod') throw new Error('ABORT: seed is forbidden in production.');

const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const A = RUNTIME_EVIDENCE_CONFIG.tenants.a;
const B = RUNTIME_EVIDENCE_CONFIG.tenants.b;

async function findOrCreateCompany(name) {
  const existing = await supabase.from('companies').select('id,name').eq('name', name).maybeSingle();
  if (existing.error) throw new Error(`Seed company lookup failed: ${existing.error.message}`);
  if (existing.data) return existing.data;
  const created = await supabase.from('companies').insert({ name, legal_name: name }).select('id,name').single();
  if (created.error) throw new Error(`Seed company create failed: ${created.error.message}`);
  return created.data;
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
  const created = await supabase.from('products').insert({
    company_id: companyId,
    sku,
    name: suffix,
    unit: 'test',
    cost_price: 11,
    selling_price: 17,
    min_stock: 1,
    reorder_point: 2,
    is_active: true,
  }).select('id,sku').single();
  if (created.error) throw new Error(`Seed product create failed: ${created.error.message}`);
  return created.data;
}

const companyA = await findOrCreateCompany(A);
const companyB = await findOrCreateCompany(B);
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
