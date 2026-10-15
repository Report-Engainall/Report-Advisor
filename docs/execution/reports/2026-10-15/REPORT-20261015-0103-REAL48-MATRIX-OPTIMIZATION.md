# Execution Checkpoint — 2026-10-15 — Real-source matrix N+1 query reduction

Repository: Report-Engainall/Report-Advisor
Branch: fix/generic-source-completeness-20261014
PR #926: OPEN / NOT MERGED — https://github.com/Report-Engainall/Report-Advisor/pull/926
Main SHA: b4bb9fe6f278fd7d2c2dcb76b144638549036565
Code checkpoint: 0efe136056277bbf5968c5454e9e9ae4a56ffead
Product complete: NO

## Prior evidence and defect
On predecessor e624f3f304528fe95a58a18bcd3c5f00c26b94f4, Full Product Browser E2E run 38660140004 passed build, canonical regressions, authenticated Chromium routes, real Smart Report, supported-format generic analysis, universal evidence gate, artifact upload and cleanup. The optional real-source coverage diagnostic timed out after 240 seconds and reported 0/48 NOT_PROVEN; it did not complete a proof of absent coverage.

One tenant had 3,393 completed jobs but only 16 report-corpus files. The prior preflight scanned all completed jobs and issued one file_records request per passport before applying the real-source filter; canonical anchors were also queried sequentially.

## Changes in code checkpoint 0efe136056277bbf5968c5454e9e9ae4a56ffead
- Job selection now starts from VERIFIED/READY evidence passport IDs and uses bounded batched IN queries.
- Governed report-corpus file records are prefetched once per tenant and mapped by exact source hash; the strict isGovernedRealFileRecord predicate remains the classification boundary.
- Canonical import anchors are fetched in bounded batches, retaining exact tenant/source hash/record ID validation and newest-commit order.
- Diagnostic saves atomic IN_PROGRESS/COMPLETE snapshots at startup, during source selection and after each archetype. PASS requires execution to complete all 48 profiles and all 48 to be supported.
- Contract assertions cover batching, no per-passport file_records read, atomic progress and complete-only PASS.

## Verification boundary
PERSISTED = source and contract changes committed at 0efe136056277bbf5968c5454e9e9ae4a56ffead and read back.
TESTED = pending exact-head checks for the new code; predecessor passes do not transfer.
BROWSER-PROVEN = predecessor e624f3f only until new browser run closes.
PRODUCTION-PROVEN = NOT_PROVEN.
PRODUCT_COMPLETE = NO.

## Separate Phase-F blocker
PR #925 Phase-F run 38646785819 remains failed closed at HTTP 503 operational_token_not_configured. Netlify production serves old SHA 858ef8e3e5bc5bf74430555eadfb9e6767be348b. Owner-authorized RESILIENCE_OPERATIONAL_TOKEN and SUPABASE_SERVICE_ROLE_KEY remain absent from Netlify runtime; do not invent secrets or weaken isolation.

NEXT_EXACT_ACTION = Verify exact-head matrix contract, Quality, Build, Full Product Browser E2E and Final Certification. Inspect final or partial matrix artifact honestly, then handle the separate authorized Phase-F secret prerequisite.
