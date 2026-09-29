import { createClient } from '@supabase/supabase-js';

type OidcClaims = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  repository?: string;
  ref?: string;
  sha?: string;
  workflow_ref?: string;
};

type Body = {
  path?: string;
  expectedSha?: string;
  sourceHash?: string;
};

let jwksCache: { expiresAt: number; keys: Record<string, JsonWebKey> } | null = null;

const REPOSITORY = 'Report-Engainall/Report-Advisor';
const BRANCH = 'exec/20260927-current-main-import-ui-rebased';
const WORKFLOW_SUFFIX = '/.github/workflows/execution-enforcement-contract.yml@refs/heads/' + BRANCH;
const OIDC_ISSUER = 'https://token.actions.githubusercontent.com';
const OIDC_AUDIENCE = 'report-advisor-corpus';
const CI_EMAIL = 'report-advisor-corpus-ci@aghbari.example';
const CI_COMPANY_NAME = 'Aghbari Report Corpus CI';

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function env(name: string): string {
  const value = Netlify.env.get(name);
  if (!value) throw new Error('NETLIFY_ENV_MISSING:' + name);
  return value;
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const raw = atob(normalized);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function parseJwt(token: string): { header: Record<string, unknown>; payload: OidcClaims; signingInput: string; signature: Uint8Array } {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('GITHUB_OIDC_TOKEN_INVALID');
  const header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[0]))) as Record<string, unknown>;
  const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[1]))) as OidcClaims;
  return {
    header,
    payload,
    signingInput: parts[0] + '.' + parts[1],
    signature: base64UrlToBytes(parts[2]),
  };
}

async function fetchJwks(): Promise<Record<string, JsonWebKey>> {
  if (jwksCache && jwksCache.expiresAt > Date.now()) return jwksCache.keys;
  const response = await fetch(OIDC_ISSUER + '/.well-known/jwks', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('GITHUB_OIDC_JWKS_UNAVAILABLE');
  const body = await response.json() as { keys?: Array<JsonWebKey & { kid?: string }> };
  const keys: Record<string, JsonWebKey> = {};
  for (const key of body.keys ?? []) if (typeof key.kid === 'string') keys[key.kid] = key;
  if (Object.keys(keys).length === 0) throw new Error('GITHUB_OIDC_JWKS_EMPTY');
  jwksCache = { expiresAt: Date.now() + 5 * 60_000, keys };
  return keys;
}

async function verifyGitHubOidc(token: string, expectedSha: string): Promise<OidcClaims> {
  const parsed = parseJwt(token);
  const algorithm = parsed.header.alg;
  const kid = parsed.header.kid;
  if (algorithm !== 'RS256' || typeof kid !== 'string') throw new Error('GITHUB_OIDC_ALGORITHM_UNSUPPORTED');

  const now = Math.floor(Date.now() / 1000);
  const claims = parsed.payload;
  const audience = claims.aud;
  const audienceValid = Array.isArray(audience) ? audience.includes(OIDC_AUDIENCE) : audience === OIDC_AUDIENCE;
  if (claims.iss !== OIDC_ISSUER || !audienceValid) throw new Error('GITHUB_OIDC_ISSUER_OR_AUDIENCE_INVALID');
  if (!claims.exp || claims.exp < now - 30) throw new Error('GITHUB_OIDC_EXPIRED');
  if (claims.nbf && claims.nbf > now + 30) throw new Error('GITHUB_OIDC_NOT_YET_VALID');
  if (claims.repository !== REPOSITORY) throw new Error('GITHUB_OIDC_REPOSITORY_MISMATCH');
  if (claims.ref !== 'refs/heads/' + BRANCH) throw new Error('GITHUB_OIDC_BRANCH_MISMATCH');
  if (claims.sha !== expectedSha) throw new Error('GITHUB_OIDC_SHA_MISMATCH');
  if (typeof claims.workflow_ref !== 'string' || !claims.workflow_ref.endsWith(WORKFLOW_SUFFIX)) {
    throw new Error('GITHUB_OIDC_WORKFLOW_MISMATCH');
  }

  const jwks = await fetchJwks();
  const jwk = jwks[kid];
  if (!jwk) throw new Error('GITHUB_OIDC_KEY_NOT_FOUND');
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const valid = await crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    parsed.signature,
    new TextEncoder().encode(parsed.signingInput),
  );
  if (!valid) throw new Error('GITHUB_OIDC_SIGNATURE_INVALID');
  return claims;
}

function fileMime(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop() ?? '';
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
    json: 'application/json',
    jsonl: 'application/x-ndjson',
    txt: 'text/plain',
    md: 'text/markdown',
    xml: 'application/xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    tiff: 'image/tiff',
    webp: 'image/webp',
    bmp: 'image/bmp',
  };
  return map[ext] ?? 'application/octet-stream';
}

function extension(fileName: string): string {
  const ext = (fileName.toLowerCase().split('.').pop() ?? 'bin').replace(/[^a-z0-9]/g, '').slice(0, 12);
  return ext || 'bin';
}

function sha256Hex(bytes: Uint8Array): Promise<string> {
  return crypto.subtle.digest('SHA-256', bytes).then((digest) =>
    Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join(''),
  );
}

function sourcePathFromName(companyId: string, fileName: string): string {
  return companyId + '/imports/' + crypto.randomUUID() + '.' + extension(fileName);
}

async function ensureCiIdentity(serviceClient: ReturnType<typeof createClient>) {
  const password = 'Aghbari-CI-' + crypto.randomUUID() + '-Corpus-2026!';
  const usersPage = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersPage.error) throw usersPage.error;
  let user = usersPage.data.users.find((item) => item.email?.toLowerCase() === CI_EMAIL.toLowerCase());
  if (user) {
    const updated = await serviceClient.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (updated.error) throw updated.error;
    user = updated.data.user;
  } else {
    const created = await serviceClient.auth.admin.createUser({
      email: CI_EMAIL,
      password,
      email_confirm: true,
      user_metadata: { role: 'owner', source: 'report-corpus-ci' },
    });
    if (created.error || !created.data.user) throw created.error ?? new Error('CI_USER_CREATE_FAILED');
    user = created.data.user;
  }

  let { data: company, error: companyError } = await serviceClient
    .from('companies')
    .select('id')
    .eq('name', CI_COMPANY_NAME)
    .maybeSingle();
  if (companyError) throw companyError;
  if (!company) {
    const inserted = await serviceClient
      .from('companies')
      .insert({
        name: CI_COMPANY_NAME,
        currency: 'YER',
        timezone: 'Asia/Aden',
        industry: 'Testing',
      })
      .select('id')
      .single();
    if (inserted.error || !inserted.data) throw inserted.error ?? new Error('CI_COMPANY_CREATE_FAILED');
    company = inserted.data;
  }

  const membership = await serviceClient.from('company_memberships').upsert({
    company_id: company.id,
    user_id: user.id,
    role: 'owner',
    is_active: true,
    is_default: true,
  }, { onConflict: 'company_id,user_id' });
  if (membership.error) throw membership.error;

  return { userId: user.id, companyId: company.id, password };
}

async function fetchGitHubFile(path: string, sha: string, githubToken: string): Promise<Uint8Array> {
  const url = 'https://api.github.com/repos/' + REPOSITORY + '/contents/' + path.split('/').map(encodeURIComponent).join('/') + '?ref=' + encodeURIComponent(sha);
  const response = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + githubToken,
      Accept: 'application/vnd.github.raw+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'report-advisor-real-report-corpus',
    },
  });
  if (!response.ok) throw new Error('GITHUB_FILE_FETCH_FAILED:' + response.status);
  return new Uint8Array(await response.arrayBuffer());
}

export default async (request: Request): Promise<Response> => {
  if (request.method !== 'POST') return json(405, { status: 'failed', error: 'METHOD_NOT_ALLOWED' });

  try {
    const authorization = request.headers.get('authorization') ?? '';
    if (!authorization.startsWith('Bearer ')) throw new Error('GITHUB_OIDC_REQUIRED');
    const githubToken = request.headers.get('x-github-token')?.trim();
    if (!githubToken) throw new Error('GITHUB_TOKEN_REQUIRED');

    const body = await request.json() as Body;
    const path = String(body.path ?? '').trim();
    const expectedSha = String(body.expectedSha ?? '').trim();
    const expectedSourceHash = String(body.sourceHash ?? '').trim();
    if (!/^sha256:[0-9a-fA-F]{64}$/.test(expectedSourceHash)) throw new Error('SOURCE_HASH_INVALID');
    if (!/^([0-9a-f]{40})$/.test(expectedSha)) throw new Error('EXPECTED_SHA_INVALID');
    if (!path.startsWith('tests/fixtures/realistic-reports/') || path.includes('..') || path.endsWith('/README.md')) {
      throw new Error('CORPUS_PATH_INVALID');
    }

    await verifyGitHubOidc(authorization.slice(7).trim(), expectedSha);

    const { supabaseUrl, anonKey, serviceRoleKey } = {
      supabaseUrl: env('VITE_SUPABASE_URL'),
      anonKey: env('VITE_SUPABASE_ANON_KEY'),
      serviceRoleKey: env('SUPABASE_SERVICE_ROLE_KEY'),
    };
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const identity = await ensureCiIdentity(serviceClient);
    const userClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const signIn = await userClient.auth.signInWithPassword({
      email: CI_EMAIL,
      password: identity.password,
    });
    if (signIn.error || !signIn.data.session?.access_token) throw signIn.error ?? new Error('CI_USER_SIGNIN_FAILED');
    const accessToken = signIn.data.session.access_token;

    const bytes = await fetchGitHubFile(path, expectedSha, githubToken);
    const actualHash = 'sha256:' + await sha256Hex(bytes);
    if (actualHash !== expectedSourceHash) throw new Error('SOURCE_HASH_MISMATCH');

    const fileName = path.split('/').pop() ?? 'report';
    const mime = fileMime(fileName);
    const storagePath = sourcePathFromName(identity.companyId, fileName);
    const upload = await serviceClient.storage.from('documents').upload(storagePath, bytes, {
      contentType: mime,
      upsert: false,
    });
    if (upload.error) throw upload.error;

    const fileRecordInsert = await serviceClient.from('file_records').insert({
      company_id: identity.companyId,
      file_name: fileName,
      file_extension: extension(fileName),
      file_mime: mime,
      file_size: bytes.byteLength,
      file_hash: null,
      security_status: 'pending',
      status: 'uploaded',
      metadata: {
        storage_bucket: 'documents',
        storage_path: storagePath,
        uploaded_by: identity.userId,
        report_corpus: true,
        repository: REPOSITORY,
        source_commit: expectedSha,
        source_path: path,
      },
    }).select('id').single();
    if (fileRecordInsert.error || !fileRecordInsert.data) throw fileRecordInsert.error ?? new Error('FILE_RECORD_CREATE_FAILED');

    const importJobInsert = await serviceClient.from('import_jobs').insert({
      company_id: identity.companyId,
      file_record_id: fileRecordInsert.data.id,
      job_type: 'generic:source-data',
      processing_mode: 'import',
      status: 'processing',
      total_rows: 0,
      processed_rows: 0,
      valid_rows: 0,
      invalid_rows: 0,
      quarantined_rows: 0,
      duplicate_rows: 0,
      progress: 0,
      started_at: new Date().toISOString(),
      result_summary: {
        file_name: fileName,
        source_path: path,
        source_commit: expectedSha,
        report_corpus: true,
      },
    }).select('id').single();
    if (importJobInsert.error || !importJobInsert.data) throw importJobInsert.error ?? new Error('IMPORT_JOB_CREATE_FAILED');

    const { executeCanonicalImport } = await import('../../src/server/canonical-import-executor');
    const execution = await executeCanonicalImport({
      importId: importJobInsert.data.id,
      fileName,
      sourceHash: actualHash,
      entityType: 'generic:source-data',
      qualityApproved: false,
      mode: 'execute',
    }, accessToken, { supabaseUrl, anonKey, serviceRoleKey });

    const evidenceStatus = execution.evidenceStatus === 'VERIFIED' ? 'VERIFIED' : 'PARTIAL';
    const finishSummary = {
      ...(execution as Record<string, unknown>),
      file_name: fileName,
      source_path: path,
      source_commit: expectedSha,
      source_hash: actualHash,
      report_corpus: true,
      ci_company_id: identity.companyId,
      ci_user_id: identity.userId,
    };
    const finish = await userClient.rpc('import_finish_job', {
      p_job_id: importJobInsert.data.id,
      p_status: evidenceStatus === 'VERIFIED' ? 'completed' : 'partial',
      p_result_summary: finishSummary,
      p_error_message: null,
    });
    if (finish.error) throw finish.error;

    const durableJobId = typeof execution.executionJobId === 'string'
      ? execution.executionJobId
      : (typeof execution.jobId === 'string' ? execution.jobId : null);

    let durableJob: Record<string, unknown> | null = null;
    let tasks: unknown[] = [];
    if (durableJobId) {
      const job = await serviceClient.from('report_execution_jobs')
        .select('id,company_id,status,checkpoint,evidence,completed_at,updated_at')
        .eq('id', durableJobId)
        .eq('company_id', identity.companyId)
        .maybeSingle();
      if (job.error) throw job.error;
      durableJob = job.data as Record<string, unknown> | null;
      const taskRows = await serviceClient.from('report_execution_tasks')
        .select('stage,ordinal,status,attempt,completed_at,evidence')
        .eq('report_execution_job_id', durableJobId)
        .eq('company_id', identity.companyId)
        .order('ordinal', { ascending: true });
      if (taskRows.error) throw taskRows.error;
      tasks = taskRows.data ?? [];
    }

    return json(200, {
      status: evidenceStatus === 'VERIFIED' ? 'CLOSED' : 'REVIEW',
      path,
      fileName,
      sourceHash: actualHash,
      importId: importJobInsert.data.id,
      snapshotId: typeof execution.snapshotId === 'string' ? execution.snapshotId : null,
      authoritativeRowCount: Number(execution.authoritativeRowCount ?? 0),
      authoritativeQualityScore: Number(execution.authoritativeQualityScore ?? 0),
      sourceSpecialty: typeof execution.sourceSpecialty === 'string' ? execution.sourceSpecialty : null,
      authoritativeEntityType: typeof execution.authoritativeEntityType === 'string' ? execution.authoritativeEntityType : null,
      evidenceStatus,
      executionJobId: durableJobId,
      renderedOutput: execution.renderedOutput ?? null,
      durableJob,
      tasks,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const clientError = /INVALID$|REQUIRED$|MISMATCH$|INVALID_|NOT_FOUND|UNSUPPORTED|REVIEW_APPROVAL_REQUIRED|QUALITY_REJECTED|PATH_INVALID|GITHUB_OIDC_|SOURCE_|CORPUS_/.test(message);
    return json(clientError ? 400 : 502, { status: 'failed', error: message.slice(0, 512) });
  }
};

export const config = {
  path: '/api/real-report-corpus-execute',
};
