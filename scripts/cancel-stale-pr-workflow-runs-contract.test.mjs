import assert from 'node:assert/strict';
import fs from 'node:fs';

const build = fs.readFileSync('.github/workflows/product-build-gate.yml', 'utf8');
const cleanup = fs.readFileSync('scripts/cancel-stale-pr-workflow-runs.mjs', 'utf8');

assert.ok(build.includes('actions: write'), 'PR_BUILD_GATE_NEEDS_ACTIONS_WRITE_FOR_RUN_CLEANUP');
assert.ok(build.includes('group: product-build-gate-${{ github.event.pull_request.number || github.ref }}'), 'PRODUCT_BUILD_RUNS_MUST_COALESCE_BY_PR');
assert.ok(build.includes('cancel-in-progress: true'), 'SUPERSEDED_PRODUCT_BUILDS_MUST_BE_CANCELLED');
assert.ok(build.includes('scripts/cancel-stale-pr-workflow-runs.mjs'), 'PRODUCT_BUILD_GATE_MUST_RUN_SCOPED_STALE_RUN_CLEANUP');
assert.ok(cleanup.includes("run.head_sha !== currentHeadSha"), 'CLEANUP_MUST_ONLY_CANCEL_OLDER_HEADS');
assert.ok(cleanup.includes("run.event === 'pull_request'"), 'CLEANUP_MUST_NOT_CANCEL_PUSH_OR_MANUAL_RUNS');
assert.ok(cleanup.includes('Number(pull?.number) === pullRequestNumber'), 'CLEANUP_MUST_BE_SCOPED_TO_THE_CURRENT_PR');
assert.ok(cleanup.includes("['queued', 'in_progress'].includes(run.status)"), 'CLEANUP_MUST_ONLY_CANCEL_ACTIVE_OR_QUEUED_RUNS');
assert.ok(cleanup.includes('branchStillAtThisHead()'), 'CLEANUP_MUST_GUARD_AGAINST_NEWER_BRANCH_HEADS');
assert.ok(cleanup.includes('build will continue'), 'CLEANUP_FAILURE_MUST_NOT_FAIL_THE_PRODUCT_BUILD');
console.log('STALE_PR_RUN_CLEANUP_CONTRACT_PASS');
