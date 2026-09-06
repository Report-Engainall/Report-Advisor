import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrations = [
  'supabase/migrations/20260906200000_bind_report_execution_worker_tenant_context.sql',
  'supabase/migrations/20260906201000_bind_report_execution_recovery_tenant_context.sql',
];

for (const relative of migrations) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const functions = [...source.matchAll(/create or replace function public\.([a-z0-9_]+)\(([^)]*)\)[\s\S]*?returns[\s\S]*?language plpgsql security definer set search_path to 'pg_catalog'[\s\S]*?\$function\$/g)];
  if (!functions.length) throw new Error(`security-definer boundary: no hardened function found in ${relative}`);
  for (const [, name, args] of functions) {
    if (!args.includes('p_company_id uuid')) throw new Error(`security-definer boundary: ${name} lacks explicit tenant parameter`);
    const bodyStart = source.indexOf('$function$', source.indexOf(`function public.${name}`));
    const bodyEnd = source.indexOf('$function$', bodyStart + 10);
    const body = source.slice(bodyStart, bodyEnd);
    if (!/company_id\s*=\s*p_company_id/.test(body)) throw new Error(`security-definer boundary: ${name} lacks company predicate`);
  }
}

console.log('Report execution SECURITY DEFINER boundary: PASS');
console.log(`Audited migrations: ${migrations.length}`);
