import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const SHA = /^[0-9a-f]{40}$/;
const INDEX = 'docs/MASTER_EXECUTION_INDEX.md';
const REQUIRED_EXCLUSIVE_WORKFLOWS = [
  '.github/workflows/final-certification-gate.yml',
  '.github/workflows/release-certification.yml',
  '.github/workflows/p1-filesystem-windows-deep-hardening.yml',
];
const EXCLUSIVE_GROUP = 'report-advisor-exclusive-certification';

const index = fs.readFileSync(INDEX, 'utf8');

const requiredFullShaLabels = [
  'Current main',
  'Current code/test candidate',
  'Previous executable candidate',
  'CURRENT CODE/TEST CANDIDATE',
  'Base execution SHA',
  'Worker mutation commit',
  'Index-preservation/candidate-binding commit',
];

for (const label of requiredFullShaLabels) {
  const re = new RegExp(`${label.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}[^\\n]*\\x60([^\\x60]+)\\x60`, 'i');
  const match = index.match(re);
  if (!match) throw new Error(`SHA format gate: required SHA field missing: ${label}`);
  if (!SHA.test(match[1].toLowerCase())) {
    throw new Error(`SHA format gate: non-full SHA in active field ${label}: ${match[1]}`);
  }
}

const abbreviatedOperational = index.split(/\r?\n/).filter((line) => {
  if (!/(candidate|current main|base execution sha|mutation commit|index-preservation|exact candidate)/i.test(line)) return false;
  return /`[0-9a-f]{7,39}`/i.test(line);
});
if (abbreviatedOperational.length) {
  throw new Error(`SHA format gate: abbreviated operational SHA detected:\n${abbreviatedOperational.join('\n')}`);
}

for (const workflowPath of REQUIRED_EXCLUSIVE_WORKFLOWS) {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  const groupMatch = workflow.match(/^\s*group:\s*([^\n]+)$/m);
  if (!groupMatch || !groupMatch[1].includes(EXCLUSIVE_GROUP)) {
    throw new Error(`Parallelism gate: ${workflowPath} is not bound to ${EXCLUSIVE_GROUP}`);
  }
  if (!/^\s*cancel-in-progress:\s*false\s*$/m.test(workflow)) {
    throw new Error(`Parallelism gate: ${workflowPath} must queue, not cancel, competing certification work`);
  }
}

const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (!SHA.test(head)) throw new Error(`Parallelism gate: invalid current HEAD: ${head}`);

const status = execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim();
if (status) throw new Error(`Parallelism gate: dirty checkout would invalidate exact-SHA evidence:\n${status}`);

console.log(JSON.stringify({
  shaFormat: 'PASS',
  operationalShaIdentifiers: 'FULL_40_HEX',
  exclusiveLane: EXCLUSIVE_GROUP,
  competingCertificationWork: 'SERIALIZED',
  cancellationPolicy: 'QUEUE',
  exactHead: head,
}));
