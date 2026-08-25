import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const quality = read('.github/workflows/quality.yml');
const jkl = read('.github/workflows/j-k-l-runtime-wave.yml');
const autonomy = read('.github/workflows/autonomy-safety-wave.yml');
const phaseF = read('.github/workflows/phase-f-live-resilience.yml');

const requiredQualityGates = [
  'test:phase-k-runtime',
  'test:phase-l-runtime',
  'test:phase-l-resumable-execution',
  'test:phase-m-certification',
  'test:k-to-s-closure',
  'test:k-to-s-deep-closure',
  'test:production-release-blockers',
  'test:production-certification-contract',
];
for (const gate of requiredQualityGates) {
  if (!quality.includes(gate)) throw new Error(`Canonical quality path missing: ${gate}`);
}
if (!quality.includes('push: {branches: [main]}')) {
  throw new Error('Quality must remain the canonical main push gate');
}

// These are deliberately manual/dispatch or scoped waves. They may contain
// narrowly-scoped push triggers without becoming a second canonical quality gate.
for (const [name, text] of [
  ['j-k-l-runtime-wave', jkl],
  ['autonomy-safety-wave', autonomy],
  ['phase-f-live-resilience', phaseF],
]) {
  if (!text.includes('workflow_dispatch:')) {
    throw new Error(`${name} must remain manually executable`);
  }
}

const workflowDir = path.join(root, '.github/workflows');
const names = fs.readdirSync(workflowDir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
const pushWorkflows = names.filter((f) => {
  const text = read(`.github/workflows/${f}`);
  return /(^|\n)\s+push:\s*(?:\n|$)/.test(text);
});

// The canonical topology is defined by the explicit main push trigger. Other
// workflows may legitimately listen to tags, paths, or scoped events.
const canonicalPushWorkflows = names.filter((f) => {
  const text = read(`.github/workflows/${f}`);
  return /push:\s*\n\s+branches:\s*\[main\]/.test(text) ||
    /push:\s*\{\s*branches:\s*\[main\]\s*\}/.test(text);
});
if (!canonicalPushWorkflows.includes('quality.yml')) {
  throw new Error('quality.yml must be the canonical main push workflow');
}
if (canonicalPushWorkflows.length !== 1) {
  throw new Error(`Expected exactly one main-push workflow, found: ${canonicalPushWorkflows.join(', ')}`);
}

console.log(JSON.stringify({
  contract: 'ci-execution-topology',
  canonicalPushGate: 'quality.yml',
  canonicalPushWorkflows,
  allPushWorkflows: pushWorkflows,
  manualWaves: [
    'j-k-l-runtime-wave.yml',
    'autonomy-safety-wave.yml',
    'phase-f-live-resilience.yml',
  ],
}));
