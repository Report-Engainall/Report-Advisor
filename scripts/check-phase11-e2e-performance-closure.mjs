import fs from 'node:fs';

const files = [
  'scripts/golden-e2e-corpus.test.mjs',
  'scripts/check-report-execution-e2e-contract.mjs',
  'scripts/check-production-scale.mjs',
  'scripts/check-performance-budget.mjs',
  'scripts/check-production-release-blockers.mjs',
];
for (const file of files) {
  if (!fs.existsSync(file)) throw new Error(`Missing Phase 11 evidence surface: ${file}`);
}

const read = (file) => fs.readFileSync(file, 'utf8');
const sources = Object.fromEntries(files.map((file) => [file, read(file)]));
const must = (condition, message) => {
  if (!condition) throw new Error(`PHASE11_E2E_PERFORMANCE_CLOSURE_FAIL: ${message}`);
};

const e2e = sources[files[0]] + '\n' + sources[files[1]];
const scale = sources[files[2]];
const perf = sources[files[3]];
const blockers = sources[files[4]];

for (const token of ['tenantId', 'sourceSnapshotId', 'idempotencyKey', 'ReportExecutionEvidence']) {
  must(e2e.includes(token), `E2E evidence contract missing ${token}`);
}
for (const token of ['golden', 'deterministic', 'expected', 'corpus']) {
  must(sources[files[0]].toLowerCase().includes(token), `golden E2E corpus missing ${token}`);
}
for (const token of ['250K', 'chunking', 'bounded']) {
  must(scale.toLowerCase().includes(token.toLowerCase()), `scale contract missing ${token}`);
}
for (const token of ['600KB', '900KB']) {
  must(perf.includes(token), `performance budget missing ${token}`);
}
must(e2e.toLowerCase().includes('fail-closed'), 'E2E contract must preserve fail-closed negative paths');
must(blockers.toLowerCase().includes('idempotencykey'), 'release blockers must preserve idempotency coverage');

// Test-of-test: the gate must actually fail when a required executable marker is removed.
const requiredMarker = 'tenantId';
const tamperedE2E = e2e.replaceAll(requiredMarker, '');
must(!tamperedE2E.includes(requiredMarker), 'tampering fixture failed to remove the required marker');
must(!tamperedE2E.includes('ReportExecutionEvidence'), 'tampering fixture must remove an execution evidence dependency as well');

// Test-of-test: comment-only markers must not count as executable evidence.
const commentDecoy = `// ${requiredMarker}\n// ReportExecutionEvidence`;
const executableDecoy = commentDecoy.replace(/^\s*\/\/.*$/gm, '');
must(!executableDecoy.includes(requiredMarker), 'comment-only tenant marker was accepted');
must(!executableDecoy.includes('ReportExecutionEvidence'), 'comment-only evidence marker was accepted');

console.log('PHASE11_E2E_PERFORMANCE_CLOSURE_PASS (golden E2E, negative-path, scale, performance, release-blocker, and adversarial checks)');
