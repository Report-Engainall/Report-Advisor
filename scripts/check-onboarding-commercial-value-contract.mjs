#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const onboarding = read('src/pages/OnboardingPage.tsx');

const checks = [
  [onboarding.includes('fetchDashboardSnapshot(3)'), 'Onboarding must use the canonical dashboard snapshot.'],
  [onboarding.includes('fetchDashboardIntelligence()'), 'Onboarding must use canonical dashboard intelligence.'],
  [onboarding.includes('snapshot.coverage'), 'Onboarding must expose measured data coverage.'],
  [onboarding.includes('snapshot.asOf'), 'Onboarding must expose the snapshot as-of boundary.'],
  [onboarding.includes('snapshot.kpis.status'), 'Onboarding must expose the canonical truth status.'],
  [onboarding.includes('لا يتم استبدالها بأرقام تجريبية'), 'Unavailable business truth must fail closed instead of using demo numbers.'],
  [onboarding.includes('إشارة نشطة') && onboarding.includes('افتح التحقيق'), 'Onboarding must surface a real alert path when available.'],
  [onboarding.includes('توصية للمراجعة') && onboarding.includes('افتح مسار القرار'), 'Onboarding must surface a real recommendation path when available.'],
  [onboarding.includes('لا توجد إشارة مثبتة الآن'), 'Onboarding must have a truthful no-signal state.'],
  [onboarding.includes('/reports/executive'), 'Onboarding must expose a first useful report path.'],
  [onboarding.includes('Business snapshot unavailable'), 'Snapshot failure must remain non-blocking for onboarding setup.'],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error('FAIL:', message);
  process.exit(1);
}
console.log('PASS: onboarding commercial value contract');
