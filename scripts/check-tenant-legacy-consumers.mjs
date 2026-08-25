import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
// SQL tenant enforcement is validated independently by the canonical RLS/RPC
// gates. This guard covers application and executable runtime scripts where
// legacy/static values can leak into UI, data, or automation paths.
const TARGETS = ['src', 'scripts'];
const ALLOWED_LEGACY = new Set(['src/lib/supabase.ts']);
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

function isLegacyTenantConsumer(rel, text) {
  if (ALLOWED_LEGACY.has(rel) || ALLOWED_SELF.has(rel)) return false;
  if (rel === 'src/lib/file-engine/synonyms.ts') return false;
  // check-* files are static-analysis contracts. Their literal markers are
  // intentionally inspected and must not be classified as runtime consumers.
  if (/^scripts\/check-[^/]+\.mjs$/.test(rel)) return false;

  if (/\bCOMPANY_ID\b/.test(text)) return true;
  if (/\btenant_memberships\b/i.test(text)) return true;
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
  console.error('Unsafe legacy/static application or runtime tenant consumers detected:');
  for (const item of findings) console.error(`  ${item.file}`);
  process.exit(1);
}

console.log('PASS: no legacy/static application or runtime-script tenant consumers exist outside the canonical compatibility boundary.');
