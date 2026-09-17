#!/usr/bin/env node
/** Phase F live resilience probes. Fail-closed; never synthesize PASS. */
import fs from 'node:fs';
import path from 'node:path';

const required = [
  'RESILIENCE_TARGET_ENV',
  'RESILIENCE_OPERATIONAL_TOKEN',
  'RESILIENCE_CANARY_AUTH_TOKEN',
  'RESILIENCE_HEALTH_URL',
  'RESILIENCE_CANARY_URL',
  'RESILIENCE_BACKUP_VERIFY_URL',
  'RESILIENCE_ROLLBACK_DRILL_URL',
];

const reportDir = path.join(process.cwd(), 'artifacts', 'phase-f');
const reportPath = path.join(reportDir, 'phase-f-readiness.json');
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const target = process.env.RESILIENCE_TARGET_ENV?.trim() || null;
const missing = required.filter(name => !process.env[name]?.trim());

fs.mkdirSync(reportDir, { recursive: true });

function writeReport(status, reason, extra = {}) {
  const report = {
    exactHead,
    targetEnv: target,
    status,
    reason,
    required,
    missing,
    checkedAt: new Date().toISOString(),
    ...extra,
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`PHASE_F_STATUS=${status}`);
  console.log(`PHASE_F_REPORT=${reportPath}`);
  console.log(`PHASE_F_REASON=${reason}`);
}

if (missing.length) {
  writeReport(
    'BLOCKED EXTERNAL',
    'Required live resilience secrets/targets are not provisioned in the execution environment.',
    { blockedDependency: missing },
  );
  console.error('FAIL-CLOSED: missing Phase F live configuration:');
  for (const name of missing) console.error(`- ${name}`);
  process.exit(2);
}

if (/^(prod|production)$/i.test(target) && process.env.RESILIENCE_ALLOW_PRODUCTION !== 'true') {
  writeReport(
    'NOT READY',
    'Production target requires explicit RESILIENCE_ALLOW_PRODUCTION=true.',
    { policyViolation: 'RESILIENCE_ALLOW_PRODUCTION' },
  );
  console.error('FAIL-CLOSED: production requires explicit RESILIENCE_ALLOW_PRODUCTION=true');
  process.exit(3);
}

const checks = [];

async function probe(name, url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'x-resilience-token': process.env.RESILIENCE_OPERATIONAL_TOKEN.trim(),
        ...(options.headers || {}),
      },
    });
    const body = await response.text();
    const pass = response.ok;
    checks.push({ name, pass, status: response.status });
    console.log(`${pass ? 'PASS' : 'FAIL'} ${name}: HTTP ${response.status}`);
    if (!pass) console.error(body.slice(0, 500));
  } catch (error) {
    checks.push({ name, pass: false, error: String(error) });
    console.error(`FAIL ${name}: ${error}`);
  }
}

await probe('operational-health', process.env.RESILIENCE_HEALTH_URL);
await probe('tenant-canary', process.env.RESILIENCE_CANARY_URL, {
  headers: { Authorization: `Bearer ${process.env.RESILIENCE_CANARY_AUTH_TOKEN.trim()}` },
});
await probe('backup-restore-verification', process.env.RESILIENCE_BACKUP_VERIFY_URL, { method: 'POST' });
await probe('rollback-forward-fix-drill', process.env.RESILIENCE_ROLLBACK_DRILL_URL, { method: 'POST' });

const failed = checks.filter(check => !check.pass);
const status = failed.length ? 'NOT READY' : 'READY';
writeReport(
  status,
  failed.length ? 'One or more live resilience probes failed.' : 'All configured live resilience probes passed.',
  { checks, passed: checks.length - failed.length, failed: failed.length },
);

console.log(`Phase F live result: ${checks.length - failed.length}/${checks.length} passed.`);
if (failed.length) {
  console.error('FAIL-CLOSED: Phase F live resilience is not certified.');
  process.exit(10);
}
console.log('PASS: Phase F live resilience probes completed.');
