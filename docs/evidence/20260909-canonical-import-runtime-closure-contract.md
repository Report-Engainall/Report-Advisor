# Closure Contract Summary

- Source-header validation no longer gates imports by raw field-name equality.
- Canonical validation consumes `mappedField` and enforces entity identity requirements.
- Created import jobs retain their id for terminalization.
- Successful completion uses `import_finish_job`.
- Failure uses `import_finish_job` with `failed` and preserves the original error.
- DB lifecycle remains the final authority and tenant boundary.
- Runtime execution of the new static contract is still pending CI/local execution; no PASS is asserted here.
