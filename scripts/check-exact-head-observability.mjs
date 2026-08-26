import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const sha = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim();
const actual = sha('git', ['rev-parse', 'HEAD']);
const expected = process.env.EXACT_HEAD_SHA || process.env.GITHUB_SHA || '';
const event = process.env.GITHUB_EVENT_NAME || 'local';
const ref = process.env.GITHUB_REF || '';
const runId = process.env.GITHUB_RUN_ID || '';
const isPush = event === 'push';
const exactMatch = Boolean(expected) && actual === expected;
const observable = isPush ? exactMatch : false;
const status = observable ? 'CI RUN EXISTS + EXACT HEAD MATCH' : 'EXACT-HEAD CI = NOT OBSERVABLE';

const evidence = {
  checkedOutSha: actual,
  expectedSha: expected || null,
  githubSha: process.env.GITHUB_SHA || null,
  event,
  ref,
  runId: runId || null,
  exactMatch,
  observable,
  statuses: {
    runExists: Boolean(runId),
    runPassed: null,
    gateSatisfied: false,
  },
  rule: 'NOT OBSERVABLE != PASS; GATED requires independently verifiable evidence',
};

mkdirSync('artifacts', { recursive: true });
writeFileSync('artifacts/exact-head-observability.json', JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence, null, 2));

if (isPush && expected && !exactMatch) {
  console.error(`EXACT_HEAD_MISMATCH checked-out=${actual} expected=${expected}`);
  process.exit(1);
}

if (isPush && !process.env.GITHUB_SHA) {
  console.error('EXACT_HEAD_EXPECTED_SHA_MISSING');
  process.exit(1);
}

if (!observable) console.warn(status);
