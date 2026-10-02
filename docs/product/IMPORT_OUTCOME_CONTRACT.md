# IMPORT OUTCOME CONTRACT — NO-OP PROHIBITION
## 2026-10-02

Every upload/import must end with a visible terminal state:

`SUCCESS | FAILED | REVIEW_REQUIRED | BLOCKED | PARTIAL`

## Required outcome envelope
`JOB_ID`
`SOURCE_HASH`
`FORMAT`
`SHEETS`
`ROWS`
`DETECTED_TYPE`
`ARCHETYPE_ID`
`PROFILE_VERSION`
`CONFIDENCE_STATE`
`ERROR_STAGE`
`ERROR_CODE`
`RETRY_POLICY`
`NEXT_ACTION`
`CREATED_AT`

## Spreadsheet resilience
The import contract must explicitly handle:
- multiple sheets;
- merged/repeated headers;
- duplicate headers;
- Arabic and English headers;
- Arabic and Latin digits;
- dates and formulas;
- cached formula values;
- large files and bounded processing;
- 50K ceiling semantics;
- FULL vs PARTIAL results.

## User-visible behavior
The UI must never respond with a silent no-op after upload.

Examples:
- parsing failure → `FAILED` + stage + actionable retry;
- ambiguous structure → `REVIEW_REQUIRED` + detected ambiguity;
- partial extraction → `PARTIAL` + processed scope;
- unsupported capability → `SUCCESS` for import when truth was persisted, with downstream capability marked `NOT_AVAILABLE`;
- infrastructure/policy block → `BLOCKED` + blocker + permitted next action.

## Intelligence binding
Import success does not imply intelligence success.

The sequence is:

`IMPORT`
→ `TRUTH`
→ `ARCHETYPE DETECTION`
→ `FIELD AVAILABILITY`
→ `SMART REPORT`

Each stage has its own state and evidence.

## Acceptance
A real Excel/PDF source must produce a terminal import outcome with job/hash/format/scope and either a Smart Report or an explicit reason why downstream analysis is unavailable. No “upload then nothing”.
