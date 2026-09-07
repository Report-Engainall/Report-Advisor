# Execution Checkpoint — 2026-09-07 Batch 30

## Objective

Close a concrete architectural gap discovered while investigating the missing real durable worker lifecycle: the repository had a durable worker claim/heartbeat/checkpoint/complete/fail/retry adapter, but no explicit durable enqueue RPC/adapter path. Add the smallest tenant-scoped, idempotent enqueue primitive without fabricating business-flow evidence.

## Exact repository state

- Branch: `fix/runtime-provenance-20260906`.
- Pre-checkpoint code commits in this batch:
  - `6df926b2e00321018efbe2bd6bf0c13d906cbbf6` — durable enqueue adapter.
  - `1f2ab6737ada75e22ea231fb8f0d7cddea0005c4` — durable enqueue migration.
  - `7f5f6e584fd69f9c4f2e7bd5ba8dfbed46761cde` — adversarial durable enqueue contract checker hardening.
- This checkpoint is the final documentation commit for Batch 30 and therefore becomes the new exact HEAD.
- Frozen RCs and production aliases were not mutated.

## Concrete discovery

- `ReportExecutionCoordinator` currently uses `InMemoryReportQueue`; the durable store previously exposed only claim/heartbeat/checkpoint/complete/fail/retry.
- The Staging database exposes seven report-execution worker functions and, before this batch, no enqueue function.
- `report_execution_jobs` has tenant-scoped RLS, a composite unique key `(company_id, job_key)`, queue/lease/ready indexes, and the required durable lifecycle columns.
- Staging contained `0` durable report execution rows before the new enqueue primitive; no synthetic job was inserted.

## Implemented

### Repository

1. Added `DurableEnqueueInput` and `SupabaseReportExecutionStore.enqueue(...)` in `src/lib/report-execution/durable-worker-adapter.ts`.
2. Added `supabase/migrations/20260907001015_add_report_execution_durable_enqueue_20260907.sql`.
3. The enqueue contract:
   - requires tenant, job key, source path and source hash;
   - creates the initial `queued` checkpoint with source hash/evidence keys;
   - bounds max attempts to 1..100;
   - is idempotent on `(company_id, job_key)`;
   - rejects reuse of a job key with different source identity;
   - is `SECURITY DEFINER` with `search_path=pg_catalog`;
   - grants execute only to `service_role` and explicitly revokes `public`, `anon`, and `authenticated`.
4. Added `scripts/check-report-execution-durable-enqueue-contract.mjs`, including a test-of-test that verifies removal of the source-identity guard is detected.

## Staging verification

Applied the enqueue migration to project `fnqbvfuwbdpwvhcgzksl` using the Supabase migration path.

Verified live function:

- `enqueue_report_execution_job(uuid,text,text,text,text[],integer)` exists.
- `SECURITY DEFINER = true`.
- `service_role_execute = true`.
- `authenticated_execute = false`.
- `anon_execute = false`.
- Durable job count remains `0`; no fixture residue was created.

Supabase recorded the applied migration as version `20260907005932` with name `20260907001015_add_report_execution_durable_enqueue_20260907`; this is recorded explicitly because the platform-assigned migration version differs from the repository filename prefix.

## Vercel / CI boundary

- Vercel team/project deployment listing currently returns `403 Forbidden` due to authorization scope; therefore no exact-head deployment or browser E2E result was claimed.
- Vercel Agent Runs access also returns `403 Forbidden` for the connected scope.
- Existing CI forensic failures remain non-diagnostic where jobs expose empty/null steps, unavailable log blobs, and no artifacts. No repeated rerun was performed merely to generate noise.

## Evidence status

### Improved / closed at contract level

- Durable enqueue primitive now exists in source and Staging.
- Tenant-scoped idempotent enqueue contract exists.
- Service-role-only execution boundary verified live.
- No synthetic runtime lifecycle evidence was manufactured.

### Still open

1. Legitimate business-flow call site that invokes durable enqueue.
2. Real tenant-scoped enqueue → claim → heartbeat → checkpoint → complete/fail/retry runtime evidence.
3. Authenticated exact-head Chromium E2E and Tenant A/B adversarial browser evidence.
4. Full source/live migration parity certification, including this new platform-assigned migration version/name mapping.
5. Observable current-head CI PASS.

## Method improvement

When a runtime blocker is caused by a missing production primitive, prefer closing that primitive at the narrowest contract boundary, verify it live, and leave the business-flow evidence open until a real caller exercises it. This advances the architecture without manufacturing certification.

## Next execution point

Inspect actual UI/server/edge-function call paths for a legitimate durable enqueue caller; if none exists, trace the report-generation business flow to the correct integration boundary rather than wiring the queue speculatively. Then re-verify the exact post-checkpoint HEAD through the strongest available hosted boundary.
