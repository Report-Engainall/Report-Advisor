import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['exec', '--', 'vitest', 'run', 'src/lib/metricEngine.boundary.test.ts'], {
  stdio: 'inherit',
  shell: false,
  env: { ...process.env, CI: '1' },
});

if (result.error) throw result.error;
if (result.signal) {
  console.error(`METRIC_BOUNDARY_TERMINATED_BY=${result.signal}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
