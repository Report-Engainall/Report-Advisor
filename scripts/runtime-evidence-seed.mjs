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

async function upsertCompany(name) {
  const { data, error } = await supabase.from('companies').upsert({ name, legal_name: name }, { onConflict: 'name' }).select('id,name').single();
  if (error) throw new Error(`Seed company failed: ${error.message}`);
  return data;
}

async function ensureMembership(companyId, userId) {
  const { error } = await supabase.from('company_memberships').upsert(
    { company_id: companyId, user_id: userId, role: 'member', is_active: true, is_default: true },
    { onConflict: 'company_id,user_id' },
  );
  if (error) throw new Error(`Seed membership failed: ${error.message}`);
}

async function upsertProduct(companyId, suffix) {
  const { error } = await supabase.from('products').upsert({
    company_id: companyId,
    sku: `RUNTIME-${suffix}-2026`,
    name: suffix,
    unit: 'test',
    cost_price: 11,
    selling_price: 17,
    min_stock: 1,
    reorder_point: 2,
    is_active: true,
  }, { onConflict: 'company_id,sku' });
  if (error) throw new Error(`Seed product failed: ${error.message}`);
}

const companyA = await upsertCompany(A);
const companyB = await upsertCompany(B);
await ensureMembership(companyA.id, userAId);
await ensureMembership(companyB.id, userBId);
await upsertProduct(companyA.id, A);
await upsertProduct(companyB.id, B);

console.log(JSON.stringify({
  status: 'SEEDED_NOT_VERIFIED',
  environment,
  tenants: { A: companyA.id, B: companyB.id },
  users: { A: userAId, B: userBId },
  sentinelProducts: [`RUNTIME-A-2026`, `RUNTIME-B-2026`],
}, null, 2));
