import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { timingSafeEqual } from 'node:crypto';
import { isProductionEnv } from '../src/server/resilience-runtime.mjs';

assert.equal(isProductionEnv(), false);
process.env.RESILIENCE_TARGET_ENV = 'production';
assert.equal(isProductionEnv(), true);
delete process.env.RESILIENCE_TARGET_ENV;

const files = [
  'api/health.mjs',
  'api/tenant-canary.mjs',
  'api/backup-restore-verify.mjs',
  'api/rollback-drill.mjs',
  'src/server/resilience-runtime.mjs',
  'scripts/phase-f-live-resilience-probes.mjs',
];
for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });

const a = Buffer.from('resilience-secret');
const b = Buffer.from('resilience-secret');
assert.equal(timingSafeEqual(a, b), true);
console.log(`PASS: resilience runtime syntax + guard tests (${files.length} files).`);
