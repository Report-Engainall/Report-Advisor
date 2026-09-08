# Report-Advisor — Governed Import Writer + Visual System

**Date:** 2026-09-08
**Branch:** `fix/folder-sync-universal-persistence`

## Implemented

### Governed import writer
- Canonical import commit now resolves the authenticated tenant before writing.
- Canonical provenance is asserted before crossing the write boundary.
- The writer constructs governed `write_new` resolutions and calls `import_commit_batch_governed` rather than the legacy direct batch writer.
- Source rows retain raw source data plus provenance/lineage metadata.
- The writer rejects a commit result unless the committed count and returned id count exactly match the input batch.

### Visual system
- Global application background now uses a restrained multi-radial gradient rather than a flat canvas.
- Added reusable `surface-gradient`, `hero-gradient`, `section-heading`, `gradient-border`, and `soft-glow` utilities.
- Primary actions use a consistent primary-to-accent gradient.
- Navigation active state uses the same visual language.
- Source Analysis Workspace now has a stronger executive hero, layered surfaces, richer source cards, metric tiles, and safer visual status hierarchy.
- Universal Intelligence now uses a polished gradient surface and grouped evidence/quality/relation cards.
- Dashboard now uses the same executive hero language, gradient action controls, hover elevation, and clearer attention/recommendation surfaces.

## Exact implementation SHAs

- Governed canonical writer: `18cf3cf1bce882c00307c7c7c3b3cdd2cd3a5408`
- Writer regression contract: `3bb62673abf6ec9862892d73554d2805ff46c737`
- Global visual system: `1c9fad7a5faa9b75e5a78b5c64ae3e3a34dfd952`
- Source Analysis Workspace: `6cc4020e44a5a8253cfe1268f2c858ca841d6ad5`
- Universal Intelligence visual refresh: `53b7ebc4869fcec013060255d16cad7e9a3b2ea4`
- Dashboard visual refresh: `872b524164426a894a12fc8593b8f34fae50f386`

## Boundaries

- This closes the canonical writer's route through the governed DB gate, but the interactive duplicate/conflict review action path is still a separate closure target.
- Visual changes are source-level implementation; no browser visual PASS is claimed because the available Vercel deployment remains externally blocked.
- Frozen RC `d846821b8d969aaa384ab85487a0dcf264a65aca` and production aliases were not mutated.
