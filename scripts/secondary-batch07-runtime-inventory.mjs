import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : null;
const exists = (file) => fs.existsSync(path.join(root, file));

const rows = [
  {
    capability: 'Evidence Workspace',
    contract: 'src/lib/free-toolbox/evidence-ledger.ts',
    implementation: 'src/lib/secondary-batch03-runtime.ts',
    persistence: 'src/lib/free-toolbox/evidence-ledger.ts',
    security: 'src/lib/secondary-batch04-regression.mjs',
    test: 'scripts/secondary-batch04-regression.mjs',
    workflow: '.github/workflows/secondary-agent-batch04.yml',
    runtime: 'LIVE REQUIRED',
    status: 'GATED',
  },
  {
    capability: 'Decision Replay',
    contract: 'src/lib/product-intelligence/decision-evidence-ledger.ts',
    implementation: 'src/lib/secondary-batch03-runtime.ts',
    persistence: 'src/lib/product-intelligence/decision-evidence-ledger.ts',
    security: 'scripts/secondary-batch06-quality-audit.mjs',
    test: 'scripts/secondary-batch04-regression.mjs',
    workflow: '.github/workflows/secondary-agent-batch04.yml',
    runtime: 'LIVE REQUIRED',
    status: 'GATED',
  },
  {
    capability: 'Report Snapshot / Diff',
    contract: 'src/lib/import-pipeline/report-snapshot-history.ts',
    implementation: 'src/lib/secondary-batch03-runtime.ts',
    persistence: 'src/lib/import-pipeline/report-snapshot-history.ts',
    security: 'scripts/secondary-batch06-quality-audit.mjs',
    test: 'scripts/secondary-batch04-regression.mjs',
    workflow: '.github/workflows/secondary-agent-batch04.yml',
    runtime: 'LIVE REQUIRED',
    status: 'GATED',
  },
  {
    capability: 'Data Quality',
    contract: 'src/lib/data-quality-queries.ts',
    implementation: 'src/lib/data-quality-queries.ts',
    persistence: 'supabase',
    security: 'scripts/check-data-quality-projections.mjs',
    test: 'scripts/check-data-quality-projections.mjs',
    workflow: '.github/workflows/secondary-agent-batch04.yml',
    runtime: 'LIVE REQUIRED',
    status: 'LIVE REQUIRED',
  },
  {
    capability: 'Document Intelligence',
    contract: 'src/lib/documentIntelligenceGateway.ts',
    implementation: 'src/lib/documentIntelligenceGateway.ts',
    persistence: 'DocumentExtractionEnvelope',
    security: 'scripts/check-file-intelligence-security.mjs',
    test: 'scripts/check-document-intelligence-closure.mjs',
    workflow: '.github/workflows/secondary-agent-batch04.yml',
    runtime: 'LIVE REQUIRED',
    status: 'GATED',
  },
  {
    capability: 'Smart Reconciliation',
    contract: 'src/lib/report-intelligence/reconciliation-engine.ts',
    implementation: 'src/lib/secondary-batch03-runtime.ts',
    persistence: 'src/lib/report-intelligence/reconciliation-engine.ts',
    security: 'scripts/secondary-batch04-regression.mjs',
    test: 'scripts/check-schema-entity-reconciliation.ts',
    workflow: '.github/workflows/secondary-agent-batch04.yml',
    runtime: 'LIVE REQUIRED',
    status: 'LIVE REQUIRED',
  },
  {
    capability: 'Business Control Plane',
    contract: 'scripts/check-business-control-plane-contract.mjs',
    implementation: 'src/lib/phase-kl-supabase-runtime.ts',
    persistence: 'supabase/migrations/20260825140000_phase_l_runtime_cockpit.sql',
    security: 'scripts/check-business-control-plane-contract.mjs',
    test: 'scripts/check-business-control-plane-contract.mjs',
    workflow: '.github/workflows/secondary-agent-batch04.yml',
    runtime: 'LIVE REQUIRED',
    status: 'GATED',
  },
];

const requiredFiles = new Set([
  '.github/workflows/secondary-agent-batch04.yml',
  'src/lib/secondary-batch03-runtime.ts',
  'src/lib/free-toolbox/evidence-ledger.ts',
  'src/lib/product-intelligence/decision-evidence-ledger.ts',
  'src/lib/import-pipeline/report-snapshot-history.ts',
  'src/lib/data-quality-queries.ts',
  'src/lib/documentIntelligenceGateway.ts',
  'src/lib/report-intelligence/reconciliation-engine.ts',
  'src/lib/phase-kl-supabase-runtime.ts',
  'supabase/migrations/20260825140000_phase_l_runtime_cockpit.sql',
]);

let pass = 0;
let fail = 0;
for (const file of requiredFiles) {
  if (exists(file)) pass += 1;
  else { fail += 1; console.error(`FAIL — canonical runtime file missing: ${file}`); }
}

const secondaryRuntime = read('src/lib/secondary-batch03-runtime.ts') ?? '';
const regression = read('scripts/secondary-batch04-regression.mjs') ?? '';
const quality = read('scripts/secondary-batch06-quality-audit.mjs') ?? '';
const workflow = read('.github/workflows/secondary-agent-batch04.yml') ?? '';
const packageJson = read('package.json') ?? '';
const allSecondary = [secondaryRuntime, regression, quality, workflow].join('\n');

const forbidden = [
  ['/api/chat', 'legacy paid/remote chat path'],
  ['openai.com/v1', 'hard-coded OpenAI endpoint'],
  ['api.anthropic.com', 'hard-coded Anthropic endpoint'],
  ['generativelanguage.googleapis.com', 'hard-coded Google endpoint'],
  ['lovable', 'Lovable gateway/provider marker'],
];
for (const [token, label] of forbidden) {
  if (allSecondary.toLowerCase().includes(token.toLowerCase())) {
    fail += 1;
    console.error(`FAIL — forbidden provider/runtime marker: ${label}`);
  } else pass += 1;
}

for (const token of ['source_id', 'evidence_id', 'snapshot_id', 'lineage_id', 'metric_id', 'decision_id']) {
  if (secondaryRuntime.includes(token)) pass += 1;
  else { fail += 1; console.error(`FAIL — evidence identifier propagation contract missing: ${token}`); }
}

const hasUnknownGuard = allSecondary.includes('UNKNOWN') && allSecondary.includes('SOURCE UNAVAILABLE');
if (hasUnknownGuard) pass += 1;
else { fail += 1; console.error('FAIL — UNKNOWN/SOURCE UNAVAILABLE safety guard missing.'); }

// Do not search for the literal text "select(*)" across the harness itself: regression
// tests intentionally mention that phrase. Inspect executable secondary runtime code only.
const hasUnboundedSelect = /\.select\(\s*[\'\"`]\*\s*[\'\"`]\s*\)/.test(secondaryRuntime);
if (!hasUnboundedSelect) pass += 1;
else { fail += 1; console.error('FAIL — secondary runtime contains an unbounded select(*) projection.'); }

if (!packageJson.includes('test:secondary-batch07-runtime-inventory')) {
  console.log('NOTE — package script is added by this batch commit after the inventory script.');
}

console.log('\nBatch 07 Runtime Gap Inventory');
console.table(rows.map((row) => ({
  Capability: row.capability,
  Contract: row.contract,
  Implementation: row.implementation,
  Security: row.security,
  Test: row.test,
  Workflow: row.workflow,
  Runtime: row.runtime,
  Status: row.status,
})));
console.log(`Structural checks: PASS=${pass} FAIL=${fail}`);
console.log('Runtime evidence: LIVE REQUIRED where authoritative persistence/browser/tenant execution is not available to this branch.');
console.log('No COMPLETE claim is emitted by this audit.');

if (fail > 0) process.exitCode = 1;
