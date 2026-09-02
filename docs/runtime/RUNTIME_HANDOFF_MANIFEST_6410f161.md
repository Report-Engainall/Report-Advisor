# Runtime Handoff Manifest — Exact SHA 6410f161

**Handoff status:** READY FOR COMPUTER / TRUE STOP FOR LOCAL-AUTOMATED EXECUTION

## 0. Exact Candidate Binding

- **Candidate SHA:** `6410f161668572fbf9a913529456b3b2f1d1821d`
- **Candidate classification:** STRONG CANDIDATE
- **Verified final:** NO
- **Certified:** NO
- **Manifest binding rule:** Every runtime observation in this handoff MUST identify the tested application build/deployment as sourced from exact SHA `6410f161668572fbf9a913529456b3b2f1d1821d`. A different source SHA is NOT evidence for this candidate.

## 1. Vercel Deployment Identity

- **Project:** `report-advisor`
- **Project ID:** `prj_jcqgz6UKGd6tPgHZlttgFXaXvyvo`
- **Team:** `Injaz` (`team_7BSJnGvDzIC6bXMakIOeAYle`)
- **Production deployment ID:** `dpl_DCxZcpM81oRxmaL6sDsfkEQwePek`
- **Deployment state:** `READY`
- **Deployment target:** `production`
- **Deployment URL:** `https://report-advisor-iuf3thhjc-injaz2.vercel.app`
- **Production project URL:** `https://report-advisor.vercel.app`
- **Source SHA:** `6410f161668572fbf9a913529456b3b2f1d1821d`
- **Source ref:** `main`
- **Deployment identity verification:** VERIFIED by Vercel deployment metadata: deployment `dpl_DCxZcpM81oRxmaL6sDsfkEQwePek` reports GitHub commit SHA exactly equal to candidate SHA `6410f161668572fbf9a913529456b3b2f1d1821d`.
- **Important:** Deployment identity verification is NOT runtime verification and does NOT certify Production Alias Binding, Authenticated Runtime, Security Authorization, Backup/Restore, Rollback, RPO, RTO, Forward Recovery, or DR.

## 2. Runtime Evidence Sequence E1 → E12

Execute in order. Record direct browser/runtime observations; do not infer PASS from static/CI evidence.

### E1 — Deployment Identity
- Open the exact deployment URL.
- Confirm deployment/source identity remains bound to candidate SHA.
- Capture URL, deployment ID, source SHA, timestamp.

### E2 — Anonymous Access Denial
- Start from a clean/anonymous browser session.
- Attempt protected dashboard/report routes directly.
- **Expected:** protected data/routes denied or redirected; no tenant data exposed.
- Capture status/redirect/UI result and console/network evidence.

### E3 — Actor A Authentication + Session
- Authenticate as Actor A using the owner-provided runtime credentials.
- **Expected:** login succeeds; session is established; Actor A receives only authorized tenant/application scope.
- Capture login result, session state, dashboard load, timestamp.

### E4 — Actor A Logout + Anonymous Rejection
- Logout Actor A.
- Re-attempt protected route/API/data access without a session.
- **Expected:** session is invalidated and protected access is denied.
- Capture logout state and denial evidence.

### E5 — Actor B Authentication + Session
- Authenticate as Actor B in a clean session.
- **Expected:** login succeeds; Actor B receives only authorized tenant/application scope.
- Capture login result, session state, dashboard load, timestamp.

### E6 — Tenant A Isolation
- As Actor A / Tenant A, exercise normal dashboard/report reads and permitted writes.
- **Expected:** only Tenant A data is readable/writable within Actor A authorization.
- Capture representative records, IDs, requests, and results.

### E7 — Tenant B Isolation
- As Actor B / Tenant B, exercise normal dashboard/report reads and permitted writes.
- **Expected:** only Tenant B data is readable/writable within Actor B authorization.
- Capture representative records, IDs, requests, and results.

### E8 — Cross-Tenant Read Adversarial Cases
- While authenticated as Actor A, attempt to read known/constructed Tenant B identifiers, records, reports, storage objects, and business data.
- Repeat symmetrically as Actor B against Tenant A.
- **Expected:** every unauthorized read is denied, filtered, or returns no cross-tenant data.
- Capture exact request and observed denial/filter result.

### E9 — Cross-Tenant Write Adversarial Cases
- Attempt unauthorized update/insert/delete/mutation against the opposite tenant from each actor.
- **Expected:** mutation is rejected and opposite-tenant state remains unchanged.
- Capture before/after state and request/result evidence.

### E10 — Business RPC Authorization
- Exercise every critical business RPC used by dashboard/report flows.
- Test authorized invocation and unauthorized invocation with wrong tenant/object scope.
- **Expected:** authorized calls succeed; unauthorized calls fail closed and cannot leak or mutate data.
- Capture RPC name/signature, actor, tenant, request, response/error, timestamp.

### E11 — Storage Isolation
- Test authenticated access to permitted product/document/report storage objects.
- Attempt direct access to opposite-tenant/private object paths as Actor A and Actor B.
- **Expected:** authorized object access succeeds; unauthorized object access is denied and does not disclose object metadata/content.
- Capture storage path/object identifier and observed result.

### E12 — Critical Product Flows + Final Runtime Gate
- Exercise the critical dashboard/report flows end-to-end for both actors: login → dashboard → data load → report access/action → permitted mutation where applicable → logout.
- Include failure/denial paths encountered in E2–E11.
- **Expected:** core flows work for authorized actors; all security boundaries fail closed; no cross-tenant leakage or unauthorized mutation.
- Final runtime result remains **UNPROVEN** unless direct evidence for all required cases is captured.

## 3. Actor A Requirements

- Owner-provided valid credentials.
- Known Tenant A identity/scope.
- Ability to authenticate in a clean browser session.
- Ability to exercise dashboard/report flows.
- Ability to perform only the mutations legitimately authorized to Actor A.
- Evidence must include actor identity/scope without exposing credentials or secrets.

## 4. Actor B Requirements

- Owner-provided valid credentials distinct from Actor A.
- Known Tenant B identity/scope.
- Clean browser session separate from Actor A.
- Ability to exercise dashboard/report flows.
- Ability to perform only the mutations legitimately authorized to Actor B.
- Evidence must include actor identity/scope without exposing credentials or secrets.

## 5. Tenant A / Tenant B Requirements

- Establish authoritative Tenant A and Tenant B identifiers before adversarial testing.
- Establish at least one known readable record/object/report for each tenant.
- Establish at least one known mutation target for each tenant where mutation is legitimately supported.
- Verify that A→B and B→A attempts use identifiers belonging to the opposite tenant.
- Verify state before and after adversarial write attempts.

## 6. Auth / Session / Logout / Anonymous Cases

Minimum required cases:

1. Anonymous direct protected-route access denied.
2. Anonymous protected API/data access denied.
3. Actor A valid login succeeds.
4. Actor A session persists for required authenticated flow.
5. Actor A logout invalidates access.
6. Post-logout protected access denied.
7. Actor B valid login succeeds in a clean session.
8. Actor B session persists for required authenticated flow.
9. Actor B logout invalidates access.
10. Post-logout protected access denied.
11. Invalid/unauthorized credential path does not establish an authenticated session.

## 7. Critical Dashboard / Report Flows

For each actor:

- Login.
- Protected dashboard navigation.
- Dashboard data load.
- Tenant-scoped data visibility.
- Critical report list/detail/open flow.
- Any supported report action/mutation.
- Refresh/reload while authenticated.
- Logout.
- Rejection after logout.

Record exact route, API/RPC/storage calls where visible, and resulting UI/data state.

## 8. Adversarial Matrix

| Case | Actor | Target | Required result |
|---|---|---|---|
| Read opposite tenant record | A | Tenant B | DENIED / FILTERED |
| Read opposite tenant report | A | Tenant B | DENIED / FILTERED |
| Write opposite tenant record | A | Tenant B | DENIED; state unchanged |
| Delete opposite tenant record | A | Tenant B | DENIED; state unchanged |
| Read opposite tenant record | B | Tenant A | DENIED / FILTERED |
| Read opposite tenant report | B | Tenant A | DENIED / FILTERED |
| Write opposite tenant record | B | Tenant A | DENIED; state unchanged |
| Delete opposite tenant record | B | Tenant A | DENIED; state unchanged |
| Invoke business RPC with wrong tenant scope | A/B | Opposite tenant | DENIED / fail closed |
| Direct private storage object access | A | Tenant B | DENIED |
| Direct private storage object access | B | Tenant A | DENIED |

## 9. Evidence Capture Contract

Every test case MUST record all of the following fields:

- **ACTION** — exact action performed.
- **EXPECTED** — deterministic expected result.
- **OBSERVED** — exact observed result, including UI/network/API status where relevant.
- **EVIDENCE** — screenshot, URL, request/response excerpt, console/network capture, or other direct artifact sufficient to reproduce the observation.
- **EXACT SHA** — MUST be `6410f161668572fbf9a913529456b3b2f1d1821d` for candidate evidence.
- **TIMESTAMP** — local timestamp with timezone.
- **PASS-FAIL** — PASS only when the observed result directly satisfies the expected result; otherwise FAIL or UNPROVEN.

Do not record inferred PASS based solely on source inspection, CI success, deployment READY state, or expected behavior.

## 10. Hard Runtime Certification Rule

> **NO RUNTIME PASS WITHOUT DIRECT OBSERVED EVIDENCE.**

A green deployment, successful CI run, static analysis result, source-code inspection, or deployment identity match cannot substitute for direct runtime observation.

A runtime case with missing, ambiguous, stale, or wrong-SHA evidence is **UNPROVEN**, not PASS.

## 11. Remaining Operational Tests — Explicitly Unproven

The following remain operationally unproven and MUST NOT be inferred from CI/static evidence:

- **Backup**
- **Restore**
- **RPO**
- **RTO**
- **Rollback**
- **Forward Recovery**
- **DR (Disaster Recovery)**

For each, capture direct operational evidence including exact timestamps, source/target environment, artifact/backup identity, measured result, and exact candidate/deployment identity where applicable.

## 12. Final Handoff State

```text
6410 = STRONG CANDIDATE
Migration Lineage = LINEAGE BLOCKER
Authenticated Runtime = UNPROVEN
Security Runtime Authorization = UNPROVEN
Operational Resilience = UNPROVEN
Master Index = FROZEN at f29cdbc3...
Certification = BLOCKED
```

## 13. Execution Boundary

This manifest is a runtime handoff artifact only.

It does NOT authorize:

- product code changes;
- migration changes;
- Master Index changes;
- migration-history changes;
- arbitrary REVOKE operations;
- new CI creation;
- re-running Execution Enforcement #44;
- declaring Runtime PASS;
- declaring Security PASS;
- declaring Certification PASS.

**LOCAL/AUTOMATED EXECUTION = EXHAUSTED**

The next valid work is direct runtime/operational observation from the computer/owner environment. This transition is an execution-boundary handoff, not a project failure or abandonment.

---

**Manifest purpose:** preserve an exact-SHA-bound, auditable runtime test contract for candidate `6410f161668572fbf9a913529456b3b2f1d1821d` without modifying the product, migrations, or Master Index.
