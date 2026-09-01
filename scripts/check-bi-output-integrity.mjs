import { spawnSync } from 'node:child_process';

const result = spawnSync('npx', ['vitest', 'run', 'src/lib/bi-output-integrity-contract.test.ts'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
console.log('PASS: BI output integrity contract runner completed.');
