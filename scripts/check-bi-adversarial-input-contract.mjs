import { spawnSync } from 'node:child_process';

const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['exec', 'vitest', 'run', 'src/lib/bi-adversarial-input-contract.test.ts', '--run'], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(`Unable to execute BI adversarial contract: ${result.error.message}`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
