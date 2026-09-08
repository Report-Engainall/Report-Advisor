import fs from 'node:fs';

const files = {
  page: 'src/pages/CanonicalImportPage.tsx',
  commit: 'src/lib/import/canonical-commit.ts',
  migration: 'supabase/migrations/20260908150000_import_source_lineage.sql',
};

for (const path of Object.values(files)) {
  if (!fs.existsSync(path)) throw new Error(`MISSING_FILE:${path}`);
}

const page = fs.readFileSync(files.page, 'utf8');
const commit = fs.readFileSync(files.commit, 'utf8');
const migration = fs.readFileSync(files.migration, 'utf8');

const required = [
  ['page passes import job id', /commitImportBatch\(entityType, batch, \{ jobId: rec\.id \}\)/],
  ['page renders every detected source header', /\.\.\.headers\.map\(h =>/],
  ['commit retains source data', /source_data:\s*row\.data/],
  ['commit retains provenance lineage', /lineage:\s*row\.provenance/],
  ['commit uses lineage RPC', /import_commit_batch_with_lineage/],
  ['migration inserts source data', /INSERT INTO public\.import_job_rows[\s\S]*source_data/],
  ['migration inserts lineage', /INSERT INTO public\.import_job_rows[\s\S]*lineage/],
  ['migration binds target id', /target_id,[\s\S]*v_ids ->>/],
];

for (const [label, pattern] of required) {
  if (!pattern.test(label === 'page passes import job id' || label === 'page renders every detected source header' ? page : label.includes('commit') ? commit : migration)) {
    throw new Error(`IMPORT_SOURCE_FIELD_PRESERVATION_GUARD_FAILED:${label}`);
  }
}

if (/headers\.slice\(0\s*,\s*6\)/.test(page)) {
  throw new Error('IMPORT_SOURCE_FIELD_PRESERVATION_GUARD_FAILED:preview truncates source fields');
}

console.log('IMPORT_SOURCE_FIELD_PRESERVATION_GUARD_PASS');
