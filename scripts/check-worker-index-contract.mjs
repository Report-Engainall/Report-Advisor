import fs from 'node:fs';

const index = fs.readFileSync('docs/MASTER_EXECUTION_INDEX.md', 'utf8');
const required = [
  'check-worker-lifecycle-guards.mjs',
  'check-worker-lease-expiry.mjs',
  'check-worker-service-role-boundary.mjs',
  'check-worker-tenant-isolation.mjs',
  'check-worker-terminal-state-guards.mjs',
];

const missing = required.filter((entry) => !index.includes(entry));
if (missing.length) {
  console.error(`FAIL: worker index contract missing ${missing.length} guard(s)`);
  missing.forEach((entry) => console.error(`- ${entry}`));
  process.exit(1);
}

console.log(`PASS: worker index contract (${required.length}/${required.length})`);
