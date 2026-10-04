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

console.log('CUSTOMER_FACING_REPORT_SURFACE_CONTRACT_PASS');
