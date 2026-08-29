# Import truth regression — 2026-08-29

The compatibility import lifecycle boundary was corrected so validation counters are never inferred from processed rows. Current counters are read from the authoritative `import_jobs` row and preserved when progress or error metadata is updated. Terminal status calls the canonical finish RPC directly.

Regression gate: `test:import-truth-contract`.
