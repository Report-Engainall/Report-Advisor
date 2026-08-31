import { spawnSync } from 'node:child_process';

const result = spawnSync('npx', ['vitest', 'run', 'src/lib/metricEngine.boundary.test.ts'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
