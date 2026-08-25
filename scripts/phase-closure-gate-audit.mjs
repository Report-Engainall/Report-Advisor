import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const scripts = pkg.scripts ?? {};

const gates = {
  A: [
    'test:auth-tenant-convergence',
    'test:migration-schema-audit',
    'test:migration-dependencies',
    'test:tenant-security-contract',
    'test:global-tenant-rls',
    'test:report-truth',
  ],
  B: [
    'test:canonical-import-mapping',
    'test:import-transaction-contract',
    'test:import-runtime-governance',
    'test:import-rpc-tenant-context',
    'test:import-business-key',
    'test:onyx-adapter-contract',
    'test:phase-ab-import-rpc-signature-audit',
  ],
  C: [
    'test:report-execution-foundation',
    'test:report-execution-e2e-contract',
    'test:report-truth',
    'test:metric-single-source-of-truth',
    'test:safe-metrics',
  ],
  D: [
    'test:decision-intelligence-closure',
    'test:scenario-engine',
    'test:forecast-calibration-contract',
    'test:forecast-calibration-contract',
    'test:trust-evidence-runtime',
  ],
  E: [
    'test:watched-report-pipeline',
    'test:automation-executor-contract',
    'test:phase-k-runtime',
    'test:phase-l-runtime',
    'test:phase-l-resumable-execution',
    'test:operational-resilience',
  ],
  F: [
    'test:production-scale',
    'test:analysis-cache-policy',
    'test:concurrent-analysis',
    'test:bounded-concurrency',
    'test:release-resilience-manifest',
    'test:production-readiness',
  ],
  G: [
    'test:production-certification-contract',
    'test:phase-m-certification',
    'test:production-gate-integrity',
    'test:production-gate-runtime',
    'test:production-release-blockers',
  ],
};

const results = {};
for (const [gate, requiredScripts] of Object.entries(gates)) {
  const missing = [...new Set(requiredScripts)].filter((name) => typeof scripts[name] !== 'string');
  results[gate] = {
    required_contracts: [...new Set(requiredScripts)].length,
    missing_scripts: missing,
    static_ready: missing.length === 0,
    runtime_status: 'LIVE REQUIRED',
  };
}

const allStaticReady = Object.values(results).every((r) => r.static_ready);
const output = {
  contract: 'phase-closure-gate-audit',
  rule: 'Static readiness never upgrades a gate to runtime-evidenced or production-certified.',
  states: ['UNKNOWN', 'INVENTORIED', 'IMPLEMENTED', 'GATED', 'INTEGRATED', 'RUNTIME-EVIDENCED', 'PRODUCTION-CERTIFIED'],
  gates: results,
  summary: {
    static_ready_gates: Object.values(results).filter((r) => r.static_ready).length,
    total_gates: Object.keys(results).length,
    all_static_ready: allStaticReady,
    runtime_evidenced: 0,
    production_certified: 0,
  },
};
console.log(JSON.stringify(output, null, 2));
if (!allStaticReady) process.exitCode = 2;
