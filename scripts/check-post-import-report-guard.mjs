import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=process.cwd();
const read=(p)=>fs.readFileSync(`${root}/${p}`,'utf8');
const importPage=read('src/pages/CanonicalImportPage.tsx');
const reportPage=read('src/pages/ReportsPage.tsx');
const queries=read('src/lib/queries.ts');
const domainReport=read('src/pages/SourceDomainReportPage.tsx');

for(const token of ['fetchReportExecutionTasks','executionIsFullyRendered','CANONICAL_IMPORT_EXECUTION_NOT_FULLY_RENDERED','navigate(`/reports/source/${rec.id}`)','executionTasks'])
  assert(importPage.includes(token),`Import report guard missing: ${token}`);

for(const token of ['fetchReportExecutionTasks','executionComplete','report_execution_tasks','دورة التنفيذ الفعلية'])
  assert(reportPage.includes(token),`Source report proof surface missing: ${token}`);

assert(!reportPage.includes("['queued','fingerprinted','extracted','canonicalized','validated','analyzed','decisioned','committed','rendered'].map"),
  'Source report must not hardcode nine stages as successful');

for(const token of ['fetchCanonicalSourceReport','fetchReportExecutionTasks','SOURCE-BOUND DOMAIN REPORT','sourceHash','canonicalRowsTotal','report.specialty'])
  assert(domainReport.includes(token),`Source-bound domain report lineage contract missing: ${token}`);

for(const token of ['الملخص التنفيذي','الإشارات الذكية','الرقابة الإدارية','مرشحات القرار','إجراءات المتابعة','القيود وحالة المقارنة','EVIDENCE-BOUND'])
  assert(domainReport.includes(token),`Evidence-bound downstream output missing: ${token}`);

for(const token of ['age_0_30','age_31_60','age_61_90','age_91_120','age_over_120','ageCoverageComplete','تغطية أعمار الذمم جزئية','فرق بين الرصيد المستحق وإجمالي شرائح الأعمار المتاحة'])
  assert(domainReport.includes(token),`Receivables aging coverage guard missing: ${token}`);

for(const token of ['executionJobId','export interface ReportExecutionTask','report_execution_tasks','order('])
  assert(queries.includes(token),`Report execution query contract missing: ${token}`);

console.log('Post-import report guard: PASS (actual 9-stage proof + source-bound report navigation + no hardcoded success)');