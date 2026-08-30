# Phase 9 — Windows Runtime Contract

This gate is an executable source-level closure contract for the native Windows watched-folder runtime. It does not claim a fresh Windows host run; that evidence remains a separate runtime requirement.

## Required invariants

- recursive native filesystem watch and production polling are present
- stable-file detection prevents partial-write ingestion
- generation/promise guards prevent stale overlapping rescans
- watcher root is selected through the controlled desktop boundary
- absolute native file paths are not exposed to the renderer
- Electron context isolation and disabled Node integration remain enabled
- packaging metadata identifies the desktop application and Windows packaging path
- the existing Windows watcher contract remains part of the verification surface

## Adversarial rule

The gate contains a test-of-test check so a comment containing a required token cannot itself be treated as runtime evidence.

## Certification boundary

Source-level PASS is not Windows runtime PASS. A fresh Windows smoke/runtime artifact bound to the exact tested SHA is still required before production certification.
