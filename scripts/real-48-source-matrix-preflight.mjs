import { listReportArchetypes, runReportArchetype } from '../src/lib/report-intelligence/archetype-registry.ts';
import { matchCanonicalField } from '../src/lib/report-intelligence/canonical-schema.ts';

const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || 'https://fnqbvfuwbdpwvhcgzksl.supabase.co').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const email = (process.env.REAL_48_TEST_USER_EMAIL || process.env.TEST_USER_B_EMAIL || process.env.TEST_USER_A_EMAIL)?.trim();
const password = process.env.REAL_48_TEST_USER_PASSWORD || process.env.TEST_USER_B_PASSWORD || process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
const targetJobId = process.env.REAL_48_TARGET_JOB_ID?.trim() || 'c42fb0e1-75f2-4727-8c3e-470ae1a804fa';
if (!serviceRoleKey) throw new Error('REAL_48_SERVICE_ROLE_REQUIRED');
const outFile = process.env.E2E_REPORT_DIR
  ? process.env.E2E_REPORT_DIR + '/real-48-source-matrix-preflight.json'
  : 'artifacts/e2e-business/real-48-source-matrix-preflight.json';

for (const [name, value] of Object.entries({ anonKey, email, password })) {
  if (!value) throw new Error('REAL_48_SOURCE_MATRIX_ENV_MISSING:' + name);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { apikey: anonKey, ...(options.headers || {}) },
  });
  const body = await response.text();
  if (!response.ok) throw new Error('SUPABASE_HTTP_' + response.status + ':' + body.slice(0, 1200));
  return body ? JSON.parse(body) : null;
}

async function rpcCurrentCompany(token) {
  const response = await fetchJson(supabaseURL + '/rest/v1/rpc/current_company_id', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: '{}',
  });
  return response == null ? null : String(response);
}

async function serviceRestSelect(table, filters, select, options = {}) {
  if (!serviceRoleKey) return [];
  const url = new URL(supabaseURL + '/rest/v1/' + table);
  url.searchParams.set('select', select);
  for (const [column, value] of Object.entries(filters)) url.searchParams.set(column, 'eq.' + value);
  if (options.order) url.searchParams.set('order', options.order);
  if (options.limit) url.searchParams.set('limit', String(options.limit));
  const response = await fetch(url, { headers: { apikey: serviceRoleKey, Authorization: 'Bearer ' + serviceRoleKey } });
  const body = await response.text();
  if (!response.ok) throw new Error('SERVICE_' + table + '_HTTP_' + response.status + ':' + body.slice(0, 800));
  return body ? JSON.parse(body) : [];
}

async function authenticatedUserId(accessToken) {
  const user = await fetchJson(supabaseURL + '/auth/v1/user', {
    headers: { Authorization: 'Bearer ' + accessToken },
  });
  const id = user?.id ? String(user.id) : '';
  if (!id) throw new Error('REAL_48_AUTH_USER_ID_MISSING');
  return id;
}

async function servicePatch(table, queryParams, payload) {
  if (!serviceRoleKey) throw new Error('REAL_48_SERVICE_ROLE_REQUIRED_FOR_TENANT_SWITCH');
  const url = new URL(supabaseURL + '/rest/v1/' + table);
  for (const [column, value] of Object.entries(queryParams)) url.searchParams.set(column, 'eq.' + value);
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: serviceRoleKey,
      Authorization: 'Bearer ' + serviceRoleKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  if (!response.ok) throw new Error('SERVICE_PATCH_' + table + '_HTTP_' + response.status + ':' + body.slice(0, 800));
}

async function switchDefaultTenant(userId, tenantId) {
  await servicePatch('company_memberships', { user_id: userId, is_active: 'true' }, { is_default: false });
  await servicePatch('company_memberships', { user_id: userId, company_id: tenantId, is_active: 'true' }, { is_default: true });
  const current = await rpcCurrentCompany(accessToken);
  if (String(current) !== String(tenantId)) {
    throw new Error('REAL_48_TENANT_SWITCH_FAILED:' + tenantId + '!=' + current);
  }
}

async function buildSelectionDiagnostics(actorCompanyId) {
  if (!serviceRoleKey) return { serviceRole: 'NOT_AVAILABLE' };
  const [targetJobs, targetPassports, targetFiles, actorJobs, actorPassports, actorFiles] = await Promise.all([
    serviceRestSelect('report_execution_jobs', { id: targetJobId }, 'id,company_id,status,source_path,source_hash,completed_at', { limit: 2 }),
    serviceRestSelect('report_evidence_passports', { report_execution_job_id: targetJobId }, 'id,company_id,report_execution_job_id,evidence_snapshot_id,source_hash,verification_status,decision_readiness', { order: 'created_at.desc', limit: 10 }),
    (async () => {
      const jobs = await serviceRestSelect('report_execution_jobs', { id: targetJobId }, 'source_hash', { limit: 2 });
      const sourceHash = String(jobs[0]?.source_hash || '');
      return sourceHash ? serviceRestSelect('file_records', { file_hash: sourceHash }, 'id,company_id,file_name,file_hash,metadata', { limit: 20 }) : [];
    })(),
    serviceRestSelect('report_execution_jobs', { company_id: actorCompanyId, status: 'completed' }, 'id,company_id,status,source_path,source_hash,completed_at', { limit: 1000 }),
    serviceRestSelect('report_evidence_passports', { company_id: actorCompanyId, verification_status: 'VERIFIED', decision_readiness: 'READY' }, 'id,company_id,report_execution_job_id,evidence_snapshot_id,source_hash', { limit: 500 }),
    serviceRestSelect('file_records', { company_id: actorCompanyId, 'metadata->>report_corpus': 'true' }, 'id,company_id,file_name,file_hash,metadata', { limit: 100 }),
  ]);
  const target = targetJobs[0] || null;
  const targetFileClassification = targetFiles.map(record => {
    const metadata = record?.metadata && typeof record.metadata === 'object' ? record.metadata : {};
    return {
      id: record.id, companyId: record.company_id, fileName: record.file_name,
      reportCorpus: metadata.report_corpus === true || String(metadata.report_corpus ?? '').toLowerCase() === 'true',
      fixtureType: metadata.fixture_type ?? null, catalogId: metadata.catalog_id ?? null,
    };
  });
  return {
    serviceRole: 'AVAILABLE',
    actorCompanyId: actorCompanyId || null,
    actorCompletedJobs: actorJobs.length,
    actorReadyPassports: actorPassports.length,
    actorGovernedCorpusFiles: actorFiles.length,
    targetJobId,
    targetJob: target ? { id: target.id, companyId: target.company_id, status: target.status, sourcePath: target.source_path, sourceHashPresent: Boolean(target.source_hash) } : null,
    targetVisibleToActorTenant: Boolean(target && actorCompanyId && String(target.company_id) === String(actorCompanyId)),
    targetPassportCount: targetPassports.length,
    targetReadyPassportCount: targetPassports.filter(row => row.verification_status === 'VERIFIED' && row.decision_readiness === 'READY').length,
    targetFileRecords: targetFileClassification,
  };
}

async function signIn() {
  const auth = await fetchJson(supabaseURL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!auth?.access_token) throw new Error('REAL_48_SOURCE_MATRIX_ACCESS_TOKEN_MISSING');
  return String(auth.access_token);
}

const accessToken = await signIn();
const actorUserId = await authenticatedUserId(accessToken);
const actorCompanyId = await rpcCurrentCompany(accessToken);
const configuredTenantIds = [...new Set(
  String(process.env.E2E_CORPUS_TENANT_IDS || actorCompanyId || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
)];
if (!configuredTenantIds.length) throw new Error('REAL_48_CORPUS_TENANT_IDS_MISSING');
const selectionDiagnostics = await buildSelectionDiagnostics(actorCompanyId);

async function restSelect(table, filters, select, options = {}) {
  const url = new URL(supabaseURL + '/rest/v1/' + table);
  url.searchParams.set('select', select);
  for (const [column, value] of Object.entries(filters)) {
    url.searchParams.set(column, 'eq.' + value);
  }
  if (options.order) url.searchParams.set('order', options.order);
  if (options.limit) url.searchParams.set('limit', String(options.limit));
  const response = await fetch(url, {
    headers: { apikey: anonKey, Authorization: 'Bearer ' + accessToken },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(table + '_HTTP_' + response.status + ':' + body.slice(0, 1200));
  return body ? JSON.parse(body) : [];
}

function usableColumns(analysis) {
  const datasets = Array.isArray(analysis?.datasets) ? analysis.datasets : [];
  const columns = datasets.flatMap((dataset) => Array.isArray(dataset?.columns) ? dataset.columns : []);
  return [...new Set(columns.flatMap((column) => [column?.mappedField, column?.name]).filter(Boolean))];
}

function canonicalFieldSet(fields) {
  const legacyAliases = new Map([
    ['sku', 'productCode'],
    ['itemcode', 'productCode'],
    ['item_code', 'productCode'],
    ['balance', 'currentStock'],
    ['stock', 'currentStock'],
    ['onhand', 'currentStock'],
    ['on_hand', 'currentStock'],
    ['net_sales', 'salesQty'],
    ['netsales', 'salesQty'],
    ['sales_qty', 'salesQty'],
  ]);
  return new Set(fields.flatMap((field) => {
    const value = String(field);
    const semantic = matchCanonicalField(value);
    const normalized = value.trim().toLowerCase().normalize('NFKC').replace(/[\s_\-./]+/g, '');
    const legacy = legacyAliases.get(normalized);
    return [...new Set([semantic, legacy, value].filter(Boolean))];
  }));
}

function requiredFieldsPresent(profile, fields) {
  const canonical = canonicalFieldSet(fields);
  return profile.requiredFields.every((required) => canonical.has(required));
}

async function selectBestAnalysis(companyId, sourceHash, renderedImportId, rowCountHint, expectedAnalysisId = '') {
  const rows = await serviceRestSelect(
    'source_analysis_snapshots',
    { company_id: companyId, source_hash: sourceHash },
    'id,import_job_id,row_count,datasets,created_at',
    { order: 'created_at.desc', limit: 50 },
  );
  const exact = expectedAnalysisId
    ? rows.find((row) => String(row.id ?? '') === expectedAnalysisId)
    : null;
  if (exact) return exact;
  return rows
    .filter((row) => !renderedImportId || String(row.import_job_id ?? '') === renderedImportId)
    .sort((a, b) => {
      const aColumns = usableColumns(a).length;
      const bColumns = usableColumns(b).length;
      if (bColumns !== aColumns) return bColumns - aColumns;
      if (rowCountHint > 0) {
        return Math.abs(Number(a.row_count ?? 0) - rowCountHint)
          - Math.abs(Number(b.row_count ?? 0) - rowCountHint);
      }
      return String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''));
    })[0] ?? null;
}

async function fetchVerifiedSnapshot(companyId, jobId, sourceHash, passport) {
  if (!passport?.evidence_snapshot_id) return null;
  const rows = await serviceRestSelect(
    'report_evidence_snapshots',
    {
      company_id: companyId,
      id: passport.evidence_snapshot_id,
      report_execution_job_id: jobId,
      source_hash: sourceHash,
    },
    'id,company_id,report_execution_job_id,source_version_id,analysis_snapshot_id,source_hash,canonical_coverage_status,acceptance_status,verification_status',
    { limit: 2 },
  );
  return rows.find((row) =>
    String(row.company_id) === String(companyId) &&
    String(row.report_execution_job_id) === String(jobId) &&
    String(row.source_hash) === String(sourceHash) &&
    String(row.verification_status) === 'VERIFIED' &&
    String(row.canonical_coverage_status) === 'FULL'
  ) ?? null;
}

const profiles = listReportArchetypes();
const evidenceSelect = serviceRestSelect;
const sourceRecords = [];
const sourceRowsCache = new Map();

for (const companyId of configuredTenantIds) {
  const passports = (await evidenceSelect(
    'report_evidence_passports',
    { verification_status: 'VERIFIED', decision_readiness: 'READY' },
    'id,company_id,report_execution_job_id,evidence_snapshot_id,source_hash',
    { limit: 5000 },
  )).filter((row) => String(row.company_id) === String(companyId));
  const verifiedJobIds = new Set(passports.map((row) => String(row.report_execution_job_id)));

  const jobs = (await evidenceSelect(
    'report_execution_jobs',
    { status: 'completed' },
    'id,company_id,source_path,source_hash,evidence,completed_at',
    { order: 'completed_at.desc', limit: 5000 },
  )).filter((row) => String(row.company_id) === String(companyId));

  for (const passport of passports) {
    const job = jobs.find((item) => String(item.id) === String(passport.report_execution_job_id));
    if (!job || !verifiedJobIds.has(String(job.id))) continue;

    const rendered = job.evidence?.renderedOutput && typeof job.evidence.renderedOutput === 'object'
      ? job.evidence.renderedOutput
      : {};
    const sourceHash = String(job.source_hash ?? passport.source_hash ?? '');
    if (!sourceHash) continue;

    // Real-source proof must never select the synthetic 48-archetype fixture corpus.
    // The governed file record is the authoritative classification boundary here.
    const fileRecords = (await evidenceSelect(
      'file_records',
      {},
      'id,company_id,file_name,file_hash,metadata',
      { limit: 5000 },
    )).filter((record) =>
      String(record.company_id) === String(companyId) &&
      String(record.file_hash ?? '') === sourceHash
    );
    const governedRealSource = fileRecords.find((record) => {
      const metadata = record?.metadata && typeof record.metadata === 'object' ? record.metadata : {};
      const reportCorpus = metadata.report_corpus === true || String(metadata.report_corpus ?? '').toLowerCase() === 'true';
      const fixtureType = String(metadata.fixture_type ?? '').trim().toLowerCase();
      const catalogId = String(metadata.catalog_id ?? '').trim().toLowerCase();
      return reportCorpus
        && fixtureType !== 'synthetic-realistic'
        && catalogId !== 'report-intelligence.48';
    });
    if (!governedRealSource) continue;

    const renderedImportId = typeof rendered.importId === 'string' ? rendered.importId.trim() : '';
    const rowCountHint = Number(rendered.rowCount ?? 0);
    const snapshot = await fetchVerifiedSnapshot(companyId, String(job.id), sourceHash, passport);
    if (!snapshot) continue;
    const analysis = await selectBestAnalysis(
      companyId,
      sourceHash,
      renderedImportId,
      rowCountHint,
      snapshot.analysis_snapshot_id == null ? '' : String(snapshot.analysis_snapshot_id),
    );
    if (!analysis?.import_job_id) continue;

    const analysisFields = usableColumns(analysis);
    const canonicalPreview = await evidenceSelect(
      'canonical_dataset_records',
      {
        company_id: companyId,
        source_hash: sourceHash,
        import_job_id: String(analysis.import_job_id),
      },
      'data',
      { limit: 25 },
    );
    const rowFields = [...new Set(canonicalPreview.flatMap((row) =>
      row?.data && typeof row.data === 'object' ? Object.keys(row.data) : []
    ))];
    const fields = [...new Set([...analysisFields, ...rowFields])];
    sourceRecords.push({
      companyId,
      job,
      passport,
      snapshot,
      analysis,
      fields,
      fieldSet: canonicalFieldSet(fields),
      sampleSize: Number(analysis.row_count ?? 0),
      sourceRecord: governedRealSource,
    });
  }
}

for (const source of sourceRecords) {
  sourceRowsCache.set(String(source.job.id), null);
}

async function sourceRowsFor(source) {
  const key = String(source.job.id);
  if (sourceRowsCache.get(key)) return sourceRowsCache.get(key);
  const rows = await evidenceSelect(
    'canonical_dataset_records',
    {
      company_id: source.companyId,
      source_hash: String(source.job.source_hash),
      import_job_id: String(source.analysis.import_job_id),
    },
    'row_number,data',
    { order: 'row_number.asc', limit: 5000 },
  );
  const normalized = rows.map((row) => ({ row_number: Number(row.row_number ?? 0), data: row.data ?? {} }));
  sourceRowsCache.set(key, normalized);
  return normalized;
}

const results = [];

for (const profile of profiles) {
  const candidates = sourceRecords
    .filter((source) => source.sampleSize >= profile.minimumSample && requiredFieldsPresent(profile, source.fields))
    .sort((a, b) => {
      const aExact = typeof a.job?.evidence?.renderedOutput?.archetypeId === 'string'
        && a.job.evidence.renderedOutput.archetypeId === profile.id;
      const bExact = typeof b.job?.evidence?.renderedOutput?.archetypeId === 'string'
        && b.job.evidence.renderedOutput.archetypeId === profile.id;
      if (aExact !== bExact) return aExact ? -1 : 1;
      return b.sampleSize - a.sampleSize;
    });

  const candidateDiagnostics = [];
  let chosen = null;
  let runtime = null;
  for (const candidate of candidates) {
    const rows = await sourceRowsFor(candidate);
    if (rows.length < profile.minimumSample) {
      candidateDiagnostics.push({
        reportJobId: candidate.job.id,
        sourcePath: candidate.job.source_path,
        reasons: ['CANONICAL_SAMPLE_BELOW_MINIMUM:' + rows.length + '<' + profile.minimumSample],
      });
      continue;
    }
    const result = runReportArchetype({
      archetypeId: profile.id,
      report: {
        specialty: profile.adapterSpecialty,
        rowCount: Number(candidate.analysis.row_count ?? rows.length),
        canonicalRows: rows,
        sourceAnalysis: { datasets: candidate.analysis.datasets ?? [] },
      },
      availableFields: candidate.fields,
      sampleSize: rows.length,
      provenance: {
        tenantId: candidate.companyId,
        sourceHash: candidate.job.source_hash,
        reportExecutionJobId: candidate.job.id,
        evidenceSnapshotId: candidate.snapshot.id,
        evidencePassportId: candidate.passport.id,
        sourceVersionId: candidate.snapshot.source_version_id ?? null,
      },
      profileVersion: profile.version,
    });

    const candidateRendered =
      candidate.job?.evidence?.renderedOutput && typeof candidate.job.evidence.renderedOutput === 'object'
        ? candidate.job.evidence.renderedOutput
        : {};
    const persistedArchetypeId =
      typeof candidateRendered.archetypeId === 'string' ? candidateRendered.archetypeId.trim() : null;
    const persistedArchetypeConsistency =
      !persistedArchetypeId || persistedArchetypeId === profile.id;

    const claimProvenanceValid = result.advisory.claims.every((claim) =>
      claim.archetypeId === profile.id &&
      claim.tenantId === candidate.companyId &&
      claim.sourceHash === candidate.job.source_hash &&
      claim.reportExecutionJobId === candidate.job.id &&
      claim.evidenceSnapshotId === candidate.snapshot.id
    );

    const reasons = [];
    if (result.state !== 'SUPPORTED') reasons.push('STATE:' + String(result.state ?? 'UNKNOWN'));
    if (result.advisory.proofState !== 'VERIFIED') reasons.push('ADVISORY_PROOF:' + String(result.advisory.proofState ?? 'UNKNOWN'));
    if (result.advisory.questions.length === 0) reasons.push('NO_ADVISORY_QUESTIONS');
    if (result.advisory.claims.length === 0) reasons.push('NO_ADVISORY_CLAIMS');
    if (!persistedArchetypeConsistency) reasons.push('PERSISTED_ARCHETYPE_CONFLICT:' + persistedArchetypeId);
    if (result.advisory.claims.length > 0 && !claimProvenanceValid) reasons.push('CLAIM_PROVENANCE_MISMATCH');
    if (!result.intelligence.signals.some((signal) => signal.id === 'model:' + profile.id)) reasons.push('MODEL_SIGNAL_MISSING');
    if (!result.intelligence.recommendations.some((recommendation) => recommendation.id === 'rec:archetype:' + profile.id)) reasons.push('ARCHETYPE_RECOMMENDATION_MISSING');

    candidateDiagnostics.push({
      reportJobId: candidate.job.id,
      sourcePath: candidate.job.source_path,
      sampleSize: rows.length,
      reasons,
    });

    if (reasons.length === 0) {
      chosen = candidate;
      runtime = result;
      break;
    }
  }

  const missingRequiredFields = candidates.length === 0
    ? sourceRecords
      .slice()
      .sort((a, b) => b.sampleSize - a.sampleSize)
      .slice(0, 5)
      .map((source) => ({
        reportJobId: source.job.id,
        sourcePath: source.job.source_path,
        sampleSize: source.sampleSize,
        missingFields: profile.requiredFields.filter((field) => !source.fieldSet.has(field)),
      }))
    : [];

  results.push({
    number: profile.number,
    archetypeId: profile.id,
    title: profile.title,
    status: chosen ? 'SUPPORTED_REAL_SOURCE' : 'NOT_PROVEN_REAL_SOURCE',
    sourcePath: chosen?.job?.source_path ?? null,
    sourceHash: chosen?.job?.source_hash ?? null,
    reportJobId: chosen?.job?.id ?? null,
    tenantId: chosen?.companyId ?? null,
    evidenceSnapshotId: chosen?.snapshot?.id ?? null,
    evidencePassportId: chosen?.passport?.id ?? null,
    sourceRowCount: chosen?.sampleSize ?? null,
    canonicalRowsRead: chosen ? sourceRowsCache.get(String(chosen.job.id))?.length ?? 0 : 0,
    governedSource: chosen ? {
      fileRecordId: chosen.sourceRecord?.id ?? null,
      fileName: chosen.sourceRecord?.file_name ?? null,
      sourcePath: chosen.sourceRecord?.metadata?.source_path ?? null,
      fixtureType: chosen.sourceRecord?.metadata?.fixture_type ?? null,
      catalogId: chosen.sourceRecord?.metadata?.catalog_id ?? null,
    } : null,
    runtimeState: runtime?.state ?? null,
    advisoryProofState: runtime?.advisory.proofState ?? null,
    recommendationCount: runtime?.intelligence.recommendations.length ?? 0,
    claimCount: runtime?.advisory.claims.length ?? 0,
    candidateCount: candidates.length,
    notProvenReason: chosen
      ? null
      : candidates.length === 0
        ? 'NO_ELIGIBLE_REAL_SOURCE'
        : (candidateDiagnostics.flatMap((candidate) => candidate.reasons).find(Boolean) ?? 'RUNTIME_OR_PROVENANCE_GATE'),
    candidateDiagnostics: candidateDiagnostics.slice(0, 8),
    missingRequiredFields,
    persistedArchetypeId: chosen?.job?.evidence?.renderedOutput?.archetypeId ?? null,
    persistedArchetypeConsistency: chosen
      ? (typeof chosen.job?.evidence?.renderedOutput?.archetypeId !== 'string'
        || chosen.job.evidence.renderedOutput.archetypeId === profile.id)
      : null,
  });
}

const supported = results.filter((row) => row.status === 'SUPPORTED_REAL_SOURCE').length;
const missing = results.filter((row) => row.status === 'NOT_PROVEN_REAL_SOURCE').length;
const proof = {
  exactHead,
  diagnostics: selectionDiagnostics,
  generatedAt: new Date().toISOString(),
  status: supported === profiles.length ? 'PASS' : 'NOT_PROVEN',
  sourceJobsScanned: sourceRecords.length,
  archetypes: results,
  summary: {
    totalArchetypes: profiles.length,
    supported,
    notProven: missing,
  },
};

await (await import('node:fs/promises')).mkdir(outFile.slice(0, outFile.lastIndexOf('/')) || '.', { recursive: true });
await (await import('node:fs/promises')).writeFile(outFile, JSON.stringify(proof, null, 2) + '\n', 'utf8');

if (proof.status !== 'PASS') {
  console.error(JSON.stringify({ summary: proof.summary, sourceJobsScanned: proof.sourceJobsScanned, diagnostics: proof.diagnostics }));
  process.exit(2);
}
console.log(JSON.stringify(proof.summary));
