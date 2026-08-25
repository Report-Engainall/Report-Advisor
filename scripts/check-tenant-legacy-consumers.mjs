import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
// SQL tenant enforcement is validated independently by the canonical RLS/RPC
// gates. This guard is specifically for application consumers of tenant
// context, where legacy/static values can leak into UI or client data paths.
const TARGETS = ['src'];
const ALLOWED_LEGACY = new Set(['src/lib/supabase.ts']);
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

function isLegacyTenantConsumer(rel, text) {
  if (ALLOWED_LEGACY.has(rel)) return false;
  if (rel === 'src/lib/file-engine/synonyms.ts') return false;

  // The compatibility owner is the only application location where the
  // legacy symbol may exist. Canonical consumers may resolve the active
  // company and pass that value to a query; that is not legacy selection.
  if (/\bCOMPANY_ID\b/.test(text)) return true;

  // Reject static tenant identity or an externally selected tenant value.
  // Canonical `resolveCurrentCompanyId()` results remain valid.
  if (/\b(?:companyId|company_id|tenantId)\s*[:=]\s*['"][0-9a-f-]{16,}['"]/i.test(text)) return true;
  if (/\.(?:eq|neq|in|filter)\s*\(\s*['"]company_id['"]\s*,\s*['"][0-9a-f-]{16,}['"]\s*\)/i.test(text)) return true;
  if (/\.(?:eq|neq|in|filter)\s*\(\s*['"]company_id['"]\s*,\s*(?:selectedCompanyId|selectedTenantId|profile\.company_id|user\.company_id)\s*\)/i.test(text)) return true;

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
  console.error('Unsafe legacy/static application tenant consumers detected:');
  for (const item of findings) console.error(`  ${item.file}`);
  process.exit(1);
}

console.log('PASS: no legacy/static application tenant consumers exist outside the canonical compatibility boundary.');
