# Execution Checkpoint — Arabic OCR Truthful Confidence — Batch 44 — 2026-09-07

## Finding
The existing Arabic OCR adapter produced OCR text but hard-coded every OCR block to `confidence=0.0`. The repository's existing OCR confidence contract considers confidence below `0.7` unusable. Therefore successful OCR output could not truthfully cross the usable-confidence boundary.

## Repair
1. Started an isolated branch from exact main `5b083100d463aae4a4cf22ebbbff7e1470749b1f`.
2. Updated `services/document-intelligence/app/main.py` to consume PaddleOCR `rec_scores`.
3. Uses the minimum observed recognition score as the block confidence, avoiding an optimistic average when any recognized segment is weak.
4. Preserves `0.0` only when OCR returned text without usable score metadata.
5. Adds an explicit review warning for confidence below the existing `0.7` threshold.
6. Keeps OCR-unavailable and OCR-empty paths fail-closed.
7. Removed the unreachable duplicated fallback implementation and its no-op legacy marker.
8. Added `scripts/check-ocr-runtime-contract.mjs` to lock the runtime confidence and fallback invariants.
9. Extended `.github/workflows/ocr-confidence-contract.yml` to execute the new runtime guard together with the existing confidence guard.
10. Opened PR #397 for review; current head is `376ef13c2fbecec10b365ddae8f1cd9a99354942`.

## Evidence boundary
- This is a source/runtime correctness repair, not an OCR production certification.
- No real customer document was fabricated or inserted.
- No Staging data, frozen RC, production alias, or historical migration was changed.
- Actual Arabic PDF/image extraction still requires runtime evidence from the deployed document-intelligence service.
