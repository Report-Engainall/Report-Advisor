-- Forward-only correction for composite provenance foreign keys.
-- Ensure referenced tenant/id pairs are unique even when the parent tables pre-existed
-- this reconciliation migration (CREATE TABLE IF NOT EXISTS does not add inline
-- constraints to an already-existing table).
CREATE UNIQUE INDEX IF NOT EXISTS watched_report_folders_company_id_id_uq
  ON public.watched_report_folders(company_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS watched_report_files_company_id_id_uq
  ON public.watched_report_files(company_id, id);

-- Keep tenant identity immutable when a folder/file source is deleted; only the
-- nullable source identifier may be cleared.
ALTER TABLE public.canonical_text_provenance
  DROP CONSTRAINT IF EXISTS canonical_text_provenance_company_id_folder_id_fkey,
  DROP CONSTRAINT IF EXISTS canonical_text_provenance_company_id_file_id_fkey;

ALTER TABLE public.canonical_text_provenance
  ADD CONSTRAINT canonical_text_provenance_company_id_folder_id_fkey
    FOREIGN KEY (company_id, folder_id)
    REFERENCES public.watched_report_folders(company_id, id)
    ON DELETE SET NULL (folder_id),
  ADD CONSTRAINT canonical_text_provenance_company_id_file_id_fkey
    FOREIGN KEY (company_id, file_id)
    REFERENCES public.watched_report_files(company_id, id)
    ON DELETE SET NULL (file_id);
