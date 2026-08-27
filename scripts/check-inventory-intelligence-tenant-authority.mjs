import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationPath = path.join(root, 'supabase', 'migrations', '20260826093000_inventory_intelligence_tenant_authority.sql');
const demandOverridePath = path.join(root, 'supabase', 'migrations', '20260827173000_inventory_demand_explicit_tenant.sql');
const migration = fs.readFileSync(migrationPath, 'utf8');
const demandOverride = fs.readFileSync(demandOverridePath, 'utf8');
const failures = [];

const baseFunctions = [
  ['inventory_liquidity_velocity', 'inventory_liquidity_velocity(uuid,date,integer)', 'GRANT EXECUTE ON FUNCTION public.inventory_liquidity_velocity(date,integer) TO authenticated;'],
  ['cash_liquidity_snapshot', 'cash_liquidity_snapshot(uuid,date,date)', 'GRANT EXECUTE ON FUNCTION public.cash_liquidity_snapshot(date,date) TO authenticated;'],
];

function definition(source, name) {
  const start = source.indexOf(`CREATE OR REPLACE FUNCTION public.${name}`);
  if (start < 0) return '';
  const end = source.indexOf('\n$$;', start);
  return end < 0 ? source.slice(start) : source.slice(start, end + 4);
}

for (const [name, oldSignature, grant] of baseFunctions) {
  const body = definition(migration, name);
  if (!body) failures.push(`${name}: definition missing`);
  else if (!body.includes('public.current_company_id()')) failures.push(`${name}: own definition does not derive tenant from current_company_id()`);
  if (!migration.includes(`DROP FUNCTION IF EXISTS public.${oldSignature};`)) failures.push(`${name}: explicit old-signature drop missing`);
  if (!migration.includes(grant)) failures.push(`${name}: matching authenticated grant missing`);
}

const demand = definition(demandOverride, 'demand_reorder_snapshot');
if (!demand) failures.push('demand_reorder_snapshot: effective override definition missing');
else if (!demand.includes('public.current_company_id()')) failures.push('demand_reorder_snapshot: effective definition does not resolve current tenant');
if (!demandOverride.includes('REVOKE ALL ON FUNCTION public.demand_reorder_snapshot(date,integer,numeric,numeric) FROM PUBLIC;')) failures.push('demand_reorder_snapshot: effective PUBLIC revoke missing');
if (!demandOverride.includes('GRANT EXECUTE ON FUNCTION public.demand_reorder_snapshot(date,integer,numeric,numeric) TO authenticated;')) failures.push('demand_reorder_snapshot: effective authenticated grant missing');
if (/p_company_id\s+uuid/i.test(migration) || /p_company_id\s+uuid/i.test(demandOverride)) failures.push('inventory intelligence migrations must not introduce caller-supplied p_company_id');
if (/SECURITY\s+DEFINER/i.test(migration) || /SECURITY\s+DEFINER/i.test(demandOverride)) failures.push('inventory intelligence RPCs must remain SECURITY INVOKER');

if (failures.length) {
  console.error('INVENTORY_INTELLIGENCE_TENANT_AUTHORITY_FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('INVENTORY_INTELLIGENCE_TENANT_AUTHORITY_PASS: effective RPC definitions derive tenant per function and restrict execution');
