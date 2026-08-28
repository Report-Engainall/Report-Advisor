import fs from 'node:fs';
const report = fs.readFileSync('src/lib/reportIntelligenceModel.ts','utf8');
const workforce = fs.readFileSync('src/lib/workforceExecution.ts','utf8');
const notification = fs.readFileSync('src/lib/notificationIntelligence.ts','utf8');

for (const token of ['ReportIntelligenceModel','dataAsOf','metricVersion','evidence','recommendations','decisions','tasks','outcomes']) {
  if (!report.includes(token)) throw new Error('report projection invariant missing: ' + token);
}
if (!report.includes('never calculates metric truth')) throw new Error('report must remain projection-only');
if (!workforce.includes('Deterministic routing only')) throw new Error('AI must not own authorization routing');
if (!workforce.includes('tenantConfigKey') || !workforce.includes('policyVersion')) throw new Error('routing provenance missing');
if (!notification.includes('dedupeKey') || !notification.includes('evidenceFingerprint')) throw new Error('notification dedupe provenance missing');
console.log('architecture invariants: PASS');
