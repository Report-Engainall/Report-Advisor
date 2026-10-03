import { listReportArchetypes, runReportArchetype } from '../src/lib/report-intelligence/archetype-registry.ts';
import { matchCanonicalField } from '../src/lib/report-intelligence/canonical-schema.ts';

const supabaseURL = (process.env.REPORT_ADVISOR_SUPABASE_URL || 'https://fnqbvfuwbdpwvhcgzksl.supabase.co').replace(/\/$/, '');
const anonKey = process.env.REPORT_ADVISOR_SUPABASE_ANON_KEY?.trim();
const email = process.env.TEST_USER_A_EMAIL?.trim();
const password = process.env.TEST_USER_A_PASSWORD;
const exactHead = process.env.EXACT_HEAD || 'UNKNOWN';
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
  return new Set(fields.flatMap((field) => {
    const value = String(field);
    const semantic = matchCanonicalField(value);
    return semantic ? [semantic] : [value];
  }));
}

function requiredFieldsPresent(profile, fields) {
  const canonical = canonicalFieldSet(fields);
  return profile.requiredFields.every((required) => canonical.has(required));
}

async function selectBestAnalysis(companyId, sourceHash, renderedImportId, rowCountHint, expectedAnalysisId = '') {
  const rows = await restSelect(
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
  const rows = await restSelect(
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

const companies = await restSelect('report_execution_jobs', { status: 'completed' }, 'company_id', { limit: 1000 });
const tenantIds = [...new Set(companies.map((row) => row.company_id).filter(Boolean))];
const profiles = listReportArchetypes();
const sourceRecords = [];
const sourceRowsCache = new Map();

for (const companyId of tenantIds) {
  const passports = await restSelect(
    'report_evidence_passports',
    { company_id: companyId, verification_status: 'VERIFIED', decision_readiness: 'READY' },
    'id,company_id,report_execution_job_id,evidence_snapshot_id,source_hash',
    { limit: 500 },
  );
  const verifiedJobIds = new Set(passports.map((row) => String(row.report_execution_job_id)));

  const jobs = await restSelect(
    'report_execution_jobs',
    { company_id: companyId, status: 'completed' },
    'id,company_id,source_path,source_hash,evidence,completed_at',
    { order: 'completed_at.desc', limit: 5000 },
  );

  for (const passport of passports) {
    const job = jobs.find((item) => String(item.id) === String(passport.report_execution_job_id));
    if (!job || !verifiedJobIds.has(String(job.id))) continue;

    const rendered = job.evidence?.renderedOutput && typeof job.evidence.renderedOutput === 'object'
      ? job.evidence.renderedOutput
      : {};
    const sourceHash = String(job.source_hash ?? passport.source_hash ?? '');
    if (!sourceHash) continue;

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
    const canonicalPreview = await restSelect(
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
    });
  }
}

for (const source of sourceRecords) {
  sourceRowsCache.set(String(source.job.id), null);
}

async function sourceRowsFor(source) {
  const key = String(source.job.id);
  if (sourceRowsCache.get(key)) return sourceRowsCache.get(key);
  const rows = await restSelect(
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

  let chosen = null;
  let runtime = null;
  for (const candidate of candidates) {
    const rows = await sourceRowsFor(candidate);
    if (rows.length < profile.minimumSample) continue;
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

    const valid =
      result.state === 'SUPPORTED' &&
      result.advisory.proofState === 'VERIFIED' &&
      result.advisory.questions.length > 0 &&
      result.advisory.claims.length > 0 &&
      result.advisory.claims.every((claim) =>
        claim.archetypeId === profile.id &&
        claim.tenantId === candidate.companyId &&
        claim.sourceHash === candidate.job.source_hash &&
        claim.reportExecutionJobId === candidate.job.id &&
        claim.evidenceSnapshotId === candidate.snapshot.id
      ) &&
      result.intelligence.signals.some((signal) => signal.id === 'model:' + profile.id) &&
      result.intelligence.recommendations.some((recommendation) => recommendation.id === 'rec:archetype:' + profile.id);

    if (valid) {
      chosen = candidate;
      runtime = result;
      break;
    }
  }

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
    canonicalRowsRead: chosen && runtime ? runtime.canonicalRowsRead ?? sourceRowsCache.get(String(chosen.job.id))?.length ?? 0 : 0,
    runtimeState: runtime?.state ?? null,
    advisoryProofState: runtime?.advisory.proofState ?? null,
    recommendationCount: runtime?.intelligence.recommendations.length ?? 0,
    claimCount: runtime?.advisory.claims.length ?? 0,
  });
}

const supported = results.filter((row) => row.status === 'SUPPORTED_REAL_SOURCE').length;
const missing = results.filter((row) => row.status === 'NOT_PROVEN_REAL_SOURCE').length;
const proof = {
  exactHead,
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
  console.error(JSON.stringify(proof.summary));
  process.exit(2);
}
console.log(JSON.stringify(proof.summary));
