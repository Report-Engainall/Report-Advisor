import fs from 'node:fs/promises';
await import('./production-scenario-runtime-e2e.mjs');
await fs.mkdir('artifacts/e2e-business', { recursive: true });
await fs.copyFile('release-evidence/production-regression-results.json', 'artifacts/e2e-business/production-regression-results.json');
