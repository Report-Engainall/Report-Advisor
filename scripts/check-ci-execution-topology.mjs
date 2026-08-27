import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const workflowDir = path.join(root, '.github/workflows');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const quality = read('.github/workflows/quality.yml');
const productionBoundary = read('.github/workflows/production-evidence-boundary.yml');
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
if (!/^  push:\s*\n(?:    .*\n)*?\s{4}branches:\s*\[main\]/m.test(productionBoundary)) {
  throw new Error('Production evidence boundary must retain an explicit main push trigger');
}
if (!productionBoundary.includes('node scripts/check-production-certification-contract.mjs')) {
  throw new Error('Production evidence boundary must execute the direct certification contract');
}

for (const [name, text] of [
  ['j-k-l-runtime-wave', jkl],
  ['autonomy-safety-wave', autonomy],
  ['phase-f-live-resilience', phaseF],
]) {
  if (/^ {2}push:\s*(?:\{|$)/m.test(text)) {
    throw new Error(`${name} must not define a push trigger; it is a manual/scheduled wave`);
  }
}

const names = fs.readdirSync(workflowDir)
  .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'));

function pushTrigger(text) {
  const inline = text.match(/^ {2}push:\s*\{([^}]*)\}/m);
  if (inline) return { present: true, config: inline[1] };

  const match = text.match(/^ {2}push:\s*$/m);
  if (!match) return { present: false, config: '' };

  const start = match.index + match[0].length;
  const rest = text.slice(start);
  const nextTopLevel = rest.search(/^\S/m);
  const block = nextTopLevel >= 0 ? rest.slice(0, nextTopLevel) : rest;
  return { present: true, config: block };
}

const pushWorkflows = [];
const canonicalMainPushWorkflows = [];
const scopedPushWorkflows = [];
const broadPushWorkflows = [];
const productionBoundaryWorkflows = [];

for (const file of names) {
  const trigger = pushTrigger(read(`.github/workflows/${file}`));
  if (!trigger.present) continue;

  pushWorkflows.push(file);
  const config = trigger.config.replace(/\s+/g, ' ');
  const targetsMain = /branches\s*:\s*\[?\s*main\s*\]?/.test(config);
  const hasBranchRestriction = /branches\s*:|branches-ignore\s*:/.test(config);
  const hasPathRestriction = /paths\s*:|paths-ignore\s*:/.test(config);
  const hasTagRestriction = /tags\s*:|tags-ignore\s*:/.test(config);
  const isProductionBoundary = file === 'production-evidence-boundary.yml';
  const isCanonicalMain = targetsMain && !hasPathRestriction && !hasTagRestriction && !isProductionBoundary;
  if (isCanonicalMain) canonicalMainPushWorkflows.push(file);
  if (isProductionBoundary) productionBoundaryWorkflows.push(file);

  // Tag-only release workflows are intentionally scoped even without branch/path filters.
  if (!hasBranchRestriction && !hasPathRestriction && !hasTagRestriction && !isProductionBoundary) broadPushWorkflows.push(file);
  if (!isCanonicalMain && !isProductionBoundary) scopedPushWorkflows.push(file);
}

if (canonicalMainPushWorkflows.length !== 1 || canonicalMainPushWorkflows[0] !== 'quality.yml') {
  throw new Error(`Expected quality.yml to be the only canonical main push workflow, found: ${canonicalMainPushWorkflows.join(', ') || 'none'}`);
}

const nonCanonicalBroad = broadPushWorkflows.filter((file) => file !== 'quality.yml');
if (nonCanonicalBroad.length) {
  throw new Error(`Non-canonical broad push workflows are not allowed: ${nonCanonicalBroad.join(', ')}`);
}

if (productionBoundaryWorkflows.length !== 1) {
  throw new Error(`Expected exactly one production evidence boundary workflow, found: ${productionBoundaryWorkflows.join(', ') || 'none'}`);
}

console.log(JSON.stringify({
  contract: 'ci-execution-topology',
  canonicalPushGate: 'quality.yml',
  pushWorkflows,
  canonicalMainPushWorkflows,
  productionBoundaryWorkflows,
  scopedPushWorkflows: pushWorkflows.filter((file) => !canonicalMainPushWorkflows.includes(file) && !productionBoundaryWorkflows.includes(file)),
  manualWaves: ['j-k-l-runtime-wave.yml', 'autonomy-safety-wave.yml', 'phase-f-live-resilience.yml'],
}));
