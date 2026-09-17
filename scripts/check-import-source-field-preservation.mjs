import fs from 'node:fs';

const commit = fs.readFileSync('src/lib/import/canonical-commit.ts', 'utf8');
const adapter = fs.readFileSync('src/lib/import/canonical-production-adapter.ts', 'utf8');
const page = fs.readFileSync('src/pages/CanonicalImportPage.tsx', 'utf8');

const requiredCommitMarkers = [
  'export async function commitImportBatch',
  'row.data',
  'row.provenance.sourceHash',
  'normalizeSourceHash',
  "p_source_hash: normalizedSourceHash",
  "p_null_policy: 'preserve'",
  "supabase.rpc('import_commit_batch'",
];
for (const marker of requiredCommitMarkers) {
  if (!commit.includes(marker)) throw new Error(`IMPORT_SOURCE_PRESERVATION_MISSING:${marker}`);
}

const requiredAdapterMarkers = [
  'runCanonicalProductionImport',
  'reconcileForCanonical',
  'sourceHash',
  'rowVersions',
  'sourceCandidates',
  'commitImportBatch(input.entityType, input.rows, sourceHash)',
  'import_finish_job',
];
for (const marker of requiredAdapterMarkers) {
  if (!adapter.includes(marker)) throw new Error(`IMPORT_SOURCE_PIPELINE_MISSING:${marker}`);
}

const requiredPageMarkers = [
  'computeSHA256',
  'checkDuplicate',
  'reconcileForCanonical',
  'runCanonicalProductionImport',
];
for (const marker of requiredPageMarkers) {
  if (!page.includes(marker)) throw new Error(`IMPORT_SOURCE_UI_BOUNDARY_MISSING:${marker}`);
}

if (/import_job_rows|import_commit_batch_with_lineage|20260908150000_import_source_lineage\.sql/.test(commit + adapter + page)) {
  throw new Error('IMPORT_SOURCE_PRESERVATION_STALE_CONTRACT_DETECTED');
}

console.log('IMPORT SOURCE FIELD PRESERVATION CONTRACT: PASS (current canonical source hash/data/provenance path; no raw-file retention claim).');
