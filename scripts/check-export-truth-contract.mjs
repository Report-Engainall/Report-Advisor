import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)) files.push(full);
  }
}

walk(src);

const findings = [];
const forbiddenNames = /\b(?:exportAll|exportAllData|exportEverything)\b/;
const pagination = /\b(?:pageSize|pageIndex|currentPage|offset|limit)\b/;
const clientAggregation = /\.reduce\s*\(|\b(?:sum|total|count)\s*[:=]/;
const exportOperation = /\b(?:export|download|toCsv|toJSON|toJson|toExcel|toXlsx|reportTo)\b/i;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replaceAll(path.sep, '/');
  if (!exportOperation.test(text + rel)) continue;

  if (forbiddenNames.test(text)) findings.push(`${rel}: ambiguous exportAll-style API name`);
  if (pagination.test(text) && clientAggregation.test(text) && exportOperation.test(text)) {
    findings.push(`${rel}: export code mixes pagination signals with client aggregation; classify as view export or route through canonical truth`);
  }
}

const manifest = path.join(src, 'lib/free-toolbox/export-manifest.ts');
if (!fs.existsSync(manifest)) findings.push('missing export manifest');
else {
  const text = fs.readFileSync(manifest, 'utf8');
  for (const required of ['ExportManifest', 'createExportManifest', 'evidenceCount', 'warningCount']) {
    if (!text.includes(required)) findings.push(`export manifest missing ${required}`);
  }
}

if (findings.length) {
  console.error('EXPORT_TRUTH_CONTRACT: FAIL');
  findings.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log(`EXPORT_TRUTH_CONTRACT: PASS (${files.length} source files scanned)`);
console.log('Export classes remain explicit: CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET.');
