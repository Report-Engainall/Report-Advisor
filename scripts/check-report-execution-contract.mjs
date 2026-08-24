import { readFileSync } from 'node:fs';

const contract = readFileSync('src/lib/reportExecutionContract.ts', 'utf8');
for (const token of [
  'companyId',
  'snapshotId',
  'semanticDefinitionVersion',
  'assertReportExecutionScope',
  "status: 'queued'",
  'correlationId',
]) {
  if (!contract.includes(token)) throw new Error(`Missing report execution contract invariant: ${token}`);
}

const roadmap = readFileSync('docs/IMPLEMENTATION_ROADMAP.md', 'utf8');
for (const token of [
  'Phase A — Report execution',
  'trusted worker adapter',
  'queue_report_run',
  'claim_report_run',
  'immutable run evidence',
  'delivery results',
]) {
  if (!roadmap.includes(token)) throw new Error(`Missing report execution requirement: ${token}`);
}

console.log('Report execution contract: PASS');
