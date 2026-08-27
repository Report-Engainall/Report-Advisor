import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const exportFiles = [];
const forbiddenNames = /\b(?:exportAll|exportAllData|exportEverything)\b/;
const pageAggregation = /(?:\.reduce\s*\(|\.map\s*\([^)]*=>[^)]*(?:sum|total|count))/;
const paginationSignals = /(?:pageSize|pageIndex|currentPage|offset|from\s*[:=]|to\s*[:=])/;

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)) exportFiles.push(full);
  }
}

walk(src);

const findings = [];
for (const file of exportFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replaceAll(path.sep, '/');
  if (!/(?:export|download|csv|xlsx|excel|report)/i.test(rel + text)) continue;

  if (forbiddenNames.test(text)) {
    findings.push(`${rel}: ambiguous exportAll-style API name`);
  }

  const exportLike = /(?:export|download|toCsv|toJSON|toJson|toExcel|toXlsx|reportTo)/i.test(text);
  if (exportLike && pageAggregation.test(text) && paginationSignals.test(text)) {
    findings.push(`${rel}: export-related code combines pagination signals with client aggregation; classify as view export or migrate to canonical full/filtered truth`);
  }
}

const manifest = path.join(src, 'lib/free-toolbox/export-manifest.ts');
if (!fs.existsSync(manifest)) findings.push('src/lib/free-toolbox/export-manifest.ts: missing export manifest');
else {
  const text = fs.readFileSync(manifest, 'utf8');
  for (const required of ['ExportManifest', 'createExportManifest', 'evidenceCount', 'warningCount']) {
    if (!text.includes(required)) findings.push(`export manifest missing required contract token: ${required}`);
  }
}

if (findings.length) {
  console.error('EXPORT_TRUTH_CONTRACT: FAIL');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`EXPORT_TRUTH_CONTRACT: PASS (${exportFiles.length} source files scanned)`);
console.log('Required distinction: current-view export vs full dataset vs filtered full dataset must remain explicit.');
