# Universal Report Intelligence Workspace — 2026-09-08

## Objective
Make external reports first-class sources instead of disposable import attempts. Every readable source is expected to survive analysis, retain its fingerprint, structure, mappings, OCR output, warnings and routing decision.

## Implemented boundary
- Mixed folders are analyzed per file and per dataset; no fixed entity is imposed on the folder.
- Structured datasets do not fail merely because canonical text extraction is unavailable; the extraction layer is preferred but has a structured-source fallback.
- Canonical writes require the existing tenant/reconciliation/identity boundary.
- Readable non-canonical sources are recorded as `partial` import jobs and surfaced as `analyzed`, not fake failures.
- Import history now uses durable result metadata for file name, path, source format, entity type, hash and quality.
- A durable `source_analysis_snapshots` read model stores dataset schema, bounded preview/rows, canonical text, OCR/visual metadata, warnings and source identity under tenant RLS.
- A dedicated `/source-analysis` workspace displays source details and routes completed sales/products/customers sources into their existing business screens.
- PDF/image parsing already uses Arabic + English OCR for scanned/image-only content; the new workspace exposes the resulting OCR status instead of discarding the source.
- Snapshot retention is bounded to prevent unbounded browser/server payloads: 5,000 rows per dataset and 250,000 canonical-text characters.

## Important limitation
This is not a claim of generic computer vision. Image-only documents with no useful text remain in source analysis for review unless a configured vision backend is available. No visual business meaning is fabricated.

## Verification
- Supabase staging migration `source_analysis_workspace` applied successfully.
- Staging table exists with RLS enabled and currently contains 0 rows.
- PR #427 remains draft/unmerged.
- Vercel preview deployments for this project are currently BLOCKED at the platform/team level; therefore no browser/preview PASS is claimed from this change set.
