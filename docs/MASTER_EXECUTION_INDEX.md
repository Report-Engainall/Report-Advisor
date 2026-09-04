# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION BOUNDARY — 2026-09-04

> Authoritative execution manifest. Because embedding this file's own commit SHA would make the SHA self-invalidating, the exact current candidate is always the Git `HEAD` of the relevant checkout/ref. Pair this manifest with `git rev-parse HEAD` for every evidence batch.

### CURRENT REPAIR CANDIDATE
- Repair branch: `repair/currency-analytics-truth-46156969`.
- Base boundary: `46156969f506d7fb6c3c75fde419c6de76f6e14d`.
- Current exact candidate before this index commit: `ba8fea36925fbac60a053b9067fbae2976444d2c`.
- PR #316: OPEN / DRAFT / NOT MERGED.
- Certification: NOT CERTIFIED.
- Historical evidence is never promoted to the subsequent exact HEAD.

### BOUNDARY / GOVERNANCE
- Main release boundary remains separate from this repair candidate until review/merge.
- Historical evidence is valid only for its recorded SHA.
- No deployment, test, DB result, or prior RC is reused across a changed exact head.
- Browser E2E uses real Chromium, real Supabase authentication when credentials exist, and browser-held access tokens; service-role and mocked sessions are prohibited.
- PASS requires correct behavior + correct data + correct security + persistence + evidence + exact HEAD.
- QUEUED/PENDING/RUNNING is never PASS.

### CERTIFICATION ANTI-FORGERY WAVE
- `scripts/certification-consumer-validation.mjs` now enforces mandatory evidence as executable semantic input rather than a string/status declaration.
- Mandatory contracts are exactly `tenant`, `backup`, `rollback`, `artifact`, `security`.
- Each contract requires `status=validated`, exact source SHA, manifest ID, certification run ID, artifact fingerprint, evidence reference, evidence SHA-256 fingerprint, proof type, and a fresh verification timestamp.
- Evidence references are constrained beneath the consumer evidence root and their actual bytes are re-hashed before acceptance.
- `scripts/check-live-production-evidence-boundary.mjs` now invokes the executable mandatory-evidence validator before emitting consumption proof.
- `scripts/certification-consumer-antiforgery.test.mjs` executes adversarial mutations for missing, empty, null, wrong-type, stale, wrong-SHA, wrong-manifest, wrong-run, wrong-artifact-fingerprint, wrong-evidence-fingerprint, unknown/duplicate contract, and tampered-artifact cases.
- Release certification workflow runs the anti-forgery suite before evidence generation.
- Structural hardening does not create runtime tenant/backup/rollback/artifact/security evidence.
- Consumer certification remains `NOT PROVEN` until fresh exact-head CI proves the suite and real mandatory runtime evidence is independently produced and consumed.

### CURRENT DISPOSITION
| Domain | Status |
|---|---|
| Certification consumer semantic validation | NOT PROVEN — fresh CI required |
| Certification anti-forgery test-of-test | NOT PROVEN — fresh CI required |
| Canonical certification path | INTERNAL GAP — canonical producer/evaluator unification remains unproven |
| Real mandatory runtime evidence | NOT PROVEN |
| Authenticated Browser E2E | NOT PROVEN / BLOCKED — EXTERNAL credentials |
| Golden binary corpus | NOT PROVEN where real artifacts are absent |
| Production runtime | BLOCKED — EXTERNAL |
| Backup / Restore | BLOCKED — EXTERNAL |
| Rollback | BLOCKED — EXTERNAL |
| Production Certification | NOT CERTIFIED |
