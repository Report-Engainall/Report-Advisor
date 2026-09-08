# Universal Import Intelligence — 2026-09-08

## Scope
This batch closes a source-level intelligence layer for arbitrary datasets without silently writing or discarding data.

## Implemented
- Deterministic report classification using mapped canonical fields with explicit confidence/evidence.
- Safe fallback to `general_report` when specialization confidence is insufficient; empty datasets remain `document_analysis`.
- Cross-dataset relation candidate detection from shared identifier-like canonical fields, including confidence and evidence.
- Row fingerprinting that is deterministic over the ordered source columns and canonical field names.
- Explicit row resolution outcomes: `new`, `skip_exact`, `candidate_duplicate`, `conflict`.
- Universal quality summary combining completeness, mapping confidence, type coverage, duplicate candidates, conflicts, and warnings.
- Conflict/duplicate paths are advisory; no automatic merge or destructive write is performed.

## Boundary
The helper is source/read-model intelligence. It does not certify database writes, authenticated browser behavior, production behavior, or statistical accuracy. Cryptographic file SHA remains the authoritative file-level fingerprint; the row fingerprint in this layer is a deterministic comparison key, not a replacement for the file SHA.

## Exact implementation SHA
`ade372ada46c75d4426c4ed533029e81d0653b17`

## Existing source preservation
The existing adapter preserves every normalized source property while adding canonical projections; unknown columns therefore remain available for review instead of being dropped.

## Next closure
Wire the intelligence summary into the Source Analysis Workspace and add authenticated/live evidence for the end-to-end import → classification → relation → conflict workflow. Until then this batch is implemented at the source layer only.
