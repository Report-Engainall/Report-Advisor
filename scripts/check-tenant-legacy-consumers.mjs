import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGETS = ['src', 'scripts', 'supabase'];
const ALLOWED_LEGACY = new Set(['src/lib/supabase.ts']);
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|js|mjs|sql)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function isActualLegacyTenantConsumer(rel, text) {
  if (ALLOWED_LEGACY.has(rel)) return false;
  if (rel.startsWith('scripts/')) return false;
  if (rel === 'src/lib/file-engine/synonyms.ts') return false;

  // Read-only compatibility consumers remain safe under canonical RLS and are
  // being migrated separately. The hard boundary here is write-path leakage:
  // a legacy COMPANY_ID must never be passed into a write RPC or mutation.
  const writePatterns = [
    /p_company_id\s*:\s*COMPANY_ID\b/,
    /\.(?:insert|update|upsert|delete)\s*\([^\n]*COMPANY_ID\b/,
    /\.(?:rpc)\s*\([^\n]*[\s\S]{0,300}COMPANY_ID\b/,
  ];
  return writePatterns.some((pattern) => pattern.test(text));
}

const findings = [];
for (const root of TARGETS) {
  for (const file of walk(path.join(ROOT, root))) {
    const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
    const text = fs.readFileSync(file, 'utf8');
    if (!isActualLegacyTenantConsumer(rel, text)) continue;
    findings.push({ file: rel });
  }
}

if (findings.length) {
  console.error('Unsafe legacy tenant write consumers detected:');
  for (const item of findings) console.error(`  ${item.file}`);
  process.exit(1);
}

console.log('PASS: no unsafe legacy COMPANY_ID tenant write consumers exist outside the compatibility boundary.');
