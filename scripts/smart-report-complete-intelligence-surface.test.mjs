import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/components/SmartReportAdvisorySurface.tsx', import.meta.url), 'utf8');

for (const marker of [
  'report.intelligence.signals.length',
  'report.intelligence.recommendations.length',
  'report.intelligence.forecast.status',
  'report.intelligence.guidance.focus',
  'كل الإشارات والتنبيهات',
  'كل التوصيات المؤهلة',
  'الإشارة التنبئية',
  'الإرشاد التالي',
  'لماذا الآن:',
  'المخاطر:',
  'العائق:',
  'القياس:',
  'الحدود:',
]) {
  if (!source.includes(marker)) throw new Error('Missing complete smart intelligence surface marker: ' + marker);
}

const signalStart = source.indexOf('الإشارات');
const recommendationStart = source.indexOf('التوصيات');
const forecastStart = source.indexOf('التنبؤ');
if (signalStart < 0 || recommendationStart < 0 || forecastStart < 0) throw new Error('Missing Arabic intelligence surface section boundaries');
const signalBlock = source.slice(signalStart, recommendationStart);
const recommendationBlock = source.slice(recommendationStart, forecastStart);
if (signalBlock.includes('signals.slice(')) throw new Error('Signals must not be artificially truncated');
if (recommendationBlock.includes('recommendations.slice(')) throw new Error('Recommendations must not be artificially truncated');

console.log('smart-report-complete-intelligence-surface: PASS');

const smartReportPage = fs.readFileSync(new URL('../src/pages/SmartReportPage.tsx', import.meta.url), 'utf8');
if (!smartReportPage.includes("GenericFileIntelligenceCard")) throw new Error('Smart Report page must expose source-agnostic intelligence');
if (!smartReportPage.includes('data-testid="smart-report-generic-intelligence"')) throw new Error('Smart Report generic intelligence test marker missing');
if (!smartReportPage.includes('intelligence={report.genericIntelligence ?? report.intelligence}')) throw new Error('Smart Report must render the independent general intelligence layer');
if (!smartReportPage.includes('sourceHash={report.sourceHash}') || !smartReportPage.includes('reportJobId={report.jobId}')) throw new Error('Generic intelligence card must retain report source lineage');
if (!smartReportPage.includes('generalIntelligence: report.genericIntelligence ?? undefined')) throw new Error('Persisted universal evidence chain must include the same report general layer');
if (smartReportPage.includes('{!report.specialty && (')) throw new Error('General intelligence must render even when a specialty is detected');

const uploadPage = fs.readFileSync(new URL('../src/pages/ExternalFileAnalysisPage.tsx', import.meta.url), 'utf8');
if (!uploadPage.includes('buildGenericFileIntelligence(dataset')) throw new Error('File Lab must run generic analysis for every recognized dataset');
if (!uploadPage.includes('generalIntelligence: genericIntelligence ?? undefined')) throw new Error('File Lab must merge general intelligence into the universal chain');
if (!uploadPage.includes('sourceHash={file.hash}')) throw new Error('File Lab generic results must show the uploaded source hash');

const genericCard = fs.readFileSync(new URL('../src/components/GenericFileIntelligenceCard.tsx', import.meta.url), 'utf8');
for (const marker of ['signals.map((signal)', 'recommendations.map((recommendation)', 'signal.evidence ?? []', 'recommendation.evidence ?? []', 'intelligence.guidance.inspect.map(', 'finding.evidence ?? []', 'generic-intelligence-source-lineage']) {
  if (!genericCard.includes(marker)) throw new Error('Generic intelligence card must expose all source-derived results/evidence: ' + marker);
}
for (const marker of ['evidence.slice(', 'signals.slice(', 'recommendations.slice(', 'guidance.inspect.slice(']) {
  if (genericCard.includes(marker)) throw new Error('Generic intelligence card must not truncate result collections: ' + marker);
}

const reportSmartForGeneric = fs.readFileSync(new URL('../src/lib/report-smart.ts', import.meta.url), 'utf8');
if (!reportSmartForGeneric.includes('composeIntelligenceLayers(genericIntelligence, intelligence)')) throw new Error('Persisted reports must compose general and applicable specialist intelligence');
if (!reportSmartForGeneric.includes('genericIntelligence: ReportIntelligence | null')) throw new Error('Smart Report detail must return the general intelligence layer separately');
if (!reportSmartForGeneric.includes('intelligence = baseIntelligence;')) throw new Error('A failed specialist eligibility gate must preserve review state while allowing general analysis');

const composer = fs.readFileSync(new URL('../src/lib/report-intelligence/compose-intelligence-layers.ts', import.meta.url), 'utf8');
for (const marker of ['mergeSignals', 'mergeRecommendations', 'uniqueStrings([...(existing.evidence ?? []), ...(incoming.evidence ?? [])])', 'moreCautiousHealth']) {
  if (!composer.includes(marker)) throw new Error('General/specialist layer composition guard missing: ' + marker);
}
console.log('smart-report-generic-intelligence-composition: PASS');

const smartReportSource = fs.readFileSync(new URL('../src/lib/report-smart.ts', import.meta.url), 'utf8');
const fetchStart = smartReportSource.indexOf('export async function fetchSmartReport');
const fetchBlock = fetchStart >= 0 ? smartReportSource.slice(fetchStart) : '';
if (!fetchBlock.includes('const resolvedSourceHash')) throw new Error('Smart report must resolve source hash from the tenant-scoped job lineage');
if (fetchBlock.includes(".eq('source_hash', sourceHash)")) throw new Error('Smart report contains an unbound sourceHash query reference');
if (!fetchBlock.includes('if (normalizedSourceHash && resolvedSourceHash !== normalizedSourceHash)')) throw new Error('Explicit source hash mismatch must still be rejected');
console.log('smart-report-context-lineage: PASS');

for (const marker of [
  'ag-report-hero-stat',
  'ag-report-tech-meta',
  'smart-report-source-hash',
  'smart-report-job-id',
  'جاهزية القرار',
  'الثقة المصدرية',
  'السجلات الموثقة',
]) {
  if (!smartReportPage.includes(marker)) throw new Error('Smart Report executive result surface marker missing: ' + marker);
}
console.log('smart-report-executive-result-surface: PASS');

const reportsPage = fs.readFileSync(new URL('../src/pages/ReportsPage.tsx', import.meta.url), 'utf8');
for (const marker of [
  'fetchSmartReportCatalogPage',
  'catalogHasMore',
  'loadMoreCatalog',
  'data-testid="smart-report-catalog-load-more"',
  "report.jobId + ':' + report.sourceHash",
]) {
  if (!reportsPage.includes(marker)) throw new Error('Missing smart report catalog pagination marker: ' + marker);
}

const reportCatalog = fs.readFileSync(new URL('../src/lib/report-smart.ts', import.meta.url), 'utf8');
if (!reportCatalog.includes('export async function fetchSmartReportCatalogPage')) throw new Error('Paged smart report catalog API missing');
if (!reportCatalog.includes('.range(offset, offset + limit)')) throw new Error('Paged smart report catalog must advance via source-job offsets');

const reportContext = fs.readFileSync(new URL('../src/components/ReportSourceContext.tsx', import.meta.url), 'utf8');
for (const marker of [
  'fetchSmartReportCatalogPage(6, 0',
  'aria-label="التقارير الذكية الأخيرة"',
  'data-testid="recent-smart-report-navigation"',
  "encodeURIComponent(item.jobId) + '?sourceHash=' + encodeURIComponent(item.sourceHash)",
  'to="/reports"',
]) {
  if (!reportContext.includes(marker)) throw new Error('Missing cross-screen smart report navigation marker: ' + marker);
}
console.log('smart-report-catalog-navigation: PASS');
