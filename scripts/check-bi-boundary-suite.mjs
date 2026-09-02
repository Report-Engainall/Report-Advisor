import { spawnSync } from 'node:child_process';

const suites = [
  'src/lib/bi-output-integrity-contract.test.ts',
  'src/lib/bi-adversarial-input-contract.test.ts',
];

for (const suite of suites) {
  const result = spawnSync('npx', ['vitest', 'run', suite], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('PASS: BI boundary suite completed.');
