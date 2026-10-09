import process from 'node:process';

const token = process.env.GH_TOKEN?.trim();
const repository = process.env.GH_REPOSITORY?.trim();
const apiBase = (process.env.GH_API_URL || 'https://api.github.com').replace(/\/+$/, '');
const branch = process.env.PR_HEAD_BRANCH?.trim();
const currentHeadSha = process.env.PR_HEAD_SHA?.trim();
const pullRequestNumber = Number(process.env.PR_NUMBER);

function warn(message) {
  console.warn('[stale-pr-run-cleanup] ' + message);
}

if (!token || !repository || !branch || !currentHeadSha || !Number.isInteger(pullRequestNumber) || pullRequestNumber < 1) {
  warn('required context missing; build will continue without cancellation.');
  process.exit(0);
}

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: 'Bearer ' + token,
  'X-GitHub-Api-Version': '2022-11-28',
};

async function getJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('GET_HTTP_' + response.status);
  return response.json();
}

async function branchStillAtThisHead() {
  const branchUrl = apiBase + '/repos/' + repository + '/branches/' + encodeURIComponent(branch);
  const current = await getJson(branchUrl);
  return current?.commit?.sha === currentHeadSha;
}

let runsPayload;
try {
  if (!(await branchStillAtThisHead())) {
    warn('branch moved after this run was queued; no runs were cancelled.');
    process.exit(0);
  }
  const runsUrl = apiBase + '/repos/' + repository + '/actions/runs?branch=' + encodeURIComponent(branch) + '&per_page=100';
  runsPayload = await getJson(runsUrl);
} catch (error) {
  warn('cannot enumerate runs (' + String(error?.message || error) + '); build will continue.');
  process.exit(0);
}

const staleRuns = (runsPayload?.workflow_runs ?? []).filter((run) =>
  run &&
  run.head_branch === branch &&
  run.head_sha !== currentHeadSha &&
  ['queued', 'in_progress'].includes(run.status) &&
  run.event === 'pull_request' &&
  Array.isArray(run.pull_requests) &&
  run.pull_requests.some((pull) => Number(pull?.number) === pullRequestNumber),
);
console.log('STALE_PR_RUNS_DISCOVERED=' + staleRuns.length);

let cancelled = 0;
for (const run of staleRuns) {
  try {
    // Re-check before every cancellation. If a newer push arrives, this old
    // cleanup run must stop instead of cancelling the new candidate.
    if (!(await branchStillAtThisHead())) {
      warn('branch advanced; stopped cancelling remaining runs.');
      break;
    }
    const response = await fetch(apiBase + '/repos/' + repository + '/actions/runs/' + run.id + '/cancel', {
      method: 'POST',
      headers,
    });
    if (response.ok) {
      cancelled += 1;
      console.log('STALE_PR_RUN_CANCEL_REQUESTED=' + run.id);
    } else {
      warn('could not cancel stale run ' + run.id + ' (HTTP ' + response.status + '); continuing.');
    }
  } catch (error) {
    warn('cancellation request failed for ' + run.id + ' (' + String(error?.message || error) + '); continuing.');
  }
}
console.log('STALE_PR_RUNS_CANCEL_REQUESTED=' + cancelled);
