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
const scopeDeclaration = /\b(?:EXPORT_SCOPE|[A-Z0-9_]+_EXPORT_SCOPE|REPORT_DOWNLOAD_SCOPE)\b\s*[:=]\s*['"](?:CURRENT_VIEW|FULL_DATASET|FILTERED_FULL_DATASET)['"]/;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replaceAll(path.sep, '/');
  if (!exportOperation.test(text + rel)) continue;

  if (forbiddenNames.test(text)) findings.push(`${rel}: ambiguous exportAll-style API name`);
  if (pagination.test(text) && clientAggregation.test(text) && exportOperation.test(text)) {
    findings.push(`${rel}: export code mixes pagination signals with client aggregation; classify as view export or route through canonical truth`);
  }

  const declaresExporter = /\bexport\s+(?:async\s+)?function\s+(?:export|download|toCsv|toJSON|toJson|toExcel|toXlsx|reportTo)/i.test(text);
  const materializesDownload = /\b(?:download|renderArtifact|Blob|createObjectURL)\b/i.test(text);
  if ((declaresExporter || materializesDownload) && !scopeDeclaration.test(text)) {
    findings.push(`${rel}: exporter function has no explicit CURRENT_VIEW/FULL_DATASET/FILTERED_FULL_DATASET scope declaration`);
  }
}

const manifest = path.join(src, 'lib/free-toolbox/export-manifest.ts');
if (!fs.existsSync(manifest)) findings.push('missing export manifest');
else {
  const text = fs.readFileSync(manifest, 'utf8');
  for (const required of ['ExportManifest', 'ExportScope', 'createExportManifest', 'CURRENT_VIEW', 'FULL_DATASET', 'FILTERED_FULL_DATASET', 'evidenceCount', 'warningCount']) {
    if (!text.includes(required)) findings.push(`export manifest missing ${required}`);
  }
}

const reportExporter = path.join(src, 'lib/free-toolbox/report-export.ts');
if (fs.existsSync(reportExporter)) {
  const text = fs.readFileSync(reportExporter, 'utf8');
  if (!text.includes("REPORT_EXPORT_SCOPE: ExportScope = 'CURRENT_VIEW'")) findings.push('report-export.ts is not explicitly classified as CURRENT_VIEW');
}

const browserReportDownloader = path.join(src, 'lib/report-execution/download.ts');
if (fs.existsSync(browserReportDownloader)) {
  const text = fs.readFileSync(browserReportDownloader, 'utf8');
  if (!text.includes("REPORT_DOWNLOAD_SCOPE: ExportScope = 'CURRENT_VIEW'")) {
    findings.push('report-execution/download.ts must explicitly classify its materialized-row browser export as CURRENT_VIEW');
  }
}

if (findings.length) {
  console.error('EXPORT_TRUTH_CONTRACT: FAIL');
  findings.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log(`EXPORT_TRUTH_CONTRACT: PASS (${files.length} source files scanned)`);
console.log('Export scope is enforced: CURRENT_VIEW | FULL_DATASET | FILTERED_FULL_DATASET.');
