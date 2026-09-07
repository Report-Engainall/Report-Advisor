# Provenance Index Repair — 2026-09-07

Staging Performance Advisor found the tenant-bound composite foreign keys on `canonical_text_provenance` lacked index coverage. The live repair added partial indexes for `(company_id, file_id)` and `(company_id, folder_id)` where the reference is non-null. The repair is carried into a dedicated repository migration and contract gate so schema replay preserves the performance fix.
