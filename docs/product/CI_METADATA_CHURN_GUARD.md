# CI / METADATA CHURN GUARD
## 2026-10-02

## Problem
The execution branch uses documentation-only commits to persist session state. When broad pull_request workflows trigger on those commits, identical execution code can be queued repeatedly, increasing CI latency and consuming deployment/runner capacity.

## Rule
Separate:
- EXECUTION CODE HEAD — last commit that changes runtime/application/test/CI behavior.
- METADATA PERSISTENCE HEAD — later documentation-only commits.

The persisted state may advance without pretending that execution code changed.

## CI trigger policy
Workflows whose purpose is application/runtime verification should run when relevant execution files change.

Documentation-only session persistence should not retrigger expensive runtime/browser/database suites unless the workflow explicitly verifies the documentation contract.

Suggested classes:
- Runtime/browser/data suites → source/runtime/config/test workflow paths.
- Session handoff checks → docs/execution + governance paths.
- Product specs → docs/product paths only.
- Certification → explicit dispatch/manual or after a proven execution-code change.

## Safety
A path-filter optimization must never weaken a required release check. The certification system must record:
`EXECUTION_CODE_HEAD + METADATA_HEAD + PROOF_SHA`
and must prove that the tested execution code equals the execution head claimed by the report.

## Acceptance
For a documentation-only persistence commit:
1. state/report archive checks may run;
2. expensive runtime suites are not duplicated;
3. certification still knows the exact execution-code SHA;
4. no historical PASS is silently promoted as current runtime proof.

## Product value
Lower queue contention, lower deployment pressure, faster feedback, and clearer provenance between “code tested” and “state persisted.”
