import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/DecisionExperiencePage.tsx', 'utf8');

for (const token of [
  'fetchRecommendations',
  'fetchAlerts',
  'get_dashboard_intelligence',
  'recommendationId',
  'alertId',
  'الإشارة المصدرية ليست بديلًا عن evidence',
  'الدليل التشغيلي التفصيلي غير مثبت هنا',
  'الحالة المصدرية',
  'الثقة',
  'الأثر المتوقع',
  'القيمة مقابل الحد',
  'وقت إنشاء الإشارة',
  'لا يتم تحويل الإشارة إلى حالة معتمدة محليًا',
]) {
  assert.ok(source.includes(token), 'missing decision trust contract token: ' + token);
}

assert.match(source, /selectedAlert/);
assert.match(source, /selectAlert/);
assert.match(source, /source.?\.? .*get_dashboard_intelligence|get_dashboard_intelligence/);
assert.match(source, /stage=|p\.set\('stage'/);
assert.ok(!source.includes('المصدر</p><p className="mt-1 font-bold">غير متاح'));
assert.ok(!/Math\.random\(|mock|synthetic/i.test(source));

console.log('Decision experience trust contract: PASS');
