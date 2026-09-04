# 2026-09-04 — P1 Filesystem / Windows Deep Hardening

## Evidence boundary

- Repository: `Report-Engainall/Report-Advisor`
- Base: `083225068f1e2d390f6e1d50e8b178a1e8e1bacb`
- Branch: `execution/owner-level-compatibility-hardening-main`
- PR: `#310` — OPEN / NOT MERGED
- Code hardening ancestor: `fdf677edb6855b376fa73e9db76cf307c7cb5e6f`
- Latest index/evidence head at authoring time: `dba68eb1f313d7473c2e7a33a5f32d74d7b798e4`
- Certification: NOT CLOSED
- Production certification: 0%
- No previous PASS is transferred to the new filesystem mutation.

## Surface discovery

Audited the repository's filesystem surfaces at the exact execution lineage, including the desktop watcher, recursive scan, stable-file wait, realpath containment, path-relative checks, event generation fencing, duplicate suppression, pending-event suppression, archive path scanning, file-engine security, import/watch contracts, and Windows native workflow.

Primary runtime surface: `desktop/main.cjs`. Existing file-engine security surface: `src/lib/file-engine/security.ts`. Existing cross-platform capability boundary: `src/lib/import-pipeline/folder-watch-contract.ts`.

## Findings / RCA / fixes

| ID | Severity | Finding | RCA | Action |
|---|---|---|---|---|
| FS-001 | P1 | Watched-file reads validated `realpath()` and then called `readFile(path)` without an opened-handle identity check. A target can theoretically change between validation and the final open/read. | Validation and consumption were separate filesystem operations. | Hardened `readWatchedFile()` to open a handle after canonical validation, use `O_NOFOLLOW` where supported, compare opened-file stat identity/size/mtime against the path, re-check canonical containment, and read from the opened handle. Residual directory-component TOCTOU remains platform/OS specific and is not claimed closed by this change. |
| FS-002 | P1 | The prior archive regression covered POSIX absolute, Windows drive, and parent traversal but did not provide a full deep-hardening matrix. | Existing test was intentionally narrow and predates this front. | Added a new exact-head deep harness and a mutation-based test-of-test. |
| FS-003 | P1 | Windows native watcher had native smoke coverage but not the new deep guard/test-of-test gate. | Existing Windows workflow only exercised its prior contract/smoke. | Added exact-head Linux + Windows deep-hardening workflow gates. |

No P0 tenant filesystem leak was observed from the local/static surface inspected. External artifact runtime and authenticated tenant A/B remain blocked and therefore are not certified here.

## Path traversal

Deep matrix includes:

- `../outside.txt`
- `../../outside.txt`
- `../../../outside.txt`
- `/absolute/path.txt`
- `C:/absolute/path.txt`
- `C:\\absolute\\path.txt`
- `C:/target/../outside.txt`
- `nested/../../outside.txt`
- `./nested/file.txt`
- repeated separators
- mixed separators
- deterministic normalization/containment expectation

The existing desktop runtime already applies `path.resolve()` followed by relative-root containment; the new handle-based read hardening preserves that boundary.

## Symlink / junction / hardlink

Production code now performs canonical `realpath()` containment before opening and uses `O_NOFOLLOW` on platforms where Node exposes that primitive. Full attacker-controlled target replacement across every path component is not proven on Windows by Linux execution. Native Windows primitive capability remains a separate evidence boundary.

Status: **PARTIALLY PROVEN / NOT CERTIFIED**.

## Windows path semantics

Reviewed drive-letter handling, backslash normalization, absolute-path rejection in archive scanning, and device-style/UNC-equivalent slash forms through the archive boundary. The existing archive guard rejects normalized leading `/` and Windows drive paths. Native Windows behavior is separately exercised by the Windows runner; no Linux PASS is promoted to native Windows certification.

Reserved device names, trailing-dot/space Win32 canonicalization, ADS, and full junction race behavior remain explicit deep-runtime follow-up items unless directly exercised by a native exact-head test.

## Unicode / Arabic

Exact filesystem fixture covers Arabic directory/file names, Arabic digits in a filename, NFC/NFD-looking names, and deterministic byte round-trips. This is filesystem round-trip evidence, not a claim that Windows/NTFS Unicode equivalence semantics are identical across all configurations.

## Archive security

Production `securityScan()` was reused by the new deep harness. The matrix covers safe nested entries, parent traversal, nested traversal, POSIX absolute paths, Windows drive absolute paths, and mixed nested escape. Existing archive regression remains in the project test surface.

## TOCTOU / atomicity

The principal actionable issue was FS-001. The read path now consumes an opened handle after canonical validation and verifies opened-file identity before reading. Atomic rename lifecycle is exercised by the deep harness.

This does **not** certify an impossible-to-race filesystem on every OS. Windows directory replacement/junction races require native evidence equivalent to the actual deployed runtime.

## Locked / partial files

The deep harness exercises a locked-file lifecycle, zero-byte files, stable-file semantics, atomic temporary-file rename, and partial-write stabilization. Existing desktop native smoke also proves partial-file stabilization and changed-file handling.

## Watcher lifecycle

The existing native smoke at exact SHA `b63d9ab5581bbec466314dde66b8f5fd5695753a` produced:

```text
nativeSmoke=PASS
rootPersistence=true
fileEvent=true
nativeFsWatchEvents=30
duplicateSuppressed=true
changedFileEvent=true
partialFileStabilized=true
rapidFilesDetected=5
traversalRejected=true
deletionDetected=true
recursiveScan=true
```

That is a prior exact-SHA runtime result and is recorded only as baseline evidence; it is not transferred as a PASS to the post-mutation SHA.

The deep gate adds watcher/source guard verification and test-of-test coverage. A new native exact-head deep run is required before closing this front.

## Tenant filesystem isolation

Local inspection found tenant binding in the database/file security path through `resolveCurrentCompanyId()` for duplicate checks. No authenticated A/B filesystem runtime was available. Therefore:

- cross-tenant artifact runtime: **BLOCKED / NOT PROVEN**
- shared temp/cache/watcher cross-tenant runtime: **BLOCKED / NOT PROVEN**
- no P0 leak claimed.

## Artifact ownership

Artifact integrity remains separate from filesystem path hardening. Path binding, canonical containment, existence/type checks and stale/replacement concerns are partially covered locally; external artifact runtime remains **BLOCKED**.

## Test-of-test

Added `scripts/p1-filesystem-windows-test-of-test.mjs`.

It intentionally mutates/removes each of the following guard classes and requires the checker to detect the mutation:

- traversal predicate
- canonical realpath
- stable-file guard
- watcher generation fence
- duplicate-event guard
- pending-event guard
- opened-handle TOCTOU guard
- no-follow guard
- archive parent traversal guard
- archive absolute-path guard
- archive drive-path guard
- archive size-limit guard

A mutation that remains green is treated as a test-of-test defect.

## Bypass search

Inspected alternate filesystem consumers around:

- desktop watcher
- recursive rescan
- file-engine archive security
- import/watch capability contract
- worker artifact surfaces
- temporary/stable-file handling
- export/report artifact boundaries

No alternate direct read path was promoted to a new PASS. External artifact and production-worker execution remain blocked.

## Regression

The new workflow executes the existing archive traversal regression plus the new deep harness and test-of-test on Linux and Windows. Existing `desktop-windows` workflow was also observed at the prior exact SHA with a successful native watcher smoke and successful Windows packaging.

Fresh exact-head CI for the latest post-mutation head is still required; GitHub connector visibility did not expose a completed Actions result for the newest push at the time of this addendum.

## Files / migrations

### Added
- `scripts/p1-filesystem-windows-deep-hardening.mjs`
- `scripts/p1-filesystem-windows-test-of-test.mjs`
- `.github/workflows/p1-filesystem-windows-deep-hardening.yml`
- `docs/execution-addenda/2026-09-04-p1-filesystem-windows-deep-hardening.md`

### Mutated
- `desktop/main.cjs`

### Migrations
- **None.** Filesystem hardening required no database schema change.

## CI

Current combined status on the latest head exposes a Vercel failure/rate-limit status only; this is an external CI/deployment constraint and is not converted into a filesystem PASS or FAIL.

Fresh Exact-SHA GitHub Actions for the final documentation head remains **NOT PROVEN**.

## Platform limitations / blockers

| Area | State |
|---|---|
| Linux/POSIX filesystem fixture | Locally executable; deep harness added |
| Windows native watcher baseline | PASS at prior exact SHA only; not transferred |
| Windows native deep-hardening current head | NOT PROVEN until exact-head workflow result is observed |
| Symlink/junction full TOCTOU race | NOT PROVEN |
| Hardlink security semantics | NOT PROVEN as an application-level guard |
| Authenticated Tenant A/B | BLOCKED |
| Production worker runtime | BLOCKED |
| External artifact runtime | BLOCKED |
| Backup/Restore | BLOCKED |
| Rollback/Forward | BLOCKED |
| Vercel rate-limit | BLOCKED external |

## Current state

- PR #310: OPEN / NOT MERGED
- Certification: NOT CLOSED
- Production Certified: 0%
- No certification state changed.
- No previous PASS transferred across the filesystem mutation.

## Next executed action

Observe and consume the exact-head Linux/Windows filesystem gates. Any first failure must follow:

`FIRST FAILURE → RCA → FIX → TEST → TEST-OF-TEST → BYPASS → REGRESSION → EXACT SHA → FRESH CI`

After filesystem gates are exhausted: PR reconciliation → full repository rescan → evidence reconciliation, while continuing Tenant/Security rescan and escalating any P0 immediately.
