const SUPABASE_URL = process.env.REPORT_ADVISOR_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY;
const EMAIL = process.env.TEST_USER_A_EMAIL || process.env.TEST_USER_D_EMAIL;
const PASSWORD = process.env.TEST_USER_A_PASSWORD || process.env.TEST_USER_D_PASSWORD;
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173';
const JOB_ID = process.env.OPEN_REPORT_EXECUTION_JOB_ID;
const EXPECTED_HASH = process.env.OPEN_REPORT_EXPECTED_SOURCE_HASH;
const EXPECTED_ROWS_ENV = Number(process.env.OPEN_REPORT_EXPECTED_ROWS ?? '0');
const EXPECTED_FILE = process.env.OPEN_REPORT_FILE_NAME;

function required(name, value) {
  if (!value) throw new Error(name + '_MISSING');
  return value;
}
required('REPORT_ADVISOR_SUPABASE_URL', SUPABASE_URL);
required('REPORT_ADVISOR_SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);
required('TEST_USER_A_EMAIL', EMAIL);
required('TEST_USER_A_PASSWORD', PASSWORD);
required('OPEN_REPORT_EXECUTION_JOB_ID', JOB_ID);
required('OPEN_REPORT_EXPECTED_SOURCE_HASH', EXPECTED_HASH);
required('OPEN_REPORT_FILE_NAME', EXPECTED_FILE);
if (!Number.isFinite(EXPECTED_ROWS_ENV) || EXPECTED_ROWS_ENV < 0) throw new Error('OPEN_REPORT_EXPECTED_ROWS_INVALID');

async function supabaseFetch(path, init = {}) {
  const response = await fetch(SUPABASE_URL + path, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch {}
  if (!response.ok) throw new Error('SUPABASE_HTTP_' + response.status + ':' + text.slice(0, 700));
  return { response, body };
}

async function rest(path, accessToken, init = {}) {
  return supabaseFetch('/rest/v1' + path, {