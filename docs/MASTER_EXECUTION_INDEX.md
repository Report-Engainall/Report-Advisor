# Report Advisor — Master Execution & Truth Index

## OWNER-LEVEL RELEASE CLOSURE — 2026-09-01

This file is the authoritative execution index. Historical PASS remains historical. No PASS may move between branches/SHAs without exact-head evidence.

## Current Truth

- Planning estimate from latest developer assessment: **~88%** overall.
- Independent release-readiness judgment: advanced Release Candidate; **NOT Production Certified / NOT Sellable yet**.
- Current `main` release baseline: `17a49420c70faca143cf7cc58ad11aae6edcb662`.
- Owner integration PR: **#294**, OPEN / NOT MERGED.
- This execution wave adds implementation PR **#300**, OPEN / NOT MERGED.
- PR #300 current head: `5841f44fe26f0d326f6c06ccb0baea520e1f14eb`.
- Do not call branch-local hardening PASS `main` PASS until exact-head CI and merge conditions are satisfied.

## Latest Executed Cycle — 2026-09-01

### Concrete implementation completed in PR #300

1. **Canonical intelligence numeric hardening:** negative/non-finite payment values are sanitized before receivables/payables calculations.
2. **Canonical history hardening:** negative/non-finite sales history is sanitized before trend, velocity, forecast and backtest inputs.
3. **Inventory stochastic-input hardening:** negative/non-finite daily demand is sanitized before stochastic inventory decisions.
4. **CCC period hardening:** invalid/non-positive reporting periods fail to a deterministic safe period rather than reaching CCC as invalid input.
5. **Metric confidence hardening:** explicit NaN/infinite/out-of-range confidence fails closed to zero while omitted confidence retains the established valid-data fallback.
6. **Metric source-evidence hardening:** missing, fractional, negative, NaN or infinite source-row counts become `INSUFFICIENT_DATA` and cannot drive decisions.
7. **AI tenant hardening:** requested and authenticated tenant IDs are type-checked, trimmed and compared against session authority before hosted AI access.
8. **Evidence confidence hardening:** report-fact confidence is normalized to a safe `[0,1]` range and invalid values fail closed.
9. **Evidence provenance hardening:** evidence attachment is now derived from the authoritative ledger rather than preserving caller-supplied evidence.
10. **Executable regression coverage:** focused boundary tests were added for canonical intelligence, metrics, AI tenant policy and report-fact evidence.
11. **CI contracts:** read-only GitHub Actions workflows and deterministic runners were added for the four hardening surfaces.
12. **Release integration:** all of the above were consolidated onto one implementation branch and opened as PR #300 instead of mutating production aliases or fabricating runtime evidence.
13. **CI topology repair:** removed the duplicate `main` push trigger from `final-execution-batch.yml`, leaving its explicit manual execution path intact.
14. **Tenant-isolation workflow repair:** removed the duplicate `main` push trigger from `storage-tenant-isolation.yml`, preserving PR and manual execution.
15. **File-security ESM repair:** normalized `security.ts` imports to explicit `.ts` module paths so the archive traversal regression can execute under Node's ESM resolver.
16. **CI credential hardening:** disabled persisted checkout credentials in the file-intelligence security workflow.
17. **File-security integrity restoration:** restored the complete `security.ts` implementation after the prior branch edit had replaced it with an incomplete prefix; all scanner and duplicate-check exports are present again while retaining explicit ESM imports.
18. **Archive traversal adversarial expansion:** extended the executable ZIP regression matrix to cover backslash traversal, NUL entry names, unsafe uploaded archive filenames and NUL-containing uploaded filenames, in addition to POSIX/Windows absolute and nested parent traversal.

### Exact implementation SHAs

- Canonical intelligence: `643b7dda45b0f7f034a622aa4f97a7b0dcdc73f7`
- Financial decision boundaries: `03a6f23707efcd6bae81f2788bcc52d011b2a007`
- AI tenant policy: `ea8d89efe485ae5d710d36983662a0b2b3700ba3`
- Report-fact provenance/confidence: `8043d9ec069d110922b01997e5578c7e34d4d64e`
- Metric boundary hardening: `a284144b5d614c2991712a596992394f52dbb203`
- File-security restoration: `a61892bd1153e32d3b35ba396342b9faa00a7155`
- Archive traversal regression expansion: `5841f44fe26f0d326f6c06ccb0baea520e1f14eb`
- Earlier execution fix commits: `a857f4404b8c99bbd4da3b264b59c65d3f2a3751`, `29a99caf0f59178cfe9fb3fdf373d5e02a6ad232`, `15159f207402ac8a0df4f169d0505925c4744f15`, `95bb48acc2a694a9bf9c948cc1cbade3f4ff37ee`

## Verification Truth

- The exact-head CI for `dff150f...` proved the previous archive regression failure was a real module-export failure because the branch file was incomplete; it is now restored at `a61892b...` and the regression matrix was expanded at `5841f44...`.
- Before the regression, the File Intelligence security contract itself passed; no current post-fix security PASS is claimed until the new exact-head run completes.
- The latest post-fix commit has triggered the PR CI matrix; queued runs are the active verification state and are not yet PASS.
- The latest status still includes the known Vercel deployment quota failure; this remains external and does not become a code PASS.
- No production certification, authenticated tenant A/B PASS, backup/restore PASS, rollback PASS, or Vercel runtime PASS is claimed.

## Current Operational Truth / Blockers

1. **Exact-head CI:** queued/running against `5841f44...`; must finish green before merge.
2. **Security:** Advisor findings require per-function analysis; leaked-password protection remains an operational configuration gap.
3. **Authenticated A/B:** no operational credentials/sessions available for honest LIVE E2E evidence.
4. **Backup/Restore:** no real PASS run yet.
5. **Rollback:** no real PASS run yet.
6. **Vercel:** deployment checks remain blocked by `api-deployments-free-per-day` (>100 deployments/24h).
7. **Local test execution:** no local `npm ci`/Vitest PASS is claimed from this environment.
8. **Supabase direct SQL:** no new DB PASS is claimed without a valid project reference and execution evidence.

## Parallel Execution Board

### P0-A — PR #300 exact-head closure
- Obtain real GitHub Actions execution on the post-fix head.
- Run boundary tests, typecheck, lint, build, regression and security gates.
- Fix only actual failures.
- Merge only after required exact-head gates pass.

### P0-B — Security Advisor remediation
- Enumerate every flagged `SECURITY DEFINER` function.
- Trace callers and effective privileges.
- Verify tenant/user guards, `search_path`, underlying RLS, intended runtime use and exploitability.
- Retain intentional functions with proof; harden/revoke only where excessive privilege is demonstrated.

### P0-C — Authenticated Runtime / Tenant A-B
Prepare and execute Actor A/B login/session journeys, own-data CRUD/persistence, cross-tenant denial, Storage/signed URLs, Realtime and AI/vector isolation, with browser/network/console evidence. Do not invent evidence without credentials.

### P0-D — Vercel / Runtime Deployment
Do not wait on quota. When deployment is possible, bind deployment to final candidate SHA and prove `/`, `/login`, deep routes, authenticated journey, console/network and Supabase connectivity.

### P0-E — Canonical Truth / BI / Export
Golden business corpus; UI = RPC = Export; date/status/as-of/filter semantics; NULL/UNKNOWN/INSUFFICIENT_DATA; forecast/demand/inventory; legacy/compatibility risks. Fix discrepancies rather than merely report them.

### P1-F — OCR / Document Golden Corpus
Execute PDF text, scanned PDF, Arabic/English OCR, DOCX, images and malformed corpus. Record ground truth, actual, diff, score, provenance and regression evidence.

### P1-G — Workers / Queue / Watched Folder
Execute success/failure/retry/lock/idempotency/duplicate/crash/restart/recovery/DLQ and watched-folder detect → parse → validate → import → reconcile → canonical → evidence.

### P1-H — Backup / Restore / DR
Real backup artifact verification and safe-environment restore verification for schema, data, relationships, constraints and application behavior; record RPO/RTO.

### P1-I — Canary / Rollback
Controlled known-good → canary → rollback → verify drill in a safe environment; verify DB/schema/data/auth/core workflow/canonical truth/application health.

### P1-J — Performance / Scale
Read P95 ≤300ms; write P95 ≤800ms; preview ≤1500ms; realistic corpus; query plans/indexes; N+1/unbounded-read attacks; fix and remeasure.

### P1-K — Observability / Operations
DB/Realtime/services/Storage/notifications/security health, representative alert triggers, visibility and recovery, exact-SHA evidence.

### P2-L — UI/UX
Authenticated responsive/RTL/accessibility, loading/empty/error states, deep links, import/documents/evidence/admin/logout.

### P2-M — Business Acceptance
Merchant golden scenarios, independent expected results, decision/evidence/outcome, UI/export equality, and operation without developer intervention.

## SHA / Evidence Rules

1. Branch-local PASS is not `main` PASS.
2. Historical PASS is not current candidate PASS.
3. A migration being present is not proof of runtime behavior.
4. A test file existing is not test PASS.
5. A reachable deployment is not runtime certification.
6. Every final PASS must identify the exact tested SHA.
7. Certification requires all required evidence to converge on ONE release SHA.
8. A Security Advisor warning must be classified by actual exploitability/privilege semantics; do not close it by blanket revoke or by ignoring it.
9. If an index entry names a SHA different from the actual PR head, the PR head is authoritative for PR status; reconcile the index only after direct verification.

## No-Waste Operating Protocol

The programmer must NOT restart with a broad repository tour or repeat old reports.

For every cycle:

`OPEN INDEX → SELECT ALL INDEPENDENT FRONTS → INSPECT MINIMUM NEEDED → IMPLEMENT → TARGETED TEST → ADVERSARIAL TEST → REQUIRED REGRESSION → EXACT SHA → MERGE IF JUSTIFIED → IMMEDIATELY CONTINUE`

If one front is blocked, continue all independent fronts.

Required update format only:

```text
EXECUTED:
- concrete implementation

VERIFIED:
- actually executed tests/evidence

SHA:
- exact SHA

BLOCKED:
- real blocker only

NEXT PARALLEL:
- next executable fronts
```

## Final Definition of Done

```text
ONE EXACT RELEASE SHA
+ Build/Typecheck/Lint
+ Quality/Architecture
+ Security
+ DB/Migration parity
+ Canonical Truth
+ Authenticated E2E
+ Tenant A/B
+ Storage/Realtime/AI isolation
+ Vercel/runtime
+ OCR/document corpus
+ Workers/queue/recovery
+ Backup/Restore
+ Rollback
+ Performance
+ Observability
+ Critical UX
+ Business Acceptance
+ Complete Evidence Pack
= PRODUCTION CERTIFIED / SELLABLE
```

## OWNER DECISION

The project remains in **PROVE → CERTIFY → RELEASE**, not BUILD. This cycle restored the complete file-security scanner, preserved the intended ESM repair, and materially expanded adversarial archive traversal coverage. Exact-head CI is now the active proof gate; no merge or certification is claimed until it converges on the current SHA.