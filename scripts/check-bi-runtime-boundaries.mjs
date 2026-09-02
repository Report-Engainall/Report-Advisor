import { spawnSync } from 'node:child_process';

const result = spawnSync('npx', ['vitest', 'run', 'src/lib/bi-runtime-boundaries.test.ts'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
