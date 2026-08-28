import { createClient } from '@supabase/supabase-js';
import { requireSafeRuntimeEnvironment, requireAuthenticatedContext } from './runtime-evidence-config.mjs';
import { DATABASE_TABLES, CHILD_TABLES } from './runtime-evidence-matrix.mjs';
import { createEvidenceRecord } from './runtime-evidence-record.mjs';

const environment = requireSafeRuntimeEnvironment();
const required = ['SUPABASE_URL', 'RUNTIME_EVIDENCE_USER_A_EMAIL', 'RUNTIME_EVIDENCE_USER_A_PASSWORD', 'RUNTIME_EVIDENCE_USER_B_EMAIL', 'RUNTIME_EVIDENCE_USER_B_PASSWORD', 'RUNTIME_EVIDENCE_TENANT_A_ID', 'RUNTIME_EVIDENCE_TENANT_B_ID', 'RUNTIME_EVIDENCE_RELEASE', 'RUNTIME_EVIDENCE_COMMIT_SHA'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`NOT VERIFIED: live harness requires environment variables: ${missing.join(', ')}`);

const url = process.env.SUPABASE_URL;
const A = process.env.RUNTIME_EVIDENCE_TENANT_A_ID;
const B = process.env.RUNTIME_EVIDENCE_TENANT_B_ID;

async function signIn(email, password) {
  const client = createClient(url, process.env.SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  if (!process.env.SUPABASE_ANON_KEY) throw new Error('NOT VERIFIED: SUPABASE_ANON_KEY is required in the runtime environment.');
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) throw new Error(`NOT VERIFIED: authenticated session could not be established: ${error?.message ?? 'missing session'}`);
  return { client, user: data.user, session: data.session };
}

function contextFor(actor, authorizedTenant, targetTenant) {
  return requireAuthenticatedContext({
    actor,
    authorizedTenant,
    targetTenant,
    environment,
    release: process.env.RUNTIME_EVIDENCE_RELEASE,
    commitSha: process.env.RUNTIME_EVIDENCE_COMMIT_SHA,
  });
}

async function probeCompanyOwnedTable(client, table, authorizedTenant, targetTenant) {
  const { data, error } = await client.from(table).select('id').eq('company_id', targetTenant).limit(10);
  const rows = data?.length ?? 0;
  return { table, operation: 'SELECT', expected: 'ZERO UNAUTHORIZED ROWS', actual: error ? 'DENIED_OR_ERROR' : `${rows} rows`, rows, errorCode: error?.code ?? null, leak: rows > 0 };
}

async function runActor(actorName, email, password, authorizedTenant, targetTenant) {
  const { client, user } = await signIn(email, password);
  contextFor(user.id, authorizedTenant, targetTenant);
  const results = [];
  for (const table of DATABASE_TABLES.filter((name) => !CHILD_TABLES.includes(name))) {
    try {
      const result = await probeCompanyOwnedTable(client, table, authorizedTenant, targetTenant);
      const record = createEvidenceRecord({
        TEST_ID: `P0-2-READ-${actorName}-${table}`,
        ENVIRONMENT: environment,
        RELEASE: process.env.RUNTIME_EVIDENCE_RELEASE,
        COMMIT_SHA: process.env.RUNTIME_EVIDENCE_COMMIT_SHA,
        TIMESTAMP: new Date().toISOString(),
        ACTOR: user.id,
        AUTHORIZED_TENANT: authorizedTenant,
        TARGET_TENANT: targetTenant,
        SURFACE: table,
        OPERATION: 'SELECT',
        INPUT: { targetTenant },
        EXPECTED: 'ZERO UNAUTHORIZED ROWS',
        ACTUAL: result.actual,
        ROWS_RETURNED: result.rows,
        ROWS_AFFECTED: 0,
        ERROR_CODE: result.errorCode ?? 'NONE',
        RESULT: result.leak ? 'FAIL' : 'PASS',
        EVIDENCE_REFERENCE: 'stdout-only; persist sanitized records in CI artifact when live environment is available',
      });
      results.push(record);
      if (record.RESULT === 'FAIL') throw new Error(`CROSS-TENANT DATA LEAK: ${table}`);
    } catch (error) {
      results.push({ TEST_ID: `P0-2-READ-${actorName}-${table}`, RESULT: 'NOT VERIFIED', error: error.message });
    }
  }
  await client.auth.signOut();
  return results;
}

const results = [
  ...(await runActor('A_TO_B', process.env.RUNTIME_EVIDENCE_USER_A_EMAIL, process.env.RUNTIME_EVIDENCE_USER_A_PASSWORD, A, B)),
  ...(await runActor('B_TO_A', process.env.RUNTIME_EVIDENCE_USER_B_EMAIL, process.env.RUNTIME_EVIDENCE_USER_B_PASSWORD, B, A)),
];

const failures = results.filter((r) => r.RESULT === 'FAIL');
const unverified = results.filter((r) => r.RESULT === 'NOT VERIFIED');
console.log(JSON.stringify({ status: failures.length ? 'FAIL' : unverified.length ? 'NOT VERIFIED' : 'LIVE_READ_READY', environment, results }, null, 2));
if (failures.length) process.exitCode = 1;
