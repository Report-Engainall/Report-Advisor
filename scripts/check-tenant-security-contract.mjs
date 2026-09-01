import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const migrations = files.map((file) => ({ file, text: fs.readFileSync(path.join(dir, file), 'utf8') }));

const resolverCandidates = migrations.filter(({ text }) =>
  /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+(?:public\.)?current_company_id\s*\(/i.test(text),
);
const resolver = resolverCandidates.at(-1);
const failClosedCandidates = migrations.filter(({ file }) => file.includes('import_rpc_fail_closed'));
if (!resolver) throw new Error('Canonical tenant resolver migration is missing');
if (failClosedCandidates.length === 0) throw new Error('Import RPC fail-closed migration is missing');

for (const marker of ['CREATE TABLE IF NOT EXISTS company_memberships', 'REFERENCES auth.users(id)', 'auth.uid()', 'company_memberships', 'is_active']) {
  if (!resolver.text.includes(marker)) throw new Error(`Tenant security contract missing from latest resolver ${resolver.file}: ${marker}`);
}

if (!/cm\.user_id\s*=\s*auth\.uid\(\)[\s\S]*?cm\.is_active\s*=\s*true/i.test(resolver.text) &&
    !/user_id\s*=\s*v_user[\s\S]*?is_active/i.test(resolver.text)) {
  throw new Error(`Latest tenant resolver ${resolver.file} does not enforce active membership for auth.uid()`);
}
if (!/SELECT\s+count\(\*\),\s*min\(company_id\)[\s\S]*?FROM\s+company_memberships[\s\S]*?WHERE\s+user_id\s*=\s*v_user[\s\S]*?is_active/i.test(resolver.text)) {
  throw new Error(`Latest tenant resolver ${resolver.file} is missing the canonical bounded membership resolution`);
}
if (!/v_count\s*=\s*1[\s\S]*?RETURN\s+v_company/i.test(resolver.text)) {
  throw new Error(`Latest tenant resolver ${resolver.file} does not fail closed on ambiguous membership`);
}

if (/CREATE POLICY[^;]+TO\s+anon[^;]+USING\s*\(\s*true\s*\)/is.test(resolver.text)) throw new Error('Permissive anonymous tenant policy detected');
if (/CREATE POLICY[^;]+TO\s+authenticated[^;]+USING\s*\(\s*true\s*\)/is.test(resolver.text)) throw new Error('Permissive authenticated tenant policy detected');

const failClosed = failClosedCandidates.find(({ text }) => text.includes('IMPORT_RPC_TENANT_AUTH_NOT_CONFIGURED'));
if (!failClosed) throw new Error(`Import RPC fail-closed contract missing from matching migrations: ${failClosedCandidates.map(({ file }) => file).join(', ')}`);

console.log(`Tenant security contract: PASS (latest-resolver=${resolver.file}, historical-resolver-definitions=${resolverCandidates.length}, fail-closed=${failClosed.file})`);
