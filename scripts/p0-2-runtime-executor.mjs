import { createClient } from '@supabase/supabase-js';
import { requireSafeRuntimeEnvironment, requireAuthenticatedContext } from './runtime-evidence-config.mjs';
import { DATABASE_TABLES, INFERENCE_SURFACES } from './runtime-evidence-matrix.mjs';
import { createEvidenceRecord } from './runtime-evidence-record.mjs';
import { validateChildMutationCoverage } from './p0-2-mutation-coverage.mjs';
import { assertMutationResponseIdentity, assertMutationTargetIdentity, mutationTargetId } from './p0-2-mutation-identity.mjs';

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

function evidence({ testId, actor, authorizedTenant, targetTenant, surface, operation, expected, actual, rowsReturned = 0, rowsAffected = 0, errorCode = 'NONE', denialClass = 'NOT_APPLICABLE', result, input = {} }) {
  return createEvidenceRecord({
    TEST_ID: `${testId}-${runId}`, ENVIRONMENT: environment, RELEASE: release, COMMIT_SHA: commitSha,
    TIMESTAMP: new Date().toISOString(), ACTOR: actor, AUTHORIZED_TENANT: authorizedTenant,
    TARGET_TENANT: targetTenant, SURFACE: surface, OPERATION: operation, INPUT: input,
    EXPECTED: expected, ACTUAL: actual, ROWS_RETURNED: rowsReturned, ROWS_AFFECTED: rowsAffected,
    ERROR_CODE: errorCode, DENIAL_CLASS: denialClass, RESULT: result,
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
    return evidence({ testId: `P0-2-SELECT-${direction}-${table}`, actor, authorizedTenant, targetTenant, surface: table, operation: 'SELECT', expected: crossTenant ? 'DENIED OR ZERO UNAUTHORIZED ROWS' : 'OWN TENANT READ SUCCEEDS', actual: error.message, errorCode: denied.errorCode, denialClass: crossTenant ? denied.denialClass : 'DATABASE_ERROR', result: 'NOT VERIFIED', input: { targetTenant, direction, tenantColumn: column, targetKnown } });
  }
  const result = crossTenant ? (rows === 0 ? 'PASS' : 'FAIL') : 'PASS';
  const denial = crossTenant ? classifyDenied({ error: null, rows, targetKnown }) : { denialClass: 'NOT_APPLICABLE' };
  return evidence({ testId: `P0-2-SELECT-${direction}-${table}`, actor, authorizedTenant, targetTenant, surface: table, operation: 'SELECT', expected: crossTenant ? 'ZERO UNAUTHORIZED ROWS' : 'OWN TENANT READ', actual: `${rows} rows`, rowsReturned: rows, result, denialClass: denial.denialClass, input: { targetTenant, direction, tenantColumn: column, targetKnown } });
}

function parseMutationFixtures() {
  const raw = process.env.RUNTIME_EVIDENCE_MUTATION_FIXTURES;
  if (!raw) throw new Error('NOT VERIFIED: RUNTIME_EVIDENCE_MUTATION_FIXTURES is required for mutation execution.');
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error('NOT VERIFIED: mutation fixture JSON is invalid.'); }
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('NOT VERIFIED: mutation fixtures must be a non-empty array.');
  const allowed = new Set(DATABASE_TABLES);
  for (const item of parsed) {
    if (!allowed.has(item.table) || !['INSERT', 'UPDATE', 'DELETE'].includes(item.operation)) throw new Error(`NOT VERIFIED: unsupported mutation fixture for ${item.table}/${item.operation}`);
    if (!item.own || !item.foreign || !item.restore) throw new Error(`NOT VERIFIED: mutation fixture requires own, foreign and restore cases for ${item.table}/${item.operation}`);
    if (!item.restore.id && item.operation !== 'INSERT') throw new Error(`NOT VERIFIED: restore fixture requires deterministic id for ${item.table}/${item.operation}`);
    mutationTargetId(item);
  }
  validateChildMutationCoverage(parsed);
  return parsed;
}

function comparableRecord(actual, expected) {
  if (!actual || !expected) return false;
  return Object.entries(expected).every(([key, value]) => JSON.stringify(actual[key]) === JSON.stringify(value));
}

async function readById(client, table, id) {
  if (!id) throw new Error(`NOT VERIFIED: deterministic id missing for ${table}`);
  const { data, error } = await client.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`NOT VERIFIED: state read failed for ${table}/${id}: ${error.message}`);
  return data ?? null;
}

async function snapshotOriginalState(client, fixture, targetId, expectedOriginal = null, requireFixtureMatch = false) {
  const canonicalId = assertMutationTargetIdentity(fixture, targetId);
  const original = await readById(client, fixture.table, canonicalId);
  if (fixture.operation === 'INSERT') {
    if (original !== null) throw new Error(`NOT VERIFIED: INSERT fixture is not clean; deterministic id ${canonicalId} already exists in ${fixture.table}`);
    return { original: null, fixtureMatchesOriginal: true, targetId: canonicalId };
  }
  if (original === null) throw new Error(`NOT VERIFIED: original-state snapshot missing for ${fixture.table}/${canonicalId}`);
  if (requireFixtureMatch && !comparableRecord(original, expectedOriginal)) {
    throw new Error(`NOT VERIFIED: fixture.restore does not match original database state for ${fixture.table}/${canonicalId}`);
  }
  return { original, fixtureMatchesOriginal: requireFixtureMatch ? true : null, targetId: canonicalId };
}

async function observeMutatedState(client, fixture, original, targetId, response) {
  const canonicalId = assertMutationResponseIdentity(fixture, targetId, response.data ?? []);
  const mutated = await readById(client, fixture.table, canonicalId);
  if (fixture.operation === 'INSERT') {
    if (mutated === null) throw new Error(`NOT VERIFIED: INSERT mutation did not produce an observable row for ${fixture.table}/${canonicalId}`);
  } else if (fixture.operation === 'UPDATE') {
    if (mutated === null) throw new Error(`NOT VERIFIED: UPDATE mutation produced no observable row for ${fixture.table}/${canonicalId}`);
    if (comparableRecord(mutated, original)) throw new Error(`NOT VERIFIED: UPDATE mutation returned success but database state did not change for ${fixture.table}/${canonicalId}`);
  } else if (mutated !== null) {
    throw new Error(`NOT VERIFIED: DELETE mutation returned success but row remains for ${fixture.table}/${canonicalId}`);
  }
  return mutated;
}

async function restoreAndVerify(client, fixture, original, targetId) {
  const canonicalId = assertMutationTargetIdentity(fixture, targetId);
  if (fixture.operation === 'INSERT') {
    if (original !== null) throw new Error(`NOT VERIFIED: INSERT original state must be null for ${fixture.table}/${canonicalId}`);
    const deleted = await client.from(fixture.table).delete().eq('id', canonicalId);
    const rowsAffected = deleted.data?.length ?? 0;
    if (deleted.error) throw new Error(`NOT VERIFIED: INSERT cleanup failed for ${fixture.table}/${canonicalId}: ${deleted.error.message}`);
    const finalState = await readById(client, fixture.table, canonicalId);
    if (finalState !== null || rowsAffected > 1) throw new Error(`NOT VERIFIED: INSERT cleanup verification failed for ${fixture.table}/${canonicalId}`);
    return { ok: true, state: null, targetId: canonicalId };
  }
  if (!original) throw new Error(`NOT VERIFIED: original snapshot missing for ${fixture.table}/${canonicalId}`);
  const restored = await client.from(fixture.table).upsert(original, { onConflict: 'id' }).select('*').maybeSingle();
  if (restored.error) throw new Error(`NOT VERIFIED: restore failed for ${fixture.table}/${canonicalId}: ${restored.error.message}`);
  const finalState = await readById(client, fixture.table, canonicalId);
  if (!comparableRecord(finalState, original)) throw new Error(`NOT VERIFIED: restored-state assertion failed for ${fixture.table}/${canonicalId}`);
  return { ok: true, state: finalState, targetId: canonicalId };
}

async function runMutation(client, actor, authorizedTenant, fixture, targetTenant, attack) {
  const { table, operation } = fixture;
  const payload = attack ? fixture.foreign : fixture.own;
  const targetId = attack ? payload?.id : mutationTargetId(fixture);
  if (!targetId) throw new Error(`NOT VERIFIED: mutation target identity is missing for ${table}/${operation}`);
  if (!payload?.id || payload.id !== targetId) throw new Error(`NOT VERIFIED: mutation payload identity mismatch for ${table}/${operation}: target=${targetId}, payload=${payload?.id ?? 'missing'}`);

  const snapshot = await snapshotOriginalState(client, fixture, targetId, fixture.restore, !attack);
  const target = attack ? targetTenant : authorizedTenant;
  let response;
  if (operation === 'INSERT') response = await client.from(table).insert(payload).select('id');
  else if (operation === 'UPDATE') response = await client.from(table).update(payload).eq('id', targetId).select('id');
  else response = await client.from(table).delete().eq('id', targetId).select('id');

  const rows = response.data?.length ?? 0;
  const targetKnown = operation === 'INSERT' ? snapshot.original === null : snapshot.original !== null;
  const denied = Boolean(response.error) || rows === 0;
  const denial = attack ? classifyDenied({ error: response.error, rows, targetKnown }) : { denialClass: 'NOT_APPLICABLE', errorCode: response.error?.code ?? 'NONE' };

  if (!attack && response.error) throw new Error(`NOT VERIFIED: own-tenant ${operation} failed for ${table}/${targetId}: ${response.error.message}`);
  if (!attack && rows === 0) throw new Error(`NOT VERIFIED: own-tenant ${operation} affected zero rows for known target ${table}/${targetId}`);
  if (attack && rows === 0 && !response.error && !targetKnown) throw new Error(`NOT VERIFIED: cross-tenant ${operation} returned zero rows but target existence is unresolved for ${table}/${targetId}`);

  let mutatedState = null;
  let observationError = null;
  let restoreError = null;
  const mutationApplied = !attack && !response.error && rows > 0;
  const unauthorizedMutationApplied = attack && !denied && rows > 0;
  const restoreRequired = mutationApplied || unauthorizedMutationApplied;

  if (restoreRequired) {
    try {
      mutatedState = await observeMutatedState(client, fixture, snapshot.original, targetId, response);
    } catch (error) {
      observationError = error;
    } finally {
      try {
        await restoreAndVerify(client, fixture, snapshot.original, targetId);
      } catch (error) {
        restoreError = error;
      }
    }
  }
  if (observationError) throw new Error(observationError.message);
  if (restoreError) throw new Error(restoreError.message);

  const result = attack ? (denied ? 'PASS' : 'FAIL') : 'PASS';
  return evidence({
    testId: `P0-2-${operation}-${attack ? 'FOREIGN' : 'OWN'}-${table}`, actor, authorizedTenant, targetTenant: target,
    surface: table, operation,
    expected: attack ? 'CROSS-TENANT MUTATION DENIED' : 'OWN TENANT MUTATION SUCCEEDS AND RESTORES EXACT STATE',
    actual: response.error?.message ?? `${rows} rows`, rowsReturned: rows, rowsAffected: rows,
    errorCode: response.error?.code ?? 'NONE', denialClass: denial.denialClass, result,
    input: { attack, targetTenant: target, targetId, originalSnapshotVerified: snapshot.fixtureMatchesOriginal !== false, mutatedStateObserved: Boolean(mutatedState), restoreVerified: restoreRequired ? !restoreError : true, targetIdentityInvariant: targetId === (attack ? payload.id : mutationTargetId(fixture)) },
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
    records.push(evidence({ testId: `P0-2-INFERENCE-${surface}`, actor: 'runtime-executor', authorizedTenant: A, targetTenant: B, surface, operation: surface, expected: 'ZERO CROSS-TENANT INFORMATION LEAKAGE', actual: 'APPLICATION-SPECIFIC EXECUTOR REQUIRED', result: 'NOT VERIFIED', denialClass: 'NOT_APPLICABLE' }));
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
