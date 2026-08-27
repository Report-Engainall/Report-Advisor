import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migration = path.join(root, 'supabase', 'migrations', '20260826093000_inventory_intelligence_tenant_authority.sql');
const source = fs.readFileSync(migration, 'utf8');
const failures = [];

const functions = [
  ['inventory_liquidity_velocity', 'inventory_liquidity_velocity(uuid,date,integer)', 'GRANT EXECUTE ON FUNCTION public.inventory_liquidity_velocity(date,integer) TO authenticated;'],
  ['demand_reorder_snapshot', 'demand_reorder_snapshot(uuid,date,integer,numeric,numeric)', 'GRANT EXECUTE ON FUNCTION public.demand_reorder_snapshot(date,integer,numeric,numeric) TO authenticated;'],
  ['cash_liquidity_snapshot', 'cash_liquidity_snapshot(uuid,date,date)', 'GRANT EXECUTE ON FUNCTION public.cash_liquidity_snapshot(date,date) TO authenticated;'],
];

function definition(name) {
  const start = source.indexOf(`CREATE OR REPLACE FUNCTION public.${name}`);
  if (start < 0) return '';
  const end = source.indexOf('\n$$;', start);
  return end < 0 ? source.slice(start) : source.slice(start, end + 4);
}

for (const [name, oldSignature, grant] of functions) {
  const body = definition(name);
  if (!body) failures.push(`${name}: definition missing`);
  else if (!body.includes('public.current_company_id()')) failures.push(`${name}: own definition does not derive tenant from current_company_id()`);
  if (!source.includes(`DROP FUNCTION IF EXISTS public.${oldSignature};`)) failures.push(`${name}: explicit old-signature drop missing`);
  if (!source.includes(grant)) failures.push(`${name}: matching authenticated grant missing`);
}

if (/p_company_id\s+uuid/i.test(source)) failures.push('inventory intelligence migration must not introduce caller-supplied p_company_id');
if (/SECURITY\s+DEFINER/i.test(source)) failures.push('inventory intelligence RPCs must remain SECURITY INVOKER');

if (failures.length) {
  console.error('INVENTORY_INTELLIGENCE_TENANT_AUTHORITY_FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('INVENTORY_INTELLIGENCE_TENANT_AUTHORITY_PASS: each RPC derives its own tenant and has its own authenticated grant');
