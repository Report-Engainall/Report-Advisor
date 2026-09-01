# Report Advisor — Project Execution Index (Legacy Pointer)

> هذا الملف كان الفهرس التنفيذي الأول. تم الآن إنشاء الفهرس الشامل الحالي في:
>
> **`docs/MASTER_EXECUTION_INDEX.md`**
>
> يجب الرجوع إلى الفهرس الشامل أولًا قبل أي تنفيذ جديد. هذا الملف محفوظ كسجل تاريخي للدفعات السابقة والـcommits، وليس مصدر الحالة الوحيد.

## Current master reference

- `docs/MASTER_EXECUTION_INDEX.md` — الحالة الشاملة الحالية، المراحل، المتطلبات، الـCI، الـgaps، الـbacklog وتسلسل التنفيذ.
- `docs/IMPLEMENTATION_ROADMAP.md` — التسلسل المرحلي الأصلي.
- `docs/MASTER_PRODUCT_REFERENCE.md` — المتطلبات والـguardrails المرجعية.
- `docs/INSPIRATION_IMPLEMENTATION_AUDIT.md` — تدقيق فجوات المنتج/UX.
- `docs/INTEGRATION_SOURCES_REGISTRY.md` — سجل التكاملات والفروع.
- `docs/CI_FAILURE_HUNTING_LEDGER.md` — سجل مشاكل CI التاريخية.

## Historical execution record

### CI topology
- J/K/L runtime wave → manual-only. Commit: `2117ea05bcfda6f9321919c991c3d9e5b9a03371`
- Autonomy safety wave → manual-only. Commit: `86b961b721d3ce17c58d9ada2dae9a9dd5b227cc`
- CI topology guard → `fcbfbaf908c63a193eb8ad852253aabdb880a051`
- Quality topology/recovery integration → `c7a1561fa049a6c89863d1e34816c09bc2ec0c49`
- Production closure → manual-only. Commit: `0f4e1f36a53117516974170268f4d93aaa726ca2`

### Release / provenance / certification
- Security provenance certification → `5edd785f890428f208fe5f05d381394a31fced77`
- Artifact/migration provenance → `17f48ebf6836f8a1cb1e3e592bc309f9d78a22e6`
- Release artifact integrity → `bc2f1f2b96d2dd7d3c023f3e4c55d85dce7e3fb7`
- Rollback contract → `8d27e749549aec79d118a27f3e3b48c250870210`
- Release manifest → `36633c481966257bf782ccd42f18a107608a3953`
- Manifest integrity → `c029b98d1729d62f53431b0db4d0bbd335a65fa0`
- Release drift → `0801e07e43a03955c21e8ad4a61545eabc7ce974`
- Evidence snapshot → `cda2ed0e61e1683ee886a15e8fbc238663614211`
- Evidence freshness → `971c9dde1295cee4070334fa780669e4119d54ea`
- Release decision provenance → `e0d8bd561603d4f648618d2352acfdf247b97991`
- Release audit bundle → `6854a064f490aff284a3fb50fcb18a8d4b3dcfeb`
- Release gate completeness → `94687198491ee9804ad0ff7f4866e5633d460d40`
- Unified production release gate → `2fc36900190b878e36449b966ba4120503d4ba8c`
- Recovery readiness → `e7af4dca612761e6d19e3d24e4e6e29d7589618e`
- Recovery workflow → `be9daad4915f2c9b5082ffb77b5c1dcb974fe66c`
- Production recovery gate → `2f3547b272511847f12a35b5ae686f390566a96e`

### Historical rules retained

- Do not confuse static wiring with runtime PASS.
- Do not announce Production Certified without live evidence.
- Do not create duplicate gates without first checking Quality and existing contracts.
- `main` is the source of truth.
- After every meaningful execution batch, update `docs/MASTER_EXECUTION_INDEX.md`.

## Current PR #294 Reconciliation — 2026-09-01

> **Historical PASS is historical. Current PR certification is bound to the current exact PR HEAD only.**

### Current authoritative PR state

- Repository: `Report-Engainall/Report-Advisor`
- PR: **#294 — OPEN / NOT MERGED**
- PR head branch: `codex/p0-hardening-integration-20260901`
- Current Exact PR HEAD: **`c600265040ca99cb17b68e5ae8c23155b51b127e`**
- Base: `main`
- PR base SHA currently reported by GitHub: `89c8361e85878521c915328f6d0a595663498cd3`
- PR remains unmerged; no merge is authorized by this record.

### Exact SHA chronology — preserve, never collapse

```text
6aa1580...              historical
    ↓
4d583968...             historical certification candidate
    ↓
f3d47dcf...             historical candidate / certification investigation
    ↓
fd04295f...             Release Evidence architectural boundary fix
    ↓
Natural CI
    ↓
c600265...             Evidence provenance contract RCA/fix
    ↓
CURRENT EXACT PR HEAD
```

The two latest transitions are explicitly preserved:

#### `fd04295f1d176bb50b4f5d65667d38b67bd689c5`
- Date/time: `2026-09-01T05:07:16Z`
- PR: `#294`
- Parent: `f3d47dcf243a71d2b73b080c602d1f8050e42079`
- Commit: `fix(ci): scope release evidence freshness to release certification`
- RCA: proven release-evidence architectural boundary drift; PR Certification must not require release-only freshness evidence.
- Mutation: **3 files**, **17 additions / 11 deletions**.
- Changed files:
  - `.github/workflows/final-certification-gate.yml`
  - `.github/workflows/release-certification.yml`
  - `scripts/check-evidence-freshness.mjs`
- Key correction: release freshness was scoped to Release Certification; the legacy `release-manifest.json` expectation was replaced by canonical `release-evidence/manifest.json` / `generated_at` semantics in the release workflow.
- Status: historical mutation; not current certification evidence.

#### `c600265040ca99cb17b68e5ae8c23155b51b127e`
- Date/time: `2026-09-01T05:11:28Z`
- PR: `#294`
- Parent: `fd04295f1d176bb50b4f5d65667d38b67bd689c5`
- Commit: `fix(ci): remove nonexistent migration from evidence provenance contract`
- RCA: evidence provenance contract referenced a migration that does not exist in the repository; the contract was corrected to match the actual canonical evidence components.
- Mutation: **1 file**, **1 addition / 1 deletion**.
- Changed file: `scripts/check-evidence-provenance-chain.mjs`
- Exact diff: removed `supabase/migrations/20260825110000_autonomous_governance_bi.sql` from the contract's required-file list; retained the real phase-K/L runtime migration and evidence source files.
- GitHub confirms the commit parent is exactly `fd04295f...` and the commit changed only this file.
- Status: **CURRENT HEAD**; current CI must be evaluated independently on this SHA.

### Current CI / certification truth for `c600265...`

- Natural CI was triggered from the current PR head after `c600265...` was pushed.
- GitHub currently reports workflow runs directly on `c600265...`; at the reconciliation point they are **IN_PROGRESS / NOT YET CERTIFIED**. No green result is promoted until its run explicitly reports `head_sha == c600265040ca99cb17b68e5ae8c23155b51b127e`.
- One directly verified current run is `desktop-windows`, Run ID **`33472642251`**, workflow `.github/workflows/desktop-windows.yml`, event `pull_request`, status **`in_progress`**, conclusion `null`, exact `head_sha = c600265040ca99cb17b68e5ae8c23155b51b127e`.
- GitHub reports **41 workflow runs** for this exact `head_sha` query at reconciliation time; their individual conclusions must be read from GitHub before any final certification count is claimed.
- Historical Runs/Checks from `4d583968...`, `f3d47dcf...`, or `fd04295f...` are **NOT** counted as PASS for `c600265...` unless a new independent exact-head run proves the same result.
- Merge-ref, base SHA, stale run, skipped check, or result from another SHA is **NOT COUNTED**.

### Current state matrix

| Area | Current state on `c600265...` | Evidence rule |
|---|---|---|
| Quality | **PASS historically; current exact-head result PENDING** | Must be re-proven on `c600265...` |
| Phase 10 | **PASS historically; current exact-head result PENDING** | Do not promote old SHA |
| Windows | **PENDING / IN_PROGRESS** at reconciliation | Run `33472642251` is exact-head and in progress |
| Decision Terminal | **PASS historically; current exact-head result PENDING** | Do not promote old SHA |
| Exact-head identity | **PR head proven = `c600265...`** | GitHub PR metadata directly identifies head SHA |
| Final Certification | **NOT YET PROVEN** | Requires coherent current-head evidence |
| Exact-commit evidence | **NOT YET PROVEN** | Must execute after prerequisite contracts pass |
| Required Checks | **PENDING / MUST BE VERIFIED** | Count only checks whose `head_sha` equals current exact head |
| Merge | **BLOCKED** | No merge before exact-head certification and owner decision |
| Production Certification | **BLOCKED** | Requires runtime/release evidence separately |
| Sellable | **NO** | Production certification not proven |

### Architecture boundary — permanent rule

```text
PR Certification
    ↓
Source / CI / Security / Contract / Exact-Head readiness

Release Certification
    ↓
release-evidence/manifest.json
+ generated_at
+ source_sha
+ certification_run_id
+ freshness

Production Evidence Boundary
    ↓
Downloaded release artifact
+
Exact source SHA
+
Runtime / release evidence
```

Do not reintroduce the legacy `release-manifest.json` requirement into PR Certification. Do not manufacture release evidence for a PR. Release freshness remains enforced in the Release Certification boundary. Production runtime evidence remains a separate operational boundary.

### Evidence ledger / known certification history

The following evidence sequence is retained as historical context and is not promoted across SHAs:

- Decision Terminal RCA and terminal guard closure: historical evidence only; current-head PASS must be independently proven.
- Phase 10 backup/restore contract closure: historical evidence only; no runtime restore PASS is inferred from source contract alone.
- Exact-head workflow enforcement: retained as a required guard; current-head result must identify `c600265...`.
- Release Evidence RCA: `f3d47dcf...` → `fd04295f...`; proven architectural boundary correction.
- Release manifest producer/consumer RCA: release producer is `.github/workflows/release-certification.yml`; canonical manifest path is `release-evidence/manifest.json`; consumer is `scripts/check-evidence-freshness.mjs` in Release Certification; PR Certification must not consume this release-only artifact.
- Release-only freshness boundary: enforced by `release-certification.yml` after the `release-evidence/manifest.json` and certification decision are available.
- Evidence provenance RCA: `c600265...` removed the nonexistent migration from `scripts/check-evidence-provenance-chain.mjs`; no other source component was changed by that mutation.
- Windows PASS evidence from earlier SHAs remains historical; current exact-head Windows is pending at the time of this reconciliation.
- Quality PASS evidence from earlier SHAs remains historical; current exact-head Quality is pending until a matching current-head run concludes successfully.
- Runtime blockers remain separate from CI readiness: authenticated tenant A/B, live production runtime, backup/restore drill, rollback drill, and other operational evidence cannot be claimed without real runtime evidence.

### Owner-level operating rules from this reconciliation

1. `CURRENT EXACT PR HEAD` is authoritative for current PR status.
2. Historical SHA evidence is never silently transferred to a newer SHA.
3. Every current PASS must identify exact `head_sha`, workflow, run ID, job/check name, and result.
4. `SKIPPED` is not PASS.
5. `IN_PROGRESS` is not PASS.
6. A merge-ref result is not an exact-head result.
7. No random rerun is a substitute for natural CI.
8. No fake manifest, fake evidence, legacy PR manifest, or speculative mutation.
9. A proven failure requires exact checker/assertion → RCA → minimal fix → new exact HEAD → fresh natural CI.
10. If a runtime or credential boundary is unavailable, preserve the blocker rather than fabricate a PASS.

### Current next single highest-value action

**Verify the natural CI results on `c600265040ca99cb17b68e5ae8c23155b51b127e`, counting only exact-head checks; once all prerequisites are known, complete Final Certification and exact-commit evidence on that same SHA. Do not merge before evidence coherence is proven.**

## Next action

**NOW-1: Full inventory closure** from `docs/MASTER_EXECUTION_INDEX.md`: workflows → triggers → package scripts → `scripts/check-*` → Phase E–M dependencies → duplicate/obsolete candidates, then fix the real gaps only.
