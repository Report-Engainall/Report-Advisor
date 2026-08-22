import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/quality.yml', 'utf8');
const scripts = pkg.scripts ?? {};
const commands = [...workflow.matchAll(/run:\s*npm run ([^\s]+)/g)].map((m) => m[1]);

if (commands.length === 0) throw new Error('Quality workflow contains no npm test commands.');

const uniqueCommands = [...new Set(commands)];
const missing = uniqueCommands.filter((name) => !scripts[name]);
if (missing.length) {
  throw new Error(`Quality workflow references missing npm scripts: ${missing.join(', ')}`);
}

if (!workflow.includes('workflow_dispatch:')) {
  throw new Error('Quality workflow must remain manually dispatchable.');
}
if (!workflow.includes('npm ci --no-audit --no-fund')) {
  throw new Error('Quality workflow must use locked, non-auditing dependency installation.');
}
if (!workflow.includes('npm run typecheck') || !workflow.includes('npm run lint') || !workflow.includes('npm run build')) {
  throw new Error('Quality workflow must retain typecheck, lint, and build gates.');
}

const requiredStages = [
  'Quality workflow contract',
  'Typecheck',
  'Lint',
  'Build',
  'Performance budget',
  'Global tenant RLS',
  'Import RPC tenant context',
  'Import business key',
  'Report truth contract',
];
const missingStages = requiredStages.filter((stage) => !workflow.includes(`- name: ${stage}`));
if (missingStages.length) {
  throw new Error(`Quality workflow is missing mandatory stages: ${missingStages.join(', ')}`);
}

if (!/concurrency:\s*\n\s*group:\s*quality-\$\{\{ github\.ref \}\}/m.test(workflow)) {
  throw new Error('Quality workflow must define a stable per-ref concurrency group.');
}
if (!/cancel-in-progress:\s*true/.test(workflow)) {
  throw new Error('Quality workflow must cancel superseded runs to avoid stale verification.');
}
if (!/timeout-minutes:\s*25/.test(workflow)) {
  throw new Error('Quality workflow must retain an explicit execution timeout.');
}

console.log(`Quality workflow contract: PASS (${uniqueCommands.length} npm commands, ${requiredStages.length} mandatory stages)`);
