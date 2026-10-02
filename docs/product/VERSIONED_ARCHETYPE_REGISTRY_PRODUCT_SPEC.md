# VERSIONED ARCHETYPE REGISTRY — PRODUCT SPEC
## Captain-owned product wave — 2026-10-02

Status: READY
Owner: Captain / Product Intelligence
Implementation owner: Programmer
Priority: P2 (safe, independent, must not compete with active P0/P1 runtime fixes)

## Product outcome

Report-Advisor must not treat a report as only one of six hard-coded types plus "unknown".
Every supported source should resolve to a versioned intelligence profile that governs detection, field requirements, metrics, signals, drivers, risks, recommendations, decision questions, actions, exports, limitations, and provenance.

The permanent 48-archetype catalogue is a capability catalogue, not evidence that 48 concrete report fixtures already exist.

## Required runtime flow

FILE
-> FINGERPRINT
-> DETECT
-> MATCH ARCHETYPE
-> LOAD PROFILE VERSION
-> INHERIT RULES
-> CHECK FIELD AVAILABILITY
-> ADAPT
-> VALIDATE
-> CALCULATE
-> SMART PACK
-> EVIDENCE PASSPORT
-> RECOMMENDATION
-> DECISION
-> WORK
-> OUTCOME
-> LEARNING

Unknown reports must not fail silently. They receive a Generic Smart Pack with explicit limitations and become candidate archetype submissions.

## Registry model

Each archetype profile must expose:

- ARCHETYPE_ID
- VERSION
- STATUS
- TITLE_ALIASES
- HEADER_ALIASES
- INPUT_SHAPE
- REQUIRED_FIELDS
- OPTIONAL_FIELDS
- CONFLICTING_FIELDS
- GRAIN
- TIME_FIELDS
- ENTITY_FIELDS
- MEASURE_FIELDS
- DOMAIN_RULES
- SMART_METRICS
- SIGNAL_RULES
- ANOMALY_RULES
- DRIVER_RULES
- RISK_RULES
- OPPORTUNITY_RULES
- RECOMMENDATION_RULES
- DECISION_QUESTIONS
- ACTION_TEMPLATES
- EXPORT_SECTIONS
- MIN_SAMPLE
- CONFIDENCE_THRESHOLD
- PROVENANCE_REQUIREMENTS
- LIMITATIONS

Registry records are immutable by version. A profile update creates a new version; historical report results retain the profile version used.

## Detection and matching contract

Detector output:

ARCHETYPE_ID
PROFILE_VERSION
MATCH_REASON
MATCHED_FIELDS
MISSING_REQUIRED_FIELDS
CONFLICTS
CONFIDENCE
REVIEW_REQUIRED
LIMITATIONS

Confidence is deterministic and explainable. It must not be presented as calibrated model probability unless calibration is actually proven.

No archetype match is allowed to invent a missing field.
Missing inputs produce NOT_AVAILABLE or INSUFFICIENT_SAMPLE as appropriate.

## Adaptive intelligence

A matched archetype inherits shared intelligence rules, then adapts from the source's field-availability matrix.

Examples:
- no cost -> profitability/margin conclusions become NOT_AVAILABLE;
- no due date -> aging/collection urgency becomes NOT_AVAILABLE;
- no sufficient time periods -> forecast becomes INSUFFICIENT_SAMPLE;
- no customer identity -> concentration by customer is NOT_AVAILABLE;
- no warehouse -> warehouse comparison is NOT_AVAILABLE.

The Smart Pack must state what was calculated, what could not be calculated, and why.

## UX / Smart Report behavior

The user-facing report should make the archetype explicit without forcing technical language:

- "نوع التقرير"
- "نسخة قواعد التحليل"
- "ما الذي يستطيع التقرير الإجابة عنه"
- "ما الذي لا يستطيع إثباته"
- "الحقول التي دعمت النتيجة"
- "الفجوات التي منعت بعض الاستنتاجات"

The first intelligence questions remain:
WHAT HAPPENED?
WHY?
SO WHAT?
WHAT NEXT?
PROOF?

A recommendation must retain source hash + report job + evidence snapshot/passport identity.

## Learning loop

Outcome evidence must be able to reference:
ARCHETYPE_ID + PROFILE_VERSION + RULE/RECOMMENDATION ID

This enables later analysis of which intelligence rules generated useful outcomes.
Learning must modify a future profile version, never mutate historical truth.

## Migration path from current implementation

Current detector supports:
inventory, sales, purchases, customerBalances, supplierBalances, stockMovement, unknown.

Do not remove current behavior in one step.
Introduce a registry adapter around the current detector, then migrate each type into a registry profile.
Existing report type names may become compatibility aliases to archetype IDs.

Minimum first wave:
1. registry contract and types;
2. registry loader;
3. versioned profile selection;
4. field-availability evaluator;
5. adapter for the existing six types;
6. generic unknown fallback;
7. deterministic detector tests;
8. Smart Report readout of archetype + limitations.

## Acceptance criteria

1. A known report resolves to ARCHETYPE_ID + VERSION deterministically.
2. A profile can be selected by source signature/title/header evidence without hard-coded UI branching.
3. Missing fields alter available intelligence explicitly, never silently.
4. Unknown input still receives a useful Generic Smart Pack.
5. Every recommendation/decision generated from a report remains source-bound.
6. Historical output remains reproducible against the profile version used.
7. No claim of "48 implemented reports" is made unless the repository contains that evidence.
8. The registry is covered by unit/contract tests and has an explicit readback path in Smart Report.
9. No P0/P1 repair is blocked by this wave.

## Proof required

- registry contract PASS
- deterministic matching tests PASS
- field-availability tests covering missing cost/due-date/time/customer/warehouse
- unknown/generic fallback test PASS
- current six report types remain regression PASS
- Smart Report browser readback shows archetype/version/limitations on real source data
- evidence provenance remains intact
- exact current HEAD recorded in captain/programmer handoff

## Next implementation slice

Implement the registry as a pure deterministic domain layer first.
Do not couple profile storage to UI state.
Do not introduce a second truth engine.
Reuse current canonical fields and source-bound evidence identities.
