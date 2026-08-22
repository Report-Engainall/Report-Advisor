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

// Quality runs must be isolated. A later manual run must never cancel the run whose
// result is being used as release evidence. Include run_id (or another unique key)
// in the concurrency group and disable cancellation.
if (!/concurrency:\s*\n\s*group:\s*quality-\$\{\{ github\.ref \}\}-\$\{\{ github\.event_name \}\}-\$\{\{ github\.run_id \}\}/m.test(workflow)) {
  throw new Error('Quality workflow must define a unique per-run concurrency group.');
}
if (!/cancel-in-progress:\s*false/.test(workflow)) {
  throw new Error('Quality workflow must not cancel an in-flight verification run.');
}
if (!/timeout-minutes:\s*40/.test(workflow)) {
  throw new Error('Quality workflow must retain an explicit 40-minute execution timeout.');
}

console.log(`Quality workflow contract: PASS (${uniqueCommands.length} npm commands, ${requiredStages.length} mandatory stages)`);
