# Secondary Agent Batch 14 — Explainability + Decision Safety

## Scope
Adds governance-safe contracts for explainability and decision safety. This is intentionally adapter/contract work; it does not replace the authoritative decision, recommendation, metric, approval, or action engines.

## Implemented
- Evidence-aware decision explanation shape.
- Calculation/assumption/uncertainty/alternative fields.
- Explicit `whyNot` support.
- Safety states: `allowed`, `blocked`, `unknown`.
- Missing evidence or unknown freshness never becomes `allowed`.
- Required approval without approval becomes `blocked`.
- Missing `whyNot` remains an explicit unavailable statement rather than fabricated reasoning.

## Free-first / safety
No paid provider, external API, autonomous execution, financial calculation, or source-of-truth mutation was introduced.

## Runtime
Mainline wiring is required before this can be marked complete.

## Verification
A source-contract regression test was added. CI must execute it before claiming PASS.
