# Canonical Certification — Mutation Checkpoint

Anchor: `139e1705cca0048ef6e0c205d2bd03a6d73c9f50`  
Anchor tree: `f275c7347fffaaa1c858cc63e8f180828eae4925`  
Exact inventory: **65 members**  
Exact-tree fingerprint: `68b6062a9c475edf51a9710245e8d0f237c4d25c73fb25f77f01d5177f2bf023`

| Gate | Status | Evidence |
|---|---|---|
| Exact Git materialization | PASS | 65 ordered `(position,path,blobSha)` records |
| Independent cross-check | PASS | 65/65 identical; all mismatch classes 0 |
| Git blob contract | PASS | 40-char lowercase Git object IDs |
| Canonical verifier | PASS | exact anchor tree comparison, fail-closed |
| Isolated matrix | PASS | 31/31 |
| Blob identity | PASS | 65/65 |
| Fingerprint sensitivity | PASS | position/path/blob/reorder/newline |
| Consumer authority | PATCHED | all five consumers call canonical verifier |
| Workflow authority | PATCHED | canonical verifier is certification gate; full history fetched |

## Invariants

- Canonical membership remains exactly 65 records.
- Canonical fingerprint is unchanged.
- No SQL migration content is modified by this certification patch.
- Filesystem enumeration is not a certification authority.
- Current HEAD is never substituted for the protected anchor.
- Verifier non-zero exit blocks certification.

## Mutation checkpoint

Implementation patch prepared as one atomic Git change; CI remains the final external certification gate.
