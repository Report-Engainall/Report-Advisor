import { readFile } from 'node:fs/promises';

const workflow = await readFile('.github/workflows/phase-e-live-certification.yml', 'utf8');
const reports = await readFile('src/pages/ReportsPage.tsx', 'utf8');

const requiredSecrets = [
  'CERT_SUPABASE_URL', 'CERT_SUPABASE_ANON_KEY', 'CERT_TENANT_A_ID',
  'CERT_TENANT_B_ID', 'CERT_USER_A_JWT', 'CERT_USER_B_JWT',
];

const results = [];
const pass = (id, detail) => results.push({ id, status: 'PASS', detail });
const gap = (id, detail) => results.push({ id, status: 'NOT PROVEN', detail });

for (const name of requiredSecrets) {
  const mapped = workflow.includes(`secrets.${name}`) && workflow.includes(`${name}:`);
  if (mapped) pass(`SECRET-MAP-${name}`, 'Exact secret name is mapped into the Phase-E runtime step without exposing its value.');
  else gap(`SECRET-MAP-${name}`, 'Exact secret mapping is absent from the committed workflow.');
}

if (/^\s*environment:/m.test(workflow)) gap('SECRET-ENV-BINDING', 'Workflow/job declares an environment binding that may alter secret visibility.');
else pass('SECRET-ENV-BINDING', 'No workflow/job environment binding exists in phase-e-live-certification.yml; runtime secret references are direct Actions secrets.');

if (workflow.includes('pull_request:')) gap('SECRET-PR-TOPOLOGY', 'Workflow has pull_request execution that requires separate fork/approval analysis.');
else pass('SECRET-PR-TOPOLOGY', 'Phase-E workflow does not declare pull_request; current observed execution was a push by the repository branch.');

const exportButtons = [...reports.matchAll(/<button[^>]*>[\s\S]{0,240}<Download[^>]*>[\s\S]{0,160}<\/button>/g)];
const wiredExportButtons = exportButtons.filter(m => /onClick=/.test(m[0]));
if (exportButtons.length > 0 && wiredExportButtons.length === 0) {
  gap('GP-EXPORT-CONSUMER', `ReportsPage contains ${exportButtons.length} Download button(s), but none has an onClick handler in the target source; export consumer is disconnected at UI wiring level.`);
} else if (wiredExportButtons.length > 0) {
  pass('GP-EXPORT-CONSUMER', `${wiredExportButtons.length}/${exportButtons.length} Download button(s) have UI handlers; downstream exporter/query chain still requires runtime proof.`);
} else {
  gap('GP-EXPORT-CONSUMER', 'No Download button was found in ReportsPage; export surface cannot be proven from this entry point.');
}

const executivePipeline = await readFile('src/lib/free-toolbox/executive-pipeline.ts', 'utf8');
const executiveRefs = (await readFile('src/lib', 'utf8').catch(() => '')).length; // directory read intentionally fails on most runtimes; use source search below.
void executiveRefs;
const sourceCandidates = ['src/lib/free-toolbox/executive-pipeline.ts', 'src/lib/freshness.ts', 'src/lib/report-evidence-gate.ts'];
let executiveConsumerRefs = 0;
for (const path of sourceCandidates) {
  const text = await readFile(path, 'utf8').catch(() => '');
  executiveConsumerRefs += (text.match(/runExecutivePipeline\s*\(/g) || []).length;
}
if (executiveConsumerRefs <= 1 && executivePipeline.includes('runExecutivePipeline')) {
  gap('GP-EXECUTIVE-ENTRYPOINT', 'Executive pipeline implementation exists, but no second source reference proving an actual UI/action consumer was found in the inspected source set. Dashboard KPI reuse is therefore not accepted as Executive runtime proof.');
} else {
  pass('GP-EXECUTIVE-ENTRYPOINT', 'An additional source reference to the executive pipeline exists; runtime consumer proof remains required.');
}

gap('GP-CROSS-SURFACE', 'Current runtime proof loops Dashboard, Reports, and Executive Decision through the same production fetchDashboardKPIs consumer. This is not independent surface proof.');
gap('GP-DATE-BOUNDARIES', 'fetchDashboardKPIs has no date-range argument; date-boundary behavior is not proven by the current consumer.');
gap('GP-EXPORT-25-GREATER-20', 'No connected Gross Profit export consumer is proven, so 25-row versus 20-row presentation completeness remains NOT PROVEN.');

const artifact = {
  generatedAt: new Date().toISOString(),
  targetHead: process.env.GITHUB_SHA ?? 'unknown',
  policy: 'Static findings are evidence, not runtime certification. Gaps remain fail-closed.',
  results,
  closure: 'NOT PROVEN',
};
await import('node:fs/promises').then(fs => fs.writeFile('gross-profit-static-surface-audit.json', JSON.stringify(artifact, null, 2) + '\n'));

for (const r of results) console.log(`${r.status.padEnd(11)} ${r.id} :: ${r.detail}`);
console.log(`STATIC GP AUDIT: ${results.filter(r => r.status === 'NOT PROVEN').length} NOT PROVEN; no runtime claims promoted.`);
process.exitCode = 0;
