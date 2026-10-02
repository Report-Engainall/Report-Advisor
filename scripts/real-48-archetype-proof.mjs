import fs from 'node:fs/promises';
import { listReportArchetypes, runReportArchetype, detectReportArchetype } from '../src/lib/report-intelligence/archetype-registry.ts';

const baseURL = (process.env.E2E_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const email = process.env.TEST_USER_A_EMAIL?.trim();
const password = process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
const reportDir = process.env.E2E_REPORT_DIR || 'artifacts/e2e-business';
const outFile = reportDir + '/real-48-archetype-proof.json';
for (const [name, value] of Object.entries({ supabaseURL, anonKey, email, password })) {
  if (!value) throw new Error('REAL_48_PROOF_ENV_MISSING:' + name);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { apikey: anonKey, ...(options.headers || {}) } });
  const body = await response.text();
  if (!response.ok) throw new Error('SUPABASE_HTTP_' + response.status + ':' + body.slice(0, 1200));
  return body ? JSON.parse(body) : null;
}

const auth = await fetchJson(supabaseURL + '/auth/v1/token?grant_type=password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const accessToken = auth?.access_token;
if (!accessToken) throw new Error('REAL_48_PROOF_ACCESS_TOKEN_MISSING');

async function restSelect(table, filters, select, options = {}) {
  const url = new URL(supabaseURL + '/rest/v1/' + table);
  url.searchParams.set('select', select);
  for (const [column, value] of Object.entries(filters)) url.searchParams.set(column, 'eq.' + value);
  if (options.order) url.searchParams.set('order', options.order);
  if (options.limit) url.searchParams.set('limit', String(options.limit));
  const response = await fetch(url, {
    headers: {
      apikey: anonKey,
      Authorization: 'Bearer ' + accessToken,
    },
  });
  const body = await response.text();
  if (!response.ok) throw new Error(table + '_HTTP_' + response.status + ':' + body.slice(0, 1200));
  return body ? JSON.parse(body) : [];
}

const companies = await restSelect('report_execution_jobs', { status: 'completed' }, 'company_id', { limit: 1000 });
const tenantIds = [...new Set(companies.map((row) => row.company_id).filter(Boolean))];
if (tenantIds.length === 0) throw new Error('REAL_48_PROOF_NO_COMPLETED_REPORT_JOBS');

const proof = {
  exactHead,
  generatedAt: new Date().toISOString(),
  status: 'NOT_PROVEN',
  tenantIds,
  sourceJobsScanned: 0,
  archetypes: [],
};

const allProfiles = listReportArchetypes();
const byId = new Map(allProfiles.map((profile) => [profile.id, profile]));
const candidateJobs = [];

for (const companyId of tenantIds) {
  const jobs = await restSelect(
    'report_execution_jobs',
    { company_id: companyId, status: 'completed' },
    'id,company_id,source_path,source_hash,evidence,completed_at',
    { order: 'completed_at.desc', limit: 500 },
  );
  proof.sourceJobsScanned += jobs.length;

  const hashes = [...new Set(jobs.map((job) => String(job.source_hash ?? '')).filter(Boolean))];
  const analysesByHash = new Map();
  for (let i = 0; i < hashes.length; i += 100) {
    const batch = hashes.slice(i, i + 100);
    if (!batch.length) continue;
    const url = new URL(supabaseURL + '/rest/v1/source_analysis_snapshots');
    url.searchParams.set('select', 'source_hash,row_count,datasets,created_at');
    url.searchParams.set('company_id', 'eq.' + companyId);
    url.searchParams.set('source_hash', 'in.(' + batch.map((hash) => '"' + hash.replaceAll('"', '') + '"').join(',') + ')');
    url.searchParams.set('order', 'created_at.desc');
    const response = await fetch(url, { headers: { apikey: anonKey, Authorization: 'Bearer ' + accessToken } });
    const body = await response.text();
    if (!response.ok) throw new Error('source_analysis_snapshots_HTTP_' + response.status + ':' + body.slice(0, 1200));
    const analyses = body ? JSON.parse(body) : [];
    for (const analysis of analyses) {
      const hash = String(analysis.source_hash ?? '');
      if (hash && !analysesByHash.has(hash)) analysesByHash.set(hash, analysis);
    }
  }

  for (const job of jobs) {
    const rendered = job?.evidence?.renderedOutput;
    if (!rendered || typeof rendered !== 'object') continue;
    const analysis = analysesByHash.get(String(job.source_hash ?? '')) ?? null;
    const dataset = analysis?.datasets?.[0];
    const columns = Array.isArray(dataset?.columns) ? dataset.columns : [];
    const availableFields = [...new Set(columns.map((column) => column?.mappedField).filter(Boolean))];
    const detected = detectReportArchetype({
      sourcePath: String(job.source_path ?? ''),
      specialty: typeof rendered.sourceSpecialty === 'string' ? rendered.sourceSpecialty : null,
      availableFields,
    });
    const archetypeId = typeof rendered.archetypeId === 'string' && byId.has(rendered.archetypeId)
      ? rendered.archetypeId
      : detected.profile?.id ?? null;
    if (!archetypeId || !byId.has(archetypeId)) continue;
    candidateJobs.push({ job, rendered, archetypeId });
  }
}

for (const profile of allProfiles) {
  const candidate = candidateJobs.find((item) => item.archetypeId === profile.id);
  if (!candidate) {
    proof.archetypes.push({
      number: profile.number,
      archetypeId: profile.id,
      title: profile.title,
      status: 'NOT_PROVEN_REAL_SOURCE',
      reason: 'NO_COMPLETED_REAL_REPORT_WITH_EXACT_ARCHETYPE_ID',
    });
    continue;
  }

  const { job, rendered } = candidate;
  const analysisRows = await restSelect(
    'source_analysis_snapshots',
    { company_id: job.company_id, source_hash: job.source_hash },
    'id,import_job_id,row_count,datasets,created_at',
    { order: 'created_at.desc', limit: 1 },
  );
  const analysis = analysisRows[0] ?? null;
  const dataset = analysis?.datasets?.[0];
  const columns = Array.isArray(dataset?.columns) ? dataset.columns : [];
  const availableFields = [...new Set(columns.map((column) => column?.mappedField).filter(Boolean))];
  const sourceRows = await restSelect(
    'canonical_dataset_records',
    { company_id: job.company_id, source_hash: job.source_hash, import_job_id: analysis?.import_job_id ?? '' },
    'id,company_id,import_job_id,source_hash,row_number,data,provenance',
    { order: 'row_number.asc', limit: 5000 },
  );
  const passportRows = await restSelect(
    'report_evidence_passports',
    { company_id: job.company_id, report_execution_job_id: job.id, source_hash: job.source_hash },
    'id,company_id,report_execution_job_id,evidence_snapshot_id,source_hash,verification_status,decision_readiness,acceptance_status',
    { order: 'updated_at.desc', limit: 5 },
  );
  const passport = passportRows.find((row) =>
    String(row.company_id) === String(job.company_id) &&
    String(row.report_execution_job_id) === String(job.id) &&
    String(row.source_hash) === String(job.source_hash) &&
    String(row.verification_status) === 'VERIFIED' &&
    String(row.decision_readiness) === 'READY'
  ) ?? null;
  const renderedSnapshotId = typeof rendered.evidenceSnapshotId === 'string' ? rendered.evidenceSnapshotId : null;
  const renderedPassportId = typeof rendered.evidencePassportId === 'string' ? rendered.evidencePassportId : null;
  const evidenceSnapshotId = passport ? String(passport.evidence_snapshot_id ?? '') || renderedSnapshotId : null;
  const evidencePassportId = passport ? String(passport.id) : null;
  let snapshot = null;
  if (passport && evidenceSnapshotId) {
    const snapshotRows = await restSelect(
      'report_evidence_snapshots',
      { company_id: job.company_id, id: evidenceSnapshotId, report_execution_job_id: job.id, source_hash: job.source_hash },
      'id,company_id,report_execution_job_id,source_version_id,analysis_snapshot_id,source_hash,canonical_coverage_status,acceptance_status,verification_status',
      { limit: 2 },
    );
    snapshot = snapshotRows.find((row) =>
      String(row.company_id) === String(job.company_id) &&
      String(row.report_execution_job_id) === String(job.id) &&
      String(row.source_hash) === String(job.source_hash) &&
      String(row.verification_status) === 'VERIFIED' &&
      String(row.canonical_coverage_status) === 'FULL'
    ) ?? null;
  }
  if (!passport || !evidenceSnapshotId || !snapshot) {
    proof.archetypes.push({
      number: profile.number,
      archetypeId: profile.id,
      title: profile.title,
      status: 'REVIEW_REQUIRED',
      sourcePath: job.source_path ?? null,
      sourceHash: job.source_hash,
      reportJobId: job.id,
      tenantId: job.company_id,
      evidenceSnapshotId: renderedSnapshotId,
      evidencePassportId: renderedPassportId,
      reason: 'REAL_SOURCE_EVIDENCE_SNAPSHOT_NOT_VERIFIED_FULL_FOR_EXACT_JOB_HASH',
    });
    continue;
  }
  if (renderedSnapshotId && renderedSnapshotId !== evidenceSnapshotId) throw new Error('REAL_48_RENDERED_SNAPSHOT_MISMATCH:' + profile.id);
  if (renderedPassportId && renderedPassportId !== evidencePassportId) throw new Error('REAL_48_RENDERED_PASSPORT_MISMATCH:' + profile.id);

  const result = runReportArchetype({
    archetypeId: profile.id,
    report: {
      specialty: profile.adapterSpecialty,
      rowCount: Number(job?.evidence?.renderedOutput?.rowCount ?? analysis?.row_count ?? sourceRows.length),
      canonicalRows: sourceRows.map((row) => ({ row_number: row.row_number, data: row.data })),
      sourceAnalysis: { datasets: analysis?.datasets ?? [] },
    },
    availableFields: availableFields,
    sampleSize: sourceRows.length,
    provenance: {
      tenantId: job.company_id,
      sourceHash: job.source_hash,
      reportExecutionJobId: job.id,
      evidenceSnapshotId,
      evidencePassportId,
      sourceVersionId: typeof rendered.sourceVersionId === 'string' ? rendered.sourceVersionId : null,
    },
    profileVersion: profile.version,
  });

  const validProof =
    result.profile.id === profile.id &&
    result.state === 'SUPPORTED' &&
    result.advisory.claims.length > 0 &&
    result.advisory.questions.length > 0 &&
    result.advisory.proofState === 'VERIFIED' &&
    result.advisory.claims.every((claim) => claim.archetypeId === profile.id) &&
    Boolean(evidenceSnapshotId && evidencePassportId && snapshot);

  proof.archetypes.push({
    number: profile.number,
    archetypeId: profile.id,
    title: profile.title,
    status: validProof ? 'SUPPORTED' : 'REVIEW_REQUIRED',
    sourcePath: job.source_path ?? null,
    sourceHash: job.source_hash,
    reportJobId: job.id,
    tenantId: job.company_id,
    evidenceSnapshotId,
    evidencePassportId,
    sourceRowCount: sourceRows.length,
    availableFieldCount: availableFields.length,
    advisoryQuestionCount: result.advisory.questions.length,
    advisoryClaimCount: result.advisory.claims.length,
    advisoryProofState: result.advisory.proofState,
    runtimeState: result.state,
    recommendationCount: result.intelligence.recommendations.length,
    reason: validProof ? null : 'REAL_SOURCE_RUNTIME_PROOF_INCOMPLETE',
  });
}

const supported = proof.archetypes.filter((item) => item.status === 'SUPPORTED').length;
const missing = proof.archetypes.filter((item) => item.status === 'NOT_PROVEN_REAL_SOURCE').length;
const review = proof.archetypes.filter((item) => item.status === 'REVIEW_REQUIRED').length;
proof.summary = { total: proof.archetypes.length, supported, missing, review };
proof.status = supported === 48 && missing === 0 && review === 0 ? 'PASS' : 'NOT_PROVEN';

await fs.mkdir(reportDir, { recursive: true });
await fs.writeFile(outFile, JSON.stringify(proof, null, 2));

console.log(JSON.stringify(proof, null, 2));
if (proof.status !== 'PASS') {
  console.error('REAL_48_ARCHETYPE_PROOF_NOT_COMPLETE:supported=' + supported + ':missing=' + missing + ':review=' + review);
  process.exitCode = 1;
}
