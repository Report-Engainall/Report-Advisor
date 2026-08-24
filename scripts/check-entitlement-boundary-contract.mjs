import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
if (!packageJson.scripts['test:report-execution-contract']) throw new Error('Report execution gate must be wired before entitlement enforcement.');

const roadmap = readFileSync('docs/IMPLEMENTATION_ROADMAP.md', 'utf8');
for (const token of [
  'Phase B — Usage/entitlements',
  'Enforce limits at the server boundary before expensive jobs',
  'billing provider adapter',
  'webhook verification',
]) {
  if (!roadmap.includes(token)) throw new Error(`Missing entitlement boundary requirement: ${token}`);
}

console.log('Entitlement boundary contract: PASS');
