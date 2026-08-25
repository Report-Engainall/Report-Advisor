import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
// SQL tenant enforcement is validated independently by canonical RLS/RPC
// gates. This guard covers executable application/runtime consumers where
// legacy, static, or client-selected tenant values can leak into data paths.
const TARGETS = ['src', 'scripts'];
const ALLOWED_SELF = new Set(['scripts/check-tenant-legacy-consumers.mjs']);
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');
}

function hasAuthoritativeCompanyResolution(code) {
  return /(?:const|let|var)\s+companyId\s*=\s*await\s+resolveCurrentCompanyId\s*\(\s*\)/.test(code)
    || /(?:const|let|var)\s+companyId\s*:\s*string\s*=\s*await\s+resolveCurrentCompanyId\s*\(\s*\)/.test(code);
}

function isLegacyTenantConsumer(rel, text) {
  if (ALLOWED_SELF.has(rel)) return false;
  if (rel === 'src/lib/file-engine/synonyms.ts') return false;
  if (/^scripts\/check-[^/]+\.mjs$/.test(rel)) return false;

  const code = stripComments(text);
  const authoritativeCompanyId = hasAuthoritativeCompanyResolution(code);

  if (/\bCOMPANY_ID\b/.test(code)) return true;
  if (/\b(?:setCompanyId|clearCompanyId|getCompanyId)\b/.test(code)) return true;
  if (/\btenant_memberships\b/i.test(code)) return true;

  if (/\b(?:companyId|company_id|tenantId|tenant_id)\s*[:=]\s*['"][0-9a-f-]{16,}['"]/i.test(code)) return true;
  if (/\b(?:VITE_|NEXT_PUBLIC_|PUBLIC_)?(?:COMPANY_ID|TENANT_ID)\s*[:=]/i.test(code)) return true;
  if (/\b(?:companyId|company_id|tenantId|tenant_id)\s*=\s*(?:process\.env\.|import\.meta\.env\.)/i.test(code)) return true;

  // A database-resolved companyId may be used as defense-in-depth filtering;
  // the database/RLS remains authoritative. Client-selected IDs are forbidden.
  if (/\.(?:eq|neq|in|filter)\s*\(\s*['"](?:company_id|tenant_id)['"]\s*,\s*(?:selectedCompanyId|selectedTenantId|profile\.company_id|user\.company_id)\s*\)/i.test(code)) return true;
  if (/\.(?:eq|neq|in|filter)\s*\(\s*['"](?:company_id|tenant_id)['"]\s*,\s*(?:companyId|tenantId)\s*\)/i.test(code) && !authoritativeCompanyId) return true;

  if (/\.(?:eq|neq|in|filter)\s*\(\s*['"](?:company_id|tenant_id)['"]\s*,\s*['"][0-9a-f-]{16,}['"]\s*\)/i.test(code)) return true;

  return false;
}

const findings = [];
for (const root of TARGETS) {
  for (const file of walk(path.join(ROOT, root))) {
    const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
    const text = fs.readFileSync(file, 'utf8');
    if (!isLegacyTenantConsumer(rel, text)) continue;
    findings.push({ file: rel });
  }
}

if (findings.length) {
  console.error('Unsafe legacy/static/client-selected tenant consumers detected:');
  for (const item of findings) console.error(`  ${item.file}`);
  process.exit(1);
}

console.log('PASS: no legacy/static/client-selected application or runtime tenant consumers exist; tenant state is database-authoritative.');
