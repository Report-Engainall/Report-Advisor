# Canonical Certification — CI Readiness

## Exact certification contract

The release certification workflow invokes:

`node scripts/check-canonical-certification-migrations.mjs --manifest docs/CANONICAL_CERTIFICATION_MIGRATIONS.json`

The workflow uses `fetch-depth: 0` so the protected anchor can be resolved even when it diverges from the implementation commit. A non-zero verifier exit fails the job.

## Required evidence

- Anchor: `139e1705cca0048ef6e0c205d2bd03a6d73c9f50`
- Anchor tree: `f275c7347fffaaa1c858cc63e8f180828eae4925`
- Members: 65
- Fingerprint: `68b6062a9c475edf51a9710245e8d0f237c4d25c73fb25f77f01d5177f2bf023`
- Git blob identity: 65/65
- Isolated matrix: 31/31

## Fail-closed rules

Verifier, manifest validation, consumer certification, and static preflight failures remain non-zero and block certification. No filesystem-derived migration fingerprint is authoritative.
