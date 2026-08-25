import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const workflowDir = path.join(root, '.github/workflows');
const read = (name) => fs.readFileSync(path.join(workflowDir, name), 'utf8');
const files = fs.readdirSync(workflowDir).filter((f) => /\.(yml|yaml)$/.test(f));
const hasEvent = (text, event) => new RegExp(`(^|\\n)\\s+${event}:`, 'm').test(text) || new RegExp(`${event}:\\s*\\{`).test(text);
const branchListContains = (text, event, branch) => {
  const inline = new RegExp(`${event}:\\s*\\{[^}]*branches:\\s*\\[[^\\]]*\\b${branch}\\b[^\\]]*\\]`, 's');
  if (inline.test(text)) return true;
  const eventStart = text.indexOf(`\\n  ${event}:`);
  if (eventStart < 0) return false;
  const tail = text.slice(eventStart, eventStart + 600);
  return new RegExp(`\\bbranches:\\s*\\n(?:\\s+-\\s+[^\\n]+\\n?)*`, 'm').test(tail)
    && new RegExp(`(^|\\n)\\s+-\\s+${branch}\\s*$`, 'm').test(tail);
};

const workflows = files.map((file) => ({
  file,
  text: read(file),
  hasPush: hasEvent(read(file), 'push'),
  hasMainPush: branchListContains(read(file), 'push', 'main'),
  hasMainPr: branchListContains(read(file), 'pull_request', 'main'),
  hasDispatch: /workflow_dispatch:/.test(read(file)),
}));

const quality = workflows.find((w) => w.file === 'quality.yml');
if (!quality) throw new Error('Missing canonical quality.yml workflow');
if (!quality.hasMainPush) throw new Error('quality.yml must remain the canonical main push gate');

const required = [
  'test:phase-k-runtime',
  'test:phase-l-runtime',
  'test:phase-m-certification',
  'test:k-to-s-closure',
  'test:production-release-blockers',
  'test:production-certification-contract',
];
for (const gate of required) {
  if (!quality.text.includes(gate)) throw new Error(`quality.yml missing required canonical gate: ${gate}`);
}

const competing = workflows
  .filter((w) => w.file !== 'quality.yml' && w.hasMainPush)
  .filter((w) => required.every((gate) => w.text.includes(gate)));
if (competing.length) {
  throw new Error(`Duplicate canonical quality gate set: ${competing.map((w) => w.file).join(', ')}`);
}

const secondary = workflows.find((w) => w.file === 'secondary-agent-batch04.yml');
if (!secondary) throw new Error('Missing secondary-agent-batch04.yml');
if (secondary.hasMainPush) throw new Error('Secondary workflow must not push-trigger on main');
if (!secondary.hasDispatch) throw new Error('Secondary workflow must remain manually executable');

const report = {
  contract: 'secondary-batch17-ci-topology-audit',
  canonicalMainPushGate: 'quality.yml',
  mainPushWorkflows: workflows.filter((w) => w.hasMainPush).map((w) => w.file),
  allPushWorkflows: workflows.filter((w) => w.hasPush).map((w) => w.file),
  secondaryWorkflow: {
    file: secondary.file,
    mainPush: secondary.hasMainPush,
    workflowDispatch: secondary.hasDispatch,
  },
  result: 'PASS',
};
console.log(JSON.stringify(report, null, 2));
