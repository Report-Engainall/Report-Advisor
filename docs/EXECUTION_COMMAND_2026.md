# REPORT-ADVISOR — EXECUTION COMMAND 2026

**Purpose:** Permanent execution directive for every future programmer/owner execution phase.

## Invocation

When the owner states **`2026`**, apply this directive in full. Do not downgrade it to a summary or checklist.

## Operating mode

- Execute immediately; do not wait for a report cycle.
- Work all independent fronts in parallel.
- While a CI/build/browser/deployment operation runs, move immediately to another independent front and return to inspect results as soon as they appear.
- Operate like a surgeon: observe the first real failure, isolate root cause, make the minimum correct surgical fix, verify it, commit it, bind evidence to the exact SHA, then continue.
- Never let one waiting/pending front make the whole project idle.
- Do not repeat already-closed checks unless SHA, source, dependency, environment, database state, or evidence boundary materially changed.
- Optimize for maximum useful throughput while conserving GitHub Actions, Vercel, Supabase, storage, artifacts, logs, and deployment capacity.

## Evidence and release discipline

- No fake PASS, fake JWT/session, fake persistence, fake browser evidence, fake runtime evidence, fixture-only proof presented as production runtime, or contract-only proof presented as runtime.
- No historical evidence transfer to a new Exact HEAD.
- Certification is fail-closed on missing or mismatched evidence, provenance, SHA identity, runtime proof, persistence proof, tenant proof, security proof, or deployment proof.
- Every material implementation follows: **IMPLEMENT → TEST → VERIFY → EVIDENCE → COMMIT → EXACT SHA → DOCUMENT**.
- Fix the first real failure before chasing downstream symptoms, while continuing independent work elsewhere.

## Architecture protection

- Reuse existing canonical engines, RPCs, runners, coordinators, import path, evidence path, and semantic metric layer.
- Do not create duplicate engines/RPCs/runners/migrations/components when an existing canonical path is correct.
- Preserve Evidence-First truth, deterministic metric math, RLS, tenant isolation, fail-closed behavior, and authoritative import lifecycle closure.
- Do not use an LLM as a calculator and do not send raw documents to an LLM when the architecture prohibits it.

## Parallel front movement

Continuously rotate through every actionable front: certification, first-failure remediation, CI evidence, runtime, browser E2E, business persistence, database/RLS, import lifecycle, evidence/provenance, document intelligence/OCR, metrics/KPI truth, dashboard financial truth, data quality, reports, work center, decision intelligence, inventory/demand, customer/product/receivables/profitability, UX/RTL/responsive/PWA/mobile, Windows desktop, security, performance, resilience, Vercel, documentation/traceability, and commercial readiness.

If one front is externally blocked, classify the blocker precisely and continue every independent front.

## Resource / space discipline

Prefer targeted and incremental checks over full repeated suites. Avoid duplicate artifacts, redundant deployments, needless reruns, stale evidence, debug files, and oversized logs. Preserve capacity without sacrificing real verification.

## Definition of done

A front is not complete merely because code exists. It is complete only when implementation is present, the relevant runtime/business path is proven where applicable, required tests are green, the exact SHA is recorded, evidence is linked/stored, no blocker remains for that front, and ownership/state is synchronized in GitHub.

## Project authority

- **Master Status:** GitHub Issue #478
- **Commercial Roadmap:** GitHub Issue #472
- **Parallel Execution Protocol:** `docs/PARALLEL_EXECUTION_PROTOCOL_20260917.md`
- **Certification Authority at protocol start:** `2313dc50d5de6a8f53ca6aae447a97de7a69e17b`

## ChatGPT control/verification responsibilities

- Maintain the master execution protocol and dependency map.
- Continuously inspect GitHub issues, PRs, branches, commits, workflow runs, evidence, changed files, and ownership state.
- Identify the next independent action or first real blocker and communicate it without waiting for idle cycles.
- Verify architecture: canonical reuse, Evidence-First truth, exact-SHA binding, tenant/RLS isolation, fail-closed behavior, and no historical evidence transfer.
- Maintain product UX/IA acceptance architecture and review product slices against the documented commercial requirements.
- Inspect Vercel deployment identity, SHA, health, runtime and rate-limit/external blockers.
- Detect conflicting work, stale SHA claims, duplicate effort, unproven claims, and evidence contamination.
- Keep the GitHub status synchronized so the programmer can act from one current control record.
- Do not silently edit programmer-owned implementation files; any ownership transfer must be explicit in GitHub before such a write.

## Current operating correction

Current exact-SHA browser evidence is allowed to expose real blockers. A browser/runtime failure must be fixed at the actual source of failure; it must not be weakened or bypassed. When the failing fixture is stale relative to authoritative business-import requirements, synchronize the test fixture with those canonical requirements rather than weakening the business gate.

## Core rule

**Do not stop because a result is pending. Do not wait when another real action is available. Do not claim success before evidence. Keep moving, checking, fixing, verifying, committing, and synchronizing across all independent fronts until all executable work is exhausted or a specific external dependency is genuinely required.**
