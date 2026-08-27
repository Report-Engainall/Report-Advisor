import fs from 'node:fs';
import path from 'node:path';

const roots = ['src', 'supabase/migrations', 'scripts'];
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|mjs|sql)$/.test(entry.name)) files.push(p);
  }
}
for (const root of roots) walk(root);

const findings = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (/\b(?:unknown|missing|null|undefined)\b[^\n]{0,100}(?:\?\?|coalesce)\s*\(?\s*0\b/i.test(line) || /(?:coalesce|\?\?)\s*\(?\s*0\b[^\n]{0,100}\b(?:unknown|missing|null|undefined)\b/i.test(line)) {
      findings.push(`${file}:${i + 1}: possible missing/unknown→zero coercion: ${line.trim()}`);
    }
    if (/\b(?:impact|accuracy|expected|actual|cost|revenue)\b[^\n]{0,100}(?:\?\?|coalesce)\s*\(?\s*0\b/i.test(line)) {
      findings.push(`${file}:${i + 1}: possible financial/outcome missing→zero coercion: ${line.trim()}`);
    }
  });
}

const allowlist = new Set([
  'src/lib/dashboard-canonical.ts',
]);
const actionable = findings.filter((f) => ![...allowlist].some((p) => f.startsWith(p + ':')));
if (actionable.length) {
  console.error(`Semantic truth conversion scan found ${actionable.length} potential violation(s):`);
  for (const finding of actionable) console.error(finding);
  process.exit(1);
}
console.log(`Semantic truth conversion scan: PASS (${files.length} source files scanned; no unapproved missing/unknown→zero pattern found)`);
