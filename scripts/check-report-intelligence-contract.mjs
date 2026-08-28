import fs from 'node:fs';

const required = [
  'src/lib/reportIntelligenceModel.ts',
  'src/lib/workforceExecution.ts',
  'src/lib/notificationIntelligence.ts',
  'docs/capability-loss-guard-v2.md',
  'docs/e2e-product-benchmark-v1.md',
  'docs/report-print-design-system-v1.md',
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('missing canonical artifact: ' + file);
}

const report = fs.readFileSync(required[0], 'utf8');
for (const token of ['ReportIntelligenceModel','dataAsOf','metricVersion','evidence','recommendations','decisions','tasks','outcomes']) {
  if (!report.includes(token)) throw new Error('report contract missing ' + token);
}

const workforce = fs.readFileSync(required[1], 'utf8');
if (!workforce.includes('Deterministic routing only')) throw new Error('workforce routing must be deterministic');

const notification = fs.readFileSync(required[2], 'utf8');
if (!notification.includes('dedupeKey') || !notification.includes('shouldNotify')) throw new Error('notification intelligence contract incomplete');

console.log('report intelligence/workforce/notification/product benchmark contracts: PASS');
