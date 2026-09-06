# Execution Checkpoint — 2026-09-07 / Batch 1

## Protocol
`1` was executed from the latest GitHub checkpoint. Closed work was not restarted. This batch intentionally exceeded the previous batch's impact by adding two independent regression boundaries around the durable report-execution runtime.

## Verified source changes

### 1. Runtime admission regression
Added `scripts/check-report-execution-runtime-admission.mjs`.

Coverage:
- tenant-bound claim at admission;
- explicit tenant mismatch rejection;
- source-hash immutability during resume;
- heartbeat interval remains shorter than lease duration;
- heartbeat failure aborts progression;
- checkpoint writes remain lease-fenced and tenant-bound;
- completion/failure/retry remain tenant-bound;
- heartbeat timer is cleared;
- adapter requires worker identity and lease token for protected mutations;
- request identity requires tenant + idempotency and includes source snapshot identity.

### 2. Evidence-boundary regression
Added `scripts/check-report-execution-evidence-boundary.mjs`.

Coverage:
- production lifecycle occurs only after checkpoint progression;
- completion evidence carries source hash, lineage count, scenario, portfolio, and autonomy;
- structured failure evidence is persisted;
- retry remains bounded by the attempt budget;
- request identity remains tenant/idempotency scoped;
- completion RPC retains explicit tenant admission.

## Evidence status
- Both changes are committed to `fix/runtime-provenance-20260906`.
- Latest exact HEAD after this batch: `7b2778d2c44a8805523846dcc83e4655e305b3c2`.
- The preceding runtime-admission commit is `551e191e44155a6763c1dab511bed17705868bb1`.
- GitHub commit inspection confirms the second regression file and its assertions are present at the exact HEAD.
- Current combined status observed for `7b2778d2...`: Vercel is **pending**; this is not treated as PASS or certification.

## Boundaries preserved
- Frozen historical RC untouched.
- Production aliases untouched.
- No historical migration rewritten.
- No certification claim promoted from source-level proof to operational proof.

## Next execution point
1. Continue from `7b2778d2c44a8805523846dcc83e4655e305b3c2`.
2. Obtain executable CI result/log evidence for this exact HEAD.
3. Then attack the highest-value independent open gate without repeating closed Worker contract work: authenticated current-head E2E/A-B isolation where operational access permits; otherwise migration parity/OCR/import-runtime contract work in parallel.
