import fs from 'node:fs';

const gate = fs.readFileSync('src/lib/report-evidence-gate.ts', 'utf8');
const freshness = fs.readFileSync('src/lib/freshness.ts', 'utf8');

for (const token of [
  'assessFreshness',
  'evidenceCount === 0',
  'qualityScore < 70',
  'requiresFreshData',
  'canDriveExecutiveDecisions',
  'ready: blockingIssues.length === 0',
]) {
  if (!gate.includes(token)) throw new Error(`Report evidence gate missing: ${token}`);
}

for (const token of ['FRESH', 'WARNING', 'STALE', 'CRITICAL', 'UNKNOWN', 'canDriveForecast', 'canDriveAlerts']) {
  if (!freshness.includes(token)) throw new Error(`Freshness contract missing: ${token}`);
}

console.log('Report evidence + freshness gate: PASS');
