# Checkpoint Correction — 2026-09-07 / Batch 1

The batch checkpoint was committed after two runtime/evidence regression additions. The documentation checkpoint itself advanced the branch, so the authoritative current HEAD is the PR head, not the pre-documentation functional SHA.

- Active branch: `fix/runtime-provenance-20260906`
- Authoritative current HEAD: `c5a42ff1855239ab83e24474464678ce997cf395`
- Functional commits immediately preceding the documentation checkpoint:
  - `551e191e44155a6763c1dab511bed17705868bb1` — runtime admission regression
  - `7b2778d2c44a8805523846dcc83e4655e305b3c2` — evidence boundary regression
- Documentation checkpoint: `c5a42ff1855239ab83e24474464678ce997cf395`
- PR #348 remains open and mergeable; not merged.
- No frozen RC or production alias mutation.
- No operational PASS is claimed while executable CI/E2E evidence is pending.

Next `1` must resume from `c5a42ff1855239ab83e24474464678ce997cf395`.
