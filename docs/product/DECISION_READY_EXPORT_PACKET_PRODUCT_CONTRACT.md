# DECISION-READY EXPORT PACKET — PRODUCT CONTRACT
## 2026-10-02

## Two export modes
### DATA EXPORT
Canonical rows/filtered dataset for operational reuse.

### DECISION PACKET
A human-readable artifact for management review and action.

## Packet structure
### Cover
- report title
- generated-at
- tenant-safe display context
- archetype/version when resolved

### Executive decision
- business question
- WHAT
- WHY
- SO WHAT
- IMPACT when computable
- WHAT NEXT
- readiness state

### Evidence
- source path/name
- source hash
- execution job id
- evidence snapshot/passport id
- verification status
- supporting observations
- calculation method
- limitations

### Action chain
- recommendation id/status
- decision id/status
- approval status/authorized actor when allowed
- work item id/status
- expected outcome
- actual outcome
- outcome state

### Audit
- timestamps
- actor/event trace
- profile version/rule ids
- reproducibility reference

## Guardrails
Never export invented:
`CAUSALITY`, `CONFIDENCE`, `BENCHMARK`, `FORECAST`, `IMPACT`, `OUTCOME`.

When unavailable:
`NOT_AVAILABLE` or `INSUFFICIENT_SAMPLE`.

## Acceptance
The packet must be independently readable and independently traceable back to the same source/evidence identity. Data export remains unchanged and separate.
