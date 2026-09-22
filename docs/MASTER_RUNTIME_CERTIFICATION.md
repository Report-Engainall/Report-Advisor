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
