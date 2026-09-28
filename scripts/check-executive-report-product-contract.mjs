import fs from 'node:fs';

const file = 'src/pages/ExecutiveReportPage.tsx';
const source = fs.readFileSync(file, 'utf8');
const required = [
  'fetchDashboardSnapshot',
  'fetchDashboardIntelligence',
  'الملخص التنفيذي',
  'حدود الدليل',
  'Actual Outcome',
  'مساحة القرار',
  'window.print()',
  'لا توجد تنبيهات مصدرية حاليًا.',
  'لا توجد توصيات مصدرية حاليًا.',
  'ownerCoverage',
  'outcomeCoverage',
  'Owner Coverage',
  'Outcome Coverage',
  'جاهزة للقرار',
  'قيد التنفيذ',

    'actionableRecommendations',
  "SourceBoundReportContext",

  "const activeDecisionCount = actionableRecommendations.length",

];
const missing = required.filter(token => !source.includes(token));
if (missing.length) {
  console.error('Executive report product contract: FAIL');
  for (const token of missing) console.error(`- missing: ${token}`);
  process.exit(1);
}
if (source.includes('Math.random()') || source.includes('fake') || source.includes('mock')) {
  console.error('Executive report product contract: FAIL — synthetic data marker detected');
  process.exit(1);
}

if (source.includes('renderedManifest') || source.includes('getBoundRenderedReportManifest')) {
  console.error('Executive report product contract: FAIL — duplicate rendered-manifest UI logic detected');
  process.exit(1);
}

console.log('Executive report product contract: PASS');
