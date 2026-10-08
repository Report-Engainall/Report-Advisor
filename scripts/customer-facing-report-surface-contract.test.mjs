import assert from 'node:assert/strict';
import fs from 'node:fs';

const reports = fs.readFileSync('src/pages/ReportsPage.tsx', 'utf8');
const surface = fs.readFileSync('src/components/CustomerReportSurface.tsx', 'utf8');
const smart = fs.readFileSync('src/pages/SmartReportPage.tsx', 'utf8');

assert.ok(reports.includes("import { CustomerReportSurface } from '@/components/CustomerReportSurface';"));
assert.ok(reports.includes('return <CustomerReportSurface report={report} expectedSpecialty={expectedSpecialty} title={title} />;'));
assert.ok(!reports.includes('{report.sourcePath}</div>'));
assert.ok(!reports.includes('title={report.sourcePath}>{report.sourcePath}'));
assert.ok(!reports.includes('report.archetypeId +'));
assert.ok(surface.includes('الأرقام التي تهم القرار'));
assert.ok(surface.includes('ماذا يعني التقرير للإدارة؟'));
assert.ok(surface.includes('ما يراه العميل هنا هو معنى التقرير وقرار الأعمال'));
assert.ok(surface.includes('تفاصيل المصدر عند الحاجة فقط'));
assert.ok(!surface.includes('{report.sourcePath}'));
assert.ok(!surface.includes('report.archetypeId'));
assert.ok(!surface.includes('sourcePath'));
assert.ok(smart.includes('displayColumnLabel'));
assert.ok(smart.includes('التقرير الذكي'));
assert.ok(smart.includes("report.specialty === 'sales' ? 'المبيعات'"));
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
assert.ok(!smart.includes("getByText('EVIDENCE PASSPORT', { exact: false }).waitFor"), 'Real business E2E must use a deterministic Evidence Passport locator');
assert.ok(reports.includes('export function SalesReportPage'), 'Sales report surface must remain present');
assert.ok(reports.includes('export function PurchasesReportPage'), 'Purchases report surface must remain present');
const salesBlock = reports.slice(reports.indexOf('export function SalesReportPage'), reports.indexOf('export function PurchasesReportPage'));
const purchasesBlock = reports.slice(reports.indexOf('export function PurchasesReportPage'), reports.indexOf('export function InventoryReportPage'));
assert.ok(!salesBlock.includes('fetchDashboardSnapshot(6)'), 'Sales report must not depend on the global dashboard snapshot RPC');
assert.ok(!purchasesBlock.includes('fetchDashboardSnapshot(6)'), 'Purchases report must not depend on the global dashboard snapshot RPC');
console.log('DOMAIN_REPORT_DIRECT_DATA_CONTRACT_PASS');

console.log('CUSTOMER_FACING_REPORT_SURFACE_CONTRACT_PASS');
