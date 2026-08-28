# Certification Authority / Bypass Audit

## Canonical authority

`docs/CANONICAL_CERTIFICATION_MIGRATIONS.json` + `scripts/check-canonical-certification-migrations.mjs` are the single migration certification authority.

## Patched consumers

1. `scripts/build-release-manifest.mjs`
2. `scripts/check-artifact-migration-provenance.mjs`
3. `scripts/check-release-drift.mjs`
4. `scripts/check-release-decision-provenance.mjs`
5. `.github/workflows/release-certification.yml`

Each consumes the canonical verifier result and does not derive certification membership from filesystem ordering or local file-content hashes.

## Allowed non-authoritative enumeration

Generic diagnostic/inventory tooling may enumerate migrations, but such enumeration is not accepted as certification membership authority.

## Result

`CERTIFICATION BYPASSES = 0`
