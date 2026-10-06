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

const smartReportSource = fs.readFileSync(new URL('../src/lib/report-smart.ts', import.meta.url), 'utf8');
const fetchStart = smartReportSource.indexOf('export async function fetchSmartReport');
const fetchBlock = fetchStart >= 0 ? smartReportSource.slice(fetchStart) : '';
if (!fetchBlock.includes('const resolvedSourceHash')) throw new Error('Smart report must resolve source hash from the tenant-scoped job lineage');
if (fetchBlock.includes(".eq('source_hash', sourceHash)")) throw new Error('Smart report contains an unbound sourceHash query reference');
if (!fetchBlock.includes('if (normalizedSourceHash && resolvedSourceHash !== normalizedSourceHash)')) throw new Error('Explicit source hash mismatch must still be rejected');
console.log('smart-report-context-lineage: PASS');

// Product invariant: REVIEW_REQUIRED is a decision/readiness state, not an intelligence deletion state.
// A real kernel run must retain its calculated intelligence when the archetype is REVIEW_REQUIRED/INSUFFICIENT_SAMPLE/BLOCKED.
const reviewDropPattern = /intelligence\\s*=\\s*archetypeRun\\.state\\s*===\\s*['"]SUPPORTED['"]\\s*\\?\\s*archetypeRun\\.intelligence/;
if (reviewDropPattern.test(fetchBlock)) {
  throw new Error('Smart Report drops archetypeRun.intelligence for non-SUPPORTED states; REVIEW_REQUIRED must retain available intelligence.');
}
if (!fetchBlock.includes('intelligence = archetypeRun.intelligence')) {
  throw new Error('Smart Report must retain the actual archetypeRun.intelligence payload after a real run.');
}

// Product invariant: calculation persistence is evidence/readback infrastructure, not decision approval.
// Persist real calculations even when decision readiness is REVIEW_REQUIRED, then expose the real persistence/readback state.
const persistenceGuardPattern = /if\\s*\\(\\s*archetypeRun\\.state\\s*===\\s*['"]SUPPORTED['"]\\s*&&\\s*calculationsForPersistence\\.length\\s*>\\s*0\\s*\\)/;
if (persistenceGuardPattern.test(fetchBlock)) {
  throw new Error('Calculation persistence is incorrectly gated by SUPPORTED; REVIEW_REQUIRED calculations must still be persisted/read back.');
}
if (!fetchBlock.includes('persistAndReadBackCalculations({')) {
  throw new Error('Smart Report must execute calculation persistence/readback for real calculation results.');
}

console.log('smart-report-intelligence-retention: PASS');
