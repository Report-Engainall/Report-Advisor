-- Source identity is the actual SHA-256 of the uploaded bytes. Keep one authoritative file record per tenant/source hash.
create unique index if not exists file_records_company_file_hash_uq
  on public.file_records(company_id, file_hash)
  where file_hash is not null;
