import { setTimeout as delay } from 'node:timers/promises';

const supabaseUrl = (process.env.REPORT_ADVISOR_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const runIds = [...new Set([
  ...(process.env.E2E_REVOKE_RUN_IDS || '').split(','),
  process.env.GITHUB_RUN_ID || '',
].map((value) => value.trim()).filter((value) => /^\d+$/.test(value)))];

if (!supabaseUrl || !serviceRoleKey || runIds.length === 0) {
  throw new Error('E2E_EPHEMERAL_ACTOR_CLEANUP_CONFIGURATION_MISSING');
}

const pageSize = 1000;
const maxPages = 100;
const requestTimeoutMs = 20_000;

async function adminRequest(path, init = {}) {
  const response = await fetch(supabaseUrl + path, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: 'Bearer ' + serviceRoleKey,
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  if (!response.ok) {
    // Never echo the response body or request headers: they may contain sensitive auth metadata.
    throw new Error('E2E_EPHEMERAL_ACTOR_CLEANUP_HTTP_' + response.status);
  }
  if (response.status === 204) return null;
  return response.json();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^$+{}()|[\]\\]/g, '\\$&');
}

function isRunScopedTestActorEmail(value) {
  const email = String(value || '').trim();
  if (!email) return false;
  return runIds.some((runId) => {
    const id = escapeRegex(runId);
    return [
      new RegExp('^report-advisor-e2e-(?:a|b|c|approver)-' + id + '@example\\.com$', 'i'),
      new RegExp('^e2e-(?:a|b|c|approver)-' + id + '-[a-f0-9]{12}@e2e\\.report-advisor\\.invalid$', 'i'),
      new RegExp('^e2e-approver-' + id + '@e2e\\.report-advisor\\.invalid$', 'i'),
    ].some((pattern) => pattern.test(email));
  });
}

const candidates = [];
for (let page = 1; page <= maxPages; page += 1) {
  const result = await adminRequest('/auth/v1/admin/users?page=' + page + '&per_page=' + pageSize);
  const users = Array.isArray(result?.users) ? result.users : [];
  for (const user of users) {
    if (user?.id && isRunScopedTestActorEmail(user.email)) candidates.push({ id: String(user.id) });
  }
  if (users.length < pageSize) break;
  if (page === maxPages) throw new Error('E2E_EPHEMERAL_ACTOR_CLEANUP_USER_SCAN_LIMIT_REACHED');
  await delay(0);
}

let deleted = 0;
let alreadyAbsent = 0;
for (const candidate of candidates) {
  const response = await fetch(supabaseUrl + '/auth/v1/admin/users/' + encodeURIComponent(candidate.id), {
    method: 'DELETE',
    headers: {
      apikey: serviceRoleKey,
      Authorization: 'Bearer ' + serviceRoleKey,
    },
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  if (response.status === 404) {
    alreadyAbsent += 1;
    continue;
  }
  if (!response.ok) throw new Error('E2E_EPHEMERAL_ACTOR_CLEANUP_DELETE_HTTP_' + response.status);
  deleted += 1;
}

console.log(
  'E2E_EPHEMERAL_ACTOR_CLEANUP=PASS'
  + ' revoked=' + deleted
  + ' already_absent=' + alreadyAbsent
  + ' scoped_run_ids=' + runIds.length
  + ' candidate_count=' + candidates.length,
);
