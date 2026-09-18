#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const run = (args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const remote = process.env.HEAD_COORDINATION_REMOTE ?? 'origin';
const uiBranch = process.env.HEAD_COORDINATION_UI_BRANCH ?? 'ui/aghbari-command-wave2-20260918';
const integrationBranch = process.env.HEAD_COORDINATION_INTEGRATION_BRANCH ?? 'integration/certification-candidate-20260918';
const allowDetached = process.env.HEAD_COORDINATION_ALLOW_DETACHED === '1';

function fail(message) {
  console.error(`HEAD_COORDINATION_FAIL: ${message}`);
  process.exitCode = 1;
}

const currentBranch = run(['branch', '--show-current']) || '(detached)';
const worktreeHead = run(['rev-parse', 'HEAD']);
const dirty = run(['status', '--porcelain=v1']);

const refsText = run(['ls-remote', remote, `refs/heads/main`, `refs/heads/${uiBranch}`, `refs/heads/${integrationBranch}`]);
const refs = Object.fromEntries(
  refsText.split(/\r?\n/).filter(Boolean).map((line) => {
    const [sha, ref] = line.split(/\s+/);
    return [ref.replace(`refs/heads/`, ''), sha];
  }),
);

const mainHead = refs.main;
const uiHead = refs[uiBranch];
const integrationHead = refs[integrationBranch];
const branchMatchesUi = currentBranch === uiBranch || currentBranch === `${uiBranch}-local`;
const branchMatchesIntegration = currentBranch === integrationBranch;
const branchIsMain = currentBranch === 'main';

console.log(`MAIN_HEAD=${mainHead ?? 'MISSING'}`);
console.log(`UI_HEAD=${uiHead ?? 'MISSING'} (${uiBranch})`);
console.log(`INTEGRATION_HEAD=${integrationHead ?? 'MISSING'} (${integrationBranch})`);
console.log(`WORKTREE_HEAD=${worktreeHead}`);
console.log(`WORKTREE_BRANCH=${currentBranch}`);
console.log(`WORKTREE_DIRTY=${dirty ? 'true' : 'false'}`);
console.log(`UI_AND_INTEGRATION_SAME_HEAD=${uiHead === integrationHead ? 'true' : 'false'}`);
console.log(`CURRENT_BRANCH_ROLE=${branchIsMain ? 'MAIN' : branchMatchesUi ? 'UI' : branchMatchesIntegration ? 'INTEGRATION' : 'UNASSIGNED'}`);
console.log('CERTIFICATION_SOURCE=INTEGRATION_HEAD_ONLY');
console.log('EVIDENCE_TRANSFER=FORBIDDEN');

if (!mainHead || !uiHead || !integrationHead) fail('one or more required remote refs are missing');
if (dirty) fail('worktree has uncommitted changes; handoff is not atomic');
if (branchIsMain) fail('direct execution on main is prohibited');
if (!allowDetached && currentBranch === '(detached)') fail('detached HEAD requires explicit override');
if (![branchMatchesUi, branchMatchesIntegration].some(Boolean) && !allowDetached) fail('current branch is outside the declared owner branches');
if (branchMatchesUi && worktreeHead !== uiHead) fail('local UI worktree HEAD does not match remote UI HEAD');
if (branchMatchesIntegration && worktreeHead !== integrationHead) fail('local integration worktree HEAD does not match remote integration HEAD');

if (process.exitCode) {
  console.error('Resolve the head mismatch before reporting PASS or handing off work.');
} else {
  console.log('HEAD_COORDINATION_PASS');
  console.log('Use UI_HEAD for product work, INTEGRATION_HEAD for runtime/certification, and MAIN_HEAD as protected production baseline.');
}
