import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import handler from '../api/canonical-import-execute.ts';

const url = process.env.REPORT_ADVISOR_SUPABASE_URL || process.env.SUPABASE_URL;
const anon = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const service = process.env.REPORT_ADVISOR_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const emailA = process.env.TEST_USER_A_EMAIL;
const passwordA = process.env.TEST_USER_A_PASSWORD;
const emailB = process.env.TEST_USER_B_EMAIL;
const passwordB = process.env.TEST_USER_B_PASSWORD;

for (const [name, value] of Object.entries({ url, anon, service, emailA, passwordA, emailB, passwordB })) {
  if (!value) throw new Error(`IMPORT_PROVENANCE_SECRET_MISSING:${name}`);
}
process.env.SUPABASE_URL = url;
process.env.VITE_SUPABASE_ANON_KEY = anon;
process.env.SUPABASE_SERVICE_ROLE_KEY = service;

const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
const runTag = crypto.randomUUID().slice(0, 8);
const committedCustomerName = `P0E provenance customer ${runTag}`;

async function signIn(email, password) {
  const client = createClient(url, anon, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`AUTH_FAILED:${email}:${error?.message ?? 'session_missing'}`);
  const { data: company, error: companyError } = await client.rpc('current_company_id');
  if (companyError || !company) throw new Error(`TENANT_RESOLUTION_FAILED:${companyError?.message ?? 'missing'}`);
  return { client, accessToken: data.session.access_token, userId: data.user.id, companyId: company };
}

async function createSourceJob(session, label) {
  const sourcePath = `${session.companyId}/imports/${crypto.randomUUID()}.csv`;
  const displayName = `p0e-${runTag}-${label}.csv`;
  const raw = Buffer.from([
    'code,name',
    `P0E-${runTag}-${label},${label}`,
    '',
  ].join('\n'), 'utf8');
  const hash = `sha256:${crypto.createHash('sha256').update(raw).digest('hex')}`;

  const { error: uploadError } = await session.client.storage.from('documents').upload(sourcePath, raw, {
    contentType: 'text/csv',
    cacheControl: '0',
    upsert: false,
  });
  if (uploadError) throw new Error(`SOURCE_UPLOAD_FAILED:${uploadError.message}`);

  const { data: jobId, error: jobError } = await session.client.rpc('import_create_job', {
    p_company_id: session.companyId,
    p_entity_type: 'customers',
    p_total_rows: 1,
    p_source_object_path: sourcePath,
    p_file_name: displayName,
    p_file_size: raw.byteLength,
    p_file_mime: 'text/csv',
  });
  if (jobError || !jobId) throw new Error(`IMPORT_CREATE_JOB_FAILED:${jobError?.message ?? 'missing'}`);

  const { data: job, error: jobReadError } = await admin
    .from('import_jobs')
    .select('id,company_id,file_record_id,source_fingerprint,status,job_type')
    .eq('id', jobId)
    .single();
  if (jobReadError || !job?.file_record_id) throw new Error(`IMPORT_JOB_READ_FAILED:${jobReadError?.message ?? 'file_record_missing'}`);

  const { data: fileRecord, error: fileReadError } = await admin
    .from('file_records')
    .select('id,company_id,file_name,file_size,file_mime,file_hash,status,security_status,metadata')
    .eq('id', job.file_record_id)
    .single();
  if (fileReadError || !fileRecord) throw new Error(`FILE_RECORD_READ_FAILED:${fileReadError?.message ?? 'missing'}`);

  return { sourcePath, raw, hash, job, fileRecord, displayName };
}

function makeResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.payload = body; return this; },
  };
}

async function callApi(session, body) {
  const res = makeResponse();
  await handler({
    method: 'POST',
    headers: {
      authorization: `Bearer ${session.accessToken}`,
      'content-type': 'application/json',
      'content-length': String(Buffer.byteLength(JSON.stringify(body), 'utf8')),
    },
    body,
  }, res);
  return res;
}

function rowWithClaims(source, claims) {
  return {
    rowNumber: 1,
    data: { code: `P0E-${runTag}-valid`, name: committedCustomerName },
    provenance: {
      tenantId: claims.tenantId ?? source.job.company_id,
      sourceId: claims.sourceId ?? source.fileRecord.id,
      sourceHash: claims.sourceHash ?? source.hash,
      sourceDocumentId: claims.sourceDocumentId ?? source.fileRecord.id,
      evidenceId: claims.evidenceId ?? `${source.fileRecord.id}:1`,
      lineageId: claims.lineageId ?? `${source.job.company_id}:${source.fileRecord.id}:1`,
    },
    reconciliation: 'RECONCILED',
  };
}

async function expectReject(session, body, codeFragment) {
  const response = await callApi(session, body);
  if (response.statusCode < 400 || response.statusCode >= 500) {
    throw new Error(`EXPECTED_REJECT_NOT_REJECTED:${codeFragment}:${response.statusCode}:${JSON.stringify(response.payload)}`);
  }
  const actual = String(response.payload?.error ?? '');
  if (codeFragment && !actual.includes(codeFragment)) {
    throw new Error(`EXPECTED_REJECT_WRONG_REASON:${codeFragment}:${actual}`);
  }
  return response;
}

async function cleanupSource(source) {
  try { await admin.storage.from('documents').remove([source.sourcePath]); } catch {}
  try { await admin.from('customers').delete().eq('company_id', source.job.company_id).eq('name', committedCustomerName); } catch {}
  try { await admin.from('import_jobs').delete().eq('id', source.job.id); } catch {}
  try { await admin.from('file_records').delete().eq('id', source.fileRecord.id); } catch {}
}

const sessionA = await signIn(emailA, passwordA);
const sessionB = await signIn(emailB, passwordB);
const sources = [];

try {
  const valid = await createSourceJob(sessionA, 'valid');
  sources.push(valid);

  const base = {
    entityType: 'customers',
    importId: valid.job.id,
    fileName: valid.displayName,
    rows: [{ rowNumber: 1, data: { code: `P0E-${runTag}-base`, name: committedCustomerName } }],
    qualityScore: 100,
  };

  await expectReject(sessionA, { ...base, sourceHash: `sha256:${'f'.repeat(64)}` }, 'CANONICAL_SOURCE_HASH_MISMATCH');

  await expectReject(sessionA, { ...base, rows: [rowWithClaims(valid, { sourceId: crypto.randomUUID() })] }, 'CANONICAL_SOURCE_ID_MISMATCH');

  await expectReject(sessionA, { ...base, rows: [rowWithClaims(valid, { sourceDocumentId: crypto.randomUUID() })] }, 'CANONICAL_SOURCE_DOCUMENT_MISMATCH');

  await expectReject(sessionA, { ...base, rows: [rowWithClaims(valid, { evidenceId: 'fake-evidence-id' })] }, 'CANONICAL_EVIDENCE_ID_MISMATCH');

  await expectReject(sessionA, { ...base, rows: [rowWithClaims(valid, { lineageId: 'forged-lineage' })] }, 'CANONICAL_LINEAGE_ID_MISMATCH');

  const crossTenant = await createSourceJob(sessionB, 'cross-tenant');
  sources.push(crossTenant);
  await expectReject(sessionA, {
    entityType: 'customers',
    importId: crossTenant.job.id,
    rows: base.rows,
    qualityScore: 100,
  }, 'import_job_not_found_or_forbidden');

  const validComplete = {
    ...base,
    rows: [rowWithClaims(valid, {})],
    sourceHash: valid.hash,
  };
  const validResponse = await callApi(sessionA, validComplete);
  if (validResponse.statusCode !== 200 || validResponse.payload?.status === 'failed') {
    throw new Error(`VALID_IMPORT_FAILED:${validResponse.statusCode}:${JSON.stringify(validResponse.payload)}`);
  }

  const { data: committedJob } = await admin.from('import_jobs').select('source_fingerprint,status').eq('id', valid.job.id).single();
  const { data: committedSource } = await admin.from('file_records').select('file_hash,status,security_status,metadata').eq('id', valid.fileRecord.id).single();
  if (committedSource?.file_hash !== valid.hash) throw new Error(`SOURCE_HASH_NOT_PERSISTED:${committedSource?.file_hash}`);
  if (committedJob?.source_fingerprint !== valid.hash) throw new Error(`IMPORT_SOURCE_FINGERPRINT_NOT_PERSISTED:${committedJob?.source_fingerprint}`);
  if (committedSource?.metadata?.raw_bytes_sha256 !== valid.hash) throw new Error('RAW_BYTES_SHA_NOT_RECORDED');

  const replay = await callApi(sessionA, validComplete);
  if (replay.statusCode !== 409) {
    throw new Error(`REPLAY_EXPECTED_TERMINAL_REJECTION:${replay.statusCode}:${JSON.stringify(replay.payload)}`);
  }
  const { data: customerRows } = await admin.from('customers').select('id').eq('company_id', sessionA.companyId).eq('name', committedCustomerName);
  if ((customerRows ?? []).length !== 1) throw new Error(`REPLAY_DUPLICATE_COMMIT_DETECTED:${customerRows?.length ?? 0}`);

  const tampered = await createSourceJob(sessionA, 'persisted-hash-tamper');
  sources.push(tampered);
  await admin.from('file_records').update({ file_hash: `sha256:${'0'.repeat(64)}` }).eq('id', tampered.fileRecord.id).eq('company_id', sessionA.companyId);
  await expectReject(sessionA, {
    entityType: 'customers',
    importId: tampered.job.id,
    rows: [{ rowNumber: 1, data: { code: `P0E-${runTag}-tampered`, name: `tampered source ${runTag}` } }],
    qualityScore: 100,
  }, 'PERSISTED_SOURCE_HASH_TAMPERED');

  console.log(JSON.stringify({
    exactHead: process.env.EXACT_HEAD || null,
    status: 'PASS',
    adversarial: [
      'valid_source_valid_import',
      'forged_source_hash_rejected',
      'forged_source_id_rejected',
      'mismatching_source_document_id_rejected',
      'cross_tenant_import_rejected',
      'fake_evidence_id_rejected',
      'lineage_mismatch_rejected',
      'persisted_source_hash_tamper_rejected',
      'same_import_replay_no_duplicate',
      'valid_complete_provenance',
    ],
    companyA: sessionA.companyId,
    companyB: sessionB.companyId,
    committedImportId: valid.job.id,
  }, null, 2));
} finally {
  for (const source of sources.reverse()) await cleanupSource(source);
}
