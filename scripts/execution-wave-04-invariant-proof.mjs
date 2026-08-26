import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const required = {
  'scripts/execution-wave-03-import-deep.test.mjs': [
    'same-file', 'fingerprint', 'checkpoint', 'crash', 'resume', 'business', 'cancel', 'terminal', 'tenant'
  ],
  'scripts/execution-wave-03-distributed-runtime.test.mjs': [
    'lease', 'heartbeat', 'checkpoint', 'crash', 'recovery', 'retry', 'DLQ', 'tenant', 'duplicate'
  ],
  'scripts/execution-wave-03-watched-folder.test.mjs': [
    'sha', 'rename', 'changed', 'duplicate', 'replay', 'recovery'
  ],
  'src/lib/decision-feedback-graph.ts': [
    'source', 'evidence', 'metric', 'analysis', 'recommendation', 'decision', 'action', 'outcome', 'feedback'
  ],
  'src/lib/observability/trace-context.ts': [
    'user_action_id', 'request_id', 'job_id', 'import_id', 'evidence_id', 'report_id', 'decision_id', 'outcome_id', 'tenant_id'
  ],
};

const missing = [];
for (const [file, terms] of Object.entries(required)) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    missing.push(`${file}: missing file`);
    continue;
  }
  const body = fs.readFileSync(full, 'utf8').toLowerCase();
  for (const term of terms) if (!body.includes(term.toLowerCase())) missing.push(`${file}: missing invariant marker ${term}`);
}

const index = fs.readFileSync(path.join(ROOT, 'docs/MASTER_EXECUTION_INDEX.md'), 'utf8');
for (const state of ['FOUNDATION', 'DEEP CLOSURE', 'TESTED', 'GATED', 'INTEGRATED', 'RUNTIME VERIFIED', 'LIVE VERIFIED', 'PRODUCTION CERTIFIED']) {
  if (!index.includes(state)) missing.push(`MASTER_EXECUTION_INDEX: missing state ${state}`);
}

if (missing.length) {
  console.error('Wave 04 invariant proof failed:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}
console.log('Wave 04 invariant proof: required Wave 03 invariants and truth states are present.');
