import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contractPath = path.join(root, 'src/lib/product-experience-contract.ts');
const appPath = path.join(root, 'src/App.tsx');
const journeyPath = path.join(root, 'src/components/ProductJourneyNav.tsx');
const commandPath = path.join(root, 'src/pages/ExecutiveCommandCenterPage.tsx');
const decisionPath = path.join(root, 'src/pages/DecisionExperiencePage.tsx');
const reportPath = path.join(root, 'src/pages/ExecutiveReportPage.tsx');

for (const file of [contractPath, appPath, journeyPath, commandPath, decisionPath, reportPath]) {
  if (!fs.existsSync(file)) throw new Error(`Missing product experience surface: ${path.relative(root, file)}`);
}

const contract = fs.readFileSync(contractPath, 'utf8');
const app = fs.readFileSync(appPath, 'utf8');
const journey = fs.readFileSync(journeyPath, 'utf8');
const command = fs.readFileSync(commandPath, 'utf8');
const decision = fs.readFileSync(decisionPath, 'utf8');
const report = fs.readFileSync(reportPath, 'utf8');

const requiredLifecycle = ['PROPOSED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'OUTCOME'];
const requiredTruth = ['AVAILABLE', 'NOT_AVAILABLE', 'NOT_YET_EXECUTED', 'RUNTIME_BLOCKED'];
const requiredStory = ['WHAT_HAPPENED', 'WHY', 'EVIDENCE', 'RECOMMENDATION', 'DECISION', 'OWNER', 'EXPECTED_IMPACT', 'ACTUAL_OUTCOME', 'LEARNING'];
const requiredTruthGuards = ['canClaimVerifiedEvidence', 'canClaimActualOutcome', 'canClaimDelta', 'canClaimOutcomeQuality', 'canClaimFeedback', 'canClaimLearning'];

for (const token of [...requiredLifecycle, ...requiredTruth, ...requiredStory, ...requiredTruthGuards]) {
  if (!contract.includes(token)) throw new Error(`Canonical product contract is missing ${token}`);
}

for (const route of ['/command-center', '/decision-experience', '/reports/executive']) {
  if (!app.includes(`path=\"${route}\"`)) throw new Error(`Missing coherent product route: ${route}`);
}

for (const token of ['aria-label', 'aria-current', 'focus-visible:ring', 'URLSearchParams', 'recommendationId', 'stage']) {
  if (!journey.includes(token)) throw new Error(`Journey navigation missing product contract: ${token}`);
}

if (!/recommendationId/.test(journey) || !/stage/.test(journey)) {
  throw new Error('Journey navigation must preserve recommendation context and lifecycle stage.');
}

for (const token of [
  'Decision Workspace',
  '/decision-experience?stage=decision',
  'رحلة القرار',
  '/decision-experience?stage=evidence',
  '/decision-experience?stage=approval',
  '/decision-experience?stage=work',
  '/decision-experience?stage=outcome',
  '/reports/executive',
]) {
  if (!command.includes(token)) throw new Error(`Command Center missing canonical journey bridge: ${token}`);
}

for (const token of [
  'Runtime unavailable',
  'Evidence Workspace',
  'NOT_VERIFIED',
  'RUNTIME_REQUIRED',
  'DECISION CANDIDATE',
  'PENDING_APPROVAL',
  'APPROVED / REJECTED',
  'Actual outcome not yet available',
  'Delta cannot yet be calculated',
  'Learning signal not yet verified',
]) {
  if (!decision.includes(token)) throw new Error(`Decision experience missing truth-safe surface: ${token}`);
}

if (/recommendations\.filter\(r => r\.status === ['"]done['"]\)/.test(decision)) {
  throw new Error('Decision experience must not infer verified outcomes from recommendation status.');
}

for (const token of ['Executive Summary', 'Expected impact', 'Actual', 'Learning', 'Print / PDF']) {
  if (!report.toLocaleLowerCase().includes(token.toLocaleLowerCase())) {
    throw new Error(`Executive reporting missing story surface: ${token}`);
  }
}

if (/fake|synthetic|mock/i.test(command + decision + report)) {
  throw new Error('Product experience contains forbidden fake/synthetic/mock runtime wording.');
}

console.log('PRODUCT_EXPERIENCE_CONTRACT=PASS');
console.log(`lifecycle_states=${requiredLifecycle.length}`);
console.log(`truth_states=${requiredTruth.length}`);
console.log(`report_story_sections=${requiredStory.length}`);
console.log(`truth_guards=${requiredTruthGuards.length}`);
console.log('command_center_journey=connected');
console.log('journey_context=preserved');
console.log('synthetic_runtime_data=NONE');
