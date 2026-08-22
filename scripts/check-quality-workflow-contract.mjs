import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const workflow = fs.readFileSync('.github/workflows/quality.yml', 'utf8');
const scripts = pkg.scripts ?? {};
const commands = [...workflow.matchAll(/run:\s*npm run ([^\s]+)/g)].map((m) => m[1]);

if (commands.length === 0) throw new Error('Quality workflow contains no npm test commands.');

const missing = [...new Set(commands)].filter((name) => !scripts[name]);
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

console.log(`Quality workflow contract: PASS (${new Set(commands).size} npm commands resolved)`);
