# Canonical Certification — Applied Patch Plan

## Canonical authority

The protected anchor is verified from the canonical manifest. The verifier resolves `<anchor>^{tree}` and compares the exact ordered `(position,path,blobSha)` membership.

## Applied changes

- Canonical manifest/evidence state updated only; 65-member membership and fingerprint unchanged.
- Canonical verifier hardened for exact tree SHA and Git path normalization, with reusable exported verification API.
- Five certification consumers now use the canonical verifier.
- Release certification workflow invokes the verifier and fetches complete history.
- Test harness uses real Git blob object IDs and guards the 40-character contract.

## Safety boundary

No SQL migration, database, auth, production data, dependency, unrelated workflow, or unrelated application behavior is changed by this certification patch.

## Failure propagation

Any verifier non-zero exit blocks the dependent certification stage; no fallback authority is permitted.
