# Exact-SHA Reconciliation — 2026-09-04

This is a non-destructive reconciliation record. It does not replace or truncate `docs/MASTER_EXECUTION_INDEX.md`.

| Layer | SHA / Reference | Meaning |
|---|---|---|
| Main / PR base | `083225068f1e2d390f6e1d50e8b178a1e8e1bacb` | supplied main/base boundary |
| Worker implementation mutation | `ec2c6babef8176044ba63892e6638f23904db1d2` | lease-token lifecycle fencing implementation |
| Prior candidate/index lineage | `da0c2047ea6530de869bb3b251fa8b83f3b5e812` | prior exact candidate; documentation/binding above worker ancestry |
| Report/Export candidate | `266ca96a6d8a65471a48c1fd489281cc5def7cd3` | exact candidate before OCR front |
| OCR numeric implementation | `82774bc2ed8b566c7491ab26a0f61095a3642321` | deterministic numeric normalization |
| OCR golden corpus | `629fe760704cd3df517b9588ce0d108fad24403e` | 54-case deterministic corpus |
| OCR validation mutation coverage | `90bb401e4abb5ad34fd341c2265a21e043ce4cda` | expanded validation test-of-test |
| Exact-head CI binding | `a97bfd3d756c75bda29fb6700d305a9ab0376afe` | exact PR-head document workflow |
| Current Exact Candidate HEAD | `fba9c04dcc6facb8a7aa4137ad1f094810f784cc` | current branch HEAD after OCR addendum + reconciliation records |
| Branch | `execution/owner-level-compatibility-hardening-main` | execution branch |
| PR | `#310` | OPEN / NOT MERGED |

## Binding statement

The current candidate contains worker ancestry, report/export hardening, OCR numeric normalization, expanded document golden fixtures, adversarial validation, exact-head document workflow binding, and the two non-destructive execution addenda.

The current HEAD is **not** itself described as a worker mutation or OCR implementation mutation. It is the candidate HEAD after those mutations and documentation/reconciliation descendants.

## Evidence boundary

No PASS is transferred from an older SHA merely because it is an ancestor. Fresh exact-SHA CI for `fba9c04dcc6facb8a7aa4137ad1f094810f784cc` remains required. No production certification is implied.

## Master Index preservation

The historical Master Execution Index remains the authoritative historical execution record. This reconciliation addendum exists because the large historical index cannot safely be rewritten from a truncated retrieval. A future controlled repository-side update can add a pointer to this addendum without reconstructing or deleting historical content.
