import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');

const trust = read('src/lib/trust-state.ts');
const badge = read('src/components/ui/TrustBadge.tsx');
const truthContext = read('src/components/TruthContextStrip.tsx');
const analytics = read('src/pages/AnalyticsPage.tsx');
const trustEvidence = read('src/pages/TrustEvidencePage.tsx');
const decision = read('src/pages/DecisionExperiencePage.tsx');
const states = read('src/components/ui/States.tsx');
const phaseF = read('scripts/phase-f-live-resilience-probes.mjs');

for (const token of [
  "'INSUFFICIENT_SAMPLE'",
  "'SAMPLE_TOO_SMALL'",
  "case 'NO_DATA': return 'INSUFFICIENT_DATA';",
  "case 'REVIEW_REQUIRED': return 'REVIEW';",
]) {
  if (!trust.includes(token)) throw new Error(`Trust state contract missing: ${token}`);
}

for (const [file, tokens] of [
  ['src/components/ui/TrustBadge.tsx', ['INSUFFICIENT_SAMPLE', 'UsersRound']],
  ['src/components/TruthContextStrip.tsx', ['INSUFFICIENT_SAMPLE']],
  ['src/pages/AnalyticsPage.tsx', ['TrustBadge', 'INSUFFICIENT_SAMPLE']],
  ['src/pages/TrustEvidencePage.tsx', ['TrustBadge', 'INSUFFICIENT_SAMPLE']],
  ['src/pages/DecisionExperiencePage.tsx', ['BoundaryState variant="blocked"']],
  ['src/pages/ExecutiveCommandCenterPage.tsx', ['TrustBadge', 'trustStateFromDataStatus']],
  ['src/components/ui/States.tsx', ['export function BoundaryState', "variant === 'review'", "variant === 'insufficient'"]],
]) {
  const source = read(file);
  for (const token of tokens) {
    if (!source.includes(token)) throw new Error(`UI truth contract missing in ${file}: ${token}`);
  }
}

for (const token of [
  '^[0-9a-f]{40}$',
  'snapshotRequestStartedAt',
  'snapshotResponseReceivedAt',
  'snapshotObservedAt',
  'DEPLOYMENT_SHA_MISMATCH',
]) {
  if (!phaseF.includes(token)) throw new Error(`Phase-F identity/timing contract missing: ${token}`);
}

console.log('Deep truth UI contract: PASS (canonical trust states, shared boundary states, and fail-closed Phase-F identity/timing are wired).');
