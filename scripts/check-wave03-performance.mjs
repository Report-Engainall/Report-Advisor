import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const findings = [];
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'coverage'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (/\.(ts|tsx|js|jsx|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
}
const files = walk(path.join(root, 'src'));
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (rel.includes('/pages/') && /\bsupabase\.from\(/.test(text)) findings.push({ type: 'UI_DIRECT_DB', file: rel, severity: 'PRODUCTION_RISK' });
  const queryCalls = (text.match(/\.from\(/g) ?? []).length;
  const rangeCalls = (text.match(/\.range\(/g) ?? []).length;
  if (queryCalls > 3 && rangeCalls === 0 && !rel.includes('/analytics/') && !rel.includes('/businessIntelligence')) findings.push({ type: 'UNBOUNDED_QUERY_REVIEW', file: rel, queryCalls, severity: 'REVIEW' });
  if (/\.map\([^\n]*\.filter\(/.test(text) || /\.reduce\([^\n]*\.reduce\(/.test(text)) findings.push({ type: 'REPEATED_COLLECTION_SCAN_REVIEW', file: rel, severity: 'REVIEW' });
}
const productionRisks = findings.filter(f => f.severity === 'PRODUCTION_RISK');
const report = {
  filesScanned: files.length,
  findings,
  productionRiskCount: productionRisks.length,
  benchmarkRequired: findings.some(f => f.severity === 'REVIEW'),
  methodology: 'static hotspot discovery only; no optimization is certified without before/fix/after benchmark',
};
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'WAVE03_PERFORMANCE_SCAN.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (productionRisks.length) process.exit(1);
console.log('Wave 03 performance deep static gate: PASS (no direct page-to-Supabase consumer detected)');
