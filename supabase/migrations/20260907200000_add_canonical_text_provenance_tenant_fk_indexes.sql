-- Keep the composite tenant-bound provenance foreign keys index-covered.
-- This migration mirrors the live Staging repair applied after Performance Advisor
-- identified both new composite FK paths as unindexed.

create index if not exists canonical_text_provenance_company_file_idx
  on public.canonical_text_provenance (company_id, file_id)
  where file_id is not null;

create index if not exists canonical_text_provenance_company_folder_idx
  on public.canonical_text_provenance (company_id, folder_id)
  where folder_id is not null;
