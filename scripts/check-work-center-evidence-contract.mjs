import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/WorkCenterPage.tsx', 'utf8');

for (const token of [
  'معرف سجل المصدر',
  'وقت الإنشاء',
  'وقت الإغلاق المصدرّي',
  'يوجد وقت إغلاق مصدرّي مسجل في السجل.',
  'وقت الإغلاق المصدرّي غير مثبت رغم حالة المكتمل.',
  'إثبات الإغلاق النهائي يجب أن يأتي من المسار الموثق',
  'fetchImportRecords',
]) {
  assert.ok(source.includes(token), 'missing work-center evidence token: ' + token);
}

assert.ok(source.includes('لا يعني أن الواجهة أنشأت أو أغلقت العملية'));
console.log('Work Center evidence contract: PASS');
