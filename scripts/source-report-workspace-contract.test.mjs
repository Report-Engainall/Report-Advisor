import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/SmartReportPage.tsx', 'utf8');
const surface = fs.readFileSync('src/components/SourceBoundReportSurface.tsx', 'utf8');

const smartReportPageStart = source.indexOf('export function SmartReportPage() {');
const smartReportDatasetStart = source.indexOf('const dataset = useMemo', smartReportPageStart);
assert.ok(smartReportPageStart >= 0 && smartReportDatasetStart > smartReportPageStart, 'SMART_REPORT_PAGE_CONTEXT_REGION_REQUIRED');
const smartReportRequestRegion = source.slice(smartReportPageStart, smartReportDatasetStart);
const smartReportEffectStart = smartReportRequestRegion.indexOf('useEffect(');
const smartReportEffectEnd = smartReportRequestRegion.indexOf('const reportContextMatches');
const smartReportEffect = smartReportRequestRegion.slice(smartReportEffectStart, smartReportEffectEnd);
assert.ok(smartReportEffect.includes('setReport(null);'), 'SMART_REPORT_ROUTE_CHANGE_MUST_CLEAR_PREVIOUS_REPORT');
assert.ok(smartReportEffect.indexOf('setReport(null);') < smartReportEffect.indexOf('fetchSmartReport('), 'SMART_REPORT_MUST_CLEAR_OLD_REPORT_BEFORE_FETCH');
assert.ok(smartReportRequestRegion.includes('report.jobId === currentJobId'), 'SMART_REPORT_RENDER_MUST_MATCH_JOB_ID');
assert.ok(smartReportRequestRegion.includes('report.sourceHash === expectedSourceHash'), 'SMART_REPORT_RENDER_MUST_MATCH_SOURCE_HASH');
assert.ok(source.includes('errorContextKey === requestContextKey'), 'SMART_REPORT_ERRORS_MUST_BE_CONTEXT_BOUND');

const sourceBoundStart = surface.indexOf('export function SourceBoundReportSurface(');
assert.ok(sourceBoundStart >= 0, 'SOURCE_BOUND_REPORT_SURFACE_REQUIRED');
const sourceBound = surface.slice(sourceBoundStart);
assert.ok(sourceBound.includes('setReport(null);'), 'SOURCE_BOUND_ROUTE_CHANGE_MUST_CLEAR_PREVIOUS_REPORT');
assert.ok(sourceBound.includes('report.jobId === normalizedJobId'), 'SOURCE_BOUND_REPORT_MUST_MATCH_JOB_ID');
assert.ok(sourceBound.includes('report.sourceHash === normalizedSourceHash'), 'SOURCE_BOUND_REPORT_MUST_MATCH_SOURCE_HASH');
assert.ok(sourceBound.includes('errorContextKey === requestContextKey'), 'SOURCE_BOUND_ERRORS_MUST_BE_CONTEXT_BOUND');

assert.ok(source.includes('function SourceDataWorkspace'));
assert.ok(source.includes("report.sourceHash"));
assert.ok(source.includes('report.canonicalRows.map'));
assert.ok(source.includes('window.localStorage'));
assert.ok(source.includes('تصدير CSV'));
assert.ok(source.includes('بحث داخل كل أعمدة التقرير'));
assert.ok(source.includes('فحص السجل'));
assert.ok(source.includes('selectedRowNumber'));
assert.ok(source.includes('groupedRows'));
assert.ok(source.includes('التحليل المجمع'));
assert.ok(source.includes('aggregateColumn'));
assert.ok(source.includes('downloadReportArtifact'));
assert.ok(source.includes("'xlsx'"));
assert.ok(!source.includes('const workspaceRows = previewRows'));
console.log('SOURCE_REPORT_WORKSPACE_CONTRACT_PASS');
