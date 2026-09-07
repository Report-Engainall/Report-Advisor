-- Harden canonical text provenance so optional folder/file references cannot cross tenant boundaries.
-- The provenance row is tenant-bound by company_id; its nullable folder_id/file_id
-- must be bound to the same company rather than merely referencing a globally known UUID.

ALTER TABLE public.watched_report_files
  ADD CONSTRAINT watched_report_files_company_id_id_key UNIQUE (company_id, id);

ALTER TABLE public.canonical_text_provenance
  DROP CONSTRAINT IF EXISTS canonical_text_provenance_folder_id_fkey,
  DROP CONSTRAINT IF EXISTS canonical_text_provenance_file_id_fkey;

ALTER TABLE public.canonical_text_provenance
  ADD CONSTRAINT canonical_text_provenance_folder_company_fkey
    FOREIGN KEY (company_id, folder_id)
    REFERENCES public.watched_report_folders(company_id, id)
    ON DELETE SET NULL,
  ADD CONSTRAINT canonical_text_provenance_file_company_fkey
    FOREIGN KEY (company_id, file_id)
    REFERENCES public.watched_report_files(company_id, id)
    ON DELETE SET NULL;
