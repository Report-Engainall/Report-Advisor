import { createClient } from '@supabase/supabase-js';

const required = [
  'REPORT_ADVISOR_SUPABASE_URL',
  'REPORT_ADVISOR_SUPABASE_ANON_KEY',
  'REPORT_ADVISOR_SUPABASE_SERVICE_ROLE_KEY',
  'TEST_USER_A_EMAIL',
  'TEST_USER_A_PASSWORD',
  'TEST_USER_B_EMAIL',
  'TEST_USER_B_PASSWORD',
];
for (const name of required) if (!process.env[name]) throw new Error(`MISSING_ENV:${name}`);

const url = process.env.REPORT_ADVISOR_SUPABASE_URL;
const anon = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY;
const serviceRole = process.env.REPORT_ADVISOR_SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
const admin = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });

async function signIn(email, password) {
  const scoped = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await scoped.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw error ?? new Error('AUTH_USER_MISSING');
  return { client: scoped, userId: data.user.id };
}

async function expectFailure(label, fn) {
  try {
    const result = await fn();
    if (result?.error) {
      console.log(`NEGATIVE PASS: ${label}`);
      return;
    }
  } catch {
    console.log(`NEGATIVE PASS: ${label}`);
    return;
  }
  throw new Error(`NEGATIVE PATH DID NOT FAIL: ${label}`);
}

const userA = await signIn(process.env.TEST_USER_A_EMAIL, process.env.TEST_USER_A_PASSWORD);
const userB = await signIn(process.env.TEST_USER_B_EMAIL, process.env.TEST_USER_B_PASSWORD);

const { data: companyId, error: companyError } = await userA.client.rpc('current_company_id');
if (companyError || !companyId) throw companyError ?? new Error('CURRENT_COMPANY_ID_MISSING');

const label = `runtime-watched-${Date.now()}`;
const { data: folder, error: folderError } = await admin
  .from('watched_report_folders')
  .insert({ company_id: companyId, label, logical_path: 'runtime-e2e', enabled: true })
  .select('id,company_id')
  .single();
if (folderError || !folder) throw folderError ?? new Error('WATCHED_FOLDER_CREATE_FAILED');

const relativePath = `runtime/${label}.csv`;
const args = {
  p_folder_id: folder.id,
  p_relative_path: relativePath,
  p_content_hash: `sha256:${'a'.repeat(64)}`,
  p_size_bytes: 100,
  p_modified_at: new Date().toISOString(),
  p_state: 'new',
};

try {
  const { data: fileId, error: validError } = await userA.client.rpc('record_watched_report_file', args);
  if (validError || !fileId) throw validError ?? new Error('VALID_WATCHED_RECORD_FAILED');

  for (const state of ['processing','processed','failed','dead_letter','deleted']) {
    await expectFailure(`authenticated control state ${state} rejected`, () => userA.client.rpc('record_watched_report_file', { ...args, p_state: state }));
  }

  await expectFailure('cross-tenant watched folder rejected', () => userB.client.rpc('record_watched_report_file', args));

  await expectFailure('authenticated direct watched-file UPDATE rejected', () => userA.client
    .from('watched_report_files')
    .update({ state: 'processed' })
    .eq('company_id', companyId)
    .eq('folder_id', folder.id)
    .eq('relative_path', relativePath));

  const { error: workerUpdateError } = await admin
    .from('watched_report_files')
    .update({ state: 'processing' })
    .eq('company_id', companyId)
    .eq('folder_id', folder.id)
    .eq('relative_path', relativePath);
  if (workerUpdateError) throw workerUpdateError;

  console.log(JSON.stringify({
    status: 'PASS',
    tested: [
      'authenticated new state allowed',
      'authenticated processing/processed/failed/dead_letter/deleted rejected',
      'cross-tenant folder rejected',
      'authenticated direct table update rejected',
      'service-role worker transition accepted',
    ],
  }, null, 2));
} finally {
  await admin.from('watched_report_files').delete().eq('company_id', companyId).eq('folder_id', folder.id).eq('relative_path', relativePath);
  await admin.from('watched_report_folders').delete().eq('id', folder.id).eq('company_id', companyId);
}
