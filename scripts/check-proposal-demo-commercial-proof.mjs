import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/ProposalDemoPage.tsx', 'utf8');
for (const token of [
  'proofState',
  'commercialAngle',
  'proofCounts',
  'proposalDraft',
  'copyProposal',
  'Proof Gap',
  'نسخ مسودة العرض',
  'لا تتجاوز Proof State الحالي',
]) assert.ok(source.includes(token), `proposal demo contract missing: ${token}`);

const capabilityBlock = source.match(/const CAPABILITIES: Capability\[\] = \[(.*?)\];/s)?.[1] ?? '';
const capabilityCount = (capabilityBlock.match(/id: '/g) ?? []).length;
assert.ok(capabilityCount >= 12, 'proposal demo requires a reusable capability catalog');

for (const state of ['LIVE_SURFACE','RUNTIME_REQUIRED','PARTIAL']) {
  assert.ok(capabilityBlock.includes(`proofState: '${state}'`), `missing proof state: ${state}`);
}
assert.ok(!source.includes('5 years experience'), 'proposal copy must not contain fabricated experience claims');
assert.ok(!source.includes('CERTIFIED'), 'proposal demo must not imply certification');
console.log(`Proposal Demo commercial-proof contract: PASS (${capabilityCount} capabilities)`);
