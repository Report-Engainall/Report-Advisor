# Folder Sync Product Incident — 2026-09-08

## Incident
Mixed folders containing readable PDFs/XLSX files were presented as repeated import failures because the previous flow required a fixed entity selection and canonical identity before the system could acknowledge useful analysis.

## Product correction
The universal folder path now treats each file and dataset independently, infers a business entity only when evidence is sufficient, and uses `document_analysis` when it is not safe to create a canonical entity. Structured data can continue after canonical-text extraction is unavailable through the existing fallback contract.

## Persistence correction
Folder synchronization state is persisted locally and restored after navigation/reload. The UI subscribes to storage changes so another tab can observe the latest persisted progress.

## Acceptance contract
- A mixed folder must not be forced into one entity type.
- A readable non-canonical document is `analyzed`, not a false `failed` result.
- Unknown source fields are preserved for later mapping/analysis.
- SHA-256 duplicate detection remains active.
- Progress survives navigation/reload where browser storage is available.
- No claim of production/E2E certification is made by this change.
