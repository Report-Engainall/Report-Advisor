import { createClient } from '@supabase/supabase-js';
import { requireSafeRuntimeEnvironment, requireAuthenticatedContext } from './runtime-evidence-config.mjs';
import { DATABASE_TABLES, CHILD_TABLES, INFERENCE_SURFACES } from './runtime-evidence-matrix.mjs';
import { createEvidenceRecord } from './runtime-evidence-record.mjs';

// P0-2 runtime executor. Fail-closed by design: without dedicated staging/test
// context and deterministic mutation fixtures it emits NOT VERIFIED and exits
// non-zero. It never runs against production.
const environment = requireSafeRuntimeEnvironment();
const required = [
  'SUPABASE_URL', 'SUPABASE_ANON_KEY',
  'RUNTIME_EVIDENCE_USER_A_EMAIL', 'RUNTIME_EVIDENCE_USER_A_PASSWORD',
  'RUNTIME_EVIDENCE_USER_B_EMAIL', 'RUNTIME_EVIDENCE_USER_B_PASSWORD',
  'RUNTIME_EVIDENCE_TENANT_A_ID', 'RUNTIME_EVIDENCE_TENANT_B_ID',
  'RUNTIME_EVIDENCE_EXPECTED_USER_A_ID', 'RUNTIME_EVIDENCE_EXPECTED_USER_B_ID',
  'RUNTIME_EVIDENCE_RELEASE', 'RUNTIME_EVIDENCE_COMMIT_SHA',
];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`NOT VERIFIED: missing runtime context: ${missing.join(', ')}`);

const A = process.env.RUNTIME_EVIDENCE_TENANT_A_ID;
const B = process.env.RUNTIME_EVIDENCE_TENANT_B_ID;
if (A === B) throw new Error('NOT VERIFIED: Tenant A and Tenant B must be distinct.');

const runId = process.env.RUNTIME_EVIDENCE_RUN_ID ?? process.env.GITHUB_RUN_ID ?? 'LOCAL';
const release = process.env.RUNTIME_EVIDENCE_RELEASE;
const commitSha = process.env.RUNTIME_EVIDENCE_COMMIT_SHA;

function context(actor, authorizedTenant, targetTenant) {
  return requireAuthenticatedContext({ actor, authorizedTenant, targetTenant, environment, release, commitSha });
}

function evidence({ testId, actor, authorizedTenant, targetTenant, surface, operation, expected, actual, rowsReturned = 0, rowsAffected = 0, errorCode = 'NONE', result, input = {} }) {
  return createEvidenceRecord({
    TEST_ID: `${testId}-${runId}`,
    ENVIRONMENT: environment,
    RELEASE: release,
    COMMIT_SHA: commitSha,
    TIMESTAMP: new Date().toISOString(),
    ACTOR: actor,
    AUTHORIZED_TENANT: authorizedTenant,
    TARGET_TENANT: targetTenant,
    SURFACE: surface,
    OPERATION: operation,
    INPUT: input,
    EXPECTED: expected,
    ACTUAL: actual,
    ROWS_RETURNED: rowsReturned,
    ROWS_AFFECTED: rowsAffected,
    ERROR_CODE: errorCode,
    RESULT: result,
    EVIDENCE_REFERENCE: `runtime-evidence:${runId}`,
  });
}

async function signIn(email, password, expectedUserId) {
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) throw new Error(`NOT VERIFIED: authentication failed: ${error?.message ?? 'missing session'}`);
  if (data.user.id !== expectedUserId) throw new Error(`NOT VERIFIED: authenticated actor mismatch; expected ${expectedUserId}, got ${data.user.id}`);
  return { client, user: data.user };
}

function tenantColumn(table) {
  // companies is the tenant root; all other canonical tenant-owned surfaces
  // use company_id in the current schema. Any new exception must be explicit.
  if (table === 'companies') return 'id';
  return 'company_id';
}

async function selectProbe(client, actor, authorizedTenant, targetTenant, table, direction) {
  const column = tenantColumn(table);
  const { data, error } = await client.from(table).select('id').eq(column, targetTenant).limit(10);
  const rows = data?.length ?? 0;
  const crossTenant = targetTenant !== authorizedTenant;
  if (error) {
    return evidence({ testId: `P0-2-SELECT-${direction}-${table}`, actor, authorizedTenant, targetTenant, surface: table, operation: 'SELECT', expected: crossTenant ? 'DENIED OR ZERO UNAUTHORIZED ROWS' : 'OWN TENANT READ SUCCEEDS', actual: error.message, errorCode: error.code ?? 'UNKNOWN', result: 'NOT VERIFIED', input: { targetTenant, direction, tenantColumn: column } });
  }
  const result = crossTenant ? (rows === 0 ? 'PASS' : 'FAIL') : 'PASS';
  return evidence({ testId: `P0-2-SELECT-${direction}-${table}`, actor, authorizedTenant, targetTenant, surface: table, operation: 'SELECT', expected: crossTenant ? 'ZERO UNAUTHORIZED ROWS' : 'OWN TENANT READ', actual: `${rows} rows`, rowsReturned: rows, result, input: { targetTenant, direction, tenantColumn: column } });
}

function parseMutationFixtures() {
  const raw = process.env.RUNTIME_EVIDENCE_MUTATION_FIXTURES;
  if (!raw) throw new Error('NOT VERIFIED: RUNTIME_EVIDENCE_MUTATION_FIXTURES is required for INSERT/UPDATE/DELETE execution.');
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error('NOT VERIFIED: mutation fixture JSON is invalid.'); }
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('NOT VERIFIED: mutation fixtures must be a non-empty array.');
  const allowed = new Set(DATABASE_TABLES);
  for (const item of parsed) {
    if (!allowed.has(item.table) || !['INSERT', 'UPDATE', 'DELETE'].includes(item.operation)) throw new Error(`NOT VERIFIED: unsupported mutation fixture for ${item.table}/${item.operation}`);
    if (!item.own || !item.foreign || !item.restore) throw new Error(`NOT VERIFIED: mutation fixture requires own, foreign and restore cases for ${item.table}/${item.operation}`);
  }
  return parsed;
}

async function cleanupMutation(client, fixture, operation, payload, response) {
  const id = response.data?.[0]?.id ?? payload.id;
  if (operation === 'INSERT') {
    if (!id) return { ok: false, message: 'insert returned no deterministic id for cleanup' };
    const cleanup = await client.from(fixture.table).delete().eq('id', id);
    return { ok: !cleanup.error, message: cleanup.error?.message ?? 'insert cleanup complete' };
  }
  if (!id) return { ok: false, message: 'mutation has no deterministic id for restore' };
  const restore = await client.from(fixture.table).upsert(fixture.restore, { onConflict: 'id' });
  return { ok: !restore.error, message: restore.error?.message ?? 'mutation restore complete' };
}

async function runMutation(client, actor, authorizedTenant, fixture, targetTenant, attack) {
  const table = fixture.table;
  const operation = fixture.operation;
  const payload = attack ? fixture.foreign : fixture.own;
  let response;
  if (operation === 'INSERT') response = await client.from(table).insert(payload).select('id');
  else if (operation === 'UPDATE') response = await client.from(table).update(payload).eq('id', payload.id).select('id');
  else response = await client.from(table).delete().eq('id', payload.id).select('id');

  const rows = response.data?.length ?? 0;
  const denied = Boolean(response.error) || rows === 0;
  const result = attack ? (denied ? 'PASS' : 'FAIL') : (response.error ? 'FAIL' : 'PASS');
  let cleanupResult = { ok: true, message: 'not required' };
  if (!response.error && rows > 0) cleanupResult = await cleanupMutation(client, fixture, operation, payload, response);
  if (!cleanupResult.ok) throw new Error(`NOT VERIFIED: mutation cleanup/restore failed for ${table}/${operation}: ${cleanupResult.message}`);

  return evidence({
    testId: `P0-2-${operation}-${attack ? 'FOREIGN' : 'OWN'}-${table}`,
    actor, authorizedTenant, targetTenant: attack ? targetTenant : authorizedTenant,
    surface: table, operation,
    expected: attack ? 'CROSS-TENANT MUTATION DENIED' : 'OWN TENANT MUTATION SUCCEEDS',
    actual: response.error?.message ?? `${rows} rows`, rowsReturned: rows, rowsAffected: rows,
    errorCode: response.error?.code ?? 'NONE', result,
    input: { attack, targetTenant, cleanup: cleanupResult.message },
  });
}

async function runActor(label, email, password, expectedUserId, authorizedTenant, targetTenant) {
  const { client, user } = await signIn(email, password, expectedUserId);
  context(user.id, authorizedTenant, targetTenant);
  const records = [];
  try {
    for (const table of DATABASE_TABLES) {
      records.push(await selectProbe(client, user.id, authorizedTenant, authorizedTenant, table, `${label}_OWN`));
      records.push(await selectProbe(client, user.id, authorizedTenant, targetTenant, table, `${label}_FOREIGN`));
    }
    for (const child of CHILD_TABLES) if (!DATABASE_TABLES.includes(child)) throw new Error(`NOT VERIFIED: child table missing from executor: ${child}`);

    const fixtures = parseMutationFixtures();
    for (const fixture of fixtures) {
      records.push(await runMutation(client, user.id, authorizedTenant, fixture, targetTenant, false));
      records.push(await runMutation(client, user.id, authorizedTenant, fixture, targetTenant, true));
    }
  } finally {
    await client.auth.signOut();
  }
  return records;
}

const records = [];
try {
  records.push(...await runActor('A', process.env.RUNTIME_EVIDENCE_USER_A_EMAIL, process.env.RUNTIME_EVIDENCE_USER_A_PASSWORD, process.env.RUNTIME_EVIDENCE_EXPECTED_USER_A_ID, A, B));
  records.push(...await runActor('B', process.env.RUNTIME_EVIDENCE_USER_B_EMAIL, process.env.RUNTIME_EVIDENCE_USER_B_PASSWORD, process.env.RUNTIME_EVIDENCE_EXPECTED_USER_B_ID, B, A));
  for (const surface of INFERENCE_SURFACES) {
    records.push(evidence({ testId: `P0-2-INFERENCE-${surface}`, actor: 'runtime-executor', authorizedTenant: A, targetTenant: B, surface, operation: surface, expected: 'ZERO CROSS-TENANT INFORMATION LEAKAGE', actual: 'APPLICATION-SPECIFIC EXECUTOR REQUIRED', result: 'NOT VERIFIED' }));
  }
} catch (error) {
  console.error(`NOT VERIFIED: P0-2 runtime executor aborted: ${error.message}`);
  process.exitCode = 1;
  process.exit();
}

const failures = records.filter((record) => record.RESULT === 'FAIL');
const unverified = records.filter((record) => record.RESULT === 'NOT VERIFIED');
console.log(JSON.stringify({ status: failures.length ? 'FAIL' : unverified.length ? 'NOT VERIFIED' : 'RUNTIME_EVIDENCED', environment, runId, records }, null, 2));
if (failures.length || unverified.length) process.exitCode = 1;
