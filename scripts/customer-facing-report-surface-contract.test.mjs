import assert from 'node:assert/strict';
import fs from 'node:fs';

const reports = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const surface = fs.readFileSync('src/components/CustomerReportSurface.tsx', 'utf8');
const smart = fs.readFileSync('src/pages/SmartReportPage.tsx', 'utf8');
const app = fs.readFileSync('src/App.tsx', 'utf8');
const reportSourceContext = fs.readFileSync('src/components/ReportSourceContext.tsx', 'utf8');

assert.ok(reports.includes("import { CustomerReportSurface } from '@/components/CustomerReportSurface';"));
assert.ok(reports.includes("import { SourceContextNavigation } from '@/components/ReportSourceContext';"), 'Reports center must render the source-bound navigation on its actual report surface');
assert.ok(reports.includes('<div data-testid="reports-center-source-navigation"'), 'Reports center must expose a visible navigation container within the current report card');
assert.ok(reports.includes('<SourceContextNavigation jobId={primarySmartReport.jobId} sourceHash={primarySmartReport.sourceHash} variant="dark" />'), 'Reports-center shortcuts must carry the primary report exact job id and source hash');
assert.ok(reports.includes('return <CustomerReportSurface report={report} expectedSpecialty={expectedSpecialty} title={title} />;'));
assert.ok(!reports.includes('{report.sourcePath}</div>'));
assert.ok(!reports.includes('title={report.sourcePath}>{report.sourcePath}'));
assert.ok(!reports.includes('report.archetypeId +'));
assert.ok(surface.includes('الأرقام التي تهم القرار'));
assert.ok(surface.includes('ماذا يعني التقرير للإدارة؟'));
assert.ok(surface.includes('ما يراه العميل هنا هو معنى التقرير وقرار الأعمال'));
assert.ok(surface.includes('تفاصيل المصدر عند الحاجة فقط'));
assert.ok(surface.includes('sourcePath={report.sourcePath}'), 'Generic intelligence must retain the source identity as a component prop');
const customerSurfaceWithoutSourceProp = surface.replace(/sourcePath=\{report\.sourcePath\}/g, 'sourcePath={sourcePathProp}');
assert.ok(!customerSurfaceWithoutSourceProp.includes('{report.sourcePath}'), 'Customer-facing report must not render the raw source path directly');
assert.ok(!surface.includes('report.archetypeId'));
assert.ok(smart.includes('displayColumnLabel'));
assert.ok(smart.includes('التقرير الذكي'));
assert.ok(smart.includes("report.specialty === 'sales' ? 'المبيعات'"));
assert.ok(app.includes("if (authQuery) return <AuthGate><AppShell /></AuthGate>;"), 'AUTH_QUERY_MUST_OPEN_THE_PROTECTED_WORKSPACE_AFTER_LOGIN');
assert.ok(app.includes("const isLandingPath = location.pathname === '/' || location.pathname === '';"), 'PUBLIC_PROPOSAL_DEMO_MUST_BE_LANDING_ONLY');
assert.ok(app.includes("if (demoQuery || (isLandingPath && (isNetlifyPreview || isPrimaryPublicPreview || isGitHubPagesPublicPreview))) return <ProposalDemoPage />;"), 'PUBLIC_PREVIEW_MUST_NOT_REPLACE_REPORTS_OR_SMART_REPORT_ROUTES_WITH_FIXTURE_DEMO');
assert.ok(!app.includes("if (demoQuery || isNetlifyPreview || isPrimaryPublicPreview || isGitHubPagesPublicPreview) return <ProposalDemoPage />;"), 'BROAD_PUBLIC_PREVIEW_ROUTE_OVERRIDE_FORBIDDEN');
assert.ok(reportSourceContext.includes('if (!needsContextContinuity(location.pathname)) return null;'),
  'ReportSourceContext must not render stale report content on routes without source-context continuity');
assert.ok((reportSourceContext.match(/if \(!needsContextContinuity\(location\.pathname\)/g) ?? []).length >= 3,
  'ReportSourceContext catalog, resolver, and detail effects must be scoped to context-continuity routes');
assert.ok((reportSourceContext.match(/new AbortController\(\)/g) ?? []).length >= 3,
  'Each ReportSourceContext network effect must own an abort controller');
assert.ok((reportSourceContext.match(/controller\.abort\(\)/g) ?? []).length >= 3,
  'Every ReportSourceContext request effect must abort in-flight work during cleanup');
assert.ok(reportSourceContext.includes('AbortSignal.any([controller.signal, AbortSignal.timeout(12000)])'),
  'ReportSourceContext requests must preserve timeout and cleanup cancellation');
assert.ok(reportSourceContext.includes('export function SourceContextNavigation'), 'Source-bound navigation must be reusable by the actual reports-center surface independently of report detail rendering');
assert.ok(reportSourceContext.includes("variant === 'dark'"), 'Source navigation must support readable contrast on the executive dark report card');
assert.ok(reportSourceContext.includes('data-testid="report-source-context-links"'), 'Source-context navigation must expose a stable browser-proof surface');
assert.ok(reportSourceContext.includes('if (!report && !error)'), 'Pending report-detail reads must retain navigation while they resolve');
assert.ok(reportSourceContext.includes("path: '/intelligence'"), 'Source-bound navigation must retain the intelligence route');

assert.ok(smart.includes('تصدير XLSX'));

const customerFacingSurfaces = [
  'src/pages/DashboardPage.tsx',
  'src/pages/ExecutiveCommandCenterPage.tsx',
  'src/pages/TrustEvidencePage.tsx',
  'src/pages/CanonicalImportPage.tsx',
  'src/pages/DecisionExperiencePage.tsx',
  'src/pages/DecisionInboxPage.tsx',
  'src/pages/WorkCenterPage.tsx',
  'src/pages/IntelligencePage.tsx',
  'src/components/SourceBoundReportSurface.tsx',
].map((path) => ({ path, content: fs.readFileSync(path, 'utf8') }));

const forbiddenPrimaryLabels = [
  '>WHY<',
  '>EVIDENCE<',
  '>WHAT NEXT<',
  '>OUTCOME<',
  'As-of:',
  'Source SHA:',
  'معرّف القرار:',
];

for (const { path: surfacePath, content } of customerFacingSurfaces) {
  for (const forbidden of forbiddenPrimaryLabels) {
    assert.ok(!content.includes(forbidden), surfacePath + ' must not expose primary technical label: ' + forbidden);
  }
}

assert.ok(!customerFacingSurfaces.some(({ content }) => /\b(Decision ROI|Business Replay|Money Recovery|Outcome follow-up)\b/.test(content)));
const realBusinessE2E = fs.readFileSync('scripts/real-business-e2e.mjs', 'utf8');
assert.ok(realBusinessE2E.includes('async function waitForSmartReportEvidenceSurface(page)'), 'Real business E2E must use a dedicated visible Evidence Passport proof');
assert.ok(realBusinessE2E.includes("locator('[data-testid=\"smart-report-decision-chain\"]')"), 'Real business E2E must assert the visible source-bound decision chain');
assert.ok(realBusinessE2E.includes(".filter({ hasText: 'التفاصيل الكاملة للتقرير' })"), 'Real business E2E must scope Evidence Passport to the visible details summary');
assert.ok(!realBusinessE2E.includes("getByText('EVIDENCE PASSPORT', { exact: false }).first().waitFor"), 'Real business E2E must not select a hidden duplicate Evidence Passport label');
assert.ok(!realBusinessE2E.includes("getByText('EVIDENCE PASSPORT', { exact: false }).waitFor"), 'Real business E2E must not retain a non-unique Evidence Passport locator');
assert.ok(reports.includes('export function SalesReportPage'), 'Sales report surface must remain present');
assert.ok(reports.includes('export function PurchasesReportPage'), 'Purchases report surface must remain present');
const salesBlock = reports.slice(reports.indexOf('export function SalesReportPage'), reports.indexOf('export function PurchasesReportPage'));
const purchasesBlock = reports.slice(reports.indexOf('export function PurchasesReportPage'), reports.indexOf('export function InventoryReportPage'));
assert.ok(!salesBlock.includes('fetchDashboardSnapshot(6)'), 'Sales report must not depend on the global dashboard snapshot RPC');
assert.ok(!purchasesBlock.includes('fetchDashboardSnapshot(6)'), 'Purchases report must not depend on the global dashboard snapshot RPC');
console.log('DOMAIN_REPORT_DIRECT_DATA_CONTRACT_PASS');

console.log('CUSTOMER_FACING_REPORT_SURFACE_CONTRACT_PASS');
