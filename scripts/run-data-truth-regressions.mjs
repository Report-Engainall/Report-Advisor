import { spawnSync } from 'node:child_process';

const checks = [
  ['ABC/XYZ truth', 'scripts/check-abc-xyz-truth.mjs'],
];

for (const [name, script] of checks) {
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`${name} regression failed`);
    process.exit(result.status ?? 1);
  }
}

console.log('Data truth regressions: PASS');
