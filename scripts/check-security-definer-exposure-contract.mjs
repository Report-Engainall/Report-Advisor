import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('supabase/migrations');
const files = fs.readdirSync(root)
  .filter((name) => name.endsWith('.sql'))
  .sort()
  .map((name) => path.join(root, name));

const definitions = new Map();
const authenticatedGrants = [];
const anonGrants = [];

for (const file of files) {
  const sql = fs.readFileSync(file, 'utf8');

  const functionRe = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.([a-zA-Z0-9_]+)\s*\([^)]*\)[\s\S]*?\bSECURITY\s+(DEFINER|INVOKER)\b[\s\S]*?\bSET\s+search_path\s*=\s*([^\s\n]+)[\s\S]*?\bAS\s+\$\$([\s\S]*?)\$\$/gi;
  for (const match of sql.matchAll(functionRe)) {
    definitions.set(match[1], {
      file,
      security: match[2].toUpperCase(),
      searchPath: match[3],
      body: match[4],
    });
  }

  const grantRe = /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.([a-zA-Z0-9_]+)\s*\([^;]*?\)\s+TO\s+(authenticated|anon)\s*;/gi;
  for (const match of sql.matchAll(grantRe)) {
    const entry = { functionName: match[1], role: match[2].toLowerCase(), file };
    if (entry.role === 'authenticated') authenticatedGrants.push(entry);
    else anonGrants.push(entry);
  }
}

const failures = [];
for (const grant of authenticatedGrants) {
  const def = definitions.get(grant.functionName);
  if (!def) {
    failures.push(`${grant.functionName}: authenticated EXECUTE grant has no repository-visible function definition`);
    continue;
  }
  if (def.security !== 'DEFINER') continue;
  if (!/^public$/i.test(def.searchPath)) {
    failures.push(`${grant.functionName}: SECURITY DEFINER authenticated function must pin search_path=public (source ${def.file})`);
  }
  if (!/(auth\.uid\s*\(\)|current_company_id\s*\(\))/i.test(def.body)) {
    failures.push(`${grant.functionName}: SECURITY DEFINER authenticated function lacks an explicit caller/tenant context check`);
  }
}

for (const grant of anonGrants) {
  const def = definitions.get(grant.functionName);
  if (def?.security === 'DEFINER') {
    failures.push(`${grant.functionName}: SECURITY DEFINER function is executable by anon`);
  }
}

if (failures.length) {
  console.error('Security-definer exposure contract: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Security-definer exposure contract: PASS (${authenticatedGrants.length} authenticated grants checked; ${anonGrants.length} anon grants checked)`);
