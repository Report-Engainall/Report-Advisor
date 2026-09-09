# Import Live Evidence Checklist

This checklist is the operational gate for the first real Arabic PDF/Excel/CSV ingestion.

- [ ] Real source document selected and retained by the operator only for the test.
- [ ] SHA-256 calculated and recorded.
- [ ] Native text/table extraction attempted before OCR where applicable.
- [ ] Arabic OCR used only where native extraction is insufficient.
- [ ] Discovered schema and mapping recorded.
- [ ] Normalization and business-key matching recorded.
- [ ] DQS calculated from observed source quality.
- [ ] Rejection/approval behavior observed at the actual threshold.
- [ ] Commit creates canonical facts only once.
- [ ] Same SHA-256 replay is idempotent.
- [ ] Crash/resume is idempotent.
- [ ] Rollback leaves canonical facts unchanged after a forced failure.
- [ ] Source-to-row evidence exists for committed facts.
- [ ] Tenant identity comes from authenticated context, not a trusted client company_id.
- [ ] Canonical KPI is recalculated from committed facts.
- [ ] Report result matches the canonical KPI and includes period/as-of/freshness/evidence.
- [ ] Tenant A/B denial checks are run after ingestion.

**Certification rule:** unchecked items are not PASS. No synthetic business rows may be introduced merely to satisfy this checklist.
