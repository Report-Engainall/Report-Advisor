# Report Advisor — Master Execution & Truth Index

## CURRENT EXECUTION TRUTH — 2026-09-01

This index is authoritative for execution state. Historical PASS is never promoted across SHAs. Certification requires exact-head evidence.

### Current candidate
- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- Base: `main` @ `89c8361e85878521c915328f6d0a595663498cd3`
- Current execution head: `81ea581ea0757b29fa387aa9c8e7ec0eed466ffe`
- Current branch: `codex/p0-hardening-integration-20260901`
- Exact-head CI is required after the latest intelligence-foundation contract repair; no final PASS is claimed yet.

### Latest executed repair
- Final Certification Gate on `cc667605cd8c21f3ab43a5a8bde935313070c320` completed exact checkout successfully.
- The 20-stage release-readiness matrix passed **20/20** and the final execution batch passed **30/30** before `check-intelligence-foundation.mjs` failed.
- Failure was a real API/checker drift: the checker imported `calculateGroupDemand`, but the canonical `groupDemand.ts` exports `aggregateAlternativeGroup` / `aggregateAlternativeGroups` instead.
- Confirmed by repository search that `calculateGroupDemand` has no remaining canonical implementation.
- Repaired the checker to exercise the canonical `aggregateAlternativeGroup` API, including duplicate-SKU normalization, demand/stock/sales truth, critical risk, and recommended-order assertions.
- New exact head: `81ea581ea0757b29fa387aa9c8e7ec0eed466ffe`.
- No PASS is promoted from the prior SHA; a fresh Exact-head CI run is mandatory.

## VERIFIED EXACT-HEAD RESULTS BEFORE LATEST REPAIR
- 20-stage release readiness: **20/20 PASS**.
- Final execution batch: **30/30 PASS** before intelligence-foundation failure.
- Integration boundaries: PASS after adversarial self-test repair.
- Governance runtime chain: PASS against canonical migrations.
- A0 hardening, Auth/Tenant convergence, authenticated E2E contract matrices, autonomy safety, batch decision, bounded concurrency: PASS.
- Import security/transaction/runtime, canonical mapping, tenant context: PASS.
- Certification evidence writer/lock/RPC exposure: PASS.
- CI execution topology, company context, continuous trust: PASS.
- Dashboard null/numeric truth and Data Quality canonical snapshot: PASS.
- Decision authorization/DML/work-item/outcome: PASS.
- Document Intelligence: **20/20 PASS**.
- DR source-level contracts/readiness: PASS.
- Evidence lineage/provenance/regression: PASS.
- File engine: **21 declared formats** PASS.
- Final certification immutability/manifest: PASS.
- Free-first policy: PASS across 25 dependencies.
- Global tenant RLS: PASS (22 tenant tables; 139 migrations).
- Golden dataset/evidence/intelligence/score identity: PASS.

## RECOVERY BOUNDARY REGISTER
- **P1-H — Backup / Restore / DR** remains an explicit certification boundary.
- RPO/RTO are operational evidence requirements, not source-level claims.
- Backup, restore, migration parity, artifact integrity, rollback, and security audit evidence are required before production certification.
- Source-level Phase 10 validation must never convert a missing live restore drill into PASS.

## NON-NEGOTIABLE CERTIFICATION BLOCKERS
- Production authenticated runtime.
- Real Actor A/B tenant isolation.
- Real backup + restore drill.
- Real rollback drill.
- Live Vercel deployment/runtime bound to the certified SHA.
- Real browser authenticated E2E with valid credentials.
- Live OCR/Golden Corpus execution where backend/device capability is required.
- Independent business acceptance.

## EXECUTION PROTOCOL
`OPEN INDEX → SELECT INDEPENDENT FRONTS → INSPECT MINIMUM → IMPLEMENT → TARGETED TEST → ADVERSARIAL TEST → REGRESSION → EXACT SHA → VERIFY → CONTINUE`

Do not rebuild closed work. Do not promote historical PASS. Do not mutate the frozen release candidate or production alias without certification evidence. If one operational front is blocked, continue all repository-executable fronts.

## RELEASE EQUATION
`ONE EXACT SHA + build/typecheck/lint + quality/security + canonical truth + authenticated E2E + tenant A/B + deployment/runtime + OCR/document + workers/recovery + backup/restore + rollback + performance + observability + UX + business acceptance + complete evidence = PRODUCTION CERTIFIED / SELLABLE`
