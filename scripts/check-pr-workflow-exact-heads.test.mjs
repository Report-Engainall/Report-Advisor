import assert from 'node:assert/strict';
import { analyzeWorkflowProvenance } from './check-pr-workflow-exact-heads.mjs';

const exact = `on:\n  pull_request:\nsteps:\n  - run: test "$(git rev-parse HEAD)" = "$EXPECTED_HEAD"\n  - run: ACTUAL_HEAD="$(git ls-remote origin \"refs/heads/${'${HEAD_REF}'}\" | awk '{print $1}')"\n  - run: test "$ACTUAL_HEAD" = "$EXPECTED_HEAD"\nenv:\n  EXPECTED_HEAD: ${{ github.event.pull_request.head.sha }}`;

const ordinary = analyzeWorkflowProvenance('entity-crud-contract.yml', `name: entity-crud-contract\non:\n  pull_request:\njobs: {test: {runs-on: ubuntu-latest, steps: []}}`);
assert.equal(ordinary.certification_sensitive, false);
assert.deepEqual(ordinary.violations, []);

const sensitiveMissing = analyzeWorkflowProvenance('certification-evidence-boundary.yml', `name: certification-evidence-boundary\non:\n  pull_request:\njobs: {test: {runs-on: ubuntu-latest, steps: []}}`);
assert.equal(sensitiveMissing.certification_sensitive, true);
assert.ok(sensitiveMissing.violations.includes('MISSING_EVENT_PR_HEAD_SHA'));
assert.ok(sensitiveMissing.violations.includes('MISSING_LOCAL_EXACT_HEAD_CHECK'));
assert.ok(sensitiveMissing.violations.includes('MISSING_REMOTE_HEAD_CHECK'));
assert.ok(sensitiveMissing.violations.includes('MISSING_HEAD_COMPARISON'));

const sensitiveValid = analyzeWorkflowProvenance('certification-evidence-boundary.yml', `name: certification-evidence-boundary\n${exact}`);
assert.deepEqual(sensitiveValid.violations, []);

console.log('PR exact-head checker test: PASS (ordinary PR flows excluded; certification-sensitive flows enforced)');
