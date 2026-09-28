import fs from 'node:fs';

const app = fs.readFileSync('src/App.tsx', 'utf8');
const navigationRegistry = fs.readFileSync('src/lib/navigation-registry.ts', 'utf8');
const pages = fs.readdirSync('src/pages').filter((name) => name.endsWith('Page.tsx'));

const routePaths = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
const navigationPaths = [...navigationRegistry.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);
const unique = (items) => [...new Set(items)];
const INTERNAL_PROGRESSIVE_DISCLOSURE_ROUTES = new Set(['/proposal-demo', '/import/analyze']);
const duplicateNavigationPaths = navigationPaths.filter((path, index) => navigationPaths.indexOf(path) !== index);
const missingFromSidebar = routePaths.filter((path) => path !== '*' && !navigationPaths.includes(path) && !INTERNAL_PROGRESSIVE_DISCLOSURE_ROUTES.has(path));
const missingRoutesForSidebar = navigationPaths.filter((path) => !routePaths.includes(path));

const reportsCenterPage = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const reportsCenterPageImportContract = [
  [/التقرير التنفيذي/, 'Reports Center must expose the canonical Executive Report'],
  [/inventory-intelligence/, 'Reports Center must expose inventory intelligence output'],
  [/demand-velocity/, 'Reports Center must expose demand velocity output'],
  [/سلسلة مخرجات القرار في التقارير/, 'Reports Center must expose the decision-output chain'],
  [/Report Builder/, 'Reports Center must expose the governed session builder'],
  [/01 · TRUTH \/ EVIDENCE/, 'Report Builder must expose truth/evidence state as a first-class section'],
  [/\['truth', 'kpis', 'decision'\]/, 'Report Builder must include truth/evidence in the default report package'],
];
for (const [pattern, message] of reportsCenterPageImportContract) {
  if (!pattern.test(reportsCenterPage)) {
    console.error(`FAIL reports center completeness: ${message}`);
    process.exitCode = 1;
  }
}

const executiveReportPage = fs.readFileSync('src/pages/ExecutiveReportPage.tsx', 'utf8');
const executiveReportImportContract = [
  [/useSearchParams\(\)/, 'Executive report must read the import context from the canonical route query'],
  [/fetchImportRecords/, 'Executive report must resolve the requested import job through the tenant-bound query'],
  [/fetchImportEvidenceSnapshot/, 'Executive report must resolve the requested evidence snapshot through the tenant-bound query'],
  [/fetchRecommendationsBoundToImport/, 'Executive report must resolve recommendations through the canonical import evidence binding'],
  [/recommendations\.slice\(0, 6\)/, 'Executive report must render the context-selected recommendation set'],
  [/ReportSurfaceContext/, 'Executive report must expose the canonical report truth context'],
  [/aria-label="سياق المصدر المستورد"/, 'Executive report must expose an import provenance/context surface'],
  [/REVIEW \/ NOT PROVEN/, 'Executive report must fail closed when the import context cannot be proven'],
  [/سلسلة الأدلة والقرار والنتيجة/, 'Executive report must expose the evidence-to-outcome chain'],
  [/EVIDENCE → DECISION → OUTCOME/, 'Executive report must expose the governed decision-output chain'],
  [/قراءة عامة · غير مربوطة بالمصدر/, 'Import-bound report must not mislabel general signals as source-bound'],
];
for (const [pattern, message] of executiveReportImportContract) {
  if (!pattern.test(executiveReportPage)) {
    console.error(`FAIL executive report import provenance: ${message}`);
    process.exitCode = 1;
  }
}

const reportSurfaceContext = fs.readFileSync('src/components/ReportSurfaceContext.tsx', 'utf8');
const reportSurfaceContract = [
  [/REPORT TRUTH CONTEXT/, 'Report surfaces must expose the canonical report truth context'],
  [/الشركة/, 'Report truth context must expose company context'],
  [/الفترة/, 'Report truth context must expose report period'],
  [/العملة/, 'Report truth context must expose currency'],
  [/As Of/, 'Report truth context must expose As Of'],
  [/حالة الحقيقة/, 'Report truth context must expose truth status'],
  [/>\/trust<|to="\/trust"/, 'Report truth context must link to canonical Trust & Evidence'],
];
for (const [pattern, message] of reportSurfaceContract) {
  if (!pattern.test(reportSurfaceContext)) {
    console.error(`FAIL report surface truth context: ${message}`);
    process.exitCode = 1;
  }
}

const domainReportsCount = (reportsCenterPage.match(/<ReportSurfaceContext/g) ?? []).length;
if (domainReportsCount < 6) {
  console.error('FAIL reports center report-context contract: domain reports and Reports Center must expose the shared report truth context');
  process.exitCode = 1;
}

for (const pattern of [/status={kpis\.status === 'CONFIRMED' \? 'VERIFIED'/, /status={(snapshot\?\.kpis\.status/]) {
  if (!pattern.test(reportsCenterPage)) {
    console.error('FAIL reports center truth-state contract: confirmed/calculated states must preserve VERIFIED semantics');
    process.exitCode = 1;
    break;
  }
}

const inventoryIntelligencePage = fs.readFileSync('src/pages/InventoryIntelligencePage.tsx', 'utf8');
const inventoryIntelligenceContract = [
  [/ReportSurfaceContext/, 'Inventory Intelligence must use the canonical report truth context'],
  [/ReportSurfaceContext/, 'Inventory Intelligence must bind company/currency through the shared report context'],
  [/status={!projected\.length \? 'INSUFFICIENT DATA' : missingDemand\.length \? 'REVIEW' : 'CALCULATED'}/, 'Inventory Intelligence must fail closed to REVIEW/INSUFFICIENT DATA'],
  [/downloadReportArtifact/, 'Inventory Intelligence must expose a canonical export action'],
  [/window\.print\(\)/, 'Inventory Intelligence must expose a print action'],
];
for (const [pattern, message] of inventoryIntelligenceContract) {
  if (!pattern.test(inventoryIntelligencePage)) {
    console.error(`FAIL inventory intelligence report contract: ${message}`);
    process.exitCode = 1;
  }
}

const demandVelocityPage = fs.readFileSync('src/pages/DemandVelocityPage.tsx', 'utf8');
const demandVelocityContract = [
  [/ReportSurfaceContext/, 'Demand Velocity must use the canonical report truth context'],
  [/ReportSurfaceContext/, 'Demand Velocity must bind company/currency through the shared report context'],
  [/status={data\.length \? 'CALCULATED' : 'INSUFFICIENT DATA'}/, 'Demand Velocity must fail closed to INSUFFICIENT DATA'],
  [/\{days\} يومًا/, 'Demand Velocity truth context must disclose the active analysis window'],
  [/downloadReportArtifact/, 'Demand Velocity must expose a canonical export action'],
  [/window\.print\(\)/, 'Demand Velocity must expose a print action'],
];
for (const [pattern, message] of demandVelocityContract) {
  if (!pattern.test(demandVelocityPage)) {
    console.error(`FAIL demand velocity report contract: ${message}`);
    process.exitCode = 1;
  }
}

const benchmarkNetworkPage = fs.readFileSync('src/pages/BenchmarkNetworkPage.tsx', 'utf8');
const benchmarkTruthContract = [
  [/ReportSurfaceContext/, 'Benchmark Network must expose the canonical truth context'],
  [/status="INSUFFICIENT DATA"/, 'Benchmark Network must remain fail-closed without a peer sample'],
  [/INSUFFICIENT_SAMPLE/, 'Benchmark Network must preserve the sample gate state'],
];
for (const [pattern, message] of benchmarkTruthContract) {
  if (!pattern.test(benchmarkNetworkPage)) {
    console.error(`FAIL benchmark truth context: ${message}`);
    process.exitCode = 1;
  }
}

const businessReplayPage = fs.readFileSync('src/pages/BusinessReplayPage.tsx', 'utf8');
const businessReplayTruthContract = [
  [/ReportSurfaceContext/, 'Business Replay must expose the canonical truth context'],
  [/hasReplay \? 'VERIFIED' : 'INSUFFICIENT DATA'/, 'Business Replay must keep absence of persisted outcomes fail-closed'],
  [/snapshots وoutcomes محفوظة فقط/, 'Business Replay must disclose persisted snapshot/outcome provenance'],
];
for (const [pattern, message] of businessReplayTruthContract) {
  if (!pattern.test(businessReplayPage)) {
    console.error(`FAIL business replay truth context: ${message}`);
    process.exitCode = 1;
  }
}

const workCenterPage = fs.readFileSync('src/pages/WorkCenterPage.tsx', 'utf8');
const workCenterTruthContract = [
  [/ReportSurfaceContext/, 'Work Center must expose the canonical truth context'],
  [/workTruthStatus/, 'Work Center must derive an explicit truth state'],
  [/expiredActive/, 'Work Center truth state must remain tied to operational lease health'],
];
for (const [pattern, message] of workCenterTruthContract) {
  if (!pattern.test(workCenterPage)) {
    console.error(`FAIL work center truth context: ${message}`);
    process.exitCode = 1;
  }
}

const decisionExperiencePage = fs.readFileSync('src/pages/DecisionExperiencePage.tsx', 'utf8');
const decisionTruthContract = [
  [/ReportSurfaceContext/, 'Decision Experience must expose the canonical truth context'],
  [/decisionTruthStatus/, 'Decision Experience must derive its truth state explicitly'],
  [/DECISION_SOURCE_EVIDENCE_REQUIRED/, 'Decision Experience must keep source evidence gating'],
];
for (const [pattern, message] of decisionTruthContract) {
  if (!pattern.test(decisionExperiencePage)) {
    console.error(`FAIL decision experience truth context: ${message}`);
    process.exitCode = 1;
  }
}

const trustEvidencePage = fs.readFileSync('src/pages/TrustEvidencePage.tsx', 'utf8');
const trustEvidenceContract = [
  [/ReportSurfaceContext/, 'Trust & Evidence must expose the canonical truth context'],
  [/effectiveStatus/, 'Trust & Evidence truth context must follow the effective evidence state'],
  [/truthContextStatus/, 'Trust & Evidence must map internal OK/EMPTY states to canonical truth states'],
  [/Evidence Passport/, 'Trust & Evidence must retain the evidence passport surface'],
];
for (const [pattern, message] of trustEvidenceContract) {
  if (!pattern.test(trustEvidencePage)) {
    console.error(`FAIL trust evidence truth context: ${message}`);
    process.exitCode = 1;
  }
}

const pageSourceByFile = new Map();
for (const page of pages) {
  pageSourceByFile.set(page, fs.readFileSync(`src/pages/${page}`, 'utf8'));
}
const entrySources = [
  app,
  fs.readFileSync('src/components/AuthGate.tsx', 'utf8'),
];
const pageRef = (source) => [
  ...source.matchAll(/from\s+['"]@\/pages\/([^'"]+)['"]/g),
  ...source.matchAll(/import\([^)]*['"]@\/pages\/([^'"]+)['"]/g),
].map((m) => m[1].endsWith('.tsx') ? m[1] : `${m[1]}.tsx`);

const reachablePageFiles = new Set();
const pendingPageFiles = unique(entrySources.flatMap(pageRef));
while (pendingPageFiles.length) {
  const page = pendingPageFiles.pop();
  if (!page || reachablePageFiles.has(page) || !pageSourceByFile.has(page)) continue;
  reachablePageFiles.add(page);
  pendingPageFiles.push(...pageRef(pageSourceByFile.get(page)));
}
const unreferencedPageFiles = pages.filter((file) => !reachablePageFiles.has(file));

const fail = (label, values) => {
  if (!values.length) return;
  console.error(`FAIL ${label}:\n${values.map((v) => `  - ${v}`).join('\n')}`);
  process.exitCode = 1;
};

console.log(`UI route count: ${routePaths.length}`);
console.log(`Canonical navigation count: ${unique(navigationPaths).length}`);
console.log(`Internal progressive-disclosure routes: ${[...INTERNAL_PROGRESSIVE_DISCLOSURE_ROUTES].join(', ')}`);
console.log(`Page component files: ${pages.length}`);

fail('duplicate navigation registry paths', unique(duplicateNavigationPaths));
fail('routes missing from sidebar navigation', missingFromSidebar);
fail('sidebar links missing a registered route', missingRoutesForSidebar);
fail('page components unreachable from App/AuthGate import graph', unreferencedPageFiles);

if (process.exitCode) {
  console.error('UI route/navigation completeness: FAIL');
  process.exit();
}

console.log('UI route/navigation completeness: PASS');
console.log('Note: route registration does not certify runtime rendering or every interactive control.');
