# Secondary Agent Batch 01 — Evidence / Replay / Snapshot UX

Status: FOUNDATION

Branch: `parallel/secondary-agent-evidence-ux`

## Scope

This batch adds isolated, reusable presentation and read-model foundations for:
- Evidence Workspace;
- Decision Replay;
- Decision Diff;
- Report Snapshot Diff;
- multi-dimensional trust visualization.

## Existing systems inspected

The repository already contains an evidence ledger, decision-evidence adapter, decision engine, report snapshot history, evidence cards, and extensive evidence/provenance checks. The batch therefore consumes/targets those existing contracts rather than creating a second canonical evidence or metric engine.

## Files added

- `src/lib/secondary-evidence-ux.ts`
- `src/components/secondary/EvidenceWorkspace.tsx`
- `src/components/secondary/DecisionReplay.tsx`
- `scripts/secondary-evidence-ux.test.ts`
- this handoff

## What is deliberately not changed

- Metric truth / financial calculations.
- Canonical import engine.
- RLS / tenant isolation.
- AI provider/security backend.
- Forecast/recommendation/action engines.
- Database schema/migrations.
- Production certification gates.

## Test evidence

The focused contract test is designed to run with:
`node --experimental-strip-types scripts/secondary-evidence-ux.test.ts`

The GitHub connector environment used for this handoff cannot execute the repository's Node toolchain locally, so this test is recorded as:
`SKIPPED — GitHub connector provides repository read/write operations but no local Node/npm execution environment.`

No claim of test passage is made.

## Free/local impact

No dependency was added. The implementation uses existing React/TypeScript/Tailwind/Lucide primitives only.

## Security / tenant implications

The components are read-only presentation surfaces and do not query or write tenant data. Source references are displayed only when supplied by an existing authorized read model. No authorization policy was changed.

## Integration limitation

Real backend wiring for live evidence/decision/snapshot data is intentionally not fabricated. The reusable UI accepts typed read models and explicitly renders UNKNOWN/EMPTY/ERROR/BLOCKED states when evidence is absent. The primary agent should wire these components to the authoritative existing queries/read models after reviewing tenant authorization and source-reference behavior.

## Feature preservation

No existing feature was deleted or replaced. No existing route was changed in this batch to minimize conflict with the primary agent's active App/navigation work.

## Classification

- Evidence Workspace: FOUNDATION
- Decision Replay: FOUNDATION
- Decision Diff: FOUNDATION
- Report Snapshot Diff: FOUNDATION
- Multi-Dimensional Trust UI: FOUNDATION
- Live integration: LIVE REQUIRED

## Batch 02 continuation note

Batch 02 extends this foundation with evidence-aware read-model contracts and presentation surfaces for Data Quality, Business Control Plane, Document Intelligence, Smart Reconciliation, Schema Discovery, plus a safe synthetic Golden Corpus. Batch 01 remains FOUNDATION and is not promoted to COMPLETE merely because Batch 02 exists.

Batch 02 deliberately does not replace any Batch 01 component or create a second Core Engine.
