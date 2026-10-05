import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/SmartReportPage.tsx', 'utf8');

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
