import fs from 'node:fs';

const root = process.cwd();
const commitPath = `${root}/src/lib/import/canonical-commit.ts`;
const migrationPath = `${root}/supabase/migrations/20260908150000_import_source_lineage.sql`;

const commit = fs.readFileSync(commitPath, 'utf8');
const migration = fs.readFileSync(migrationPath, 'utf8');

const requiredCommitMarkers = [
  "import_commit_batch_with_lineage",
  "source_data: row.data",
  "lineage: row.provenance",
  "sameSourceDocument",
];
for (const marker of requiredCommitMarkers) {
  if (!commit.includes(marker)) throw new Error(`IMPORT_SOURCE_PRESERVATION_MISSING:${marker}`);
}

const requiredMigrationMarkers = [
  "CREATE OR REPLACE FUNCTION public.import_commit_batch_with_lineage",
  "INSERT INTO public.import_job_rows",
  "source_data",
  "GRANT EXECUTE ON FUNCTION public.import_commit_batch_with_lineage",
  "REVOKE EXECUTE ON FUNCTION public.import_commit_batch_with_lineage",
  "SECURITY INVOKER",
];
for (const marker of requiredMigrationMarkers) {
  if (!migration.includes(marker)) throw new Error(`IMPORT_SOURCE_LINEAGE_MIGRATION_MISSING:${marker}`);
}

console.log('IMPORT SOURCE FIELD PRESERVATION CONTRACT: PASS');
