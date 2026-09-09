import fs from 'node:fs';

const files = {
  page: 'src/pages/DecisionExperiencePage.tsx',
  runtime: 'src/lib/decision-automation/vertical-slice-runtime.ts',
  outcome: 'src/lib/analytics/outcome-feedback.ts',
};

for (const [name, path] of Object.entries(files)) {
  if (!fs.existsSync(path)) throw new Error(`Missing ${name} source: ${path}`);
}

const page = fs.readFileSync(files.page, 'utf8');
const runtime = fs.readFileSync(files.runtime, 'utf8');
const outcome = fs.readFileSync(files.outcome, 'utf8');

const requiredPage = [
  'Decision Workspace',
  'Approval Center',
  'Personal Workbench',
  'النتيجة والتعلّم',
  'RUNTIME_REQUIRED',
  'loadPersistedOutcomes',
  'decisionFingerprint',
  'Expected → Actual → Delta',
];
const requiredRuntime = [
  'createRuntimeDecision',
  'requestRuntimeApproval',
  'decideRuntimeApproval',
  'createRuntimeWorkItem',
  'startRuntimeWorkItem',
  'completeRuntimeWorkItem',
  'resolveCurrentCompanyId',
];
const requiredOutcome = [
  'persistOutcome',
  'loadPersistedOutcomes',
  'recommendation_outcomes',
  'OUTCOME_TENANT_CONTEXT_MISMATCH',
];

for (const token of requiredPage) if (!page.includes(token)) throw new Error(`Missing page lifecycle token: ${token}`);
for (const token of requiredRuntime) if (!runtime.includes(token)) throw new Error(`Missing runtime token: ${token}`);
for (const token of requiredOutcome) if (!outcome.includes(token)) throw new Error(`Missing outcome token: ${token}`);

const forbidden = /Math\.random|\bfake\b|\bmock\b|synthetic|localApproval|localOutcome/i;
for (const [name, content] of Object.entries({ page, runtime, outcome })) {
  if (forbidden.test(content)) throw new Error(`Synthetic/local runtime pattern found in ${name}`);
}

if (!/outcome\.decisionFingerprint\s*===\s*selected\.id/.test(page)) {
  throw new Error('Outcome-to-recommendation matching is not exact and fail-closed');
}

console.log('Decision runtime surface contract: PASS');
