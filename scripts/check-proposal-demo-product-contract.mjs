#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const page = read('src/pages/ProposalDemoPage.tsx');

const checks = [
  [page.includes('CAPABILITY') || page.includes('CAPABILITIES'), 'Proposal Demo must use a real product capability catalog.'],
  [page.includes('Capability Mapping'), 'Proposal Demo must expose requirement-to-capability mapping.'],
  [page.includes('selectedCapabilityIds'), 'Proposal Demo must let the user choose the live paths shown in the proposal.'],
  [page.includes('ضمن العرض'), 'Selected live capabilities must be visible in the mapping surface.'],
  [page.includes('حزمة العرض المختارة'), 'Proposal Demo must expose a selected showcase bundle.'],
  [page.includes('نسخ ملخص العرض'), 'Proposal Demo must support extracting a reusable proposal summary.'],
  [page.includes('navigator.clipboard.writeText'), 'Proposal summary copy must use a real browser clipboard action.'],
  [page.includes('window.location.origin'), 'Generated proposal links must resolve to the actual running product origin.'],
  [page.includes('window.print()'), 'Proposal Demo must remain exportable/printable.'],
  [page.includes('/reports/executive'), 'Proposal Demo must retain a first real executive-output route.'],
  [page.includes('لا تُنشئ هذه الشاشة بيانات أعمال اصطناعية'), 'Proposal Demo must explicitly reject synthetic business evidence.'],
  [page.includes('item.match.path'), 'Selected capability links must open actual product paths.'],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error('FAIL:', message);
  process.exit(1);
}
console.log('PASS: proposal demo product contract');

