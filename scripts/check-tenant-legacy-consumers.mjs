import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGETS = [
  'src',
  'scripts',
  'supabase',
];
const ALLOWED_LEGACY = new Set([
  'src/pages/EntityPages.tsx',
  'src/lib/supabase.ts',
]);
const PATTERNS = [
  /\bCOMPANY_ID\b/g,
  /\bactiveCompanyId\b/g,
];
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

const findings = [];
for (const root of TARGETS) {
  for (const file of walk(path.join(ROOT, root))) {
    const rel = path.relative(ROOT, file).replaceAll(path.sep, '/');
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of PATTERNS) {
      for (const match of text.matchAll(pattern)) {
        const before = text.slice(0, match.index);
        const line = before.split('\n').length;
        findings.push({ file: rel, line, token: match[0] });
      }
    }
  }
}

const unexpected = findings.filter((f) => !ALLOWED_LEGACY.has(f.file));
const legacy = findings.filter((f) => ALLOWED_LEGACY.has(f.file));

console.log(`Tenant legacy audit: ${findings.length} legacy/context references found.`);
for (const item of legacy) console.log(`  ALLOWED-LEGACY ${item.file}:${item.line} ${item.token}`);

if (unexpected.length) {
  console.error('Unexpected tenant compatibility references detected:');
  for (const item of unexpected) console.error(`  ${item.file}:${item.line} ${item.token}`);
  process.exit(1);
}

console.log('PASS: no new tenant compatibility consumers were introduced outside the documented migration boundary.');
