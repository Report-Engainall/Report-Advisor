import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/deep-truth-closure.yml','utf8');
const required = [
  'Exact SHA',
  'test:production-certification-contract',
  'test:operational-resilience',
];
for (const token of required) if (!workflow.includes(token)) throw new Error(`Missing runtime certification boundary: ${token}`);
console.log('RUNTIME_CERTIFICATION_BOUNDARIES_PASS');
