import { createClient } from '@supabase/supabase-js';
import { requireSafeRuntimeEnvironment, requireAuthenticatedContext } from './runtime-evidence-config.mjs';
import { DATABASE_TABLES, CHILD_TABLES, INFERENCE_SURFACES } from './runtime-evidence-matrix.mjs';
import { createEvidenceRecord } from './runtime-evidence-record.mjs';

// P0-2 runtime executor. Fail-closed by design.
// It never writes to production and never treats a missing/ambiguous runtime
// result as proof. Mutation tests require deterministic fixtures and a
// post-restore state assertion before they can emit PASS.
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

function evidence({
  testId, actor, authorizedTenant, targetTenant, surface, operation,
  expected, actual, rowsReturned = 0, rowsAffected = 0, errorCode = 'NONE',
  denialClass = 'NOT_APPLICABLE', result, input = {},
}) {
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
    DENIAL_CLASS: denialClass,
    RESULT: result,
    EVIDENCE_REFERENCE: `runtime-evidence:${runId}`,
  });
}

async function signIn(email, password, expectedUserId) {
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) {
    throw new Error(`NOT VERIFIED: authentication failed: ${error?.message ?? 'missing session'}`);
  }
  if (data.user.id !== expectedUserId) {
    throw new Error(`NOT VERIFIED: authenticated actor mismatch; expected ${expectedUserId}, got ${data.user.id}`);
  }
  return { client, user: data.user };
}

function tenantColumn(table) {
  // companies is the tenant root. Its own identity is id; child/tenant-owned
  // surfaces use company_id according to the deployed schema.
  return table === 'companies' ? 'id' : 'company_id';
}

function classifyDenied({ error, rows, targetKnown }) {
  if (error) return { denialClass: 'AUTHORIZATION_OR_DATABASE_DENIAL', errorCode: error.code ?? 'UNKNOWN' };
  if (rows === 0 && targetKnown) return { denialClass: 'RLS_FILTERED' };
  if (rows === 0) return { denialClass: 'UNRESOLVED_ZERO_ROWS' };
  return { denialClass: 'NOT_APPLICABLE' };
}

async function selectProbe(client, actor, authorizedTenant, targetTenant, table, direction, targetKnown = false) {
  const column = tenantColumn(table);
  const { data, error } = await client.from(table).select('id').eq(column, targetTenant).limit(10);
  const rows = data?.length ?? 0;
  const crossTenant = targetTenant !== authorizedTenant;
  if (error) {
    const denied = classifyDenied({ error, rows, targetKnown });
    return evidence({
      testId: `P0-2-SELECT-${direction}-${table}`, actor, authorizedTenant, targetTenant,
      surface: table, operation: 'SELECT',
      expected: crossTenant ? 'DENIED OR ZERO UNAUTHORIZED ROWS' : 'OWN TENANT READ SUCCEEDS',
      actual: error.message, errorCode: denied.errorCode, denialClass: crossTenant ? denied.denialClass : 'DATABASE_ERROR',
      result: 'NOT VERIFIED', input: { targetTenant, direction, tenantColumn: column, targetKnown },
    });
  }
  const result = crossTenant ? (rows === 0 ? 'PASS' : 'FAIL') : 'PASS';
  const denial = crossTenant ? classifyDenied({ error: null, rows, targetKnown }) : { denialClass: 'NOT_APPLICABLE' };
  return evidence({
    testId: `P0-2-SELECT-${direction}-${table}`, actor, authorizedTenant, targetTenant,
    surface: table, operation: 'SELECT',
    expected: crossTenant ? 'ZERO UNAUTHORIZED ROWS' : 'OWN TENANT READ',
    actual: `${rows} rows`, rowsReturned: rows, result,
    denialClass: denial.denialClass,
    input: { targetTenant, direction, tenantColumn: column, targetKnown },
  });
}

function parseMutationFixtures() {
  const raw = process.env.RUNTIME_EVIDENCE_MUTATION_FIXTURES;
  if (!raw) throw new Error('NOT VERIFIED: RUNTIME_EVIDENCE_MUTATION_FIXTURES is required for mutation execution.');
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error('NOT VERIFIED: mutation fixture JSON is invalid.'); }
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('NOT VERIFIED: mutation fixtures must be a non-empty array.');

  const allowed = new Set(DATABASE_TABLES);
  for (const item of parsed) {
    if (!allowed.has(item.table) || !['INSERT', 'UPDATE', 'DELETE'].includes(item.operation)) {
      throw new Error(`NOT VERIFIED: unsupported mutation fixture for ${item.table}/${item.operation}`);
    }
    if (!item.own || !item.foreign || !item.restore) {
      throw new Error(`NOT VERIFIED: mutation fixture requires own, foreign and restore cases for ${item.table}/${item.operation}`);
    }
    if (!item.restore.id && item.operation !== 'INSERT') {
      throw new Error(`NOT VERIFIED: restore fixture requires deterministic id for ${item.table}/${item.operation}`);
    }
  }

  const requiredChildCases = CHILD_TABLES.flatMap((table) =>
    ['INSERT', 'UPDATE', 'DELETE'].map((operation) => `${table}::${operation}`));
  const actualChildCases = new Set(parsed.map((item) => `${item.table}::${item.operation}`));
  const missingChildCases = requiredChildCases.filter((key) => !actualChildCases.has(key));
  if (missingChildCases.length) {
    throw new Error(`NOT VERIFIED: F13 child mutation coverage incomplete: ${missingChildCases.join(', ')}`);
  }

  return parsed;
}

function comparableRecord(actual, expected) {
  if (!actual || !expected) return false;
  return Object.entries(expected).every(([key, value]) => JSON.stringify(actual[key]) === JSON.stringify(value));
}

async function readById(client, table, id) {
  if (!id) throw new Error(`NOT VERIFIED: deterministic id missing for ${table}`);
  const { data, error } = await client.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`NOT VERIFIED: post-mutation state read failed for ${table}/${id}: ${error.message}`);
  return data ?? null;
}

async function snapshotOriginalState(client, fixture) {
  const id = fixture.restore.id ?? fixture.own.id;
  if (!id && fixture.operation !== 'INSERT') {
    throw new Error(`NOT VERIFIED: original-state snapshot requires deterministic id for ${fixture.table}/${fixture.operation}`);
  }
  const original = id ? await readById(client, fixture.table, id) : null;
  if (fixture.operation === 'INSERT') {
    if (original !== null) {
      throw new Error(`NOT VERIFIED: INSERT fixture is not clean; deterministic id ${id} already exists in ${fixture.table}`);
    }
    return { original: null, fixtureMatchesOriginal: true };
  }
  if (original === null) {
    throw new Error(`NOT VERIFIED: original-state snapshot missing for ${fixture.table}/${id}`);
  }
  if (!comparableRecord(original, fixture.restore)) {
    throw new Error(`NOT VERIFIED: fixture.restore does not match original database state for ${fixture.table}/${id}`);
  }
  return { original, fixtureMatchesOriginal: true };
}

async function restoreAndVerify(client, fixture, original) {
  if (fixture.operation === 'INSERT') {
    const id = fixture.restore.id ?? fixture.own.id;
    if (!id) throw new Error(`NOT VERIFIED: INSERT fixture requires deterministic cleanup id for ${fixture.table}`);
    const deleted = await client.from(fixture.table).delete().eq('id', id);
    if (deleted.error) throw new Error(`NOT VERIFIED: INSERT cleanup failed for ${fixture.table}/${id}: ${deleted.error.message}`);
    const finalState = await readById(client, fixture.table, id);
    if (finalState !== null || original !== null) throw new Error(`NOT VERIFIED: INSERT cleanup verification failed for ${fixture.table}/${id}`);
    return { ok: true, state: null };
  }

  if (!original) throw new Error(`NOT VERIFIED: original snapshot missing for ${fixture.table}/${fixture.restore.id}`);
  const restored = await client.from(fixture.table).upsert(original, { onConflict: 'id' }).select('*').maybeSingle();
  if (restored.error) throw new Error(`NOT VERIFIED: restore failed for ${fixture.table}/${fixture.restore.id}: ${restored.error.message}`);
  const finalState = await readById(client, fixture.table, fixture.restore.id);
  if (!comparableRecord(finalState, original)) {
    throw new Error(`NOT VERIFIED: restored-state assertion failed for ${fixture.table}/${fixture.restore.id}`);
  }
  return { ok: true, state: finalState };
}

async function runMutation(client, actor, authorizedTenant, fixture, targetTenant, attack) {
  const { table, operation } = fixture;
  const snapshot = await snapshotOriginalState(client, fixture);
  const payload = attack ? fixture.foreign : fixture.own;
  const target = attack ? targetTenant : authorizedTenant;
  let response;
  if (operation === 'INSERT') response = await client.from(table).insert(payload).select('id');
  else if (operation === 'UPDATE') response = await client.from(table).update(payload).eq('id', payload.id).select('id');
  else response = await client.from(table).delete().eq('id', payload.id).select('id');

  const rows = response.data?.length ?? 0;
  const denied = Boolean(response.error) || rows === 0;
  const result = attack ? (denied ? 'PASS' : 'FAIL') : (response.error ? 'FAIL' : 'PASS');
  const denial = attack ? classifyDenied({
    error: response.error, rows, targetKnown: true,
  }) : { denialClass: 'NOT_APPLICABLE' };

  let restoreError = null;
  if (!attack || (!denied && rows > 0)) {
    try {
      await restoreAndVerify(client, fixture, snapshot.original);
    } catch (error) {
      restoreError = error;
    }
  }

  if (restoreError) {
    throw new Error(restoreError.message);
  }

  return evidence({
    testId: `P0-2-${operation}-${attack ? 'FOREIGN' : 'OWN'}-${table}`,
    actor, authorizedTenant, targetTenant: target,
    surface: table, operation,
    expected: attack ? 'CROSS-TENANT MUTATION DENIED' : 'OWN TENANT MUTATION SUCCEEDS AND RESTORES EXACT STATE',
    actual: response.error?.message ?? `${rows} rows`,
    rowsReturned: rows, rowsAffected: rows,
    errorCode: response.error?.code ?? 'NONE',
    denialClass: denial.denialClass,
    result,
    input: {
      attack,
      targetTenant: target,
      fixtureId: fixture.restore.id ?? fixture.own.id ?? null,
      originalSnapshotVerified: snapshot.fixtureMatchesOriginal,
      restoreVerified: !restoreError,
    },
  });
}

async function runActor(label, email, password, expectedUserId, authorizedTenant, targetTenant, fixtures) {
  const { client, user } = await signIn(email, password, expectedUserId);
  context(user.id, authorizedTenant, targetTenant);
  const records = [];
  try {
    for (const table of DATABASE_TABLES) {
      const targetKnown = fixtures.some((fixture) => fixture.table === table && fixture.foreign?.company_id === targetTenant);
      records.push(await selectProbe(client, user.id, authorizedTenant, authorizedTenant, table, `${label}_OWN`, true));
      records.push(await selectProbe(client, user.id, authorizedTenant, targetTenant, table, `${label}_FOREIGN`, targetKnown));
    }
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
  const fixtures = parseMutationFixtures();
  records.push(...await runActor('A', process.env.RUNTIME_EVIDENCE_USER_A_EMAIL, process.env.RUNTIME_EVIDENCE_USER_A_PASSWORD, process.env.RUNTIME_EVIDENCE_EXPECTED_USER_A_ID, A, B, fixtures));
  records.push(...await runActor('B', process.env.RUNTIME_EVIDENCE_USER_B_EMAIL, process.env.RUNTIME_EVIDENCE_USER_B_PASSWORD, process.env.RUNTIME_EVIDENCE_EXPECTED_USER_B_ID, B, A, fixtures));
  for (const surface of INFERENCE_SURFACES) {
    records.push(evidence({
      testId: `P0-2-INFERENCE-${surface}`, actor: 'runtime-executor',
      authorizedTenant: A, targetTenant: B, surface, operation: surface,
      expected: 'ZERO CROSS-TENANT INFORMATION LEAKAGE',
      actual: 'APPLICATION-SPECIFIC EXECUTOR REQUIRED',
      result: 'NOT VERIFIED',
      denialClass: 'NOT_APPLICABLE',
    }));
  }
} catch (error) {
  console.error(`NOT VERIFIED: P0-2 runtime executor aborted: ${error.message}`);
  process.exitCode = 1;
  process.exit();
}

const failures = records.filter((record) => record.RESULT === 'FAIL');
const unverified = records.filter((record) => record.RESULT === 'NOT VERIFIED');
console.log(JSON.stringify({
  status: failures.length ? 'FAIL' : unverified.length ? 'NOT VERIFIED' : 'RUNTIME_EVIDENCED',
  environment, runId, records,
}, null, 2));
if (failures.length || unverified.length) process.exitCode = 1;
