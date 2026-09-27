# MASTER RUNTIME / CERTIFICATION REFERENCE — الأغبري
Status: CANONICAL DOMAIN REFERENCE

## 1. Certification philosophy
Certification is evidence, not intention.

Exact SHA + exact target + exact execution + observed output are required.

## 2. Evidence classes
Static, Build, API, Browser, Business Persistence, Production, Resilience.

These classes never silently upgrade.

## 3. Release states
PASS / FAIL / BLOCKED / NOT PROVEN

Any unresolved release-critical gate stays closed.

## 4. Phase-F
Phase-F must prove live resilience:
- runtime identity
- authenticated canary
- logical source configuration
- backup
- restore
- measured RPO
- measured RTO
- rollback
- artifact integrity

Missing/invalid credentials are BLOCKED. Do not invent substitutes.

## 5. Deployment identity
A runtime gate must bind to:
- deployment ID
- exact Git SHA
- environment
- intended project
- intended backend/data target where applicable

READY is not authenticated product certification.

## 6. Browser E2E
Browser proof should cover:
- authentication
- tenant/company context
- canonical navigation
- unified import
- real persistence
- readback
- critical business action
- evidence/trust state
- no cross-tenant leakage

## 7. Regression discipline
Do not rerun closed tests unless SHA, environment, contract, or reproducible regression requires it.

When a new SHA fails, repair the first reproducible current-head failure before speculative broad edits.

## 8. Recovery discipline
Any recovery mutation requires:
- target proof
- authorization proof
- auditability
- governed recovery contract
- preservation of evidence

Do not terminalize unresolved processing jobs merely to make dashboards green.

## 9. Certification completion
Final certification is complete only when all release-critical gates are current, exact, attributable, reproducible or artifact-backed, and consistent with current code/test lineage.


## 11. Live staging migration-lineage boundary — 2026-09-27
Read-only inspection of `fnqbvfuwbdpwvhcgzksl` confirms the six-argument `import_commit_batch` grant boundary and RLS on the canonical import tables. The live `import_finish_job(uuid,text,jsonb,text)` currently resolves as SECURITY DEFINER and is executable by authenticated/service_role, while the canonical repository migration `20260830210000_harden_import_finish_lifecycle.sql` declares SECURITY INVOKER. Staging also records applied migration `20260919220623_allow_import_job_rpc_writes_via_definer`, which is not present in the current candidate tree. This is an environment/migration-lineage drift boundary, not a license for an unreviewed live mutation; caller, grant, and canonical ownership must be reconciled before any change.


## 12. Preview/deployment evidence correction — 2026-09-27
For candidate `ecfff32aa5ce1ec737663a71b1d9080ffe69e7eb`, GitHub commit status `netlify/aghbari-report-advisor/deploy-preview` reported success, but authoritative Netlify deployment record `6ab97c3d6fa5b900087ac057` is STATE=error with `Canceled build due to no content change`. The deployment URL is therefore not a proof surface. Vercel remains externally blocked by the free-plan build-rate limit.