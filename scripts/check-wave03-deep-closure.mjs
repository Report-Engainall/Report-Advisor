import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const SOURCE_ROOTS = ['src', 'services', 'supabase'];
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.sql', '.py']);
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'coverage'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (TEXT_EXT.has(path.extname(entry.name))) files.push(full);
  }
}
for (const rootName of SOURCE_ROOTS) walk(path.join(root, rootName));

const findings = [];
const add = (severity, category, file, detail) => findings.push({ severity, category, file: path.relative(root, file), detail });

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const isTest = /(^|\/)(test|tests|__tests__|fixtures)(\/|\.)/.test(rel) || /\.test\.[^.]+$|\.spec\.[^.]+$/.test(rel);
  if (!isTest && /(?:localStorage|sessionStorage)\.(?:getItem|setItem)\(['\"](?:COMPANY_ID|company_id|tenant_id|TENANT_ID)/.test(text)) add('PRODUCTION_RISK', 'tenant-authority', file, 'client storage used as tenant authority');
  if (!isTest && /(?:VITE_|NEXT_PUBLIC_)[A-Z_]*(?:COMPANY|TENANT)[A-Z_]*\s*[:=]/.test(text)) add('PRODUCTION_RISK', 'tenant-authority', file, 'build-time tenant authority detected');
  if (!isTest && /\bcatch\s*\{\s*\}/.test(text)) add('RISK', 'error-handling', file, 'empty catch silently suppresses failure');
  if (!isTest && /as\s+any\b/.test(text)) add('RISK', 'type-safety', file, 'production any-cast');
  if (!isTest && /(?:TODO|FIXME|TEMP|FAKE|MOCK|DEMO|PLACEHOLDER)/i.test(text)) add('REVIEW', 'hygiene', file, 'production marker requires classification');
}

const pageFiles = files.filter(f => f.includes(`${path.sep}pages${path.sep}`));
const consumerText = pageFiles.map(f => ({ file: f, text: fs.readFileSync(f, 'utf8') }));
const canonicalRefs = {
  dashboard: ['fetchDashboardKPIs', 'fetchMonthlyTrend', 'fetchTopCustomers', 'fetchTopProducts'],
  report: ['canonicalKpi', 'fetchDashboardKPIs'],
  export: ['canonicalKpi', 'fetchDashboardKPIs'],
  decision: ['canonicalKpi', 'fetchDashboardKPIs'],
};
const consumerInventory = Object.fromEntries(Object.entries(canonicalRefs).map(([surface, refs]) => [surface, consumerText.filter(({ text }) => refs.some(r => text.includes(r))).map(({ file }) => path.relative(root, file).replaceAll('\\', '/'))]));

const localFormulaPatterns = [
  /grossProfit\s*=\s*[^;\n]*(?:revenue|sales|cogs|cost)/i,
  /grossMargin\s*=\s*[^;\n]*(?:revenue|sales|profit)/i,
  /totalSales\s*=\s*[^;\n]*(?:reduce|subtotal|line_total)/i,
];
const duplicateFormulaFindings = consumerText.flatMap(({ file, text }) => localFormulaPatterns.filter(re => re.test(text)).map(re => ({ file: path.relative(root, file), pattern: re.source })));

const workflowDir = path.join(root, '.github', 'workflows');
const workflows = fs.existsSync(workflowDir) ? fs.readdirSync(workflowDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml')) : [];
const workflowText = workflows.map(f => fs.readFileSync(path.join(workflowDir, f), 'utf8'));
const qualityCount = workflowText.filter(t => /name:\s*quality|npm run test:wave03|check-wave03-deep-closure/.test(t)).length;

const productionRisks = findings.filter(f => f.severity === 'PRODUCTION_RISK');
const report = {
  generatedAt: new Date().toISOString(),
  scannedFiles: files.length,
  consumerInventory,
  duplicateFormulaFindings,
  securityProductionRisks: productionRisks,
  hygiene: {
    reviewCount: findings.filter(f => f.severity === 'REVIEW').length,
    riskCount: findings.filter(f => f.severity === 'RISK').length,
    productionRiskCount: productionRisks.length,
  },
  ciTopology: { workflowCount: workflows.length, canonicalQualityWorkflowDetected: qualityCount >= 1 },
};
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs', 'WAVE03_DEEP_SCAN.json'), JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify(report, null, 2));
if (productionRisks.length) {
  console.error(`Wave 03 deep closure blocked: ${productionRisks.length} production-risk tenant authority finding(s).`);
  process.exit(1);
}
if (duplicateFormulaFindings.length) {
  console.error(`Wave 03 deep closure blocked: ${duplicateFormulaFindings.length} consumer-local business formula finding(s).`);
  process.exit(1);
}
console.log('Wave 03 deep closure static consumer/security/hygiene gate: PASS');
