import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const scripts = pkg.scripts ?? {};

const surfaces = [
  {
    id: 'A',
    name: 'Core Integration & Security',
    required: [
      'test:auth-tenant-convergence',
      'test:tenant-security-contract',
      'test:global-tenant-rls',
      'test:import-rpc-tenant-context',
      'test:quality-workflow-contract',
      'test:phase-ab-import-rpc-signature-audit',
    ],
    live: ['Supabase tenant isolation', 'RPC execution against deployed schema', 'RLS adversarial evidence'],
  },
  {
    id: 'B',
    name: 'Data & Ingestion',
    required: [
      'test:import-transaction-contract',
      'test:import-runtime-governance',
      'test:import-business-key',
      'test:import-direct-write-guard',
      'test:canonical-import-mapping',
      'test:onyx-adapter-contract',
      'test:operational-file-pipeline',
    ],
    live: ['real-file import', 'canonical persistence', 'rollback/retry/idempotency runtime evidence', 'real Onyx corpus'],
  },
  {
    id: 'C',
    name: 'Reports & Analytics',
    required: [
      'test:report-truth',
      'test:report-execution-foundation',
      'test:report-execution-e2e-contract',
      'test:metric-single-source-of-truth',
      'test:data-quality-projections',
      'test:inventory-intelligence',
      'test:demand-velocity',
    ],
    live: ['authoritative KPI query execution', 'report runtime/export evidence', 'truth reconciliation against canonical data'],
  },
  {
    id: 'D',
    name: 'Decision & AI',
    required: [
      'test:decision-intelligence-closure',
      'test:scenario-engine',
      'test:forecast-calibration-contract',
      'test:trust-evidence-runtime',
      'test:safe-metrics',
    ],
    live: ['secure retrieval', 'decision/action/outcome evidence', 'forecast backtest evidence', 'AI tenant isolation'],
  },
  {
    id: 'E',
    name: 'Runtime & Automation',
    required: [
      'test:watched-report-pipeline',
      'test:automation-executor-contract',
      'test:operational-resilience',
      'test:phase-k-runtime',
      'test:phase-l-runtime',
      'test:phase-l-resumable-execution',
    ],
    live: ['worker execution', 'queue/retry/lease evidence', 'watched-file runtime', 'K/L production-like runtime'],
  },
];

const results = [];
for (const surface of surfaces) {
  const missing = surface.required.filter((name) => !scripts[name]);
  results.push({
    id: surface.id,
    name: surface.name,
    static: missing.length === 0 ? 'READY' : 'GAP',
    missing,
    runtime: surface.live.map((item) => ({ item, status: 'LIVE REQUIRED' })),
  });
}

const staticGaps = results.filter((r) => r.static !== 'READY');
console.log(JSON.stringify({
  contract: 'phase-abcde-closure-audit/v1',
  rule: 'Static readiness never upgrades runtime status. Runtime evidence requires authoritative reproducible artifacts.',
  generatedAt: new Date().toISOString(),
  results,
  summary: {
    staticReady: results.filter((r) => r.static === 'READY').length,
    staticGaps: staticGaps.length,
    runtimeEvidence: 0,
    productionCertified: 0,
  },
}, null, 2));

if (staticGaps.length) process.exitCode = 1;
