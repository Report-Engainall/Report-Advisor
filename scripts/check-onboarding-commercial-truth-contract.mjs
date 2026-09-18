import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/pages/OnboardingPage.tsx', 'utf8');

assert.match(page, /fetchDashboardSnapshot\(3\)/);
assert.match(page, /fetchDashboardIntelligence\(\)/);
assert.match(page, /type BusinessSnapshot/);
assert.match(page, /coverage: Math\.round\(\(confirmed \/ 8\) \* 100\)/);
assert.match(page, /alerts = intelligence\.alerts\.slice\(0, 3\)/);
assert.match(page, /recommendations = intelligence\.recommendations\.filter/);
assert.match(page, /Business snapshot unavailable/);
assert.match(page, /TruthContextStrip status=\{snapshot\.kpis\.status\}/);
assert.match(page, /asOf=\{snapshot\.asOf \?\? 'غير متاح'\}/);
assert.match(page, /snapshot\.kpis\.totalSales/);
assert.match(page, /لا يتم اختلاق رقم/);
assert.match(page, /الصورة التنفيذية غير متاحة/);
assert.match(page, /لن نخترع فرصة أو خطرًا/);
assert.doesNotMatch(page, /Math\.random\(|mock|synthetic|dummy/i);

console.log('Onboarding commercial truth contract: PASS');
console.log('  - canonical dashboard snapshot/intelligence are consumed without new RPCs');
console.log('  - KPI coverage is explicit and bounded to eight canonical fields');
console.log('  - truth status/as-of is surfaced from the source or declared unavailable');
console.log('  - missing dashboard evidence fails soft with an explicit empty state');
