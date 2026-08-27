import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationsRoot = path.join(root, 'supabase/migrations');
const findings = [];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, out);
    else if (entry.name.endsWith('.sql')) out.push(file);
  }
  return out;
}

// A SECURITY DEFINER RPC that accepts tenant identity from its caller is a
// high-risk sibling of the browser tenant-source problem. It must either
// derive tenant authority from current_company_id() or explicitly document a
// trusted internal tenant boundary. This guard intentionally does not flag
// ordinary SECURITY INVOKER SQL or data rows carrying company_id.
const files = walk(migrationsRoot);
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  if (!/SECURITY\s+DEFINER/i.test(text)) continue;
  const rel = path.relative(root, file).replaceAll(path.sep, '/');
  const acceptsCallerTenant = /\b(?:p_company_id|p_tenant_id|company_id\s+uuid|tenant_id\s+uuid)\b/i.test(text);
  if (!acceptsCallerTenant) continue;

  const derivesTenant = /current_company_id\s*\(\s*\)/i.test(text);
  const explicitlyTrusted = /TENANT_AUTHORITY:\s*TRUSTED_INTERNAL/i.test(text);
  if (!derivesTenant && !explicitlyTrusted) {
    findings.push(`${rel}: SECURITY DEFINER accepts tenant identity without current_company_id() or explicit TRUSTED_INTERNAL boundary`);
  }
}

if (findings.length) {
  console.error('TENANT SIBLING BOUNDARY: FAIL');
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`TENANT SIBLING BOUNDARY: PASS (${files.length} SQL migrations scanned)`);
console.log('No SECURITY DEFINER tenant-identity boundary bypass was detected.');
