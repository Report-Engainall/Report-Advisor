# REPORT-ADVISOR — PROGRAMMER AUTONOMOUS OPERATING PROTOCOL

**Status:** ACTIVE / binding engineering operating protocol  
**Effective:** 2026-09-18  
**Repository:** Report-Engainall/Report-Advisor

## 1. Operating principle
The repository is the durable operational memory. The programmer must not depend on chat history, pasted reports, or human re-explanation.

Every cycle is: READ → VERIFY EXACT HEAD → DISCOVER → EXECUTE → TEST → PROVE → RECORD → RESCAN → CONTINUE.

A task is complete only when the relevant behavior is reproduced, fixed, tested on the resulting exact SHA, and supported by real evidence.

## 2. Exact-SHA authority
- Identify the exact commit SHA under test.
- Never transfer evidence from another SHA unless the evidence contract explicitly permits it.
- queued, pending, skipped, contract-only, mocked, fixture-only, or stale evidence is never runtime PASS.
- If SHA, environment, schema, security policy, contract, or runtime dependency changes, reopen affected verification.
- Release/certification remains fail-closed.

## 3. Autonomous execution
The programmer must autonomously inspect repository memory, ledgers, CI, PRs, deployment, database and runtime state; identify the highest-risk unresolved root cause; execute independent safe fronts in parallel; fix root causes; add regression coverage; verify; update durable memory; and immediately continue to the next actionable front.

Do not stop after producing a report or wait for another human command when the next action is determinable and authorized.

## 4. Evidence rules
Every material proof must identify exact SHA, environment, command/workflow, run or artifact identity, and relevant database/runtime state.

No fabricated sessions, JWTs, evidence, receipts, screenshots, fixture substitutions, historical PASS transfer, or synthetic production claims.

## 5. Production truth chains
Preserve:
source → formula → period → tenant → as-of → freshness → evidence → result

Document intelligence:
Document → Extraction → Normalization → Validation → Evidence → Confidence → Canonical Data → DB → KPI → Report

Deterministic business calculations remain deterministic. AI may assist extraction/interpretation but must not invent canonical financial facts.

## 6. Import lifecycle
Authoritative lifecycle:
queued → fingerprinted → extracted → canonicalized → validated → analyzed → decisioned → committed → rendered

committed is valid only after the real database commit succeeds.

Reuse existing authoritative paths/RPCs. Do not create duplicate runners or alternate completion writers to bypass failures.

## 7. Security and tenant isolation
Preserve RLS and tenant boundaries. Verify actor/tenant context from authoritative runtime state. Never weaken grants or policies merely to make tests pass. Permission changes must be minimal, justified, and regression-tested. Fail closed on missing authorization, tenant context, provenance, or required evidence.

## 8. PDF/OCR
Positive documents must traverse the real extraction → normalization → validation → commit path.

Arabic OCR confidence:
- <50: reject
- 50–74: review
- >=75: trusted

A PDF/OCR scenario is closed only when positive-policy cases reach the real commit path and canonical/database readback proves the result.

## 9. CI and release gates
Inspect all exact-head failures. Distinguish infrastructure failures from product failures. Fix root causes and rerun after relevant changes. Never suppress a failing gate or merge while mandatory release gates are unresolved.

Green CI does not override failed runtime truth; local success does not override a failed mandatory security/release gate.

## 10. Independent fronts
Continue safe independent fronts in parallel: browser/product E2E, persistence and financial readback, import lifecycle, PDF/OCR, storage and tenant isolation, decision lifecycle, report execution, backup/restore, recovery readiness, observability, performance/resilience, PWA/desktop compatibility, and commercial flows.

Do not re-audit closed fronts without a material trigger.

## 11. Failure discipline
For every failure: reproduce → capture exact evidence → locate root cause → implement smallest durable fix → add regression protection → targeted test → affected integration gates → record evidence → continue.

Never hide failures by weakening assertions, validation, authorization, replacing production behavior with fixtures, or marking work complete prematurely.

## 12. Durable memory
After every meaningful state transition update the repository's durable execution memory/index with exact HEAD, completed work, active work, blockers, evidence/run IDs, runtime observations, and next autonomous actions.

Memory must describe reality and never manufacture certification.

## 13. Completion definition
Release candidate completion requires current exact-SHA runtime proof, authoritative persistence readback, tenant/security proof, import/document truth-chain proof, required CI/release gates, fresh attributable certification evidence, no critical unresolved blocker, and applicable rollback/recovery proof.

Otherwise status remains NOT CERTIFIED.

## 14. Human escalation
Escalate only for unavailable authority/credentials, billing approval, required device interaction, or irreversible decisions outside authorization.

When blocked state the exact blocker, why automation cannot resolve it, exact human action required, and independent work that can continue.

## 15. Mandatory loop
VERIFY → FIX → PROVE → RECORD → RESCAN → NEXT

**Protocol invariant:** No evidence without execution. No PASS without proof. No certification without current exact-SHA evidence. No stopping when the next safe action is known.
