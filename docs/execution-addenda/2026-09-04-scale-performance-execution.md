# P1 Scale / Performance — Evidence-Bound Execution

Date: 2026-09-04

## Exact provenance

- MAIN / supplied base: `083225068f1e2d390f6e1d50e8b178a1e8e1bacb`
- Branch: `execution/owner-level-compatibility-hardening-main`
- PR: `#310` — OPEN / NOT MERGED
- Candidate at start: `460bc2d3187f7be635c97ce75b42147d2abb1a32`
- Performance harness mutation chain: `460bc2...` → `c432755ef1a9223f13974ffdce03fb99b1fae97f` → `e328e4fdce3278b00ec5ae19f725c12d85ecb752` → `0f53a7b99fb26b8bc12cac386bee612b91f81ce7` → `6798a3a9a106451c76974ed6438fed1f93f92b08` → `b6e9a32a699765a399a0d0a7012cc29fbc4c0cfe` → `eca86f7753682429623d1c33f2f52e152c617a46`
- **Current Exact HEAD:** `eca86f7753682429623d1c33f2f52e152c617a46`

## Surface discovery

Inspected/targeted performance surfaces include worker queue and claim lifecycle, bounded concurrency, concurrent analysis/coalescing, production-scale chunking/streaming/cache fixtures, report/export bounds, OCR/document processing, numeric normalization, RPC/database access, pagination, artifact paths, source/provenance handling, frontend/API batching, compatibility wrappers, retries, and memory-heavy transformations.

No new P0 correctness/security defect was established by the scale work. A test coverage weakness was found in the concurrent-analysis fixture: tenant isolation was present in the implementation fixture key but the test did not exercise identical key+revision requests concurrently across two tenants. The fixture was hardened to do so simultaneously.

## Deterministic workload matrix

| Workload | 5k | 10k | 50k | 100k | 250k existing contract |
|---|---:|---:|---:|---:|---:|
| Materialized rows | PASS | PASS | PASS | PASS | PASS |
| Chunk size 500 | PASS | PASS | PASS | PASS | PASS |
| Streaming count fixture | PASS | PASS | PASS | PASS | PASS |
| Tenant-keyed cache fixture | PASS | PASS | PASS | PASS | PASS |

The repository's existing production-scale fixture executes a deterministic 250,000-row chunking/streaming/cache workload.

## Concurrency matrix

| Concurrency | Harness result | Admission invariant | Notes |
|---:|---|---|---|
| 1 | PASS | maxActive=1 | synthetic deterministic workload |
| 2 | PASS | maxActive=2 | synthetic deterministic workload |
| 4 | PASS | maxActive=4 | synthetic deterministic workload |
| 8 | PASS | maxActive=8 | synthetic deterministic workload |

Actual local harness results on the execution environment were:

| Rows | C=1 elapsed | C=2 elapsed | C=4 elapsed | C=8 elapsed |
|---:|---:|---:|---:|---:|
| 5,000 | 44.438 ms | 38.768 ms | 17.942 ms | 11.493 ms |
| 10,000 | 60.861 ms | 45.913 ms | 25.430 ms | 23.314 ms |
| 50,000 | 226.208 ms | 189.449 ms | 137.443 ms | 125.770 ms |
| 100,000 | 398.219 ms | 354.812 ms | 276.419 ms | 272.096 ms |

These are **synthetic harness measurements**, not production runtime latency.

## Latency

The deterministic harness records p50/p95/p99 per task. It does not represent DB/RPC or production service latency. Therefore no production claim is made from these numbers.

A database-scale probe was also executed against a temporary 250k-row PostgreSQL relation using the same tenant/date/order/pagination shape used to investigate deep pagination. The observed plan remained bounded at the tested scale; the probe did not establish a release-blocking >300ms production RPC latency.

## Memory

The local deterministic harness measured heap deltas for materialized row arrays:

| Rows | Heap delta |
|---:|---:|
| 5,000 | 0.304 MB |
| 10,000 | 1.301 MB |
| 50,000 | 4.973 MB |
| 100,000 | 10.234 MB |

The harness explicitly releases the large array and invokes GC when available. This is evidence for the harness behavior only; it is not a claim about browser/OCR/renderer production memory.

## Worker load / retry amplification

The existing bounded-concurrency fixture was executed and passed: concurrency limit 4, queue cap 20, explicit backpressure, failure cleanup. The existing production-scale fixture passed 250k rows. Worker lifecycle security remains governed by the previously repaired lease-token/attempt/maxAttempts DB contracts. No new worker lifecycle mutation was made in this milestone.

Production worker takeover, lease expiry under real multi-process load, and artifact crash/replay remain **BLOCKED** because the required external runtime is unavailable.

## Tenant under load

The concurrent-analysis fixture now runs two tenants with identical business key and revision concurrently and asserts distinct results. A mutation removing the tenant dimension from the registry key was executed locally and was detected by the hardened test.

The existing production-scale cache fixture also asserts tenant-key separation and TTL behavior.

This remains contract/test evidence, not authenticated production tenant-isolation certification.

## Export scale

The global export bound remains `p_max_rows = 10000` from the prior P1 repair. The required boundary cases remain 9999 accepted, 10000 accepted, 10001 rejected in the authenticated DB probe previously executed. No new export code mutation was made in this scale milestone.

No alternate compatibility/export renderer bypass was found in the inspected paths. Production artifact generation remains externally blocked.

## Test-of-Test

The scale milestone added `scripts/p1-scale-performance-test-of-test.mjs` and wired it into the exact-SHA workflow. It intentionally weakens:

- concurrency admission checking;
- bounded queue rejection;
- tenant dimension in concurrent-analysis registry keys.

The bounded-queue mutation was executed locally and detected. The tenant-key mutation was first found to be undetected because the test was sequential; the test itself was then repaired to make the two tenant requests simultaneous. The repaired mutation was executed locally and detected.

This discovery is retained as a finding about the **test**, not evidence of a production tenant leak.

## Findings

### PERF-001 — Concurrent-analysis tenant test lacked simultaneous cross-tenant coverage

- Severity: P1 test-integrity / release-readiness coverage gap
- Production defect established: **NO**
- Root cause: fixture asserted tenant-aware key construction but did not exercise same key+revision concurrently across tenants.
- Repair: concurrent Promise.all workload for Tenant A/B with identical business key and revision; distinct result assertions.
- Test-of-test: removing tenant from registry key now fails.

No P0 data/security defect was established by this finding.

## Bypass search

Checked for equivalent scale risks across production-scale fixture, bounded concurrency, concurrent analysis, export bound/renderer, report/export compatibility, and the known worker lifecycle paths. No new unbounded queue or retry path was proven. No new alternate export RPC bypass was established.

## Regression

Executed locally:

- production-scale fixture: PASS — 250k rows/chunking/streaming/cache tenant isolation
- bounded-concurrency fixture: PASS
- concurrent-analysis fixture: PASS after tenant-concurrency hardening
- deterministic P1 scale harness: PASS — 5k/10k/50k/100k × 1/2/4/8
- mutation checks: bounded queue and tenant-key weakening detected

The complete repository CI suite has not yet produced a completed fresh exact-SHA result for the final head.

## CI boundary

Fresh Exact-SHA CI for final head is **NOT PROVEN**. GitHub Actions runs were observed queued for the candidate after push; no completed PASS was transferred from an earlier SHA.

## Production boundary

The following remain separate and are not certified by this milestone:

- authenticated browser runtime
- production worker process
- external artifact store crash/replay
- backup/restore
- rollback/forward recovery
- native Windows runtime

## Next execution state

After Scale/Performance, execution proceeds to Filesystem / Windows, while Tenant/Security rescan continues in parallel. PR #310 remains OPEN / NOT MERGED.
