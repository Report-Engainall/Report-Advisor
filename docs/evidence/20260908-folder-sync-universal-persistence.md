# Folder Sync — Universal Analysis & Resumable Progress

Date: 2026-09-08
Branch: `fix/folder-sync-universal-persistence`

## Problem observed

The folder synchronization surface forced every file into one preselected entity type. A mixed folder containing PDFs, spreadsheets and different business datasets could therefore produce misleading failures such as `لم توجد صفوف صالحة بعد التحقق من الحقول المطلوبة` even when the file was readable and contained useful information.

The progress UI also lived only in React component state, so navigation/unmounting could erase the visible run state.

## Remediation

1. Added `folder-universal-sync.ts` as the folder-level orchestration boundary.
2. Each file is security-scanned, fingerprinted, format-detected and parsed independently.
3. Every dataset/sheet is analyzed; entity routing is inferred from the existing File Engine column mappings.
4. Product/customer/sales-invoice writes use minimal identity keys rather than requiring unrelated optional fields.
5. Files that are readable but not safely classifiable as a canonical business entity are reported as `analyzed`, not as fake import failures.
6. Duplicate fingerprints remain skipped without rewriting.
7. Folder progress is persisted in localStorage and restored when the import screen is mounted again; storage events refresh another open tab.
8. The folder UI no longer asks the user to choose `sales_invoices`/`products`/`customers` before processing a mixed folder.
9. The existing watcher/snapshot mechanism remains responsible for changed-file detection; the universal runtime becomes the processing path.

## Important boundary

This remediation does not certify Production, Authenticated E2E, or live tenant isolation. It changes the application behavior on the feature branch only and does not mutate the frozen release candidate or production alias.
