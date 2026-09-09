# Import Runtime Notes — 2026-09-09

## What is proven now
- A real Arabic PDF from the project corpus is available for live ingestion testing.
- The lifecycle and evidence acceptance contract is documented.
- The system must not claim ingestion PASS until extraction, normalization, DQS, commit, idempotency, rollback/resume and evidence are observed.

## What is deliberately not claimed
- No fake canonical rows were seeded.
- No unverified `record_import_evidence` RPC is assumed to exist.
- No Vercel deployment PASS is claimed while the rate-limit failure remains unresolved.
- No Tenant A/B live PASS is claimed without authenticated adversarial runtime evidence.
