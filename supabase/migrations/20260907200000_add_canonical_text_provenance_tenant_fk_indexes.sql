-- Keep composite tenant-bound provenance FKs index-covered.
-- Forward-only parity with the verified Staging repair; no data rewrite.

create index if not exists canonical_text_provenance_company_file_idx
  on public.canonical_text_provenance (company_id, file_id)
  where file_id is not null;

create index if not exists canonical_text_provenance_company_folder_idx
  on public.canonical_text_provenance (company_id, folder_id)
  where folder_id is not null;
