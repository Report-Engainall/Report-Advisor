# Canonical Certification — Test Matrix

All isolated tests are offline/synthetic and use temporary Git repositories. The production verifier uses the protected Git tree directly.

| Case | Fixture mutation | Expected verifier result | Exit | Failure class | Certification consequence |
|---|---|---|---:|---|---|
| 65 exact | none | PASS | 0 | — | eligible |
| 64 | delete one member | FAIL | 5 | TreeMismatch | blocked |
| 66 | add one member | FAIL | 5 | TreeMismatch | blocked |
| missing | remove arbitrary member | FAIL | 5 | TreeMismatch | blocked |
| extra | append member | FAIL | 5 | TreeMismatch | blocked |
| duplicate | duplicate position/path | FAIL | 5/4 | TreeMismatch/InventoryShape | blocked |
| gap | remove position from sequence | FAIL | 4 | InventoryShape | blocked |
| reorder | swap adjacent members | FAIL | 5 | TreeMismatch | blocked |
| wrong position | mutate one position | FAIL | 4 | InventoryShape | blocked |
| wrong path | mutate one path | FAIL | 5 | TreeMismatch | blocked |
| wrong blob | mutate one blob SHA | FAIL | 5 | TreeMismatch | blocked |
| modified file | substitute blob SHA | FAIL | 5 | TreeMismatch | blocked |
| renamed file | mutate path | FAIL | 5 | TreeMismatch | blocked |
| added SQL | add `.sql` member | FAIL | 5 | TreeMismatch | blocked |
| deleted SQL | remove `.sql` member | FAIL | 5 | TreeMismatch | blocked |
| duplicate path | reuse existing path | FAIL | 4 | InventoryShape | blocked |
| wrong anchor | manifest points elsewhere | FAIL | 3 | Anchor | blocked |
| malformed manifest | invalid JSON/schema | FAIL | 2 | ManifestSchema | blocked |
| missing field | omit position/path/blob | FAIL | 4 | InventoryShape | blocked |
| invalid field type | string position / invalid SHA | FAIL | 4 | InventoryShape | blocked |
| non-SQL | `.txt` member | FAIL | 4 | InventoryShape | blocked |

## Blob SHA contract guard

| Case | Expected | Failure class |
|---|---|---|
| 64-char SHA-256 | FAIL | InventoryShape |
| 39-char SHA | FAIL | InventoryShape |
| 41-char SHA | FAIL | InventoryShape |
| uppercase SHA | FAIL | InventoryShape |
| non-hex SHA | FAIL | InventoryShape |
| null / empty / wrong type | FAIL | InventoryShape |
| valid 40-char Git blob ID | PASS | — |

## Executed results

- Canonical certification matrix: **31/31 PASS**
- Git blob identity: **65/65 PASS**
- Fingerprint sensitivity: **PASS** for position/path/blob/reorder/newline mutations.
